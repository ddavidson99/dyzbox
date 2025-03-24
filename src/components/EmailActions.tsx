"use client";

import { useState } from 'react';
import { 
  Archive, 
  Trash, 
  Clock, 
  Check, 
  X,
  Eye,
  EyeSlash,
  Star
} from '@phosphor-icons/react';
import { archiveEmail, deleteEmail, markAsRead, markAsUnread } from '@/lib/email/emailActions';

interface EmailActionsProps {
  emailId: string;
  isRead: boolean;
  onActionComplete?: () => void;
  onClose?: () => void;
}

export default function EmailActions({ emailId, isRead, onActionComplete, onClose }: EmailActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    try {
      setIsLoading(true);
      await archiveEmail(emailId);
      onActionComplete?.();
    } catch (error) {
      console.error('Error archiving email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteEmail(emailId);
      onActionComplete?.();
    } catch (error) {
      console.error('Error deleting email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadUnread = async () => {
    try {
      setIsLoading(true);
      if (isRead) {
        await markAsUnread(emailId);
      } else {
        await markAsRead(emailId);
      }
      onActionComplete?.();
    } catch (error) {
      console.error('Error toggling read status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Email state actions */}
      <div className="flex items-center space-x-1 border-r pr-2 mr-2">
        <button
          onClick={handleReadUnread}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
          title={isRead ? "Mark as unread" : "Mark as read"}
        >
          {isRead ? (
            <EyeSlash size={20} weight="regular" />
          ) : (
            <Eye size={20} weight="regular" />
          )}
        </button>

        <button
          disabled={true}
          className="p-2 text-gray-300 cursor-not-allowed rounded-full"
          title="Star (Coming Soon)"
        >
          <Star size={20} weight="regular" />
        </button>
      </div>

      {/* Disposition actions */}
      <button
        onClick={handleArchive}
        disabled={isLoading}
        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
        title="Done (Archive)"
      >
        <Check size={20} weight="regular" />
      </button>
      
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
        title="Delete"
      >
        <Trash size={20} weight="regular" />
      </button>

      <button
        disabled
        className="p-2 text-gray-300 cursor-not-allowed rounded-full"
        title="Sleep (Coming Soon)"
      >
        <Clock size={20} weight="regular" />
      </button>

      {onClose && (
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title="Close"
        >
          <X size={20} weight="regular" />
        </button>
      )}
    </div>
  );
} 