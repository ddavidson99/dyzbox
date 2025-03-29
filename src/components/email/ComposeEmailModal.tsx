import ComposeEmail from './ComposeEmail';

interface ComposeEmailModalProps {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  isReply?: boolean;
  emailId?: string;
  onClose: () => void;
  onSend?: () => void;
}

export default function ComposeEmailModal({
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  isReply = false,
  emailId = '',
  onClose,
  onSend
}: ComposeEmailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div 
        className="bg-white rounded-lg shadow-xl w-[calc(100vw-8rem)] h-[calc(100vh-8rem)] relative flex flex-col"
        style={{ maxWidth: '800px', maxHeight: '600px' }}
      >
        <ComposeEmail 
          initialTo={initialTo}
          initialSubject={initialSubject}
          initialBody={initialBody}
          isReply={isReply}
          emailId={emailId}
          onCancel={onClose}
          onSend={onSend || onClose}
        />
      </div>
    </div>
  );
} 