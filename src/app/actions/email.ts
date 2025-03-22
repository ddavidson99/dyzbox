'use server';

import { auth } from '@/app/auth';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import { SendEmailOptions } from '@/lib/email/providers/EmailProvider';

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