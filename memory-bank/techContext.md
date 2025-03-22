# Technology Context: DyzBox

## Overview

DyzBox leverages modern web technologies for its email client implementation, focusing on performance, maintainability, and user experience. The technology stack has been carefully selected to support the project's requirements for a responsive, AI-enhanced email management solution.

## Core Technologies

### Frontend

1. **Next.js (v15)**: React framework with server components and App Router
   - Server Components for data fetching
   - Client Components for interactive elements
   - App Router for page organization
   - Server Actions for authenticated API calls
   - Image optimization for performant email content
   - Built-in API routes for simple backend endpoints

2. **React (v19)**: Component-based UI library
   - Hooks for state management (useState, useEffect, useContext)
   - Context API for state sharing
   - Error boundaries for resilient UI
   - Server Components for improved performance
   - Client Components for interactive elements
   - Custom hooks for shared logic

3. **TypeScript (v5.4)**: Typed JavaScript for better development experience
   - Strict typing for improved code quality
   - Interface definitions for component props
   - Type guards for runtime type checking
   - Utility types for common operations
   - Enums for defined constants

4. **Tailwind CSS (v3.4.1)**: Utility-first CSS framework
   - Responsive design utilities
   - Custom design system integration
   - JIT compiler for optimized CSS
   - Dark mode support
   - Component-specific styling

### Backend

1. **Supabase**: Backend-as-a-Service with PostgreSQL
   - Authentication services
   - Database for email metadata and preferences
   - Storage for email content
   - Row-level security policies
   - Real-time subscriptions

2. **Python (v3.12)**: Language for AI microservices
   - FastAPI for API endpoints
   - Pydantic for data validation
   - Gemini 2.0 Flash integration
   - NLP libraries for text processing
   - Docker containerization

### Email Integration

1. **Gmail API**: Official API for Gmail integration
   - REST API for email operations
   - Push notifications for real-time updates
   - OAuth authentication
   - Access to email content and metadata
   - Support for labels and filters

2. **NextAuth.js**: Authentication library for Next.js
   - OAuth integration with email providers
   - JWT session management
   - Secure credential storage
   - Typed session data
   - Integration with Next.js App Router

### Development Tools

1. **ESLint**: JavaScript/TypeScript linting
   - Custom rule configuration
   - TypeScript integration
   - React-specific rules
   - Import sorting
   - Code style enforcement

2. **Prettier**: Code formatting
   - Consistent code style
   - Integration with ESLint
   - Pre-commit hooks
   - Editor integration
   - Configuration for project style

3. **Jest**: Testing framework
   - Component testing with React Testing Library
   - API mocking
   - Snapshot testing
   - Coverage reporting
   - Integration with CI/CD

4. **Storybook**: Component development and documentation
   - Visual component testing
   - Component state management
   - Documentation generation
   - Accessibility testing
   - Design system implementation

5. **GitHub**: Version control and CI/CD
   - Git flow for branch management
   - Pull request workflow
   - Automated testing
   - Deployment pipelines
   - Issue tracking

## Technology Implementation Details

### Next.js Implementation

DyzBox uses Next.js with the App Router for its frontend implementation:

```
/app
  /api            # API routes
  /auth           # Authentication pages
  /inbox          # Inbox pages
    /page.tsx     # Inbox list page
    /[id]/page.tsx # Email detail page
  /labels         # Label pages
  /settings       # Settings pages
  layout.tsx      # Root layout
  page.tsx        # Home page
```

Key implementation details:

1. **Server Components**: Used for data fetching and initial rendering
   ```tsx
   // Example server component
   export default async function InboxPage() {
     const emails = await fetchEmails();
     return <EmailList emails={emails} />;
   }
   ```

2. **Client Components**: Used for interactive elements
   ```tsx
   'use client';
   
   export function EmailActions({ emailId }: { emailId: string }) {
     const handleArchive = async () => {
       await archiveEmail(emailId);
     };
     
     return (
       <button onClick={handleArchive}>Archive</button>
     );
   }
   ```

3. **Server Actions**: Used for authenticated API calls
   ```tsx
   'use server';
   
   export async function archiveEmail(id: string) {
     const session = await getServerSession(authOptions);
     if (!session) return { success: false, error: 'Not authenticated' };
     
     // Implementation
   }
   ```

4. **Route Handlers**: Used for API endpoints
   ```tsx
   // app/api/emails/route.ts
   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url);
     const limit = searchParams.get('limit');
     
     // Implementation
   }
   ```

5. **Middleware**: Used for authentication
   ```tsx
   // middleware.ts
   export function middleware(request: NextRequest) {
     const token = request.cookies.get('token');
     
     if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
       return NextResponse.redirect(new URL('/auth/signin', request.url));
     }
   }
   
   export const config = {
     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
   };
   ```

### Tailwind CSS Configuration

The project uses Tailwind CSS for styling, with a custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ...other shades
          900: '#0c4a6e',
        },
        // ...other colors
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        // ...other sizes
      },
      spacing: {
        // Custom spacing values
      },
      borderRadius: {
        // Custom border radius values
      },
      boxShadow: {
        // Custom shadow values
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### React Component Implementation

Components follow a structured approach for consistency:

1. **Atomic Design Methodology**: Components are categorized as:
   - Atoms: Basic building blocks (Button, Input, Icon)
   - Molecules: Groups of atoms (EmailItem, SearchBar)
   - Organisms: Groups of molecules (EmailList, Sidebar)
   - Templates: Page layouts (Layout, EmailLayout)
   - Pages: Specific instances of templates with real data

2. **Component Structure**:
   ```tsx
   import { useState, useEffect } from 'react';
   
   // Types
   interface EmailListProps {
     label?: string;
   }
   
   // Component
   export function EmailList({ label }: EmailListProps) {
     // State
     const [emails, setEmails] = useState([]);
     
     // Effects
     useEffect(() => {
       // Implementation
     }, [label]);
     
     // Event handlers
     const handleSelect = (id: string) => {
       // Implementation
     };
     
     // Render
     return (
       <div className="email-list">
         {/* Implementation */}
       </div>
     );
   }
   ```

3. **UI Composition**:
   The application uses composition to build complex UI elements:
   ```tsx
   // Main email view
   <div className="flex h-screen">
     <Sidebar />
     <div className="flex flex-1 overflow-hidden">
       <ResizablePanel width={leftPanelWidth} onResize={handleResize}>
         <EmailList />
       </ResizablePanel>
       <div style={{ width: `${100 - leftPanelWidth}%` }}>
         <EmailDetail />
       </div>
     </div>
   </div>
   ```

4. **Custom Hooks**:
   The application uses custom hooks for shared logic:
   ```tsx
   function useEmails(labelId?: string) {
     const [emails, setEmails] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       // Implementation
     }, [labelId]);
     
     return { emails, loading, error };
   }
   ```

### Email Integration Implementation

The application uses the Gmail API for email operations:

1. **Authentication**:
   ```tsx
   // auth.ts
   export const authOptions: NextAuthOptions = {
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
         authorization: {
           params: {
             scope: 'https://www.googleapis.com/auth/gmail.modify',
           },
         },
       }),
     ],
     callbacks: {
       async jwt({ token, account }) {
         if (account) {
           token.accessToken = account.access_token;
         }
         return token;
       },
       async session({ session, token }) {
         if (session.user) {
           session.accessToken = token.accessToken;
         }
         return session;
       },
     },
   };
   ```

2. **Email Fetching**:
   ```tsx
   // emails.ts
   export async function fetchEmails(labelId = 'INBOX') {
     const session = await getServerSession(authOptions);
     if (!session?.accessToken) throw new Error('Not authenticated');
     
     const response = await fetch(
       `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}`,
       {
         headers: {
           Authorization: `Bearer ${session.accessToken}`,
         },
       }
     );
     
     const data = await response.json();
     // Process and return emails
   }
   ```

3. **Email Actions**:
   ```tsx
   // actions.ts
   export async function archiveEmail(id: string) {
     const session = await getServerSession(authOptions);
     if (!session?.accessToken) return { success: false, error: 'Not authenticated' };
     
     const response = await fetch(
       `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${session.accessToken}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           removeLabelIds: ['INBOX'],
         }),
       }
     );
     
     return { success: response.ok };
   }
   ```

### Email UI Implementation

The application features a modern email interface with resizable panels:

1. **Resizable Panel Implementation**:
   ```tsx
   'use client';
   
   import { useState, useRef, useCallback } from 'react';
   
   interface ResizablePanelProps {
     width: number;
     minWidth?: number;
     maxWidth?: number;
     onResize: (width: number) => void;
     children: React.ReactNode;
   }
   
   export function ResizablePanel({
     width,
     minWidth = 20,
     maxWidth = 80,
     onResize,
     children,
   }: ResizablePanelProps) {
     const panelRef = useRef<HTMLDivElement>(null);
     const [isDragging, setIsDragging] = useState(false);
     
     const handleMouseDown = useCallback(() => {
       setIsDragging(true);
       document.body.style.cursor = 'col-resize';
       
       const handleMouseMove = (e: MouseEvent) => {
         if (!panelRef.current) return;
         
         const container = panelRef.current.parentElement;
         if (!container) return;
         
         const containerWidth = container.offsetWidth;
         const newWidth = (e.clientX / containerWidth) * 100;
         const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
         
         onResize(clampedWidth);
       };
       
       const handleMouseUp = () => {
         setIsDragging(false);
         document.body.style.cursor = '';
         document.removeEventListener('mousemove', handleMouseMove);
         document.removeEventListener('mouseup', handleMouseUp);
       };
       
       document.addEventListener('mousemove', handleMouseMove);
       document.addEventListener('mouseup', handleMouseUp);
     }, [minWidth, maxWidth, onResize]);
     
     return (
       <div
         ref={panelRef}
         className="relative flex h-full"
         style={{ width: `${width}%` }}
       >
         <div className="h-full w-full overflow-auto">
           {children}
         </div>
         <div
           className={`absolute right-0 top-0 h-full w-1 cursor-col-resize ${
             isDragging ? 'bg-blue-500' : 'bg-gray-200 hover:bg-blue-500'
           }`}
           onMouseDown={handleMouseDown}
         />
       </div>
     );
   }
   ```

2. **Email Layout Implementation**:
   ```tsx
   'use client';
   
   import { useState } from 'react';
   import { Sidebar } from '@/components/layout/Sidebar';
   import { ResizablePanel } from '@/components/ui/ResizablePanel';
   
   export function EmailLayout({ children }: { children: React.ReactNode }) {
     const [leftPanelWidth, setLeftPanelWidth] = useState(40);
     
     const handleResize = (width: number) => {
       setLeftPanelWidth(width);
     };
     
     return (
       <div className="flex h-screen">
         <Sidebar />
         <div className="flex flex-1 overflow-hidden">
           <ResizablePanel
             width={leftPanelWidth}
             onResize={handleResize}
           >
             {/* Email list component */}
           </ResizablePanel>
           <div style={{ width: `${100 - leftPanelWidth}%` }}>
             {children}
           </div>
         </div>
       </div>
     );
   }
   ```

3. **Contextual Date Formatting**:
   ```tsx
   export function DateFormatter({ timestamp }: { timestamp: number }) {
     const date = new Date(timestamp);
     const now = new Date();
     const isToday = date.toDateString() === now.toDateString();
     
     const formattedDate = isToday
       ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
       : date.toLocaleDateString([], { 
           month: 'short', 
           day: 'numeric',
           year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
         });
     
     return <span className="text-sm text-gray-500">{formattedDate}</span>;
   }
   ```

4. **Email Signature Implementation**:
   ```tsx
   export async function sendEmail(draft: EmailDraft) {
     // Add signature if not already present
     if (!draft.body.includes('Sent with DYZBOX')) {
       draft.body += '\n\n--\nSent with DYZBOX';
     }
     
     // Proceed with sending
     const session = await getServerSession(authOptions);
     if (!session?.accessToken) return { success: false, error: 'Not authenticated' };
     
     // Implementation for sending the email
   }
   ```

### Error Handling Implementation

The application implements robust error handling:

1. **Try-Catch Pattern**:
   ```tsx
   export async function fetchEmailDetail(id: string) {
     try {
       const session = await getServerSession(authOptions);
       if (!session?.accessToken) {
         return { success: false, error: 'Not authenticated' };
       }
       
       const response = await fetch(
         `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
         {
           headers: {
             Authorization: `Bearer ${session.accessToken}`,
           },
         }
       );
       
       if (!response.ok) {
         const error = await response.json();
         return { 
           success: false, 
           error: error.message || `HTTP error ${response.status}` 
         };
       }
       
       const data = await response.json();
       return { success: true, data };
     } catch (error) {
       console.error('Failed to fetch email:', error);
       return { 
         success: false, 
         error: error instanceof Error ? error.message : 'Unknown error' 
       };
     }
   }
   ```

2. **Error Boundaries**:
   ```tsx
   'use client';
   
   import { Component, ErrorInfo, ReactNode } from 'react';
   
   interface ErrorBoundaryProps {
     fallback: ReactNode;
     children: ReactNode;
   }
   
   interface ErrorBoundaryState {
     hasError: boolean;
   }
   
   export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
     constructor(props: ErrorBoundaryProps) {
       super(props);
       this.state = { hasError: false };
     }
     
     static getDerivedStateFromError(_: Error) {
       return { hasError: true };
     }
     
     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
       console.error('Error boundary caught error:', error, errorInfo);
     }
     
     render() {
       if (this.state.hasError) {
         return this.props.fallback;
       }
       
       return this.props.children;
     }
   }
   ```

3. **Loading States**:
   ```tsx
   'use client';
   
   import { useState, useEffect } from 'react';
   
   export function EmailDetail({ id }: { id: string }) {
     const [email, setEmail] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       const fetchEmail = async () => {
         setLoading(true);
         setError(null);
         
         try {
           const result = await fetchEmailDetail(id);
           if (result.success) {
             setEmail(result.data);
           } else {
             setError(result.error);
           }
         } catch (err) {
           setError('Failed to load email');
         } finally {
           setLoading(false);
         }
       };
       
       fetchEmail();
     }, [id]);
     
     if (loading) return <EmailSkeleton />;
     if (error) return <ErrorMessage message={error} />;
     if (!email) return <EmptyState message="Email not found" />;
     
     return (
       <div className="email-detail">
         {/* Email content */}
       </div>
     );
   }
   ```

## Development Environment

### Prerequisites

1. Node.js (v20+)
2. npm (v10+) or yarn (v1.22+) or pnpm (v8+)
3. Python (v3.12+) for AI services
4. Git

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ddavidson99/dyzbox.git
   cd dyzbox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with the following variables:
   ```
   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm run test

# Run Storybook
npm run storybook
```

## External Services

### Gmail API

DyzBox integrates with the Gmail API for email operations:

1. **Authentication**: OAuth 2.0 with specific scopes
   - https://www.googleapis.com/auth/gmail.readonly
   - https://www.googleapis.com/auth/gmail.send
   - https://www.googleapis.com/auth/gmail.modify
   - https://www.googleapis.com/auth/gmail.labels

2. **API Endpoints**:
   - List messages: GET /users/me/messages
   - Get message: GET /users/me/messages/{id}
   - Send message: POST /users/me/messages/send
   - Modify message: POST /users/me/messages/{id}/modify
   - List labels: GET /users/me/labels

3. **Quotas and Limitations**:
   - 1,000,000,000 quota units per day
   - 250 quota units per user per second (default)
   - 2000 requests per 100 seconds per user

### Supabase

DyzBox uses Supabase for data storage:

1. **Authentication**: Integrated with NextAuth.js
2. **Database Tables**:
   - emails: Stores email metadata
   - email_contents: Stores email content
   - email_summaries: Stores AI-generated summaries
   - labels: Stores email labels
   - user_preferences: Stores user preferences

3. **Storage Buckets**:
   - attachments: Stores email attachments
   - user_assets: Stores user-specific assets

### Google Cloud

DyzBox uses Google Cloud for authentication and API access:

1. **OAuth Consent Screen**:
   - App name: DyzBox
   - User support email: support@dyzbox.com
   - Developer contact information: dev@dyzbox.com
   - Scopes: Gmail API scopes

2. **API Keys and Credentials**:
   - OAuth 2.0 Client ID for web application
   - API Key for Gmail API access

## Deployment Strategy

### Production Deployment

DyzBox will be deployed using Vercel for the Next.js frontend:

1. **Setup**:
   - Connect GitHub repository to Vercel
   - Configure environment variables
   - Set up production branch

2. **Build Process**:
   - Automatic builds on push to main branch
   - Next.js optimized builds
   - Edge runtime for improved performance

3. **Scaling**:
   - Serverless functions for API routes
   - Edge caching for static assets
   - Automatic scaling based on traffic

### Python Microservices Deployment

AI services will be deployed using Docker and Kubernetes:

1. **Containerization**:
   - Dockerfile for each microservice
   - Docker Compose for local development
   - Container Registry for image storage

2. **Kubernetes Deployment**:
   - Deployment configuration for each service
   - Horizontal Pod Autoscaler for scaling
   - Service mesh for communication

3. **CI/CD Pipeline**:
   - Automated testing before deployment
   - Canary deployments for new versions
   - Rollback capability for failed deployments

## Performance Considerations

### Frontend Performance

DyzBox prioritizes frontend performance:

1. **Code Splitting**:
   - Automatic code splitting with Next.js
   - Dynamic imports for large components
   - Route-based code splitting

2. **Image Optimization**:
   - Next.js Image component for optimization
   - Responsive images with srcset
   - Lazy loading for offscreen images

3. **State Management**:
   - Local state for UI-specific state
   - Context API for shared state
   - Server Components for reduced client-side JavaScript

4. **CSS Optimization**:
   - Tailwind CSS with JIT compiler
   - Purging unused CSS in production
   - Minimizing CSS-in-JS runtime

### Server-Side Performance

The application optimizes server-side performance:

1. **Caching Strategy**:
   - Server-side caching for API responses
   - RFC-compliant HTTP caching headers
   - Client-side cache for frequently accessed data

2. **Database Optimization**:
   - Indexed queries for faster lookups
   - Pagination for large result sets
   - Denormalization for frequent access patterns

3. **API Efficiency**:
   - Batched API requests where possible
   - GraphQL for specific data needs
   - Response compression

## Security Considerations

### Authentication Security

DyzBox implements secure authentication:

1. **OAuth 2.0**:
   - Authorization Code flow with PKCE
   - Secure token storage
   - Token refresh management
   - Scope limitations

2. **Session Management**:
   - JWT for stateless authentication
   - Secure cookie storage
   - CSRF protection
   - Short session timeouts

### Data Security

The application secures user data:

1. **Data Encryption**:
   - TLS for all communication
   - At-rest encryption for stored data
   - Encryption for sensitive fields

2. **Access Control**:
   - Row-level security in Supabase
   - Principle of least privilege
   - Audit logging for sensitive operations

## Internationalization

DyzBox supports internationalization:

1. **Translation Framework**:
   - next-intl for translations
   - JSON-based translation files
   - Language detection
   - Right-to-left support

2. **Content Formatting**:
   - Date and time localization
   - Number formatting
   - Currency formatting

## Accessibility

The application follows accessibility best practices:

1. **ARIA Attributes**:
   - Proper role attributes
   - aria-label for non-text elements
   - aria-live for dynamic content

2. **Keyboard Navigation**:
   - Focus management
   - Keyboard shortcuts
   - Focus indicators

3. **Screen Reader Support**:
   - Alternative text for images
   - Semantic HTML structure
   - Screen reader announcements for important changes

## Future Technical Considerations

1. **Offline Support**:
   - Service Worker for offline capability
   - IndexedDB for local storage
   - Background sync for pending operations

2. **PWA Features**:
   - Installable web app
   - Push notifications for new emails
   - App-like experience

3. **AI Enhancements**:
   - On-device processing for privacy
   - Adaptive models for personalization
   - Integration with other AI services

4. **Performance Monitoring**:
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking
   - Error tracking and alerting

5. **Mobile Optimization**:
   - Responsive adaptation of the two-pane layout
   - Touch-optimized UI controls
   - Gesture support for common actions

## Technical Debt Management

The project manages technical debt through:

1. **Code Quality Checks**:
   - Automated linting
   - Type checking
   - Code reviews

2. **Refactoring Strategy**:
   - Regular refactoring cycles
   - Component extraction for reusability
   - Documentation of complex patterns

3. **Testing Coverage**:
   - Unit tests for business logic
   - Component tests for UI
   - Integration tests for workflows
   - End-to-end tests for critical paths

## Conclusion

DyzBox's technology stack provides a solid foundation for a modern, performant email client. The combination of Next.js, React, TypeScript, and Tailwind CSS for the frontend, with Supabase and Python microservices for the backend, allows for a flexible, scalable application architecture. The focus on performance, accessibility, and user experience ensures that the application will meet the needs of its users while providing a solid platform for future enhancements. 