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
  
  // State for emails and UI
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Reduced from 25 to 10
  const [totalEmails, setTotalEmails] = useState(0);
  const [pageTokens, setPageTokens] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Get selected email ID from URL or state
  const selectedEmailId = searchParams.get('id') || (selectedEmail?.id || null);

  // Calculate total pages
  const totalPages = Math.max(Math.ceil(totalEmails / itemsPerPage), page);

  // Function to load emails
  const loadEmails = async (pageToLoad: number) => {
    if (!session?.accessToken || loadingMore) return;
    
    try {
      setLoadingMore(true);
      setError(null);
      
      const emailProvider = new GmailProvider(session.accessToken as string);
      const emailService = new EmailService(emailProvider);
      
      // Get the appropriate page token
      const pageToken = pageToLoad > 1 ? pageTokens[pageToLoad - 2] : undefined;
      
      const result = await emailService.getInbox({ 
        pageToken,
        limit: itemsPerPage
      });
      
      if (result.emails?.length) {
        if (pageToLoad === 1) {
          // Reset emails for first page
          setEmails(result.emails);
          if (result.nextPageToken) {
            setPageTokens([result.nextPageToken]);
          } else {
            setPageTokens([]);
          }
        } else {
          // Append emails for subsequent pages
          setEmails(prev => [...prev, ...result.emails]);
          if (result.nextPageToken) {
            setPageTokens(prev => {
              const newTokens = [...prev];
              newTokens.push(result.nextPageToken!);
              return newTokens;
            });
          }
        }
        
        // Always update total count
        setTotalEmails(result.resultSizeEstimate);
      }
    } catch (e: any) {
      console.error('Error loading emails:', e);
      setError(e.message || 'Failed to load emails');
      
      // Reset page if we hit an error
      if (pageToLoad > 1) {
        setPage(pageToLoad - 1);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      loadEmails(1).finally(() => setLoading(false));
    }
  }, [session]);

  // Load more emails when page changes
  useEffect(() => {
    if (!loading && page > 1) {
      loadEmails(page);
    }
  }, [page]);

  // Handle page changes
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages && (page === 1 || pageTokens[page - 2])) {
      setPage(p => p + 1);
    }
  };

  // Email selection handlers
  const handleEmailSelect = (email: Email) => {
    const params = new URLSearchParams(searchParams);
    params.set('id', email.id);
    router.push(`/inbox?${params.toString()}`);
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
    router.push(`/inbox?${params.toString()}`);
  };

  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Inbox className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Inbox
                {!loading && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({totalEmails.toLocaleString()} total)
                  </span>
                )}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {totalPages > 1 && (
                <div className="flex items-center text-xs">
                  <button 
                    onClick={handlePreviousPage}
                    disabled={page === 1 || loadingMore}
                    className={`p-1 rounded ${page === 1 || loadingMore ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    aria-label="Previous page"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <span className="mx-2 text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage}
                    disabled={page >= totalPages || loadingMore || !pageTokens[page - 1]}
                    className={`p-1 rounded ${page >= totalPages || loadingMore || !pageTokens[page - 1] ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
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
          
          {!loading && emails.length === 0 && !error ? (
            <p className="text-sm text-gray-500">No emails found in inbox</p>
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
          onEmailRead={() => {}}
        />
      )}
    </div>
  );
} 