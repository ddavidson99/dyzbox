"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Email } from '@/lib/email/providers/EmailProvider';
import { Tag } from 'lucide-react';
import { Folder, Tag as TagIcon, ArrowBendUpLeft, ArrowsClockwise, ArrowSquareOut, X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { getEmailsByLabel, getLabels } from '@/app/actions/email';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import EmailActions from '@/components/EmailActions';
import EmailDetailModal from '@/components/EmailDetailModal';
import { markAsRead } from '@/app/actions/email';

// Estimate of email list item height in pixels - reduced for better space utilization
const EMAIL_ITEM_HEIGHT = 55;

export default function LabelPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labelId = decodeURIComponent(params.id as string);
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [labelName, setLabelName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Pagination state
  const EMAILS_PER_PAGE = 5;
  const [unreadPage, setUnreadPage] = useState(1);
  const [readPage, setReadPage] = useState(1);
  
  // Splitter state
  const [leftPaneWidth, setLeftPaneWidth] = useState(40); // 40% as default for email list
  const [isDragging, setIsDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get selected email ID from URL or state
  const selectedEmailId = searchParams.get('id') || (selectedEmail?.id || null);
  
  // Calculate unread and read emails for pagination
  const unreadEmails = emails.filter(email => !email.isRead);
  const readEmails = emails.filter(email => email.isRead);
  
  // Add new refs for measuring containers
  const unreadContainerRef = useRef<HTMLDivElement>(null);
  const readContainerRef = useRef<HTMLDivElement>(null);
  
  // Update pagination state
  const [unreadItemsPerPage, setUnreadItemsPerPage] = useState(5);
  const [readItemsPerPage, setReadItemsPerPage] = useState(5);
  
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
  
  // Add calculation effect
  useEffect(() => {
    calculateItemsPerPage();
    
    const handleResize = () => {
      calculateItemsPerPage();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    async function fetchLabelName() {
      try {
        const response = await getLabels();
        if (response.success && response.labels) {
          const label = response.labels.find(l => l.id === labelId);
          if (label) {
            setLabelName(label.name);
            
            // Format display name based on label ID
            if (labelId.startsWith('CATEGORY_')) {
              const displayPart = labelId.split('_')[1];
              setDisplayName(displayPart.charAt(0).toUpperCase() + displayPart.slice(1).toLowerCase());
            } else if (labelId === 'IMPORTANT') {
              setDisplayName('Important');
            } else {
              setDisplayName(label.name || labelId);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching label name:", err);
      }
    }
    
    fetchLabelName();
  }, [labelId]);
  
  useEffect(() => {
    async function fetchEmails() {
      if (!session?.accessToken) return;
      
      try {
        setLoading(true);
        const response = await getEmailsByLabel(labelId);
        
        if (response.success) {
          setEmails(response.emails || []);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch emails');
        }
      } catch (e: any) {
        console.error('Error fetching emails with label:', e);
        setError(e.message || 'Failed to fetch emails');
      } finally {
        setLoading(false);
      }
    }
    
    if (labelId) {
      fetchEmails();
    }
  }, [session, labelId]);
  
  // Reset pagination when emails change
  useEffect(() => {
    setUnreadPage(1);
    setReadPage(1);
  }, [emails]);

  // Fetch selected email details when ID changes
  useEffect(() => {
    async function fetchEmailDetails() {
      if (!session?.accessToken || !selectedEmailId) return;
      
      setEmailLoading(true);
      try {
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        
        const emailData = await emailService.getEmail(selectedEmailId);
        setSelectedEmail(emailData);
        
        // Mark as read
        try {
          const markReadProvider = new GmailProvider(session.accessToken as string);
          const markReadService = new EmailService(markReadProvider);
          await markReadService.markAsRead(selectedEmailId);
        } catch (err) {
          console.warn('Failed to mark email as read:', err);
        }
        
        setEmailError(null);
      } catch (e: any) {
        console.error('Error fetching email details:', e);
        setEmailError(e.message || 'Failed to fetch email details');
      } finally {
        setEmailLoading(false);
      }
    }
    
    if (selectedEmailId) {
      fetchEmailDetails();
      
      // Update URL with selected email ID without navigation
      const url = new URL(window.location.href);
      url.searchParams.set('id', selectedEmailId);
      window.history.pushState({}, '', url);
    } else {
      // Clear URL parameter if no email is selected
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url);
    }
  }, [selectedEmailId, session]);

  // Handle drag events for the splitter
  useEffect(() => {
    if (!selectedEmail) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // Calculate percentage (constrain between 15% and 85%)
      const newLeftPaneWidth = Math.min(85, Math.max(15, (mouseX / containerWidth) * 100));
      setLeftPaneWidth(newLeftPaneWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const splitterElement = splitterRef.current;
    if (splitterElement) {
      splitterElement.addEventListener('mousedown', handleMouseDown);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (splitterElement) {
        splitterElement.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedEmail]);

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    
    // Update URL with selected email ID without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('id', email.id);
    window.history.pushState({}, '', url);
  };

  const handleCloseEmail = () => {
    setSelectedEmail(null);
    
    // Clear URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?reply=true&to=${encodeURIComponent(
      selectedEmail.from.name ? `${selectedEmail.from.name} <${selectedEmail.from.email}>` : selectedEmail.from.email
    )}&subject=${encodeURIComponent(
      selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`
    )}&emailId=${encodeURIComponent(selectedEmail.id)}`;
    
    router.push(composeUrl);
  };

  const handleReplyAll = () => {
    if (!selectedEmail) return;
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?replyAll=true&to=${encodeURIComponent(
      selectedEmail.from.name ? `${selectedEmail.from.name} <${selectedEmail.from.email}>` : selectedEmail.from.email
    )}&subject=${encodeURIComponent(
      selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`
    )}&emailId=${encodeURIComponent(selectedEmail.id)}`;
    
    router.push(composeUrl);
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?forward=true&subject=${encodeURIComponent(
      selectedEmail.subject.startsWith('Fwd:') ? selectedEmail.subject : `Fwd: ${selectedEmail.subject}`
    )}&emailId=${encodeURIComponent(selectedEmail.id)}`;
    
    router.push(composeUrl);
  };

  const handleActionComplete = () => {
    // Close the email and refresh the inbox
    setSelectedEmail(null);
    
    // Refresh emails
    if (session?.accessToken) {
      const response = getEmailsByLabel(labelId);
      response.then(result => {
        if (result.success) {
          setEmails(result.emails || []);
        }
      }).catch(err => {
        console.error('Error refreshing emails:', err);
      });
    }
  };

  return (
    <div ref={containerRef} className="h-full relative">
      {/* Email list - left pane */}
      <div 
        className="overflow-y-auto border-r"
        style={{ width: selectedEmail ? `${leftPaneWidth}%` : '100%' }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center mb-4">
            {labelId.startsWith('CATEGORY_') ? (
              <Folder size={20} className="mr-2 text-gray-600" weight="light" />
            ) : (
              <TagIcon size={20} className="mr-2 text-gray-600" weight="light" />
            )}
            <h2 className="text-lg font-semibold">
              {displayName}
              {!loading && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({unreadEmails.length} unread)
                </span>
              )}
            </h2>
            
            {/* Add pagination controls for unread emails */}
            {unreadTotalPages > 1 && (
              <div className="flex items-center text-xs ml-auto mr-2">
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
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm">Loading emails...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && emails.length === 0 && !error ? (
            <p className="text-sm text-gray-500">No emails found with this label</p>
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

      {/* Draggable splitter */}
      {selectedEmail && (
        <div 
          ref={splitterRef}
          className={`w-1 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-600 relative z-10 ${isDragging ? 'bg-blue-600' : ''}`}
          title="Drag to resize"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="h-8 w-1 flex flex-col items-center justify-center space-y-1">
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      )}

      {/* Email detail modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => {
            setSelectedEmail(null);
            router.push(`/label/${encodeURIComponent(labelId)}`);
          }}
          onEmailRead={(emailId) => {
            if (session?.accessToken) {
              markAsRead(emailId).then(() => {
                // Refresh emails after marking as read
                getEmailsByLabel(labelId).then(response => {
                  if (response.success) {
                    setEmails(response.emails || []);
                  }
                });
              });
            }
          }}
        />
      )}
    </div>
  );
} 