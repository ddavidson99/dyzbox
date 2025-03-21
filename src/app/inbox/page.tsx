"use client";

import { useState } from "react";
import { EmailLayout } from "@/components/layout/EmailLayout";
import { EmailList } from "@/components/email/EmailList";
import { EmailPreview } from "@/components/email/EmailPreview";
import { mockEmails } from "@/data/mockEmails";
import { type EmailData } from "@/components/email/EmailListItem";

export default function InboxPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

  return (
    <EmailLayout>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-6 border-r border-gray-200 h-full overflow-hidden">
          <EmailList 
            emails={mockEmails}
            onSelectEmail={setSelectedEmail}
          />
        </div>
        <div className="col-span-6 h-full overflow-auto">
          <EmailPreview email={selectedEmail} />
        </div>
      </div>
    </EmailLayout>
  );
} 