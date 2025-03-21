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
import EmailDetail from '@/components/EmailDetail';

// Estimate of email list item height in pixels - reduced for better space utilization
const EMAIL_ITEM_HEIGHT = 55;

export default function InboxPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Refs for measuring containers
  const unreadContainerRef = useRef<HTMLDivElement>(null);
  const readContainerRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [unreadItemsPerPage, setUnreadItemsPerPage] = useState(5);
  const [readItemsPerPage, setReadItemsPerPage] = useState(5);
  const [unreadPage, setUnreadPage] = useState(1);
  const [readPage, setReadPage] = useState(1);
  
  // Splitter state
  const [leftPaneWidth, setLeftPaneWidth] = useState(40); // 40% as default for email list
  const [isDragging, setIsDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get selected email ID from URL or state
  const selectedEmailId = searchParams.get('id') || (selectedEmail?.id || null);
  
  // Filter emails into unread and read
  const unreadEmails = emails.filter(email => !email.isRead);
  const readEmails = emails.filter(email => email.isRead);
  
  // Calculate pagination values
  const unreadTotalPages = Math.ceil(unreadEmails.length / unreadItemsPerPage);
  const readTotalPages = Math.ceil(readEmails.length / readItemsPerPage);
  
  const currentUnreadEmails = unreadEmails.slice(
    (unreadPage - 1) * unreadItemsPerPage,
    unreadPage * unreadItemsPerPage
  );
  
  const currentReadEmails = readEmails.slice(
    (readPage - 1) * readItemsPerPage,
    readPage * readItemsPerPage
  );
  
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
  
  useEffect(() => {
    async function fetchEmails() {
      if (!session?.accessToken) return;
      
      try {
        setLoading(true);
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        
        // Fetch inbox emails
        const fetchedEmails = await emailService.getInbox();
        setEmails(fetchedEmails.emails || []);
        setError(null);
      } catch (e: any) {
        console.error('Error fetching inbox emails:', e);
        setError(e.message || 'Failed to fetch inbox emails');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmails();
  }, [session]);
  
  // Reset pagination when emails change
  useEffect(() => {
    setUnreadPage(1);
    setReadPage(1);
  }, [emails]);
  
  // Calculate items per page on mount and window resize
  useEffect(() => {
    calculateItemsPerPage();
    
    const handleResize = () => {
      calculateItemsPerPage();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const emailId = params.get('id');
    
    if (emailId) {
      const email = emails.find(e => e.id === emailId);
      if (email) {
        setSelectedEmail(email);
      } else if (emails.length > 0) {
        // Attempt to fetch selected email if not found in current list
        fetchEmailById(emailId);
      }
    } else {
      setSelectedEmail(null);
    }
  }, [searchParams, emails]);
  
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
      const updatedEmails = emails.map(e => 
        e.id === email.id ? { ...e, isRead: true } : e
      );
      setEmails(updatedEmails);
      
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
  
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const newWidth = ((e.clientX - containerRect.left) / containerWidth) * 100;
      
      // Limit the resize to reasonable bounds (20% - 80%)
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftPaneWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  const refresh = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      const emailProvider = new GmailProvider(session.accessToken as string);
      const emailService = new EmailService(emailProvider);
      
      const fetchedEmails = await emailService.getInbox();
      setEmails(fetchedEmails.emails || []);
      setError(null);
    } catch (e: any) {
      console.error('Error refreshing inbox emails:', e);
      setError(e.message || 'Failed to refresh inbox emails');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setSelectedEmail(null);
  };
  
  const handleEmailRead = (emailId: string) => {
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === emailId 
          ? { ...email, isRead: true } 
          : email
      )
    );
  };
  
  return (
    <div ref={containerRef} className="flex h-full relative">
      {/* Email list - left pane */}
      <div 
        className="overflow-y-auto border-r"
        style={{ width: selectedEmail ? `${leftPaneWidth}%` : '100%' }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Inbox className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Inbox
                {!loading && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({unreadEmails.length} unread)
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
              
              <button 
                onClick={refresh}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                title="Refresh"
              >
                <ArrowsClockwise size={18} weight="regular" />
              </button>
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
          
          {!loading && emails.length === 0 && !error ? (
            <p className="text-sm text-gray-500">No emails found in inbox</p>
          ) : (
            <div className="flex flex-col h-full">
              {/* Unread emails section - 60% of available height */}
              {unreadEmails.length > 0 && (
                <div ref={unreadContainerRef} className="flex-grow" style={{ maxHeight: '60%' }}>
                  <div className="h-full flex flex-col">
                    <div className="overflow-y-auto flex-grow">
                      <ul className="space-y-1">
                        {currentUnreadEmails.map((email) => (
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
              {readEmails.length > 0 && (
                <div ref={readContainerRef} style={{ maxHeight: '40%' }} className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Previously Seen</h3>
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
                      {currentReadEmails.map((email) => (
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
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Email detail - right pane */}
      {selectedEmail && (
        <div 
          className="h-full overflow-y-auto"
          style={{ width: `${100 - leftPaneWidth}%` }}
        >
          <EmailDetail 
            email={selectedEmail} 
            onClose={handleClose} 
            onEmailRead={handleEmailRead}
          />
        </div>
      )}
      
      {/* Draggable splitter between panes */}
      {selectedEmail && (
        <div
          ref={splitterRef}
          className="absolute w-1 h-full bg-gray-200 hover:bg-blue-400 cursor-col-resize z-10"
          style={{ left: `${leftPaneWidth}%` }}
          onMouseDown={handleSplitterMouseDown}
        />
      )}
    </div>
  );
} 