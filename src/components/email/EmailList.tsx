import { useState } from "react";
import { EmailListItem, type EmailData } from "./EmailListItem";
import { Filter, SortAsc } from "lucide-react";

interface EmailListProps {
  emails: EmailData[];
  onSelectEmail: (email: EmailData) => void;
}

export function EmailList({ emails, onSelectEmail }: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const handleSelectEmail = (email: EmailData) => {
    setSelectedEmail(email.id);
    onSelectEmail(email);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Smart Inbox</h2>
        <div className="flex gap-2">
          <button className="p-1.5 rounded-md hover:bg-gray-100">
            <Filter size={18} className="text-gray-500" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-gray-100">
            <SortAsc size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        {emails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No emails found</p>
          </div>
        ) : (
          emails.map((email) => (
            <EmailListItem 
              key={email.id} 
              email={email} 
              isSelected={selectedEmail === email.id}
              onClick={() => handleSelectEmail(email)}
            />
          ))
        )}
      </div>
    </div>
  );
} 