'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Email } from '@/lib/email/providers/EmailProvider';
import { getEmail } from '@/app/actions/email';
import EmailDetailModal from '@/components/EmailDetailModal';

type EmailResponse = {
  success: boolean;
  email: Email;
  error?: undefined;
} | {
  success: boolean;
  error: string;
  email: null;
};

export default function SentEmailDetailPage() {
  const session = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.status === 'authenticated' && id) {
      setLoading(true);
      setError(null);
      getEmail(id as string)
        .then((response: EmailResponse) => {
          if (response.success && response.email) {
            setEmail(response.email);
          } else {
            setError('Failed to load email');
          }
        })
        .catch((err: Error) => {
          setError('An error occurred while loading the email');
          console.error('Error loading email:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session?.status, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {email && (
        <EmailDetailModal
          email={email}
          onClose={() => router.push('/sent')}
          onEmailRead={() => {}} // No need to mark sent emails as read
        />
      )}
    </div>
  );
} 