"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ComposeEmail from '@/components/email/ComposeEmail';

export default function ComposeEmailPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const isReply = searchParams.get('reply') === 'true';
  const emailId = searchParams.get('emailId');
  const to = searchParams.get('to') || '';
  const subject = searchParams.get('subject') || '';
  const body = searchParams.get('body') || '';
  const returnTo = searchParams.get('returnTo') || '/inbox';
  
  if (!session) {
    return <div className="p-4">Please sign in to compose emails</div>;
  }
  
  const handleCancel = () => {
    router.push(returnTo);
  };
  
  const handleSend = () => {
    // After successful sending, navigation will be handled inside ComposeEmail component
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <ComposeEmail 
        initialTo={to}
        initialSubject={subject}
        initialBody={body}
        isReply={isReply}
        emailId={emailId || ''}
        onCancel={handleCancel}
        onSend={handleSend}
      />
    </div>
  );
} 