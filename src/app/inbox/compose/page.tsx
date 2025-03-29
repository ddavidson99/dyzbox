"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ComposeEmailModal from '@/components/email/ComposeEmailModal';

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
    router.push(returnTo);
  };
  
  return (
    <ComposeEmailModal 
      initialTo={to}
      initialSubject={subject}
      initialBody={body}
      isReply={isReply}
      emailId={emailId || ''}
      onClose={handleCancel}
      onSend={handleSend}
    />
  );
} 