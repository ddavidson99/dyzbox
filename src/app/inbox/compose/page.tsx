"use client";

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendEmail, replyToEmail } from '@/app/actions/email';
import { EmailAddress } from '@/lib/email/providers/EmailProvider';
import { toast } from 'react-hot-toast';

export default function ComposeEmailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isReply = searchParams.get('reply') === 'true';
  const emailId = searchParams.get('emailId');
  
  const [to, setTo] = useState<string>(searchParams.get('to') || '');
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');
  const [subject, setSubject] = useState<string>(searchParams.get('subject') || '');
  const [body, setBody] = useState<string>(searchParams.get('body') || '');
  const [sending, setSending] = useState<boolean>(false);
  const [showCc, setShowCc] = useState<boolean>(false);
  const [showBcc, setShowBcc] = useState<boolean>(false);
  
  useEffect(() => {
    // Reset form if URL parameters change
    setTo(searchParams.get('to') || '');
    setSubject(searchParams.get('subject') || '');
    setBody(searchParams.get('body') || '');
    
    // Position cursor at beginning of textarea for replies
    if (isReply && textareaRef.current) {
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(0, 0);
        }
      }, 100);
    }
  }, [searchParams, isReply]);
  
  const parseEmailAddresses = (input: string): EmailAddress[] => {
    if (!input.trim()) return [];
    
    return input.split(',').map(email => {
      const trimmedEmail = email.trim();
      // Simple check for "Name <email>" format
      const match = trimmedEmail.match(/^(.*?)\s*<(.+@.+)>$/);
      
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2].trim()
        };
      }
      
      return {
        email: trimmedEmail
      };
    });
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isReply && !to.trim()) {
      toast.error('Please enter at least one recipient');
      return;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    try {
      setSending(true);
      
      if (isReply && emailId) {
        // Use the replyToEmail server action
        const result = await replyToEmail(emailId, {
          cc: cc.trim() ? parseEmailAddresses(cc) : undefined,
          bcc: bcc.trim() ? parseEmailAddresses(bcc) : undefined,
          subject,
          body: formatEmailBody(body)
        });
        
        if (result.success) {
          toast.success('Reply sent successfully');
          router.push('/inbox');
        } else {
          toast.error(result.error || 'Failed to send reply');
        }
      } else {
        // Regular email sending
        const result = await sendEmail({
          to: parseEmailAddresses(to),
          cc: cc.trim() ? parseEmailAddresses(cc) : undefined,
          bcc: bcc.trim() ? parseEmailAddresses(bcc) : undefined,
          subject,
          body: formatEmailBody(body)
        });
        
        if (result.success) {
          toast.success('Email sent successfully');
          router.push('/inbox');
        } else {
          toast.error(result.error || 'Failed to send email');
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An error occurred while sending the email');
    } finally {
      setSending(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/inbox');
  };
  
  // Helper function to format email body correctly
  const formatEmailBody = (content: string): string => {
    if (!content.trim()) {
      return '<p>(No content)</p>';
    }
    
    // Check if content is likely HTML
    if (content.includes('<blockquote') || content.includes('<p>') || content.includes('<div>')) {
      // It's already HTML, add signature with two blank lines
      return `${content}
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p style="color: #666; font-size: 12px;">Sent with DYZBOX | Inbox clarity, delivered daily</p>`;
    }
    
    // Convert plain text to HTML and add signature
    const formattedContent = content
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('');
      
    return `${formattedContent}
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p style="color: #666; font-size: 12px;">Sent with DYZBOX | Inbox clarity, delivered daily</p>`;
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isReply ? 'Reply to Email' : 'Compose Email'}</h1>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 w-20 pt-2">
              To:
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com, Another Recipient <another@example.com>"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={sending || isReply}
                required={!isReply}
              />
            </div>
          </div>
          <div className="pl-20 mt-1">
            <button
              type="button"
              onClick={() => {
                setShowCc(!showCc);
                if (!showCc) setShowBcc(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showCc ? 'Hide Cc/Bcc' : 'Add Cc/Bcc'}
            </button>
          </div>
        </div>
        
        {showCc && (
          <div className="flex">
            <label htmlFor="cc" className="block text-sm font-medium text-gray-700 w-20 pt-2">
              Cc:
            </label>
            <input
              type="text"
              id="cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
          </div>
        )}
        
        {showBcc && (
          <div className="flex">
            <label htmlFor="bcc" className="block text-sm font-medium text-gray-700 w-20 pt-2">
              Bcc:
            </label>
            <input
              type="text"
              id="bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
          </div>
        )}
        
        <div className="flex">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 w-20 pt-2">
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
            required
          />
        </div>
        
        <div>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={isReply ? "Type your reply above the quoted text..." : "Write your message here..."}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
        </div>
      </form>
    </div>
  );
} 