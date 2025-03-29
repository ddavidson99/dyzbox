"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { EmailService } from '@/lib/email/emailService';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { Email } from '@/lib/email/providers/EmailProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash, ArrowsClockwise, CaretLeft, CaretRight, CaretDown, SignOut } from '@phosphor-icons/react';
import EmailDetailModal from '@/components/EmailDetailModal';
import { getTrashCounts } from '../actions/emailCounts';

export default function TrashPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for emails and UI
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Pagination states
  const [pageToken, setPageToken] = useState<string | undefined>();
  const [pageTokenStack, setPageTokenStack] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 25; // Gmail default
  
  // Email count state
  const [emailCounts, setEmailCounts] = useState({ totalEmails: 0, unreadEmails: 0 });
  const [countsLoading, setCountsLoading] = useState(true);
  
  // Cache indicator state
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ size: 0, maxSize: 10, memoryStatus: 'low' });
  
  // Add state to track current page bounds
  const [currentPageRange, setCurrentPageRange] = useState({ start: 0, end: 0 });
  
  // Get selected email ID from URL or state
  const selectedEmailId = searchParams.get('id') || (selectedEmail?.id || null);

  // Function to update page range display based on current page
  const updatePageRange = (pageIndex = currentPageIndex) => {
    const start = (pageIndex * itemsPerPage) + 1;
    const end = Math.min(start + itemsPerPage - 1, emailCounts.totalEmails);
    setCurrentPageRange({ start, end });
  };

  // When email counts are loaded, update page range
  useEffect(() => {
    if (emailCounts.totalEmails > 0) {
      updatePageRange();
    }
  }, [emailCounts.totalEmails]);

  // Create email service instance
  const getEmailService = () => {
    if (!session?.accessToken) return null;
    const emailProvider = new GmailProvider(session.accessToken as string);
    return new EmailService(emailProvider);
  };

  // Function to load emails
  const loadEmails = async (token?: string, isGoingBack = false) => {
    if (!session?.accessToken || loadingMore) return;
    
    const emailService = getEmailService();
    if (!emailService) return;
    
    try {
      setLoadingMore(true);
      setError(null);
      
      // Start with not using cached data
      setUsingCachedData(false);
      
      // Get the cache size before the request
      const cacheSizeBefore = emailService.getCacheSize();
      
      const result = await emailService.getTrash({ 
        pageToken: token,
        limit: itemsPerPage
      });
      
      // Check if data came from cache by comparing cache sizes
      // If cache size didn't change, the result came from cache
      const cacheSizeAfter = emailService.getCacheSize();
      const cacheService = (emailService as any).cacheService;
      
      setUsingCachedData(cacheSizeBefore === cacheSizeAfter && cacheSizeBefore > 0);
      setCacheInfo({ 
        size: cacheSizeAfter,
        maxSize: cacheService?.getMaxCacheSize() || 10,
        memoryStatus: cacheService?.getMemoryStatus() || 'low'
      });
      
      // Set emails from the result
      setEmails(result.emails);
      
      // Handle pagination tokens and page index tracking
      let newPageIndex = currentPageIndex;
      
      if (isGoingBack) {
        // When going back, we just update the pageIndex
        newPageIndex = currentPageIndex - 1;
        setPageToken(token);
        setCurrentPageIndex(newPageIndex);
      } else if (result.nextPageToken) {
        // When going forward with a token, increment page index
        if (token) {
          setPageTokenStack(prev => [...prev.slice(0, currentPageIndex + 1), token]);
          newPageIndex = currentPageIndex + 1;
          setCurrentPageIndex(newPageIndex);
        }
        setPageToken(result.nextPageToken);
      }
      
      // Update page range display (calculate based on loaded emails)
      updatePageRange(newPageIndex);
      
      // Set next/previous page availability
      setHasNextPage(!!result.nextPageToken);
      setHasPreviousPage(newPageIndex > 0);
      
      // If we're using cached data, fade out the cache indicator after 2 seconds
      if (usingCachedData) {
        setTimeout(() => {
          setUsingCachedData(false);
        }, 2000);
      }
      
    } catch (e: any) {
      console.error('Error loading trash emails:', e);
      setError(e.message || 'Failed to load trash emails');
    } finally {
      setLoadingMore(false);
      setLoading(false);
    }
  };

  // Function to fetch email counts
  const fetchEmailCounts = async () => {
    try {
      setCountsLoading(true);
      const result = await getTrashCounts();
      
      if (result.success) {
        setEmailCounts({
          totalEmails: result.totalEmails,
          unreadEmails: result.unreadEmails
        });
      }
    } catch (error) {
      // Silent failure - don't log to console
    } finally {
      setCountsLoading(false);
    }
  };

  // Function to refresh trash
  const refreshTrash = () => {
    // Clear email cache
    const emailService = getEmailService();
    if (emailService) {
      emailService.clearCache();
    }
    
    setLoading(true);
    setPageToken(undefined);
    setPageTokenStack([]);
    setCurrentPageIndex(0);
    setHasPreviousPage(false);
    loadEmails();
    fetchEmailCounts();
  };

  // Initial load
  useEffect(() => {
    if (session?.accessToken) {
      // Set up initial loading states
      setLoading(true);
      setCurrentPageIndex(0);
      setPageTokenStack([]);
      setPageToken(undefined);
      
      // Start both loading processes simultaneously
      loadEmails();
      
      // Load email counts in parallel, but don't block UI
      fetchEmailCounts();
    }
  }, [session]);

  // Handle page navigation
  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      const newIndex = currentPageIndex - 1;
      const prevToken = newIndex > 0 ? pageTokenStack[newIndex - 1] : undefined;
      
      // Set current page index before loading emails
      setCurrentPageIndex(newIndex);
      
      // Explicitly update the page token
      setPageToken(prevToken);
      
      // For page 1, explicitly set hasPreviousPage to false
      if (newIndex === 0) {
        setHasPreviousPage(false);
      }
      
      loadEmails(prevToken, true);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      // Don't update currentPageIndex here - it's handled in loadEmails
      loadEmails(pageToken);
    }
  };
  
  // Handle direct page selection
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePageSelect = (pageNum: number) => {
    if (pageNum === currentPageIndex + 1) {
      // Already on this page
      setShowPageDropdown(false);
      return;
    }

    // Handle page navigation
    const targetIndex = pageNum - 1;
    
    // IMPORTANT: Always update the currentPageIndex when jumping to a page
    setCurrentPageIndex(targetIndex);
    
    // Calculate the page range based on the selected page number
    const start = (pageNum - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, emailCounts.totalEmails);
    setCurrentPageRange({ start, end });
    
    if (targetIndex < currentPageIndex) {
      // Going backward
      const targetToken = targetIndex > 0 ? pageTokenStack[targetIndex - 1] : undefined;
      
      loadEmails(targetToken, true);
    } else if (targetIndex > currentPageIndex) {
      // Can only go forward one page at a time due to token-based pagination
      if (targetIndex === currentPageIndex + 1 && hasNextPage) {
        loadEmails(pageToken);
      }
    }
    
    setShowPageDropdown(false);
  };

  // Get the current page number - derive directly from currentPageIndex
  const currentPage = currentPageIndex + 1;

  // Total pages is an estimate since we don't know exact total without fetching all
  const estimatedTotalPages = Math.ceil(emailCounts.totalEmails / itemsPerPage);
  
  // Generate page numbers for dropdown (current page ± 3, capped at 1 and estimatedTotalPages)
  const getPageOptions = () => {
    const pageOptions = [];
    const minPage = Math.max(1, currentPage - 3);
    const maxPage = Math.min(estimatedTotalPages, currentPage + 3);
    
    for (let i = minPage; i <= maxPage; i++) {
      pageOptions.push(i);
    }
    
    return pageOptions;
  };
  
  const pageOptions = getPageOptions();

  // Email selection handlers
  const handleEmailSelect = (email: Email) => {
    const params = new URLSearchParams(searchParams);
    params.set('id', email.id);
    router.push(`/trash?${params.toString()}`);
    setSelectedEmail(email);
    
    if (!email.isRead && session?.accessToken) {
      const emailProvider = new GmailProvider(session.accessToken as string);
      const emailService = new EmailService(emailProvider);
      emailService.markAsRead(email.id).catch(e => {
        console.error('Error marking email as read:', e);
      });
    }
  };
  
  const handleClose = () => {
    setSelectedEmail(null);
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    router.push(`/trash?${params.toString()}`);
  };

  // Handle email read action
  const handleEmailRead = (emailId: string) => {
    // Update the UI to show email as read
    setEmails(prev => 
      prev.map(email => 
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
  };
  
  // Handle email restoration or permanent deletion
  const handleEmailAction = (emailId: string) => {
    // Remove the email from the list
    setEmails(prev => prev.filter(email => email.id !== emailId));
    
    // Important: Set selectedEmail to null first to prevent re-fetching
    setSelectedEmail(null);
    
    // Update URL to remove the selected email ID
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    router.push(`/trash?${params.toString()}`);
  };

  // Load email details if ID is in URL but email data is not in selected state
  useEffect(() => {
    const loadEmailById = async (id: string) => {
      if (!session?.accessToken) return;
      
      // Check if the email is already in our loaded list
      const existingEmail = emails.find(e => e.id === id);
      if (existingEmail) {
        setSelectedEmail(existingEmail);
        return;
      }
      
      // Check if we just deleted this email (avoid re-fetching deleted emails)
      const wasJustDeleted = !emails.some(e => e.id === id);
      if (wasJustDeleted && emails.length > 0) {
        // Email not found and we have emails loaded - likely deleted
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.push(`/trash?${params.toString()}`);
        return;
      }
      
      // Email not in current page, need to load it
      setEmailLoading(true);
      setEmailError(null);
      
      try {
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        const email = await emailService.getEmail(id);
        setSelectedEmail(email);
      } catch (e: any) {
        console.error('Error loading email:', e);
        setEmailError(e.message || 'Failed to load email');
        // Clear the URL if we can't load the email
        const params = new URLSearchParams(searchParams);
        params.delete('id');
        router.push(`/trash?${params.toString()}`);
      } finally {
        setEmailLoading(false);
      }
    };
    
    if (selectedEmailId && !selectedEmail) {
      loadEmailById(selectedEmailId);
    }
  }, [selectedEmailId, selectedEmail, session, emails, router, searchParams]);
  
  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Trash className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Trash
                {countsLoading ? (
                  <span className="text-sm font-medium text-gray-400 ml-2">
                    Loading...
                  </span>
                ) : emailCounts.unreadEmails > 0 && (
                  <span 
                    className="text-sm font-medium text-gray-500 ml-2"
                    title={`Total unread emails in Trash`}
                  >
                    {emailCounts.unreadEmails.toLocaleString()}
                  </span>
                )}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {usingCachedData && (
                <span 
                  className={`text-xs animate-fadeOut ${
                    cacheInfo.memoryStatus === 'high' ? 'text-orange-400' :
                    cacheInfo.memoryStatus === 'medium' ? 'text-gray-400' : 'text-gray-300'
                  }`}
                  title={`Using cached data (${cacheInfo.size}/${cacheInfo.maxSize} pages in cache, memory pressure: ${cacheInfo.memoryStatus})`}
                >
                  Cached
                </span>
              )}
              
              <button
                onClick={refreshTrash}
                disabled={loading || loadingMore}
                className="text-gray-500 hover:bg-gray-100 p-1 rounded"
                aria-label="Refresh trash"
              >
                <ArrowsClockwise size={16} />
              </button>
              
              <div className="flex items-center text-xs">
                {countsLoading ? (
                  <span className="mr-3 text-gray-400">
                    Loading...
                  </span>
                ) : emails.length > 0 && (
                  <span className="mr-3 text-gray-600">
                    {currentPageRange.start}-{currentPageRange.end} of {emailCounts.totalEmails.toLocaleString()}
                  </span>
                )}
                <button 
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage || loadingMore || loading}
                  className={`p-1 rounded ${!hasPreviousPage || loadingMore || loading ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="Previous page"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowPageDropdown(!showPageDropdown)}
                    className="mx-2 text-gray-600 hover:bg-gray-100 rounded px-2 py-1 flex items-center"
                    disabled={loading || loadingMore}
                  >
                    Page {currentPage}
                    <CaretDown size={12} weight="bold" className="ml-1" />
                  </button>
                  
                  {showPageDropdown && (
                    <div className="absolute top-full mt-1 left-0 bg-white shadow-md rounded-md py-1 z-10 min-w-[100px]">
                      {pageOptions.map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageSelect(pageNum)}
                          disabled={pageNum > currentPage + 1} // Can only go forward one page
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 ${
                            pageNum === currentPage ? 'bg-gray-100 font-medium' : ''
                          } ${
                            pageNum > currentPage + 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
                          }`}
                        >
                          Page {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loadingMore || loading}
                  className={`p-1 rounded ${!hasNextPage || loadingMore || loading ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                  aria-label="Next page"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm">Loading trash...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && emails.length === 0 && !error ? (
            <p className="text-sm text-gray-500">No emails found in trash</p>
          ) : (
            <div className="overflow-y-auto">
              <ul className="space-y-1">
                {emails.map((email) => (
                  <li key={email.id}>
                    <button 
                      onClick={() => handleEmailSelect(email)}
                      className={`block w-full text-left p-2 rounded cursor-pointer text-xs hover:bg-gray-100 
                        ${!email.isRead ? 'font-semibold bg-gray-50 bg-opacity-80 border-l-2 border-blue-200' : ''}
                        ${selectedEmailId === email.id ? 'bg-gray-100' : ''}`}
                    >
                      <div className="grid grid-cols-[16.625%_83.375%] gap-2">
                        <div className="self-start font-medium truncate">
                          {email.from.name || email.from.email}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex justify-between mb-1">
                            <div className="text-xs font-semibold truncate">{email.subject}</div>
                            <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                              {(() => {
                                const emailDate = new Date(email.receivedAt);
                                const today = new Date();
                                const isToday = emailDate.toDateString() === today.toDateString();
                                return isToday
                                  ? emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                              })()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 truncate">{email.snippet}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              
              {loadingMore && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">Loading more emails...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {selectedEmail && (
        <EmailDetailModal 
          email={selectedEmail} 
          onClose={handleClose}
          onEmailRead={handleEmailRead}
          onEmailAction={handleEmailAction}
        />
      )}
      
      {emailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white p-4 rounded-lg shadow">
            <p>Loading email...</p>
          </div>
        </div>
      )}
      
      {emailError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white p-4 rounded-lg shadow max-w-md">
            <h3 className="text-lg font-bold mb-2">Error Loading Email</h3>
            <p className="text-red-600">{emailError}</p>
            <div className="mt-4 text-right">
              <button 
                onClick={() => setEmailError(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 