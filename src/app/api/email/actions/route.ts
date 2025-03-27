import { NextRequest, NextResponse } from "next/server";
import { EmailAddress } from "@/lib/email/providers/EmailProvider";
import { getServerAuthSession } from "@/lib/getServerAuthSession";

// API route for email actions
export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  
  if (!session || !session.accessToken) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { action, emailId, data } = body;
    
    if (!action || !emailId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    // These actions require a server-side API call
    // For other actions like mark as read, archive, etc. we use server actions
    switch (action) {
      case 'delete': {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete email');
        }
        
        return NextResponse.json({ success: true });
      }
      
      case 'reply': {
        const { to, cc, bcc, subject, body } = data || {};
        
        if (!body) {
          return NextResponse.json({ success: false, error: 'Missing email body' }, { status: 400 });
        }
        
        // Get the original message to get thread information
        const msgResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        
        if (!msgResponse.ok) {
          const errorData = await msgResponse.json();
          throw new Error(errorData.error?.message || 'Failed to get original message');
        }
        
        const message = await msgResponse.json();
        const threadId = message.threadId;
        
        // Format recipients
        const formatRecipients = (recipients: EmailAddress[] | undefined) => {
          if (!recipients || recipients.length === 0) return '';
          return recipients.map(r => {
            if (r.name) {
              return `${r.name} <${r.email}>`;
            }
            return r.email;
          }).join(', ');
        };
        
        // Get email headers
        const headers = message.payload.headers;
        const getHeader = (name: string) => {
          const header = headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase());
          return header ? header.value : '';
        };
        
        const originalFrom = getHeader('from');
        const originalSubject = getHeader('subject');
        
        const replySubject = subject || (originalSubject.startsWith('Re:') ? originalSubject : `Re: ${originalSubject}`);
        
        // Create email content
        let emailContent = '';
        emailContent += `To: ${to || originalFrom}\r\n`;
        if (cc && cc.length > 0) emailContent += `Cc: ${formatRecipients(cc)}\r\n`;
        if (bcc && bcc.length > 0) emailContent += `Bcc: ${formatRecipients(bcc)}\r\n`;
        emailContent += `Subject: ${replySubject}\r\n`;
        emailContent += `In-Reply-To: ${message.id}\r\n`;
        emailContent += `References: ${message.id}\r\n`;
        emailContent += `Thread-Id: ${threadId}\r\n`;
        emailContent += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
        emailContent += body;
        
        // Encode as base64url
        const encodedEmail = btoa(emailContent)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        // Send reply
        const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: encodedEmail,
            threadId
          })
        });
        
        if (!sendResponse.ok) {
          const errorData = await sendResponse.json();
          throw new Error(errorData.error?.message || 'Failed to send reply');
        }
        
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email action error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }, { status: 500 });
  }
} 