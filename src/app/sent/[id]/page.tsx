'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import { Email } from '@/lib/email/providers/EmailProvider';
import React from 'react';

export default function SentEmailDetailPage() {
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
      } catch (e: any) {
        console.error('Error fetching sent email:', e);
        setError(e.message || 'Failed to fetch sent email');
      } finally {
        setLoading(false);
      }
    }
    
    if (emailId) {
      fetchEmail();
    }
  }, [emailId, session]);

  const handleBackToSent = () => {
    router.push('/sent');
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
          onClick={handleBackToSent}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back to Sent Mail
        </button>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Email not found</p>
        <button 
          onClick={handleBackToSent}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back to Sent Mail
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={handleBackToSent}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Sent Mail
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{email.subject}</h1>
        
        <div className="flex items-start mb-6">
          <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {email.to && email.to[0] ? (email.to[0].name?.[0] || email.to[0].email[0]) : 'S'}
            </div>
          </div>
          
          <div>
            <div className="font-medium">To: {email.to ? email.to.map(recipient => 
              recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
            ).join(', ') : 'No recipients'}</div>
            {email.cc && email.cc.length > 0 && (
              <div className="text-gray-600 text-sm">
                Cc: {email.cc.map(recipient => 
                  recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
                ).join(', ')}
              </div>
            )}
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