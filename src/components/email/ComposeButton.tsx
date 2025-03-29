"use client";

import { useState } from 'react';
import { PencilSimple } from '@phosphor-icons/react';
import ComposeEmailModal from './ComposeEmailModal';

interface ComposeButtonProps {
  floating?: boolean;
}

export default function ComposeButton({ floating = true }: ComposeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
      {floating ? (
        <button
          onClick={handleOpenModal}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
          aria-label="Compose new email"
        >
          <PencilSimple size={24} weight="bold" />
        </button>
      ) : (
        <button
          onClick={handleOpenModal}
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Compose email"
        >
          <PencilSimple size={22} weight="light" />
        </button>
      )}
      
      {isModalOpen && (
        <ComposeEmailModal
          onClose={handleCloseModal}
          onSend={handleCloseModal}
        />
      )}
    </>
  );
} 