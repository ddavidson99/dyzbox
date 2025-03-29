import { Email } from '@/lib/email/providers/EmailProvider';
import { ArrowBendUpLeft, ArrowBendDoubleUpLeft, ArrowBendUpRight } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import EmailActions from './EmailActions';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  onEmailRead: (emailId: string) => void;
  onEmailAction: (emailId: string) => void;
}

export default function EmailDetail({ email, onClose, onEmailRead, onEmailAction }: EmailDetailProps) {
  const router = useRouter();
  const hasMarkedAsRead = useRef(false);
  
  // Mark email as read when viewed
  useEffect(() => {
    if (email && !email.isRead && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true;
      onEmailRead(email.id);
    }
  }, [email, onEmailRead]);
  
  return (
    <div className="relative h-full flex flex-col">
      {/* Email header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-semibold">{email.subject}</h1>
          <div className="flex items-center">
            {/* Reply actions */}
            <div className="flex items-center space-x-1 border-r pr-2 mr-2">
              <button 
                onClick={() => router.push('/compose?reply=' + email.id)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                title="Reply"
              >
                <ArrowBendUpLeft size={20} weight="regular" />
              </button>
              <button 
                onClick={() => router.push('/compose?replyAll=' + email.id)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                title="Reply All"
              >
                <ArrowBendDoubleUpLeft size={20} weight="regular" />
              </button>
              <button 
                onClick={() => router.push('/compose?forward=' + email.id)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                title="Forward"
              >
                <ArrowBendUpRight size={20} weight="regular" />
              </button>
            </div>

            {/* Email actions and dispositions */}
            <EmailActions 
              emailId={email.id} 
              isRead={email.isRead} 
              onActionComplete={() => {
                onEmailAction(email.id);
              }}
              onClose={onClose}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm">
            <span className="font-medium">From: </span>
            <span>
              {email.from.name} {email.from.name ? `<${email.from.email}>` : email.from.email}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(email.receivedAt).toLocaleString()}
          </div>
        </div>
        
        <div className="text-sm mb-2">
          <span className="font-medium">To: </span>
          <span>
            {email.to?.map((recipient, i) => (
              <span key={i}>
                {recipient.name || recipient.email}
                {i < (email.to?.length || 0) - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        </div>
        
        {email.cc && email.cc.length > 0 && (
          <div className="text-sm mb-2">
            <span className="font-medium">Cc: </span>
            <span>
              {email.cc.map((recipient, i) => (
                <span key={i}>
                  {recipient.name || recipient.email}
                  {i < email.cc!.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
      
      {/* Email body */}
      <div className="p-6 flex-1 overflow-y-auto">
        {email.bodyHtml ? (
          <div 
            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            className="email-body"
          />
        ) : (
          <pre className="email-body whitespace-pre-wrap font-sans">{email.bodyText || email.body}</pre>
        )}
      </div>
    </div>
  );
} 