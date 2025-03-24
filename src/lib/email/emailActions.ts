import { EmailService } from './emailService';

export async function markAsRead(emailId: string): Promise<void> {
  try {
    const emailService = await EmailService.create();
    if (!emailService) throw new Error('Failed to create email service');
    await emailService.markAsRead(emailId);
  } catch (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
}

export async function markAsUnread(emailId: string): Promise<void> {
  try {
    const emailService = await EmailService.create();
    if (!emailService) throw new Error('Failed to create email service');
    await emailService.markAsUnread(emailId);
  } catch (error) {
    console.error('Error marking email as unread:', error);
    throw error;
  }
}

export async function archiveEmail(emailId: string): Promise<void> {
  try {
    const emailService = await EmailService.create();
    if (!emailService) throw new Error('Failed to create email service');
    await emailService.removeLabel(emailId, 'INBOX');
  } catch (error) {
    console.error('Error archiving email:', error);
    throw error;
  }
}

export async function deleteEmail(emailId: string): Promise<void> {
  try {
    const emailService = await EmailService.create();
    if (!emailService) throw new Error('Failed to create email service');
    await emailService.trashEmail(emailId);
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
}

export async function addLabel(emailId: string, label: string): Promise<void> {
  try {
    const emailService = await EmailService.create();
    if (!emailService) throw new Error('Failed to create email service');
    await emailService.addLabel(emailId, label);
  } catch (error) {
    console.error('Error adding label:', error);
    throw error;
  }
}

export async function removeLabel(emailId: string, label: string): Promise<void> {
  try {
    const emailService = await EmailService.create();
    if (!emailService) throw new Error('Failed to create email service');
    await emailService.removeLabel(emailId, label);
  } catch (error) {
    console.error('Error removing label:', error);
    throw error;
  }
} 