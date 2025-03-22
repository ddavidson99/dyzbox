"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { EmailService } from '@/lib/email/emailService';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { Email } from '@/lib/email/providers/EmailProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function SentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleComposeClick = () => {
    router.push('/inbox/compose');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex">
        {/* Email list */}
        <div className="w-full overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Send className="h-5 w-5 mr-2 text-gray-600" />
                <h2 className="text-lg font-semibold">Sent Mail</h2>
              </div>
              <button
                onClick={handleComposeClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Compose
              </button>
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
              <ul className="space-y-2">
                {emails.map((email) => (
                  <li key={email.id}>
                    <Link 
                      href={`/sent/${email.id}`}
                      className="block p-3 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {email.to && email.to.length > 0
                            ? email.to[0].name || email.to[0].email
                            : 'No recipient'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(email.receivedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{email.subject}</div>
                      <div className="text-sm text-gray-600 truncate">{email.snippet}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 