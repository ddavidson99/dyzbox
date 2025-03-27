'use client';

import React from 'react';
import { EmailAddress } from '@/lib/email/providers/EmailProvider';
import { X } from '@phosphor-icons/react';

interface RecipientChipProps {
  recipient: EmailAddress;
  onRemove: (recipient: EmailAddress) => void;
  type?: 'to' | 'cc' | 'bcc';
  disabled?: boolean;
}

const typeColors = {
  to: 'bg-gray-100 text-gray-800 border-gray-200 border-l-2 border-l-blue-600',
  cc: 'bg-gray-100 text-gray-800 border-gray-200 border-l-2 border-l-purple-600',
  bcc: 'bg-gray-100 text-gray-800 border-gray-200 border-l-2 border-l-orange-600'
};

const RecipientChip: React.FC<RecipientChipProps> = ({ 
  recipient, 
  onRemove,
  type = 'to',
  disabled = false
}) => {
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm border mr-1 mb-1 ${typeColors[type]} ${disabled ? 'opacity-70' : ''}`}>
      <span className="truncate max-w-[200px]">
        {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
      </span>
      {!disabled && (
        <button
          type="button"
          className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => onRemove(recipient)}
          aria-label="Remove recipient"
        >
          <X size={16} weight="bold" />
        </button>
      )}
    </div>
  );
};

export default RecipientChip; 