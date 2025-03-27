"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
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
    
    if (!isReply && toRecipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter a subject');
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
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An error occurred while sending the email');
    } finally {
      setSending(false);
    }
  };
  
  const handleCancel = async () => {
    // Check if the email has any content
    const hasToRecipients = toRecipients.length > 0;
    const hasCcRecipients = ccRecipients.length > 0;
    const hasBccRecipients = bccRecipients.length > 0;
    const hasSubject = subject.trim().length > 0;
    const hasBody = (editorRef.current?.getContent() || '').length > 0;
    
    const isEmpty = !hasToRecipients && !hasCcRecipients && !hasBccRecipients && !hasSubject && !hasBody;
    
    if (isEmpty) {
      // If email is empty, just close it without confirmation or saving
      onCancel?.();
      return;
    }
    
    // Email has content, save as draft
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Saving draft...');
      
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
        toast.success('Draft saved');
        onCancel?.();
      } else {
        toast.error(result.error || 'Could not save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Could not save draft');
    }
  };
  
  const handleDelete = () => {
    const confirmDelete = window.confirm('Delete this draft?');
    if (!confirmDelete) return;
    
    // If we had draft saving functionality, we'd delete it from storage here
    
    toast.success('Draft deleted');
    onCancel?.();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header with actions */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <h2 className="text-lg font-medium">{isReply ? 'Reply to Email' : 'New Message'}</h2>
        <div className="flex items-center space-x-1">
          <IconButton onClick={handleCancel} tooltip="Discard">
            <X size={18} weight="bold" />
          </IconButton>
        </div>
      </div>
      
      {/* Email form */}
      <form className="flex flex-col" onSubmit={handleSend}>
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
                  disabled={sending}
                />
              </div>
            </div>
            
            <div className="pl-12 mt-1">
              <button
                type="button"
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-sm text-gray-600 hover:text-gray-800 border-l-2 border-l-blue-600 pl-1"
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
                    disabled={sending}
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
                    disabled={sending}
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
              disabled={sending}
              required
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="px-4 py-2 border-b flex items-center bg-gray-50">
          <IconButton 
            variant="primary" 
            onClick={handleSend} 
            disabled={sending}
            loading={sending}
            tooltip="Send"
            className="mr-2"
            type="submit"
          >
            <PaperPlaneTilt size={18} weight="bold" />
          </IconButton>
          
          <IconButton tooltip="Attach files">
            <PaperclipHorizontal size={18} weight="bold" />
          </IconButton>
          
          <div className="flex-1"></div>
          
          <IconButton tooltip="Delete draft" onClick={handleDelete}>
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
            readOnly={sending}
          />
        </div>
      </form>
    </div>
  );
};

export default ComposeEmail; 