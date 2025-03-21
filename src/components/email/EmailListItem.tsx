import { formatTime, formatEmailPreview } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface EmailData {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  timestamp: Date;
  read: boolean;
  hasAttachments: boolean;
}

interface EmailListItemProps {
  email: EmailData;
  isSelected: boolean;
  onClick: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  return (
    <div 
      className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
        isSelected ? "bg-gray-50" : "hover:bg-gray-50"
      } ${!email.read ? "font-medium" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {email.sender.avatar ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image 
              src={email.sender.avatar} 
              alt={email.sender.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-sm font-medium">
              {email.sender.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-sm font-medium truncate pr-2">{email.sender.name}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(email.timestamp)}
            </span>
          </div>
          
          <div className="text-sm font-medium mb-1 truncate">{email.subject}</div>
          
          <div className="text-xs text-gray-600 line-clamp-1">
            <span className="font-medium mr-1">AI Summary:</span>
            {formatEmailPreview(email.preview)}
          </div>
        </div>
      </div>
    </div>
  );
} 