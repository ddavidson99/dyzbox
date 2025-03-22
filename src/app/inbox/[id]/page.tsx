'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emailId = params.id as string;
  
  useEffect(() => {
    // Redirect to the inbox page with the email ID as a query parameter
    router.replace(`/inbox?id=${emailId}`);
  }, [emailId, router]);

  return (
    <div className="p-8 flex justify-center">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
} 