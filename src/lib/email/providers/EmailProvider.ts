export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  size: number;
}

export interface Email {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: EmailAttachment[];
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  receivedAt: Date;
}

export interface SendEmailOptions {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface FetchEmailsOptions {
  limit?: number;
  pageToken?: string;
  query?: string;
  labelIds?: string[];
}

export interface FetchEmailsResult {
  emails: Email[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface EmailProvider {
  // Account management
  getProfile(): Promise<{name: string, email: string, picture?: string}>;
  getLabels(): Promise<{id: string, name: string, type: string}[]>;
  
  // Email operations
  fetchEmails(options: FetchEmailsOptions): Promise<FetchEmailsResult>;
  getEmail(id: string): Promise<Email>;
  getThread(threadId: string): Promise<Email[]>;
  sendEmail(options: SendEmailOptions): Promise<{id: string, threadId: string}>;
  replyToEmail(emailId: string, options: Omit<SendEmailOptions, 'to'>): Promise<{id: string, threadId: string}>;
  forwardEmail(emailId: string, options: Pick<SendEmailOptions, 'to' | 'cc' | 'bcc'>): Promise<{id: string, threadId: string}>;
  
  // Email management
  markAsRead(emailId: string | string[]): Promise<void>;
  markAsUnread(emailId: string | string[]): Promise<void>;
  addLabel(emailId: string | string[], labelId: string): Promise<void>;
  removeLabel(emailId: string | string[], labelId: string): Promise<void>;
  trashEmail(emailId: string | string[]): Promise<void>;
  deleteEmail(emailId: string | string[]): Promise<void>;
} 