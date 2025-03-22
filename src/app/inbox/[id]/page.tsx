'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import { Email } from '@/lib/email/providers/EmailProvider';
import EmailActions from '@/components/EmailActions';
import { markAsRead } from '@/app/actions/email';
import React from 'react';

export default function EmailDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;
  
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEmail() {
      if (!session?.accessToken) return;
      
      try {
        setLoading(true);
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        
        // Fetch the email details
        const emailData = await emailService.getEmail(emailId);
        setEmail(emailData);
        
        // Mark as read automatically when viewing, but don't throw if it fails
        try {
          await markAsRead(emailId);
        } catch (error) {
          console.warn('Failed to mark email as read:', error);
          // Continue without affecting the user experience
        }
      } catch (e: any) {
        console.error('Error fetching email:', e);
        setError(e.message || 'Failed to fetch email');
      } finally {
        setLoading(false);
      }
    }
    
    if (emailId) {
      fetchEmail();
    }
  }, [emailId, session]);

  const handleBackToInbox = () => {
    router.push('/inbox');
  };

  const handleActionComplete = () => {
    // Refresh the email data or redirect back to inbox
    router.push('/inbox');
  };

  const handleReply = () => {
    if (!email) return;
    
    // Create formatted quoted text
    let quotedText = '';
    
    if (email.bodyText) {
      const dateLine = `On ${new Date(email.receivedAt).toLocaleString()}, ${email.from.name || email.from.email} wrote:`;
      const quotedLines = email.bodyText.split('\n').map(line => `> ${line}`).join('\n');
      quotedText = `\n\n${dateLine}\n${quotedLines}`;
    } else if (email.bodyHtml) {
      const dateLine = `On ${new Date(email.receivedAt).toLocaleString()}, ${email.from.name || email.from.email} wrote:`;
      quotedText = `\n\n${dateLine}\n\n<blockquote style="border-left: 2px solid #ccc; padding-left: 10px; color: #666;">${email.bodyHtml}</blockquote>`;
    }
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?reply=true&to=${encodeURIComponent(
      email.from.name ? `${email.from.name} <${email.from.email}>` : email.from.email
    )}&subject=${encodeURIComponent(
      email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`
    )}&emailId=${encodeURIComponent(email.id)}&body=${encodeURIComponent(quotedText)}`;
    
    router.push(composeUrl);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <p className="text-gray-500">Loading email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={handleBackToInbox}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Email not found</p>
        <button 
          onClick={handleBackToInbox}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={handleBackToInbox}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Inbox
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReply}
            className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Reply
          </button>
          
          <EmailActions 
            emailId={email.id} 
            isRead={true}
            onActionComplete={handleActionComplete} 
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
        
        <div className="flex items-start mb-6">
          <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {email.from.name?.[0] || email.from.email[0]}
            </div>
          </div>
          
          <div>
            <div className="font-medium">{email.from.name || email.from.email}</div>
            <div className="text-gray-600 text-sm">{email.from.email}</div>
            <div className="text-gray-500 text-sm">
              {new Date(email.receivedAt).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          {email.bodyHtml ? (
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }} 
            />
          ) : (
            <pre className="whitespace-pre-wrap text-gray-800">
              {email.bodyText || email.body}
            </pre>
          )}
        </div>
        
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-lg font-medium mb-2">Attachments ({email.attachments.length})</h2>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="border rounded p-2 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
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
  );
} 