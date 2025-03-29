import { EmailProvider, FetchEmailsOptions, SendEmailOptions } from './providers/EmailProvider';
import { GmailProvider } from './providers/GmailProvider';
import { emailCacheService, EmailCacheService } from './emailCacheService';

// Helper type for EmailCacheKey's type property
type EmailType = 'inbox' | 'sent' | 'trash' | 'spam' | 'draft' | 'search';

export class EmailService {
  private provider: EmailProvider;
  private cacheService: EmailCacheService;

  constructor(provider: EmailProvider, cacheService = emailCacheService) {
    this.provider = provider;
    this.cacheService = cacheService;
    
    // Set up prefetch callback for the cache service
    this.cacheService.setPrefetchCallback(async (key) => {
      try {
        return await this.fetchEmailsDirectly({
          limit: key.limit,
          pageToken: key.pageToken,
          query: key.query,
          labelIds: key.labelIds
        });
      } catch (error) {
        console.error('Error during prefetch:', error);
        return null;
      }
    });
  }

  static async create(): Promise<EmailService | null> {
    const gmailProvider = await GmailProvider.fromSession();
    if (!gmailProvider) return null;
    return new EmailService(gmailProvider);
  }

  /**
   * Direct fetch method that bypasses cache
   */
  private async fetchEmailsDirectly(options: FetchEmailsOptions) {
    return this.provider.fetchEmails(options);
  }

  /**
   * Fetch emails with caching support
   */
  private async fetchEmailsWithCaching(type: EmailType, options: FetchEmailsOptions = {}) {
    // Create cache key
    const cacheKey = {
      type,
      pageToken: options.pageToken,
      query: options.query,
      labelIds: options.labelIds,
      limit: options.limit
    };
    
    // Check cache first
    const cachedResult = this.cacheService.get(cacheKey);
    if (cachedResult) {
      // If we have a nextPageToken in the cached result, queue it for prefetching
      if (cachedResult.nextPageToken) {
        const nextPageKey = {
          ...cacheKey,
          pageToken: cachedResult.nextPageToken
        };
        this.cacheService.queueForPrefetch(nextPageKey, 10); // High priority for next page
      }
      
      return cachedResult;
    }
    
    // Not in cache, fetch from provider
    const result = await this.fetchEmailsDirectly(options);
    
    // Store in cache
    this.cacheService.set(cacheKey, result);
    
    // Queue next page for prefetching
    if (result.nextPageToken) {
      const nextPageKey = {
        ...cacheKey,
        pageToken: result.nextPageToken
      };
      this.cacheService.queueForPrefetch(nextPageKey, 10); // High priority for next page
    }
    
    // For first page, also prefetch second next page
    if (!options.pageToken && result.nextPageToken) {
      // We'll need to lookup the token for the second page
      setTimeout(() => {
        const nextPageKey = this.cacheService.getNextPageKey(cacheKey);
        if (nextPageKey) {
          const secondNextPageKey = this.cacheService.getNextPageKey(nextPageKey);
          if (secondNextPageKey) {
            this.cacheService.queueForPrefetch(secondNextPageKey, 5); // Medium priority
          }
        }
      }, 2000); // Small delay to allow first prefetch to complete
    }
    
    return result;
  }

  async getInbox(options?: FetchEmailsOptions) {
    return this.fetchEmailsWithCaching('inbox', {
      limit: 100,
      ...options,
      labelIds: ['INBOX']
    });
  }

  async getImportant(options?: FetchEmailsOptions) {
    return this.fetchEmailsWithCaching('inbox', {
      limit: 500,
      ...options,
      labelIds: ['IMPORTANT']
    });
  }

  async getSent(options?: FetchEmailsOptions) {
    return this.fetchEmailsWithCaching('sent', {
      limit: 500,
      ...options,
      labelIds: ['SENT']
    });
  }

  async getDrafts(options?: FetchEmailsOptions) {
    return this.fetchEmailsWithCaching('draft', {
      limit: 500,
      ...options,
      labelIds: ['DRAFT']
    });
  }

  async getTrash(options?: FetchEmailsOptions) {
    return this.fetchEmailsWithCaching('trash', {
      limit: 500,
      ...options,
      labelIds: ['TRASH']
    });
  }

  async getSpam(options?: FetchEmailsOptions) {
    return this.fetchEmailsWithCaching('spam', {
      limit: 500,
      ...options,
      labelIds: ['SPAM']
    });
  }

  async searchEmails(query: string, options?: Omit<FetchEmailsOptions, 'query'>) {
    return this.fetchEmailsWithCaching('search', {
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
    // Invalidate cache after sending email
    this.cacheService.clear();
    return this.provider.sendEmail(options);
  }

  async replyToEmail(emailId: string, options: Omit<SendEmailOptions, 'to'>) {
    // Invalidate cache after replying to email
    this.cacheService.clear();
    return this.provider.replyToEmail(emailId, options);
  }

  async forwardEmail(emailId: string, options: Pick<SendEmailOptions, 'to' | 'cc' | 'bcc'>) {
    // Invalidate cache after forwarding email
    this.cacheService.clear();
    return this.provider.forwardEmail(emailId, options);
  }

  async markAsRead(emailId: string | string[]) {
    // Don't invalidate cache as read status doesn't affect list order
    return this.provider.markAsRead(emailId);
  }

  async markAsUnread(emailId: string | string[]) {
    // Don't invalidate cache as read status doesn't affect list order
    return this.provider.markAsUnread(emailId);
  }

  async trashEmail(emailId: string | string[]) {
    // Invalidate inbox and label caches as email has moved
    this.invalidateEmailListCaches();
    return this.provider.trashEmail(emailId);
  }

  async deleteEmail(emailId: string | string[]) {
    // Invalidate all caches as email is deleted
    this.invalidateEmailListCaches();
    return this.provider.deleteEmail(emailId);
  }

  async getLabels() {
    return this.provider.getLabels();
  }

  async addLabel(emailId: string | string[], labelId: string) {
    // Invalidate label caches
    this.invalidateEmailListCaches();
    return this.provider.addLabel(emailId, labelId);
  }

  async removeLabel(emailId: string | string[], labelId: string) {
    // Invalidate label caches
    this.invalidateEmailListCaches();
    return this.provider.removeLabel(emailId, labelId);
  }
  
  /**
   * Invalidate all email list caches
   */
  private invalidateEmailListCaches() {
    this.cacheService.clear();
  }
  
  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cacheService.size;
  }
  
  /**
   * Clear email cache
   */
  clearCache(): void {
    this.cacheService.clear();
  }
} 