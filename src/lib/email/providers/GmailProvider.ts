import { getSession } from "next-auth/react";
import { 
  EmailProvider, 
  Email, 
  SendEmailOptions, 
  FetchEmailsOptions, 
  FetchEmailsResult,
  EmailAddress,
  EmailAttachment
} from "./EmailProvider";
import { google } from 'googleapis';

// Rate limiting constants
const BATCH_SIZE = 25; // Increased from 5 to 25
const BATCH_DELAY = 1000; // Reduced from 2000ms to 1000ms
const MAX_RETRIES = 3; // Maximum number of retries for rate-limited requests

export class GmailProvider implements EmailProvider {
  private accessToken: string;
  private baseUrl = "https://gmail.googleapis.com/gmail/v1/users/me";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Static factory method to create provider from session
  static async fromSession(): Promise<GmailProvider | null> {
    const session = await getSession();
    if (!session?.accessToken) return null;
    return new GmailProvider(session.accessToken as string);
  }

  private async fetchWithRetry(url: string, options?: RequestInit, retryCount = 0): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...(options?.headers || {}),
        },
      });

      if (response.status === 429 && retryCount < MAX_RETRIES) {
        // Calculate exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gmail API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {};
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('429') && retryCount < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  private async fetchApi(endpoint: string, options?: RequestInit) {
    const url = `${this.baseUrl}${endpoint}`;
    return this.fetchWithRetry(url, options);
  }

  // Account methods
  async getProfile() {
    const response = await this.fetchApi('/profile');
    return {
      name: response.emailAddress,
      email: response.emailAddress,
      picture: response.picture
    };
  }

  async getLabels() {
    const response = await this.fetchApi('/labels');
    return response.labels.map((label: any) => ({
      id: label.id,
      name: label.name,
      type: label.type
    }));
  }

  // Email fetching methods
  async fetchEmails({ limit = 100, pageToken, query, labelIds }: FetchEmailsOptions): Promise<FetchEmailsResult> {
    try {
      // First get total count with minimal data
      const countParams = new URLSearchParams();
      countParams.append('labelIds', 'INBOX');
      countParams.append('maxResults', '1');
      const countResponse = await this.fetchApi(`/messages?${countParams.toString()}`);
      const totalCount = countResponse.resultSizeEstimate || 0;

      // Build query parameters for actual fetch
      const params = new URLSearchParams();
      params.append('maxResults', String(Math.min(limit, 100)));
      params.append('labelIds', 'INBOX');
      
      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      // Fetch messages list with delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      const listResponse = await this.fetchApi(`/messages?${params.toString()}`);
      
      if (!listResponse.messages || listResponse.messages.length === 0) {
        return {
          emails: [],
          nextPageToken: undefined,
          resultSizeEstimate: totalCount
        };
      }

      // Process messages in smaller batches with longer delays
      const allEmails: Email[] = [];
      const messagesToProcess = listResponse.messages;
      const batchSize = 5; // Smaller batch size
      
      for (let i = 0; i < messagesToProcess.length; i += batchSize) {
        const batch = messagesToProcess.slice(i, i + batchSize);
        
        // Process each message in the batch sequentially to avoid rate limits
        for (const message of batch) {
          try {
            const email = await this.getEmail(message.id);
            if (email) {
              allEmails.push(email);
            }
            // Add delay between each message
            await new Promise(resolve => setTimeout(resolve, 250));
          } catch (error) {
            console.error('Error processing message:', error);
            // Continue with next message
          }
        }
        
        // Add longer delay between batches
        if (i + batchSize < messagesToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return {
        emails: allEmails,
        nextPageToken: listResponse.nextPageToken,
        resultSizeEstimate: totalCount
      };
    } catch (error) {
      console.error('Error in fetchEmails:', error);
      throw error;
    }
  }

  async getEmail(id: string): Promise<Email> {
    const response = await this.fetchApi(`/messages/${id}?format=full`);
    return this.parseGmailMessage(response);
  }

  async getThread(threadId: string): Promise<Email[]> {
    const response = await this.fetchApi(`/threads/${threadId}?format=full`);
    return response.messages.map((message: any) => this.parseGmailMessage(message));
  }

  // Email sending methods
  async sendEmail(options: SendEmailOptions): Promise<{id: string, threadId: string}> {
    const mimeContent = this.createMimeMessage(options);
    const base64EncodedEmail = this.encodeBase64Url(mimeContent);
    
    const response = await this.fetchApi('/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64EncodedEmail
      })
    });
    
    return {
      id: response.id,
      threadId: response.threadId
    };
  }

  async replyToEmail(emailId: string, options: Omit<SendEmailOptions, 'to'>): Promise<{id: string, threadId: string}> {
    // Get the original email to extract headers
    const originalEmail = await this.getEmail(emailId);
    
    // Create reply with proper headers
    const replyOptions: SendEmailOptions = {
      to: [originalEmail.from],
      ...options,
      subject: originalEmail.subject.startsWith('Re:') 
        ? originalEmail.subject 
        : `Re: ${originalEmail.subject}`
    };
    
    const mimeContent = this.createMimeMessage(replyOptions, {
      'In-Reply-To': emailId,
      'References': originalEmail.threadId
    });
    
    const base64EncodedEmail = this.encodeBase64Url(mimeContent);
    
    const response = await this.fetchApi('/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64EncodedEmail,
        threadId: originalEmail.threadId
      })
    });
    
    return {
      id: response.id,
      threadId: response.threadId
    };
  }

  async forwardEmail(emailId: string, options: Pick<SendEmailOptions, 'to' | 'cc' | 'bcc'>): Promise<{id: string, threadId: string}> {
    // Get the original email
    const originalEmail = await this.getEmail(emailId);
    
    // Create forward options
    const forwardOptions: SendEmailOptions = {
      ...options,
      subject: originalEmail.subject.startsWith('Fwd:') 
        ? originalEmail.subject 
        : `Fwd: ${originalEmail.subject}`,
      body: `---------- Forwarded message ---------
From: ${originalEmail.from.name || originalEmail.from.email} <${originalEmail.from.email}>
Date: ${originalEmail.receivedAt.toLocaleString()}
Subject: ${originalEmail.subject}
To: ${originalEmail.to.map(recipient => `${recipient.name || recipient.email} <${recipient.email}>`).join(', ')}

${originalEmail.bodyText || originalEmail.body}`
    };
    
    // Send the forwarded email
    return this.sendEmail(forwardOptions);
  }

  // Email management methods
  async markAsRead(emailId: string | string[]): Promise<void> {
    const ids = Array.isArray(emailId) ? emailId : [emailId];
    await this.modifyMessages(ids, { removeLabelIds: ['UNREAD'] });
  }

  async markAsUnread(emailId: string | string[]): Promise<void> {
    const ids = Array.isArray(emailId) ? emailId : [emailId];
    await this.modifyMessages(ids, { addLabelIds: ['UNREAD'] });
  }

  async addLabel(emailId: string | string[], labelId: string): Promise<void> {
    const ids = Array.isArray(emailId) ? emailId : [emailId];
    await this.modifyMessages(ids, { addLabelIds: [labelId] });
  }

  async removeLabel(emailId: string | string[], labelId: string): Promise<void> {
    const ids = Array.isArray(emailId) ? emailId : [emailId];
    await this.modifyMessages(ids, { removeLabelIds: [labelId] });
  }

  async trashEmail(emailId: string | string[]): Promise<void> {
    const ids = Array.isArray(emailId) ? emailId : [emailId];
    
    for (const id of ids) {
      await this.fetchApi(`/messages/${id}/trash`, {
        method: 'POST'
      });
    }
  }

  async deleteEmail(emailId: string | string[]): Promise<void> {
    const ids = Array.isArray(emailId) ? emailId : [emailId];
    
    for (const id of ids) {
      await this.fetchApi(`/messages/${id}`, {
        method: 'DELETE'
      });
    }
  }

  // Helper methods
  private async modifyMessages(ids: string[], modifications: { addLabelIds?: string[], removeLabelIds?: string[] }): Promise<void> {
    try {
      // For batch modification
      await this.fetchApi('/messages/batchModify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids,
          ...modifications
        })
      });
    } catch (error) {
      console.error('Error modifying messages:', error);
      // Continue without throwing - this allows viewing emails even if marking as read fails
    }
  }

  private parseGmailMessage(message: any): Email {
    // Extract headers
    const headers = message.payload.headers.reduce((acc: any, header: any) => {
      acc[header.name.toLowerCase()] = header.value;
      return acc;
    }, {});
    
    // Parse email addresses
    const from = this.parseEmailAddress(headers.from || '');
    const to = this.parseEmailAddresses(headers.to || '');
    const cc = headers.cc ? this.parseEmailAddresses(headers.cc) : undefined;
    const bcc = headers.bcc ? this.parseEmailAddresses(headers.bcc) : undefined;
    
    // Extract body parts
    const parts = this.extractParts(message.payload);
    const bodyHtml = parts.find(part => part.mimeType === 'text/html')?.body;
    const bodyText = parts.find(part => part.mimeType === 'text/plain')?.body;
    
    // Extract attachments
    const attachments = parts
      .filter(part => part.filename && part.body)
      .map(part => ({
        filename: part.filename,
        contentType: part.mimeType,
        size: part.body.length,
        content: part.body
      }));
    
    // Check labels for read/starred status
    const labels = message.labelIds || [];
    const isRead = !labels.includes('UNREAD');
    const isStarred = labels.includes('STARRED');
    
    return {
      id: message.id,
      threadId: message.threadId,
      subject: headers.subject || '(No Subject)',
      snippet: message.snippet || '',
      from,
      to,
      cc,
      bcc,
      body: bodyHtml || bodyText || '',
      bodyHtml,
      bodyText,
      attachments: attachments.length > 0 ? attachments : undefined,
      labels,
      isRead,
      isStarred,
      receivedAt: new Date(parseInt(message.internalDate, 10))
    };
  }

  private parseEmailAddress(addressString: string): EmailAddress {
    // Parse "Name <email@example.com>" format
    const match = addressString.match(/^(.+)<(.+)>$/);
    
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim()
      };
    }
    
    // Just an email address
    return {
      email: addressString.trim()
    };
  }

  private parseEmailAddresses(addressString: string): EmailAddress[] {
    // Split by commas and parse each address
    return addressString
      .split(',')
      .map(address => this.parseEmailAddress(address.trim()))
      .filter(address => address.email);
  }

  private extractParts(payload: any, parts: any[] = []): any[] {
    // If this part has a body, add it
    if (payload.body && payload.body.data) {
      parts.push({
        mimeType: payload.mimeType,
        filename: payload.filename,
        body: Buffer.from(payload.body.data, 'base64').toString('utf-8')
      });
    }
    
    // If this part has sub-parts, process them
    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        this.extractParts(part, parts);
      }
    }
    
    return parts;
  }

  private createMimeMessage(options: SendEmailOptions, additionalHeaders: Record<string, string> = {}): string {
    // Create email headers
    const headers: Record<string, string> = {
      'MIME-Version': '1.0',
      'Content-Type': 'text/html; charset=utf-8',
      'Subject': options.subject,
      'From': 'me', // Default to 'me' as Gmail API will use the authenticated user
      'To': options.to.map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.email}>` 
          : recipient.email
      ).join(', '),
      ...additionalHeaders
    };
    
    // Add CC and BCC if provided
    if (options.cc && options.cc.length > 0) {
      headers['Cc'] = options.cc.map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.email}>` 
          : recipient.email
      ).join(', ');
    }
    
    if (options.bcc && options.bcc.length > 0) {
      headers['Bcc'] = options.bcc.map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.email}>` 
          : recipient.email
      ).join(', ');
    }
    
    // Create header string
    const headerString = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n');
    
    // Combine headers and body
    return `${headerString}\r\n\r\n${options.body}`;
  }

  private encodeBase64Url(data: string): string {
    // Encode to base64
    const base64 = Buffer.from(data).toString('base64');
    
    // Make URL safe
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
} 