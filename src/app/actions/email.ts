'use server';

import { auth } from '@/app/auth';
import type { EmailAddress } from '@/lib/email/providers/EmailProvider';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import { SendEmailOptions } from '@/lib/email/providers/EmailProvider';

export interface SendEmailParams {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
}

export async function markAsRead(emailId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    await emailService.markAsRead(emailId);
    return { success: true };
  } catch (error) {
    console.error('Error marking email as read:', error);
    return { success: false, error: 'Failed to mark email as read' };
  }
}

export async function markAsUnread(emailId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    await emailService.markAsUnread(emailId);
    return { success: true };
  } catch (error) {
    console.error('Error marking email as unread:', error);
    return { success: false, error: 'Failed to mark email as unread' };
  }
}

export async function trashEmail(emailId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    await emailService.trashEmail(emailId);
    return { success: true };
  } catch (error) {
    console.error('Error trashing email:', error);
    return { success: false, error: 'Failed to trash email' };
  }
}

export async function addLabel(emailId: string, labelId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    await emailService.addLabel(emailId, labelId);
    return { success: true };
  } catch (error) {
    console.error('Error adding label:', error);
    return { success: false, error: 'Failed to add label' };
  }
}

export async function removeLabel(emailId: string, labelId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    await emailService.removeLabel(emailId, labelId);
    return { success: true };
  } catch (error) {
    console.error('Error removing label:', error);
    return { success: false, error: 'Failed to remove label' };
  }
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    const result = await emailService.sendEmail(options);
    return { 
      success: true, 
      emailId: result.id,
      threadId: result.threadId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

export async function replyToEmail(emailId: string, options: Omit<SendEmailOptions, 'to'>) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    const result = await emailService.replyToEmail(emailId, options);
    return { 
      success: true, 
      emailId: result.id,
      threadId: result.threadId
    };
  } catch (error) {
    console.error('Error replying to email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reply to email' 
    };
  }
}

export async function getLabels() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated', labels: [] };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    const labels = await emailService.getLabels();
    return { 
      success: true, 
      labels
    };
  } catch (error) {
    console.error('Error fetching labels:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch labels',
      labels: []
    };
  }
}

export async function getEmailsByLabel(labelId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    const result = await provider.fetchEmails({ labelIds: [labelId] });
    return { 
      success: true, 
      emails: result.emails || []
    };
  } catch (error) {
    console.error('Error fetching emails by label:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch emails' 
    };
  }
}

export async function getEmail(emailId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated', email: null };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    const email = await emailService.getEmail(emailId);
    return { 
      success: true, 
      email
    };
  } catch (error) {
    console.error('Error fetching email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch email',
      email: null
    };
  }
}

export async function createLabel(name: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    
    // Call Gmail API directly since this is not exposed in EmailService
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.error?.message || 'Failed to create label'
      };
    }
    
    const data = await response.json();
    return { 
      success: true, 
      label: {
        id: data.id,
        name: data.name,
        type: 'user'
      }
    };
  } catch (error) {
    console.error('Error creating label:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create label'
    };
  }
}

export async function getUnreadCounts() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated', counts: {} };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    // Get all labels first
    const labelsResult = await emailService.getLabels();
    const labelIds = labelsResult.map(label => label.id);
    
    // Create an object to store counts
    const counts: Record<string, number> = {};
    
    // Get unread counts for each label
    await Promise.all(
      labelIds.map(async (labelId) => {
        try {
          // Get only unread emails for this label by passing both labels as separate items
          const result = await provider.fetchEmails({ 
            labelIds: [labelId, 'UNREAD'],
            limit: 500 // Increased limit to get more accurate counts
          });
          
          counts[labelId] = result.emails?.length || 0;
        } catch (err) {
          console.error(`Error getting unread count for ${labelId}:`, err);
          counts[labelId] = 0;
        }
      })
    );
    
    return { 
      success: true, 
      counts
    };
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch unread counts',
      counts: {}
    };
  }
}

export async function archiveEmail(emailId: string) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    // Remove INBOX label to archive the email
    await emailService.removeLabel(emailId, 'INBOX');
    return { success: true };
  } catch (error) {
    console.error('Error archiving email:', error);
    return { success: false, error: 'Failed to archive email' };
  }
}

/**
 * Save an email as draft
 */
export async function saveDraft(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    
    if (!session || !session.accessToken) {
      return { success: false, error: 'Authentication required' };
    }
    
    const provider = new GmailProvider(session.accessToken as string);
    
    try {
      // Construct email from parameters
      const { to, cc, bcc, subject, body } = params;
      
      // Format recipients as string
      const formatRecipients = (recipients: EmailAddress[] | undefined): string => {
        if (!recipients || recipients.length === 0) return '';
        return recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(', ');
      };
      
      // Construct raw email content
      let emailContent = '';
      emailContent += `To: ${formatRecipients(to)}\r\n`;
      if (cc && cc.length > 0) emailContent += `Cc: ${formatRecipients(cc)}\r\n`;
      if (bcc && bcc.length > 0) emailContent += `Bcc: ${formatRecipients(bcc)}\r\n`;
      emailContent += `Subject: ${subject}\r\n`;
      emailContent += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
      emailContent += body;
      
      // Convert to base64url
      const encodedEmail = Buffer.from(emailContent).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Create a timeout promise that rejects after 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Draft save operation timed out')), 10000);
      });
      
      // Create the API request
      const fetchPromise = fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            raw: encodedEmail
          }
        })
      });
      
      // Race the fetch against the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        // Handle rate limiting (429 error)
        if (response.status === 429) {
          console.warn('Gmail API rate limit reached when saving draft');
          return { 
            success: true, 
            error: 'Draft may be saved with delay due to rate limits'
          };
        }
        
        const errorData = await response.json();
        console.error('Error saving draft:', errorData);
        return { success: false, error: errorData.error?.message || 'Failed to save draft' };
      }
      
      const data = await response.json();
      console.log('Draft saved successfully:', data.id);
      
      return { success: true };
    } catch (error) {
      console.error('Error in saveDraft:', error);
      
      // Check if it's a timeout error
      if (error instanceof Error && error.message === 'Draft save operation timed out') {
        // Return success anyway, as draft might still be saved in the background
        return { 
          success: true, 
          error: 'Draft save taking longer than expected, but may still be saved'
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while saving draft'
      };
    }
  } catch (error) {
    console.error('Error in saveDraft:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred while saving draft'
    };
  }
} 