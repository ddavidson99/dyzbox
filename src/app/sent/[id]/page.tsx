'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { GmailProvider } from '@/lib/email/providers/GmailProvider';
import { EmailService } from '@/lib/email/emailService';
import { Email } from '@/lib/email/providers/EmailProvider';
import { ArrowLeft } from '@phosphor-icons/react';
import EmailDetail from '@/components/EmailDetail';

export default function SentEmailDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;
  
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEmail() {
      if (!session?.accessToken) return;
      
      try {
        setLoading(true);
        const emailProvider = new GmailProvider(session.accessToken as string);
        const emailService = new EmailService(emailProvider);
        
        // Fetch the email details
        const emailData = await emailService.getEmail(emailId);
        setEmail(emailData);
      } catch (e: any) {
        console.error('Error fetching sent email:', e);
        setError(e.message || 'Failed to fetch sent email');
      } finally {
        setLoading(false);
      }
    }
    
    if (emailId) {
      fetchEmail();
    }
  }, [emailId, session]);

  const handleBackToSent = () => {
    router.push('/sent');
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <p className="text-gray-500">Loading email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button 
          onClick={handleBackToSent}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back to Sent Mail
        </button>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Email not found</p>
        <button 
          onClick={handleBackToSent}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back to Sent Mail
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <button 
          onClick={handleBackToSent}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} weight="regular" className="mr-1" />
          Back to Sent Mail
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <EmailDetail 
          email={email}
          onClose={handleBackToSent}
          onEmailRead={() => {}} // No need to mark sent emails as read
        />
      </div>
    </div>
  );
} 