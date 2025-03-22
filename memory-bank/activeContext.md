# Active Context: DyzBox

## Current Focus

The DyzBox project is currently in the initial implementation phase. We've established the foundation for the email management client and implemented basic UI components based on the design inspiration. Our immediate priorities are:

1. **UI Component Enhancements**: Refining the clean, modern interface with a resizable two-pane layout.
2. **Gmail API Integration**: Connecting to Gmail to fetch and display real emails.
3. **Authentication Setup**: Implementing user authentication with Gmail using NextAuth.
4. **Email Operations**: Building core email functionality (read, send, reply, forward).
5. **Data Model Design**: Implementing the email identification and AI summary processing model.
6. **Architecture Implementation**: Setting up the hybrid communication architecture between Next.js, Python microservices, and email providers.
7. **Error Handling**: Improving resilience with better error handling in API calls and server actions.
8. **Email Workflow Expansion**: Implementing complete email workflow features including sent mail viewing, reply functionality with quoted text, and compose capabilities.
9. **UI Consistency**: Ensuring consistent UI behavior across different views (inbox, labels).

## Recent Decisions

1. **Tech Stack Selection**: Next.js frontend with Tailwind CSS v3.4.1, Supabase (PostgreSQL) backend, Python microservices for AI integration.
2. **AI Provider**: Gemini 2.0 Flash selected as the primary LLM for AI capabilities.
3. **Email Provider Support**: Initial focus on Gmail integration with IMAP/POP3 support planned for later phases.
4. **Privacy Approach**: Commitment to on-device processing where possible, with opt-in for cloud processing.
5. **Repository Setup**: Project initialized with Next.js, TypeScript, and Tailwind CSS, and pushed to GitHub at https://github.com/ddavidson99/dyzbox.
6. **UI Structure**: Implemented a two-pane layout with sidebar navigation, resizable email list and detail panes.
7. **Tailwind Configuration**: Resolved compatibility issues with Tailwind CSS by downgrading from v4 alpha to v3.4.1 stable and configuring PostCSS properly.
8. **Email Identification Strategy**: Designed approach for uniquely identifying emails using provider IDs (Gmail Message ID, Thread ID) and our own internal identifiers.
9. **AI Summary Storage**: Decided to store AI-generated summaries separately from email content in Supabase, with proper linking to original emails.
10. **Service Communication Architecture**: Implemented a hybrid approach where Next.js communicates directly with email providers for core operations (fetch, send, organize) while routing AI-dependent tasks through Python microservices.
11. **Authentication Implementation**: Implemented NextAuth with Google provider for Gmail authentication, creating a client-side authentication flow that maintains sessions properly.
12. **Email Actions Architecture**: Designed a client-side component architecture for email actions (read, unread, trash, labels) with server-side API routes.
13. **Error Handling Strategy**: Implemented robust error handling in server actions and API calls to gracefully manage failures during email operations.
14. **Client Component Structure**: Updated client components to use the latest Next.js patterns for handling route parameters with React.use().
15. **Email Reply Implementation**: Enhanced reply functionality to properly include the original email text in quoted format, maintaining the standard email client experience.
16. **Route Organization**: Created dedicated routes for key email categories (inbox, sent) with consistent patterns for both listing and detail views.
17. **UI Layout Update**: Converted from a single-page email view to a modern two-pane layout with resizable panels.
18. **Date Formatting**: Implemented intelligent date formatting that shows time for today's emails and date for older emails.
19. **Email Branding**: Added automatic "Sent with DYZBOX" signature to all outgoing emails.
20. **Space Optimization**: Reduced sidebar font sizes for a more compact view and better space utilization.
21. **UI Consistency**: Created consistent email viewing experience across inbox and label pages.

## Current Challenges

1. **Gmail API Limitations**: Understanding Gmail API quotas and limitations for email operations.
2. **UI Component Design**: Balancing aesthetics with performance for a fast, responsive interface.
3. **Authentication Flow**: Creating a seamless authentication experience for Gmail users.
4. **Email Data Management**: Efficiently handling email data and synchronization with providers.
5. **Environment Configuration**: Managing dependencies and configuration for modern Next.js applications.
6. **AI Processing Optimization**: Determining the optimal approach for generating summaries without compromising performance or privacy.
7. **Service Communication**: Implementing efficient communication between Next.js server components and Python microservices.
8. **NextAuth Type Definitions**: Resolving TypeScript issues with NextAuth type definitions, particularly around session types and JWT handling.
9. **Next.js Client Component Patterns**: Adapting to the latest patterns for handling async data in client components.
10. **Error Resilience**: Making the application robust against API failures and network issues.
11. **Email Content Formatting**: Ensuring proper handling of both HTML and plain text email content across various email operations.
12. **Navigation Flow**: Creating intuitive navigation patterns between email views and maintaining context during transitions.
13. **Consistent UI**: Ensuring consistent behavior of resizable panels and email views across different parts of the application.
14. **Mobile Responsiveness**: Adapting the resizable two-pane layout for mobile devices.

## Implementation Strategy

The development approach follows a phased implementation plan:

### Current Phase: Core UI & Gmail Integration (Q1 2025)
- Building clean, modern UI components for email management with resizable two-pane view
- Implementing Gmail authentication and basic email operations
- Creating the foundation for the email client experience
- Setting up the data models and state management for emails
- Designing the database schema for emails and AI summaries
- Implementing the hybrid communication architecture between services
- Adding robust error handling to provide a better user experience
- Building complete email workflow with inbox, sent mail, compose, and reply functionality
- Ensuring consistent UI behavior across different views

### Next Phase: Enhanced AI Features (Q2 2025)
- Adding AI-powered email categorization and summary capabilities
- Implementing smart reply suggestions
- Enhancing the email organization capabilities
- Developing speed-optimized keyboard navigation

## Next Steps

1. **Database Setup**: Create Supabase tables for emails, contents, and summaries
2. **Email Identification**: Implement the email identification and referencing system
3. **Python Microservice Setup**: Create initial Python service for AI processing
4. **Service Communication**: Implement API endpoints for Next.js to Python communication
5. **Thread View**: Implement email thread/conversation view
6. **Mobile Responsiveness**: Ensure the UI works well on mobile devices
7. **Error Handling**: Continue improving error handling across all components
8. **UI Refinement**: Further refine the resizable panel experience and interactions

## Technical Insights

1. **Tailwind CSS Configuration**: We encountered and resolved compatibility issues between Next.js 15 and Tailwind CSS. The solution was to:
   - Use Tailwind CSS v3.4.1 instead of v4 alpha
   - Configure PostCSS correctly with the CommonJS module format
   - Explicitly define color scales in the Tailwind configuration
   - Apply proper global styles in globals.css

2. **Next.js Setup**: Next.js 15 with the App Router provides a solid foundation for our application, but requires careful configuration, especially for CSS processing.

3. **Email Identification**: Our approach will use Gmail's Message ID and Thread ID as primary identifiers, with our own internal IDs for stable referencing:
   - Gmail Message IDs are unique and persistent
   - Thread IDs allow grouping related messages
   - Our internal IDs provide consistency across providers
   - Supabase will store the relationship between these identifiers

4. **AI Summary Processing**: We've designed a strategy for generating and storing email summaries:
   - Selective processing prioritizes important emails
   - Summaries stored separately from email content
   - Processing pipeline extracts entities and intent
   - Privacy controls allow users to manage which emails get processed

5. **Service Communication Architecture**: Our hybrid approach optimizes for both performance and specialized processing:
   - Direct communication from Next.js to email providers for core operations
   - AI-dependent tasks routed through Python microservices
   - Common adapter interface regardless of email provider
   - Clear separation between email operations and AI processing

6. **Authentication Implementation**: We've implemented NextAuth.js with the following insights:
   - Using Google OAuth provider with Gmail-specific scopes
   - Storing access tokens securely in the session
   - Creating client-side components for session management
   - Implementing server-side API routes for authenticated actions
   - Building dedicated sign-in and error pages for better UX

7. **Error Handling Approach**: We've implemented robust error handling with these principles:
   - Try-catch blocks in all server actions and API calls
   - Structured response objects with success/error information
   - Graceful degradation when operations fail
   - Clear error messages for debugging and user feedback
   - Preventing critical operations from breaking the entire flow

8. **Next.js Client Components**: We've addressed the latest Next.js patterns:
   - Updated components to use React.use() for handling async route parameters
   - Properly structured client-side components with state management
   - Implemented error boundaries for resilient UI components
   - Created appropriate loading states for async operations

9. **Email Flow Implementation**: We've established patterns for email operations with these insights:
   - Consistent route structure for different email categories (inbox, sent)
   - Parallel UI patterns for list and detail views
   - Reusable server actions for common email operations
   - Rich text handling with both HTML and plain text support
   - Quoted text handling for email replies following standard email client conventions
   - Automatic signature added to all outgoing emails

10. **UI Enhancement Implementation**: We've improved the email viewing experience with these patterns:
    - Converted to a two-pane layout with resizable panels using React state
    - Implemented a draggable splitter with visual feedback during resizing
    - Designed a consistent width allocation system between email list and detail panes
    - Created intelligent date formatting that adapts based on email age 
    - Made UI components reusable across different parts of the application
    - Optimized space usage with compact sidebar and appropriate font sizes

## Open Questions

1. How can we optimize the Gmail API usage to handle large email volumes efficiently?
2. What's the best approach for implementing real-time updates when new emails arrive?
3. How should we structure the data models to support both Gmail and future email providers?
4. What's the optimal caching strategy for email data to ensure speed and offline access?
5. How should we implement the AI processing pipeline for email summarization?
6. What's the right balance between processing emails on-device versus in the cloud?
7. What API design will provide the most efficient communication between Next.js and Python microservices?
8. How should error handling work across the distributed architecture?
9. What's the best approach for handling network failures during critical operations?
10. How can we optimize performance while maintaining a robust error handling approach?
11. How can we make the resizable two-pane layout work effectively on mobile devices?
12. What's the best approach for maintaining UI state during navigation between different views?

## Current Team Focus

- **Frontend Team**: Refining UI components and implementing resizable two-pane layout
- **API Integration**: Connecting to Gmail API and handling authentication
- **UX Team**: Improving the user interface with better spacing and responsive design
- **Backend Planning**: Preparing for server-side components and data storage
- **AI Team**: Designing the AI processing pipeline for email summarization
- **DevOps**: Setting up the infrastructure for Next.js and Python microservices
- **QA**: Developing testing strategies for error handling and resilience

## Reference Materials

- Project Brief: Complete project overview and requirements
- Competitive Analysis: Detailed comparison with existing email clients
- Gmail API Documentation: https://developers.google.com/gmail/api
- NextAuth Documentation: https://next-auth.js.org/
- Design Inspiration: Clean, modern email UI examples
- System Patterns: Detailed architecture and data model designs
- Gemini API Documentation: https://ai.google.dev/gemini-api
- Next.js App Router Documentation: https://nextjs.org/docs/app

## Active Assumptions

1. Gmail API will provide sufficient access for our required email operations
2. Next.js and Tailwind will provide the performance needed for a responsive UI
3. Users will be willing to grant the necessary permissions for email access
4. The two-pane resizable layout will provide an optimal user experience across devices
5. Gemini 2.0 Flash will be capable of generating useful email summaries
6. Supabase will efficiently handle our database needs for email storage
7. Direct communication with email providers will deliver sub-100ms response times for core operations
8. Python microservices will provide the flexibility needed for complex AI processing 
9. NextAuth OAuth flow with Google will provide a smooth authentication experience for users 
10. Our error handling approach will be robust enough to handle most API and network failures
11. The automatic signature approach will enhance brand recognition without impacting user experience
12. The intelligent date formatting will provide context-relevant information to users