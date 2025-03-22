'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import { Email } from '@/lib/email/providers/EmailProvider';
import { ArrowBendUpLeft, ArrowsClockwise, ArrowSquareOut, X, ArrowLeft } from '@phosphor-icons/react';
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

  const handleReply = () => {
    if (!email) return;
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?reply=true&to=${encodeURIComponent(
      email.to.map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.email}>` 
          : recipient.email
      ).join(', ')
    )}&subject=${encodeURIComponent(
      email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`
    )}&emailId=${encodeURIComponent(email.id)}`;
    
    router.push(composeUrl);
  };

  const handleReplyAll = () => {
    if (!email) return;
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?replyAll=true&to=${encodeURIComponent(
      email.to.map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.email}>` 
          : recipient.email
      ).join(', ')
    )}&subject=${encodeURIComponent(
      email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`
    )}&emailId=${encodeURIComponent(email.id)}`;
    
    router.push(composeUrl);
  };

  const handleForward = () => {
    if (!email) return;
    
    // Create a URL with query parameters for pre-filling the compose form
    const composeUrl = `/inbox/compose?forward=true&subject=${encodeURIComponent(
      email.subject.startsWith('Fwd:') ? email.subject : `Fwd: ${email.subject}`
    )}&emailId=${encodeURIComponent(email.id)}`;
    
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
          <ArrowLeft size={20} weight="regular" className="mr-1" />
          Back to Sent Mail
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold mb-2">{email.subject}</h1>
            <div className="mb-2 flex flex-wrap gap-2">
              <div>
                <span className="text-gray-600 text-xs">To:</span>
                <span className="text-gray-800 text-xs ml-1">
                  {email.to.map((recipient, index) => (
                    <span key={index}>
                      {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
                      {index < email.to.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
              
              {email.cc && Array.isArray(email.cc) && email.cc.length > 0 && (
                <div>
                  <span className="text-gray-600 text-xs">CC:</span>
                  <span className="text-gray-800 text-xs ml-1">
                    {email.cc.map((recipient, index) => (
                      <span key={index}>
                        {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
                        {index < email.cc!.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              
              <div className="text-gray-500 text-xs">
                {new Date(email.receivedAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleReply}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 flex items-center"
              title="Reply"
            >
              <ArrowBendUpLeft size={16} weight="regular" className="mr-1" />
              <span>Reply</span>
            </button>
            
            <button
              onClick={handleReplyAll}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 flex items-center"
              title="Reply All"
            >
              <ArrowsClockwise size={16} weight="regular" className="mr-1" />
              <span>Reply All</span>
            </button>

            <button
              onClick={handleForward}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-600 rounded hover:bg-blue-50 flex items-center"
              title="Forward"
            >
              <ArrowSquareOut size={16} weight="regular" className="mr-1" />
              <span>Forward</span>
            </button>
            
            <button
              onClick={handleBackToSent}
              className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1"
              title="Close"
            >
              <X size={20} weight="regular" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mt-2">
            {email.bodyHtml ? (
              <div 
                className="prose max-w-none text-xs" 
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }} 
              />
            ) : (
              <pre className="whitespace-pre-wrap text-gray-800 text-xs">
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
    </div>
  );
} 