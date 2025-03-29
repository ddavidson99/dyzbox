"use server"

import { auth } from "@/app/auth"
import { google } from 'googleapis'

type EmailCountResult = {
  success: boolean;
  totalEmails: number;
  unreadEmails: number;
  error?: string;
};

// Implement a simple in-memory cache to reduce API calls
// This cache will expire after 5 minutes to ensure data freshness
const countsCache: {
  inbox: {
    data: EmailCountResult | null;
    timestamp: number;
  };
  trash: {
    data: EmailCountResult | null;
    timestamp: number;
  };
} = {
  inbox: {
    data: null,
    timestamp: 0
  },
  trash: {
    data: null,
    timestamp: 0
  }
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getEmailCounts() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated', totalEmails: 0, unreadEmails: 0 };
    }

    // Check cache first
    const now = Date.now();
    if (countsCache.inbox.data && (now - countsCache.inbox.timestamp) < CACHE_TTL) {
      return countsCache.inbox.data;
    }

    // Create an OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
      // Use the labels API to get accurate counts
      const labelResponse = await gmail.users.labels.get({
        userId: 'me',
        id: 'INBOX'
      });
      
      // Use label data which is more accurate
      const totalEmails = labelResponse.data.messagesTotal || 0;
      const unreadEmails = labelResponse.data.messagesUnread || 0;

      const result: EmailCountResult = {
        success: true,
        totalEmails,
        unreadEmails
      };
      
      // Update cache
      countsCache.inbox = {
        data: result,
        timestamp: now
      };

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch email counts',
        totalEmails: 0,
        unreadEmails: 0
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch email counts',
      totalEmails: 0,
      unreadEmails: 0
    };
  }
}

export async function getTrashCounts() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated', totalEmails: 0, unreadEmails: 0 };
    }

    // Check cache first
    const now = Date.now();
    if (countsCache.trash.data && (now - countsCache.trash.timestamp) < CACHE_TTL) {
      return countsCache.trash.data;
    }

    // Create an OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
      // Use the labels API to get accurate counts
      const labelResponse = await gmail.users.labels.get({
        userId: 'me',
        id: 'TRASH'
      });
      
      // Use label data which is more accurate
      const totalEmails = labelResponse.data.messagesTotal || 0;
      const unreadEmails = labelResponse.data.messagesUnread || 0;

      const result: EmailCountResult = {
        success: true,
        totalEmails,
        unreadEmails
      };
      
      // Update cache
      countsCache.trash = {
        data: result,
        timestamp: now
      };

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trash email counts',
        totalEmails: 0,
        unreadEmails: 0
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trash email counts',
      totalEmails: 0,
      unreadEmails: 0
    };
  }
} 