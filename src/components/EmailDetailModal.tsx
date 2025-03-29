import { Email } from '@/lib/email/providers/EmailProvider';
import EmailDetail from './EmailDetail';

interface EmailDetailModalProps {
  email: Email;
  onClose: () => void;
  onEmailRead: (emailId: string) => void;
  onEmailAction: (emailId: string) => void;
}

export default function EmailDetailModal({ email, onClose, onEmailRead, onEmailAction }: EmailDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div 
        className="bg-white rounded-lg shadow-xl w-[calc(100vw-8rem)] h-[calc(100vh-8rem)] relative flex flex-col"
        style={{ maxWidth: '1200px' }}
      >
        <EmailDetail 
          email={email}
          onClose={onClose}
          onEmailRead={onEmailRead}
          onEmailAction={onEmailAction}
        />
      </div>
    </div>
  );
} 