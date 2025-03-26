import { EmailProvider, FetchEmailsOptions, SendEmailOptions } from './providers/EmailProvider';
import { GmailProvider } from './providers/GmailProvider';

export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  static async create(): Promise<EmailService | null> {
    const gmailProvider = await GmailProvider.fromSession();
    if (!gmailProvider) return null;
    return new EmailService(gmailProvider);
  }

  async getInbox(options?: FetchEmailsOptions) {
    return this.provider.fetchEmails({
      limit: 100,
      ...options,
      labelIds: ['INBOX']
    });
  }

  async getImportant(options?: FetchEmailsOptions) {
    return this.provider.fetchEmails({
      limit: 500,
      ...options,
      labelIds: ['IMPORTANT']
    });
  }

  async getSent(options?: FetchEmailsOptions) {
    return this.provider.fetchEmails({
      limit: 500,
      ...options,
      labelIds: ['SENT']
    });
  }

  async getDrafts(options?: FetchEmailsOptions) {
    return this.provider.fetchEmails({
      limit: 500,
      ...options,
      labelIds: ['DRAFT']
    });
  }

  async getTrash(options?: FetchEmailsOptions) {
    return this.provider.fetchEmails({
      limit: 500,
      ...options,
      labelIds: ['TRASH']
    });
  }

  async getSpam(options?: FetchEmailsOptions) {
    return this.provider.fetchEmails({
      limit: 500,
      ...options,
      labelIds: ['SPAM']
    });
  }

  async searchEmails(query: string, options?: Omit<FetchEmailsOptions, 'query'>) {
    return this.provider.fetchEmails({
      ...options,
      query
    });
  }

  // Passthrough methods
  async getEmail(id: string) {
    return this.provider.getEmail(id);
  }

  async getThread(threadId: string) {
    return this.provider.getThread(threadId);
  }

  async sendEmail(options: SendEmailOptions) {
    return this.provider.sendEmail(options);
  }

  async replyToEmail(emailId: string, options: Omit<SendEmailOptions, 'to'>) {
    return this.provider.replyToEmail(emailId, options);
  }

  async forwardEmail(emailId: string, options: Pick<SendEmailOptions, 'to' | 'cc' | 'bcc'>) {
    return this.provider.forwardEmail(emailId, options);
  }

  async markAsRead(emailId: string | string[]) {
    return this.provider.markAsRead(emailId);
  }

  async markAsUnread(emailId: string | string[]) {
    return this.provider.markAsUnread(emailId);
  }

  async trashEmail(emailId: string | string[]) {
    return this.provider.trashEmail(emailId);
  }

  async deleteEmail(emailId: string | string[]) {
    return this.provider.deleteEmail(emailId);
  }

  async getLabels() {
    return this.provider.getLabels();
  }

  async addLabel(emailId: string | string[], labelId: string) {
    return this.provider.addLabel(emailId, labelId);
  }

  async removeLabel(emailId: string | string[], labelId: string) {
    return this.provider.removeLabel(emailId, labelId);
  }
} 