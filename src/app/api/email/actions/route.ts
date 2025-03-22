import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GmailProvider } from "@/lib/email/providers/GmailProvider";
import { EmailService } from "@/lib/email/emailService";

// Use a try/catch wrapper for auth validation
async function validateAuth() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await validateAuth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request
    const body = await request.json();
    const { action, emailId, labelId } = body;
    
    if (!action || !emailId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Initialize provider and service
    const provider = new GmailProvider(session.accessToken as string);
    const emailService = new EmailService(provider);
    
    // Handle different actions
    switch (action) {
      case 'markAsRead':
        await emailService.markAsRead(emailId);
        break;
        
      case 'markAsUnread':
        await emailService.markAsUnread(emailId);
        break;
        
      case 'trash':
        await emailService.trashEmail(emailId);
        break;
        
      case 'delete':
        await emailService.deleteEmail(emailId);
        break;
        
      case 'addLabel':
        if (!labelId) {
          return NextResponse.json(
            { error: 'Label ID is required for this action' },
            { status: 400 }
          );
        }
        await emailService.addLabel(emailId, labelId);
        break;
        
      case 'removeLabel':
        if (!labelId) {
          return NextResponse.json(
            { error: 'Label ID is required for this action' },
            { status: 400 }
          );
        }
        await emailService.removeLabel(emailId, labelId);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error performing email action:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 