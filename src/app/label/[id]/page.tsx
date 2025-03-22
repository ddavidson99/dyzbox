"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Email } from '@/lib/email/providers/EmailProvider';
import { Tag } from 'lucide-react';
import { Folder, Tag as TagIcon } from '@phosphor-icons/react';
import { getEmailsByLabel, getLabels } from '@/app/actions/email';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import EmailActions from '@/components/EmailActions';

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
  
  // Splitter state
  const [leftPaneWidth, setLeftPaneWidth] = useState(40); // 40% as default for email list
  const [isDragging, setIsDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get selected email ID from URL or state
  const selectedEmailId = searchParams.get('id') || (selectedEmail?.id || null);
  
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
    <div ref={containerRef} className="flex h-full relative">
      {/* Email list - left pane */}
      <div 
        className="overflow-y-auto border-r"
        style={{ width: selectedEmail ? `${leftPaneWidth}%` : '100%' }}
      >
        <div className="p-4">
          <div className="flex items-center mb-4">
            {labelId.startsWith('CATEGORY_') ? (
              <Folder size={20} className="mr-2 text-gray-600" weight="light" />
            ) : (
              <TagIcon size={20} className="mr-2 text-gray-600" weight="light" />
            )}
            <h2 className="text-lg font-semibold">{displayName}</h2>
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
            <ul className="space-y-1">
              {emails.map((email) => (
                <li key={email.id}>
                  <button 
                    onClick={() => handleEmailSelect(email)}
                    className={`block w-full text-left p-2 rounded cursor-pointer text-xs hover:bg-gray-100 
                      ${!email.isRead ? 'font-semibold bg-blue-50' : ''}
                      ${selectedEmailId === email.id ? 'bg-blue-100' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium truncate">{email.from.name || email.from.email}</div>
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
                    <div className="text-xs font-semibold truncate">{email.subject}</div>
                    <div className="text-xs text-gray-600 truncate">{email.snippet}</div>
                  </button>
                </li>
              ))}
            </ul>
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

      {/* Email detail - right pane */}
      {selectedEmail && (
        <div 
          className="overflow-y-auto p-4 bg-gray-50"
          style={{ width: `${100 - leftPaneWidth}%` }}
        >
          {emailLoading ? (
            <div className="text-center py-4">
              <p className="text-sm">Loading email...</p>
            </div>
          ) : emailError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <p>{emailError}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold mb-2">{selectedEmail.subject}</h1>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        {selectedEmail.from.name?.[0] || selectedEmail.from.email[0]}
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="font-medium text-sm">{selectedEmail.from.name || selectedEmail.from.email}</div>
                      <div className="text-gray-600 text-xs">{selectedEmail.from.email}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(selectedEmail.receivedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {selectedEmail.labels && selectedEmail.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedEmail.labels
                        .filter(label => !['INBOX', 'SENT', 'UNREAD', 'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'].includes(label))
                        .map((label, index) => (
                          <div key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full flex items-center">
                            <span className="mr-1">•</span>
                            <span>{label}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleReply}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    Reply
                  </button>
                  
                  <button
                    onClick={handleCloseEmail}
                    className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <EmailActions 
                  emailId={selectedEmail.id} 
                  isRead={true}
                  onActionComplete={handleActionComplete} 
                />
                
                <div className="mt-4 border-t pt-4">
                  {selectedEmail.bodyHtml ? (
                    <div 
                      className="prose max-w-none text-sm" 
                      dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} 
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-gray-800 text-sm">
                      {selectedEmail.bodyText || selectedEmail.body}
                    </pre>
                  )}
                </div>
                
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h2 className="text-md font-medium mb-2">Attachments ({selectedEmail.attachments.length})</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="border rounded p-2 flex items-center gap-2 text-xs"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{attachment.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 