import { type EmailData } from "./EmailListItem";
import Image from "next/image";
import { formatTime } from "@/lib/utils";
import { Clock } from "lucide-react";

interface EmailPreviewProps {
  email: EmailData | null;
}

export function EmailPreview({ email }: EmailPreviewProps) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full p-6 bg-gray-50">
        <p className="text-gray-500">Select an email to view</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium mb-6">Preview</h2>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            {email.sender.avatar ? (
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image 
                  src={email.sender.avatar} 
                  alt={email.sender.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-medium">
                  {email.sender.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-base font-semibold">{email.sender.name}</h3>
            <p className="text-sm text-gray-600">Product Manager</p>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-base font-medium">Hi Team,</h4>
          <p className="mt-4 text-sm leading-relaxed">
            I'd like to schedule a meeting to discuss our Q2 2025 project milestones and team assignments.
            Please review the attached documentation before our discussion.
          </p>
          <p className="mt-4 text-sm">
            Best regards,<br />
            {email.sender.name}
          </p>
        </div>
        
        <div className="mt-8">
          <h4 className="text-sm font-semibold mb-3">AI Suggestions</h4>
          <div className="space-y-2">
            <button className="block w-full text-left px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors">
              Schedule meeting for tomorrow at 10 AM
            </button>
            <button className="block w-full text-left px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors">
              Request more details about assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 