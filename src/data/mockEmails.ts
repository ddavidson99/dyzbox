import { EmailData } from "@/components/email/EmailListItem";

export const mockEmails: EmailData[] = [
  {
    id: "1",
    sender: {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
    },
    subject: "Project Update Meeting",
    preview: "Discussion about Q2 2025 project milestones and team assignments...",
    timestamp: new Date("2025-03-21T10:30:00"),
    read: false,
    hasAttachments: true,
  },
  {
    id: "2",
    sender: {
      name: "Alex Chen",
      email: "alex.chen@example.com",
    },
    subject: "Client Presentation Review",
    preview: "Feedback on the latest client presentation draft with suggested revisions...",
    timestamp: new Date("2025-03-21T09:15:00"),
    read: false,
    hasAttachments: false,
  },
  {
    id: "3",
    sender: {
      name: "Miguel Rodriguez",
      email: "miguel.rodriguez@example.com",
    },
    subject: "Budget Approval for Q2",
    preview: "The finance team has approved our budget request for the upcoming quarter...",
    timestamp: new Date("2025-03-20T16:45:00"),
    read: true,
    hasAttachments: true,
  },
  {
    id: "4",
    sender: {
      name: "Priya Patel",
      email: "priya.patel@example.com",
    },
    subject: "New Feature Specifications",
    preview: "I've attached the finalized specifications for the new features we discussed...",
    timestamp: new Date("2025-03-20T14:20:00"),
    read: true,
    hasAttachments: true,
  },
  {
    id: "5",
    sender: {
      name: "Thomas Weber",
      email: "thomas.weber@example.com",
    },
    subject: "Team Building Event",
    preview: "Let's plan our quarterly team building event. I was thinking we could...",
    timestamp: new Date("2025-03-20T11:05:00"),
    read: true,
    hasAttachments: false,
  },
  {
    id: "6",
    sender: {
      name: "Lisa Kim",
      email: "lisa.kim@example.com",
    },
    subject: "User Research Results",
    preview: "Our latest user research study has yielded some interesting insights about...",
    timestamp: new Date("2025-03-19T16:30:00"),
    read: true,
    hasAttachments: false,
  },
  {
    id: "7",
    sender: {
      name: "David Okafor",
      email: "david.okafor@example.com",
    },
    subject: "API Documentation Update",
    preview: "I've updated the API documentation to reflect the recent changes we made...",
    timestamp: new Date("2025-03-19T14:15:00"),
    read: true,
    hasAttachments: false,
  },
  {
    id: "8",
    sender: {
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
    },
    subject: "Weekly Status Report",
    preview: "Attached is my weekly status report covering progress on all assigned tasks...",
    timestamp: new Date("2025-03-19T09:45:00"),
    read: true,
    hasAttachments: true,
  },
]; 