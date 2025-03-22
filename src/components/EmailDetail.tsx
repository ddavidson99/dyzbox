import { Email } from '@/lib/email/providers/EmailProvider';
import { ArrowBendUpLeft, ArrowSquareOut, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EmailActions from './EmailActions';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  onEmailRead: (emailId: string) => void;
}

export default function EmailDetail({ email, onClose, onEmailRead }: EmailDetailProps) {
  const router = useRouter();
  
  // Mark email as read when viewed
  useEffect(() => {
    if (email && !email.isRead) {
      onEmailRead(email.id);
    }
  }, [email, onEmailRead]);
  
  return (
    <div className="relative h-full flex flex-col">
      {/* Email header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-semibold">{email.subject}</h1>
          <div className="flex space-x-1">
            <EmailActions 
              emailId={email.id} 
              isRead={email.isRead} 
              onActionComplete={() => {
                // Close email detail when action completes
                onClose();
              }} 
            />
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
              title="Close"
            >
              <X size={18} weight="regular" />
            </button>
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
          <pre className="whitespace-pre-wrap font-sans">{email.bodyText || email.body}</pre>
        )}
      </div>
      
      {/* Email actions */}
      <div className="p-3 border-t flex items-center space-x-2">
        <button 
          onClick={() => router.push('/compose?reply=' + email.id)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center"
        >
          <ArrowBendUpLeft size={16} className="mr-1.5" weight="regular" />
          Reply
        </button>
        <button 
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center"
          onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.id}`, '_blank')}
        >
          <ArrowSquareOut size={16} className="mr-1.5" weight="regular" />
          Open in Gmail
        </button>
      </div>
    </div>
  );
} 