"use client";

import { useState, useRef, useEffect } from "react";
import { markAsRead, markAsUnread, trashEmail, addLabel, removeLabel, getLabels, getEmail } from "@/app/actions/email";
import { toast } from "react-hot-toast";
import { Tag, X, ChevronDown } from "lucide-react";

interface EmailActionsProps {
  emailId: string;
  isRead: boolean;
  onActionComplete?: () => void;
}

type Label = {
  id: string;
  name: string;
  type: string;
};

export default function EmailActions({ 
  emailId,
  isRead,
  onActionComplete 
}: EmailActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const labelMenuRef = useRef<HTMLDivElement>(null);
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await getLabels();
        if (response.success && response.labels) {
          // Filter out system labels that we show separately
          const userLabels = response.labels.filter(
            label => 
              label.type !== 'system' || 
              (!['INBOX', 'SENT', 'TRASH', 'DRAFT', 'SPAM'].includes(label.id))
          );
          setLabels(userLabels);
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
      }
    };

    fetchLabels();

    // Setup click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (labelMenuRef.current && !labelMenuRef.current.contains(event.target as Node)) {
        setShowLabelMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchEmailLabels = async () => {
      if (!emailId) return;
      
      try {
        const response = await getEmail(emailId);
        if (response.success && response.email) {
          // Filter out system labels and only keep user labels
          const userLabels = response.email.labels?.filter((labelId: string) => 
            !['INBOX', 'SENT', 'UNREAD', 'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 
              'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'].includes(labelId)
          ) || [];
          setActiveLabelIds(userLabels);
        }
      } catch (error) {
        console.error("Error fetching email labels:", error);
      }
    };
    
    fetchEmailLabels();
  }, [emailId]);

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

  const handleToggleLabel = async (labelId: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const isActive = activeLabelIds.includes(labelId);
      const result = isActive
        ? await removeLabel(emailId, labelId)
        : await addLabel(emailId, labelId);
        
      if (result?.success) {
        // Update local state without needing a reload
        setActiveLabelIds(prevLabels => 
          isActive
            ? prevLabels.filter(id => id !== labelId)
            : [...prevLabels, labelId]
        );
        
        toast.success(isActive ? 'Label removed' : 'Label added');
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(result?.error || 'Failed to update label');
      }
    } catch (error) {
      console.error('Error updating label:', error);
      toast.error('Failed to update label');
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

      <div className="relative">
        <button
          onClick={() => setShowLabelMenu(!showLabelMenu)}
          className={`relative p-2 rounded-full ${showLabelMenu ? 'bg-blue-100' : activeLabelIds.length > 0 ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
          disabled={isLoading}
        >
          <Tag className="h-5 w-5" />
        </button>

        {showLabelMenu && (
          <div 
            ref={labelMenuRef}
            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">Add label</p>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {labels.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">No labels found</p>
              ) : (
                <ul>
                  {labels.map((label) => (
                    <li
                      key={label.id}
                      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center ${
                        activeLabelIds.includes(label.id) ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                      onClick={() => handleToggleLabel(label.id)}
                    >
                      <span className="mr-2">{activeLabelIds.includes(label.id) ? '✓' : ''}</span>
                      {label.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

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