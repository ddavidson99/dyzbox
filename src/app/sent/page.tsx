"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { EmailService } from '@/lib/email/emailService';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { Email } from '@/lib/email/providers/EmailProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

// Estimate of email list item height in pixels - reduced for better space utilization
const EMAIL_ITEM_HEIGHT = 55;

export default function SentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Container ref for dynamic sizing
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(emails.length / itemsPerPage);
  const currentEmails = emails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Function to calculate items per page based on container height
  const calculateItemsPerPage = () => {
    if (!containerRef.current) return;
    
    const containerHeight = containerRef.current.clientHeight;
    const headerHeight = 100; // Estimate for header space
    const availableHeight = containerHeight - headerHeight;
    
    // Calculate how many items can fit based on estimated item height
    // Add 0.9 to round up more aggressively and fill available space
    const items = Math.max(5, Math.floor(availableHeight / EMAIL_ITEM_HEIGHT + 0.9));
    setItemsPerPage(items);
  };
  
  useEffect(() => {
    async function fetchEmails() {
      if (!session?.accessToken) return;
      
      try {
        setLoading(true);
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        
        // Fetch sent emails
        const fetchedEmails = await emailService.getSent();
        setEmails(fetchedEmails.emails || []);
        setError(null);
      } catch (e: any) {
        console.error('Error fetching sent emails:', e);
        setError(e.message || 'Failed to fetch sent emails');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmails();
  }, [session]);
  
  // Reset pagination when emails change
  useEffect(() => {
    setCurrentPage(1);
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

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex">
        {/* Email list */}
        <div className="w-full overflow-y-auto">
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-4">
              <Send className="h-5 w-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">
                Sent
                {!loading && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({emails.length} emails)
                  </span>
                )}
              </h2>
              
              {/* Add pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center text-xs ml-auto">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-1 rounded ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    aria-label="Previous page"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <span className="mx-2 text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-1 rounded ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                    aria-label="Next page"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
            
            {loading && (
              <div className="text-center py-4">
                <p>Loading sent emails...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}
            
            {!loading && emails.length === 0 && !error ? (
              <p className="text-gray-500">No sent emails found</p>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Sent Emails</h3>
                </div>
                
                {/* Add horizontal rule */}
                <hr className="border-t border-gray-200 mb-2" />

                <div className="overflow-y-auto flex-grow">
                  <ul className="space-y-1">
                    {currentEmails.map((email) => (
                      <li key={email.id}>
                        <Link 
                          href={`/sent/${email.id}`}
                          className="block p-2 hover:bg-gray-100 rounded cursor-pointer text-xs"
                        >
                          <div className="grid grid-cols-[16.625%_83.375%] gap-2">
                            {/* First column - Recipient name aligned to top */}
                            <div className="self-start font-medium truncate">
                              {email.to && email.to.length > 0
                                ? email.to[0].name || email.to[0].email
                                : 'No recipient'}
                            </div>
                            
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
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 