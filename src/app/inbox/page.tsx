"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { EmailService } from '@/lib/email/emailService';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { Email } from '@/lib/email/providers/EmailProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { ArrowsClockwise, ArrowBendUpLeft, ArrowSquareOut, X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import EmailActions from '@/components/EmailActions';
import EmailDetailModal from '@/components/EmailDetailModal';

// Estimate of email list item height in pixels - reduced for better space utilization
const EMAIL_ITEM_HEIGHT = 55;

export default function InboxPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Separate state for unread and read emails
  const [unreadEmails, setUnreadEmails] = useState<Email[]>([]);
  const [readEmails, setReadEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Pagination state
  const [unreadPage, setUnreadPage] = useState(1);
  const [readPage, setReadPage] = useState(1);
  const [unreadItemsPerPage, setUnreadItemsPerPage] = useState(10);
  const [readItemsPerPage, setReadItemsPerPage] = useState(10);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalRead, setTotalRead] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Refs for measuring containers
  const unreadContainerRef = useRef<HTMLDivElement>(null);
  const readContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected email ID from URL or state
  const selectedEmailId = searchParams.get('id') || (selectedEmail?.id || null);

  // Calculate pagination values
  const unreadTotalPages = Math.ceil(totalUnread / unreadItemsPerPage);
  const readTotalPages = Math.ceil(totalRead / readItemsPerPage);

  // Function to fetch email counts
  const fetchEmailCounts = async () => {
    if (!session?.accessToken) return;
    
    try {
      const emailProvider = new GmailProvider(session.accessToken as string);
      const counts = await emailProvider.getEmailCounts();
      setTotalUnread(counts.totalUnread);
      setTotalRead(counts.totalRead);
    } catch (e: any) {
      console.error('Error fetching email counts:', e);
      setError(e.message || 'Failed to fetch email counts');
    }
  };

  // Function to load emails for a specific section
  const loadEmails = async (isUnread: boolean, page: number, itemsPerPage: number) => {
    if (!session?.accessToken || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const emailProvider = new GmailProvider(session.accessToken as string);
      
      const offset = (page - 1) * itemsPerPage;
      const result = await emailProvider.fetchPaginatedEmails({
        offset,
        limit: itemsPerPage,
        unreadOnly: isUnread
      });
      
      if (result.emails?.length) {
        if (isUnread) {
          setUnreadEmails(result.emails);
        } else {
          setReadEmails(result.emails);
        }
      }
    } catch (e: any) {
      console.error('Error loading emails:', e);
      setError(e.message || 'Failed to load emails');
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    async function initialize() {
      if (!session?.accessToken) return;
      
      try {
        setLoading(true);
        await fetchEmailCounts();
        
        // Load initial pages for both sections
        await Promise.all([
          loadEmails(true, unreadPage, unreadItemsPerPage),
          loadEmails(false, readPage, readItemsPerPage)
        ]);
        
        setError(null);
      } catch (e: any) {
        console.error('Error initializing inbox:', e);
        setError(e.message || 'Failed to initialize inbox');
      } finally {
        setLoading(false);
      }
    }
    
    initialize();
  }, [session]);

  // Load emails when page changes
  useEffect(() => {
    if (!loading) {
      loadEmails(true, unreadPage, unreadItemsPerPage);
    }
  }, [unreadPage, unreadItemsPerPage]);

  useEffect(() => {
    if (!loading) {
      loadEmails(false, readPage, readItemsPerPage);
    }
  }, [readPage, readItemsPerPage]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const emailId = params.get('id');
    
    if (emailId) {
      const email = unreadEmails.find(e => e.id === emailId) || readEmails.find(e => e.id === emailId);
      if (email) {
        setSelectedEmail(email);
      } else if (unreadEmails.length > 0 || readEmails.length > 0) {
        // Attempt to fetch selected email if not found in current list
        fetchEmailById(emailId);
      }
    } else {
      setSelectedEmail(null);
    }
  }, [searchParams, unreadEmails, readEmails]);
  
  const fetchEmailById = async (emailId: string) => {
    if (!session?.accessToken) return;
    
    try {
      setEmailLoading(true);
      const emailProvider = new GmailProvider(session.accessToken as string);
      const emailService = new EmailService(emailProvider);
      
      const email = await emailService.getEmail(emailId);
      if (email) {
        setSelectedEmail(email);
        setEmailError(null);
      } else {
        setEmailError('Email not found');
      }
    } catch (e: any) {
      console.error('Error fetching email:', e);
      setEmailError(e.message || 'Failed to fetch email');
    } finally {
      setEmailLoading(false);
    }
  };
  
  const handleEmailSelect = (email: Email) => {
    // Update URL with selected email ID
    const params = new URLSearchParams(searchParams);
    params.set('id', email.id);
    router.push(`/inbox?${params.toString()}`);
    
    setSelectedEmail(email);
    
    // Mark email as read in UI immediately
    if (!email.isRead) {
      const updatedEmails = [...unreadEmails, ...readEmails].map(e => 
        e.id === email.id ? { ...e, isRead: true } : e
      );
      setUnreadEmails(updatedEmails.filter(e => !e.isRead));
      setReadEmails(updatedEmails.filter(e => e.isRead));
      
      // Update in backend
      if (session?.accessToken) {
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        emailService.markAsRead(email.id).catch(e => {
          console.error('Error marking email as read:', e);
        });
      }
    }
  };
  
  const handleClose = () => {
    setSelectedEmail(null);
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    router.push(`/inbox?${params.toString()}`);
  };
  
  const handleEmailRead = async (emailId: string) => {
    const emailProvider = new GmailProvider(session?.accessToken as string);
    const emailService = new EmailService(emailProvider);
    await emailService.markAsRead(emailId);
    
    // Update the emails list to reflect the read status
    const updatedEmails = [...unreadEmails, ...readEmails].map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    );
    setUnreadEmails(updatedEmails.filter(e => !e.isRead));
    setReadEmails(updatedEmails.filter(e => e.isRead));
  };
  
  // Function to calculate items per page based on container height
  const calculateItemsPerPage = () => {
    if (!containerRef.current) return;
    
    const containerHeight = containerRef.current.clientHeight;
    const emailListHeight = containerHeight - 100; // Subtract header and padding
    
    // 60% for unread, 40% for read
    const unreadHeight = emailListHeight * 0.6;
    const readHeight = emailListHeight * 0.4;
    
    // Calculate how many items can fit in each section, adding a buffer to maximize space
    // Add 0.9 to round up more aggressively and fill available space
    const unreadItems = Math.max(1, Math.floor(unreadHeight / EMAIL_ITEM_HEIGHT + 0.9));
    const readItems = Math.max(1, Math.floor(readHeight / EMAIL_ITEM_HEIGHT + 0.9));
    
    setUnreadItemsPerPage(unreadItems);
    setReadItemsPerPage(readItems);
  };
  
  // Calculate items per page on mount and window resize
  useEffect(() => {
    calculateItemsPerPage();
    
    const handleResize = () => {
      calculateItemsPerPage();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div ref={containerRef} className="h-full relative">
      {/* Email list */}
      <div className="h-full overflow-y-auto">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Inbox className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Inbox
                {!loading && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({(totalUnread + totalRead).toLocaleString()} total, {totalUnread.toLocaleString()} unread)
                  </span>
                )}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Pagination controls for unread emails */}
              {unreadTotalPages > 1 && (
                <div className="flex items-center text-xs">
                  <button 
                    onClick={() => setUnreadPage(p => Math.max(1, p - 1))}
                    disabled={unreadPage === 1}
                    className={`p-1 rounded ${unreadPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    aria-label="Previous page"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <span className="mx-2 text-gray-600">
                    {unreadPage} / {unreadTotalPages}
                  </span>
                  <button 
                    onClick={() => setUnreadPage(p => Math.min(unreadTotalPages, p + 1))}
                    disabled={unreadPage === unreadTotalPages}
                    className={`p-1 rounded ${unreadPage === unreadTotalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    aria-label="Next page"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm">Loading inbox...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && (unreadEmails.length === 0 && readEmails.length === 0) && !error ? (
            <p className="text-sm text-gray-500">No emails found in inbox</p>
          ) : (
            <div className="flex flex-col h-full">
              {/* Unread emails section - 60% of available height */}
              {totalUnread > 0 && (
                <div ref={unreadContainerRef} className="flex-grow" style={{ maxHeight: '60%' }}>
                  <div className="h-full flex flex-col">
                    <div className="overflow-y-auto flex-grow">
                      <ul className="space-y-1">
                        {unreadEmails.map((email) => (
                          <li key={email.id}>
                            <button 
                              onClick={() => handleEmailSelect(email)}
                              className={`block w-full text-left p-2 rounded cursor-pointer text-xs hover:bg-gray-100 
                                font-semibold bg-gray-50 bg-opacity-80 border-l-2 border-blue-200
                                ${selectedEmailId === email.id ? 'bg-gray-100' : ''}`}
                            >
                              <div className="grid grid-cols-[16.625%_83.375%] gap-2">
                                {/* First column - Sender name aligned to top */}
                                <div className="self-start font-medium truncate">{email.from.name || email.from.email}</div>
                                
                                {/* Second column - Email content and date */}
                                <div className="flex flex-col">
                                  <div className="flex justify-between mb-1">
                                    <div className="text-xs font-semibold truncate">{email.subject}</div>
                                    <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                      {(() => {
                                        const emailDate = new Date(email.receivedAt);
                                        const today = new Date();
                                        
                                        // Check if the email was received today
                                        const isToday = 
                                          emailDate.getDate() === today.getDate() &&
                                          emailDate.getMonth() === today.getMonth() &&
                                          emailDate.getFullYear() === today.getFullYear();
                                        
                                        if (isToday) {
                                          // Show time for today's emails
                                          return emailDate.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          });
                                        } else {
                                          // Show date for older emails
                                          return emailDate.toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric'
                                          });
                                        }
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
                    </div>
                  </div>
                </div>
              )}
              
              {/* Read emails section - 40% of available height */}
              {totalRead > 0 && (
                <div ref={readContainerRef} style={{ maxHeight: '40%' }} className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">
                      Previously Seen ({totalRead.toLocaleString()})
                    </h3>
                    {readTotalPages > 1 && (
                      <div className="flex items-center text-xs">
                        <button 
                          onClick={() => setReadPage(p => Math.max(1, p - 1))}
                          disabled={readPage === 1}
                          className={`p-1 rounded ${readPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                          aria-label="Previous page"
                        >
                          <CaretLeft size={14} weight="bold" />
                        </button>
                        <span className="mx-2 text-gray-600">
                          {readPage} / {readTotalPages}
                        </span>
                        <button 
                          onClick={() => setReadPage(p => Math.min(readTotalPages, p + 1))}
                          disabled={readPage === readTotalPages}
                          className={`p-1 rounded ${readPage === readTotalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                          aria-label="Next page"
                        >
                          <CaretRight size={14} weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Add horizontal rule */}
                  <hr className="border-t border-gray-200 mb-2" />
                  
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 30px)' }}>
                    <ul className="space-y-1">
                      {readEmails.map((email) => (
                        <li key={email.id}>
                          <button 
                            onClick={() => handleEmailSelect(email)}
                            className={`block w-full text-left p-2 rounded cursor-pointer text-xs hover:bg-gray-100 
                              ${selectedEmailId === email.id ? 'bg-gray-100' : ''}`}
                          >
                            <div className="grid grid-cols-[16.625%_83.375%] gap-2">
                              {/* First column - Sender name aligned to top */}
                              <div className="self-start font-medium truncate">{email.from.name || email.from.email}</div>
                              
                              {/* Second column - Email content and date */}
                              <div className="flex flex-col">
                                <div className="flex justify-between mb-1">
                                  <div className="text-xs font-semibold truncate">{email.subject}</div>
                                  <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                    {(() => {
                                      const emailDate = new Date(email.receivedAt);
                                      const today = new Date();
                                      
                                      // Check if the email was received today
                                      const isToday = 
                                        emailDate.getDate() === today.getDate() &&
                                        emailDate.getMonth() === today.getMonth() &&
                                        emailDate.getFullYear() === today.getFullYear();
                                      
                                      if (isToday) {
                                        // Show time for today's emails
                                        return emailDate.toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        });
                                      } else {
                                        // Show date for older emails
                                        return emailDate.toLocaleDateString([], {
                                          month: 'short',
                                          day: 'numeric'
                                        });
                                      }
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Email detail modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={handleClose}
          onEmailRead={handleEmailRead}
        />
      )}
    </div>
  );
} 