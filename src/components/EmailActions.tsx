"use client";

import { useState } from "react";
import { markAsRead, markAsUnread, trashEmail } from "@/app/actions/email";
import { toast } from "react-hot-toast";

interface EmailActionsProps {
  emailId: string;
  isRead: boolean;
  onActionComplete?: () => void;
}

export default function EmailActions({ 
  emailId,
  isRead,
  onActionComplete 
}: EmailActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'read' | 'unread' | 'trash') => {
    setIsLoading(true);
    try {
      let result;
      switch (action) {
        case 'read':
          result = await markAsRead(emailId);
          if (result.success) {
            toast.success('Marked as read');
          } else {
            toast.error(result.error || 'Failed to mark as read');
          }
          break;
        case 'unread':
          result = await markAsUnread(emailId);
          if (result.success) {
            toast.success('Marked as unread');
          } else {
            toast.error(result.error || 'Failed to mark as unread');
          }
          break;
        case 'trash':
          result = await trashEmail(emailId);
          if (result.success) {
            toast.success('Moved to trash');
          } else {
            toast.error(result.error || 'Failed to move to trash');
          }
          break;
      }
      
      if (result?.success && onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isRead ? (
        <button
          onClick={() => handleAction('unread')}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
          title="Mark as unread"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => handleAction('read')}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
          title="Mark as read"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
        </button>
      )}

      <button
        onClick={() => handleAction('trash')}
        disabled={isLoading}
        className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
        title="Move to trash"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 