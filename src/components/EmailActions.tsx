"use client";

import { useState, useRef, useEffect } from "react";
import { markAsRead, markAsUnread, trashEmail, addLabel, removeLabel, getLabels, getEmail } from "@/app/actions/email";
import { toast } from "react-hot-toast";
import { Eye, EyeSlash, Tag, Trash, Star, Check, X, Clock } from "@phosphor-icons/react";

interface EmailActionsProps {
  emailId: string;
  isRead: boolean;
  onActionComplete?: () => void;
  onClose?: () => void;
}

type Label = {
  id: string;
  name: string;
  type: string;
};

export default function EmailActions({ 
  emailId,
  isRead,
  onActionComplete,
  onClose
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

  const handleAction = async (action: 'read' | 'unread' | 'trash' | 'archive') => {
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
            toast.success('Email deleted');
            if (onClose) onClose();
          } else {
            toast.error(result.error || 'Failed to delete email');
          }
          break;
        case 'archive':
          // TODO: Implement archive functionality
          toast.success('Email archived');
          if (onClose) onClose();
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
      {/* Actions */}
      <div className="flex items-center space-x-2 border-r pr-2 mr-2">
        {/* Read/Unread toggle */}
        <button
          onClick={() => handleAction(isRead ? 'unread' : 'read')}
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

        {/* Star placeholder */}
        <button
          disabled={true}
          className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-gray-100 rounded-full"
          title="Star (coming soon)"
        >
          <Star size={20} weight="regular" />
        </button>

        {/* Label menu */}
        <div className="relative">
          <button
            onClick={() => setShowLabelMenu(!showLabelMenu)}
            className={`relative p-2 rounded-full ${showLabelMenu ? 'bg-blue-100' : activeLabelIds.length > 0 ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
            disabled={isLoading}
            title="Labels"
          >
            <Tag size={20} weight="regular" />
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
      </div>

      {/* Dispositions */}
      <div className="flex items-center space-x-2">
        {/* Done/Archive */}
        <button
          onClick={() => handleAction('archive')}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-green-500 hover:bg-gray-100 rounded-full"
          title="Done"
        >
          <Check size={20} weight="regular" />
        </button>

        {/* Sleep placeholder */}
        <button
          disabled={true}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
          title="Sleep (coming soon)"
        >
          <Clock size={20} weight="regular" />
        </button>

        {/* Delete */}
        <button
          onClick={() => handleAction('trash')}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
          title="Delete"
        >
          <Trash size={20} weight="regular" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          title="Close"
        >
          <X size={20} weight="regular" />
        </button>
      </div>
    </div>
  );
} 