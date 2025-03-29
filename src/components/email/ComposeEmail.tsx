"use client";

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  PaperPlaneTilt,
  PaperclipHorizontal,
  CalendarBlank,
  At,
  X,
  DotsThree,
  Trash
} from '@phosphor-icons/react';
import { EmailAddress } from '@/lib/email/providers/EmailProvider';
import { sendEmail, replyToEmail, saveDraft } from '@/app/actions/email';
import IconButton from '../ui/IconButton';
import RecipientInput from './RecipientInput';
import TipTapEditor, { TipTapEditorRef } from './TipTapEditor';

interface ComposeEmailProps {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  isReply?: boolean;
  emailId?: string;
  onCancel?: () => void;
  onSend?: () => void;
}

const ComposeEmail: React.FC<ComposeEmailProps> = ({
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  isReply = false,
  emailId = '',
  onCancel,
  onSend
}) => {
  const router = useRouter();
  const [toRecipients, setToRecipients] = useState<EmailAddress[]>(
    initialTo ? [{ email: initialTo }] : []
  );
  const [ccRecipients, setCcRecipients] = useState<EmailAddress[]>([]);
  const [bccRecipients, setBccRecipients] = useState<EmailAddress[]>([]);
  const [subject, setSubject] = useState(initialSubject);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const editorRef = useRef<TipTapEditorRef>(null);
  
  useEffect(() => {
    if (initialBody && editorRef.current) {
      editorRef.current.setContent(initialBody);
    }
  }, [initialBody]);
  
  const parseEmailString = (emailStr: string): EmailAddress[] => {
    if (!emailStr.trim()) return [];
    
    return emailStr.split(',').map(email => {
      const trimmedEmail = email.trim();
      // Check for "Name <email>" format
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
  
  const formatEmailBody = (content: string): string => {
    if (!content.trim()) {
      return '<p>(No content)</p>';
    }
    
    // Add signature
    return `${content}
    <p>&nbsp;</p>
    <p style="color: #666; font-size: 12px;">Sent with DYZBOX | Inbox clarity, delivered daily</p>`;
  };
  
  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    // Prevent multiple submissions
    if (isProcessingAction || sending) return;
    setIsProcessingAction(true);
    
    if (!isReply && toRecipients.length === 0) {
      toast.error('Please add at least one recipient');
      setIsProcessingAction(false);
      return;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      setIsProcessingAction(false);
      return;
    }
    
    const emailContent = editorRef.current?.getContent() || '';
    
    try {
      setSending(true);
      
      if (isReply && emailId) {
        // Use the replyToEmail server action
        const result = await replyToEmail(emailId, {
          cc: ccRecipients.length > 0 ? ccRecipients : undefined,
          bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
          subject,
          body: formatEmailBody(emailContent)
        });
        
        if (result.success) {
          toast.success('Reply sent successfully');
          onSend?.();
        } else {
          toast.error(result.error || 'Failed to send reply');
          setIsProcessingAction(false);
        }
      } else {
        // Regular email sending
        const result = await sendEmail({
          to: toRecipients,
          cc: ccRecipients.length > 0 ? ccRecipients : undefined,
          bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
          subject,
          body: formatEmailBody(emailContent)
        });
        
        if (result.success) {
          toast.success('Email sent successfully');
          onSend?.();
        } else {
          toast.error(result.error || 'Failed to send email');
          setIsProcessingAction(false);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An error occurred while sending the email');
      setIsProcessingAction(false);
    } finally {
      setSending(false);
    }
  };
  
  const handleCancel = useCallback(async () => {
    // Prevent multiple actions
    if (isProcessingAction) return;
    setIsProcessingAction(true);
    
    try {
      // Check if the email has any content
      const hasToRecipients = toRecipients.length > 0;
      const hasCcRecipients = ccRecipients.length > 0;
      const hasBccRecipients = bccRecipients.length > 0;
      const hasSubject = subject.trim().length > 0;
      
      // Get the editor content and check if it has actual text content (not just HTML tags)
      const editorContent = editorRef.current?.getContent() || '';
      
      // Check for common empty editor patterns first
      const emptyEditorPatterns = [
        '<p></p>',
        '<p><br></p>',
        '<p><br/></p>',
        '<p> </p>',
        '<p>&nbsp;</p>'
      ];
      
      const isEmptyContent = 
        emptyEditorPatterns.includes(editorContent.trim()) || 
        editorContent.trim() === '';
      
      // If not a common empty pattern, do a more thorough check
      let hasBody = false;
      if (!isEmptyContent) {
        // TipTap often returns <p></p> or <p><br></p> for empty content
        // Remove all HTML tags and whitespace to see if there's actual content
        const textContent = editorContent
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
          .trim();
        
        hasBody = textContent.length > 0;
      }
      
      const isEmpty = !hasToRecipients && !hasCcRecipients && !hasBccRecipients && !hasSubject && !hasBody;
      
      if (isEmpty) {
        // If email is empty, just close it without saving
        onCancel?.();
        return;
      }
      
      // Email has content, save as draft
      try {
        // Show loading toast and set saving state
        const loadingToastId = toast.loading('Saving draft...');
        setSavingDraft(true);
        
        // Get email content
        const emailContent = editorRef.current?.getContent() || '';
        
        // Call the saveDraft server action
        const result = await saveDraft({
          to: toRecipients,
          cc: ccRecipients.length > 0 ? ccRecipients : undefined,
          bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
          subject,
          body: formatEmailBody(emailContent)
        });
        
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        if (result.success) {
          // Check if there's a warning message to show
          if (result.error) {
            if (result.error.includes('rate limits') || result.error.includes('taking longer than expected')) {
              // Show warning but still close the window
              toast.success('Draft saved');
              toast(result.error, {
                icon: '⚠️',
                style: {
                  borderRadius: '10px',
                  background: '#FFF3CD',
                  color: '#856404',
                }
              });
              onCancel?.();
            } else {
              toast.success('Draft saved');
              onCancel?.();
            }
          } else {
            toast.success('Draft saved');
            onCancel?.();
          }
        } else {
          toast.error(result.error || 'Could not save draft');
          setSavingDraft(false);
          setIsProcessingAction(false);
        }
      } catch (error) {
        console.error('Error saving draft:', error);
        toast.error('Could not save draft');
        setSavingDraft(false);
        setIsProcessingAction(false);
      }
    } catch (error) {
      console.error('Error handling cancel:', error);
      setSavingDraft(false);
      setIsProcessingAction(false);
    }
  }, [toRecipients, ccRecipients, bccRecipients, subject, onCancel, isProcessingAction, formatEmailBody]);

  // Disable browser's "Are you sure you want to leave" prompt
  useEffect(() => {
    // Only add the event listener if we're running in a browser
    if (typeof window !== 'undefined') {
      window.onbeforeunload = null;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.onbeforeunload = null;
      }
    };
  }, []);

  const handleDelete = () => {
    // Prevent multiple actions
    if (isProcessingAction) return;
    setIsProcessingAction(true);
    
    const confirmDelete = window.confirm('Delete this draft?');
    if (!confirmDelete) {
      setIsProcessingAction(false);
      return;
    }
    
    toast.success('Draft deleted');
    onCancel?.();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 relative">
      {/* Loading overlay */}
      {(isProcessingAction || sending) && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-700 font-medium">
              {savingDraft ? 'Saving draft...' : sending ? 'Sending...' : 'Processing...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Header with actions */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <h2 className="text-lg font-medium">{isReply ? 'Reply to Email' : 'New Message'}</h2>
        <div className="flex items-center space-x-1">
          <IconButton onClick={handleCancel} tooltip="Close" disabled={isProcessingAction}>
            <X size={18} weight="bold" />
          </IconButton>
        </div>
      </div>
      
      {/* Email form */}
      <div className="flex flex-col">
        {/* Recipients */}
        {!isReply && (
          <div className="px-4 py-2 border-b">
            <div className="flex items-center">
              <span className="text-sm font-medium w-12">To:</span>
              <div className="flex-1">
                <RecipientInput
                  recipients={toRecipients}
                  onChange={setToRecipients}
                  placeholder="Add recipients..."
                  type="to"
                  disabled={sending || isProcessingAction}
                />
              </div>
            </div>
            
            <div className="pl-12 mt-1">
              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-sm text-gray-600 hover:text-gray-800 border-l-2 border-l-blue-600 pl-1"
                disabled={sending || isProcessingAction}
              >
                {showCcBcc ? 'Hide Cc/Bcc' : 'Add Cc/Bcc'}
              </button>
            </div>
          </div>
        )}
        
        {/* Cc/Bcc fields */}
        {showCcBcc && (
          <>
            <div className="px-4 py-2 border-b">
              <div className="flex items-center">
                <span className="text-sm font-medium w-12">Cc:</span>
                <div className="flex-1">
                  <RecipientInput
                    recipients={ccRecipients}
                    onChange={setCcRecipients}
                    placeholder="Add Cc recipients..."
                    type="cc"
                    disabled={sending || isProcessingAction}
                  />
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2 border-b">
              <div className="flex items-center">
                <span className="text-sm font-medium w-12">Bcc:</span>
                <div className="flex-1">
                  <RecipientInput
                    recipients={bccRecipients}
                    onChange={setBccRecipients}
                    placeholder="Add Bcc recipients..."
                    type="bcc"
                    disabled={sending || isProcessingAction}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Subject */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center">
            <span className="text-sm font-medium w-12">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 border-none outline-none focus:ring-0 p-1"
              placeholder="Subject"
              disabled={sending || isProcessingAction}
              required
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="px-4 py-2 border-b flex items-center bg-gray-50">
          <IconButton 
            variant="primary" 
            onClick={handleSend} 
            disabled={sending || isProcessingAction}
            loading={sending}
            tooltip="Send"
            className="mr-2"
          >
            <PaperPlaneTilt size={18} weight="bold" />
          </IconButton>
          
          <IconButton 
            tooltip="Attach files" 
            disabled={sending || isProcessingAction}
          >
            <PaperclipHorizontal size={18} weight="bold" />
          </IconButton>
          
          <div className="flex-1"></div>
          
          <IconButton 
            tooltip="Delete draft" 
            onClick={handleDelete}
            disabled={isProcessingAction}
          >
            <Trash size={18} weight="bold" />
          </IconButton>
        </div>
        
        {/* Editor */}
        <div className="p-4">
          <TipTapEditor
            ref={editorRef}
            initialValue={initialBody}
            placeholder="Write your message..."
            minHeight="250px"
            readOnly={sending || isProcessingAction}
          />
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail; 