'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { EmailAddress } from '@/lib/email/providers/EmailProvider';
import RecipientChip from './RecipientChip';

interface RecipientInputProps {
  recipients: EmailAddress[];
  onChange: (recipients: EmailAddress[]) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'to' | 'cc' | 'bcc';
}

const RecipientInput: React.FC<RecipientInputProps> = ({
  recipients,
  onChange,
  placeholder = 'Add recipient...',
  disabled = false,
  type = 'to'
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const addRecipient = (value: string) => {
    value = value.trim();
    if (!value) return;
    
    // Check if it's a valid email
    if (validateEmail(value)) {
      const newRecipient: EmailAddress = { email: value };
      onChange([...recipients, newRecipient]);
    } else {
      // Check for "Name <email>" format
      const match = value.match(/^(.*?)\s*<(.+@.+)>$/);
      if (match && validateEmail(match[2])) {
        const newRecipient: EmailAddress = {
          name: match[1].trim(),
          email: match[2].trim()
        };
        onChange([...recipients, newRecipient]);
      } else {
        // Invalid email format
        // Could show an error message here
        console.error('Invalid email format:', value);
      }
    }
    
    setInputValue('');
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && recipients.length > 0) {
      // Remove last recipient when backspace is pressed and input is empty
      onChange(recipients.slice(0, -1));
    }
  };
  
  const handleBlur = () => {
    if (inputValue.trim()) {
      addRecipient(inputValue);
    }
  };
  
  const handleRemoveRecipient = (index: number) => {
    const updatedRecipients = [...recipients];
    updatedRecipients.splice(index, 1);
    onChange(updatedRecipients);
  };
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div 
      className="flex flex-wrap items-center gap-1 min-h-[32px] p-1 border border-gray-200 rounded-md focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 bg-white cursor-text"
      onClick={focusInput}
    >
      {recipients.map((recipient, index) => (
        <RecipientChip
          key={index}
          recipient={recipient}
          onRemove={(r) => handleRemoveRecipient(index)}
          type={type}
          disabled={disabled}
        />
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="flex-1 min-w-[80px] border-none focus:outline-none focus:ring-0 text-sm p-1"
        placeholder={recipients.length === 0 ? placeholder : ''}
        disabled={disabled}
      />
    </div>
  );
};

export default RecipientInput; 