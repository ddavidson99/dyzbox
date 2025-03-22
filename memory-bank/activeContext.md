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
10. **Notification Features**: Implementing visual indicators for unread messages and attention-grabbing animations.
11. **Multi-Provider Strategy**: Designing the foundation for supporting both Gmail and Outlook while maintaining a unified user identity.

## Recent Decisions

1. **Tech Stack Selection**: Next.js frontend with Tailwind CSS v3.4.1, Supabase (PostgreSQL) backend, Python microservices for AI integration.
2. **AI Provider**: Gemini 2.0 Flash selected as the primary LLM for AI capabilities.
3. **Email Provider Support**: Initial focus on Gmail integration with Outlook and IMAP/POP3 support planned for later phases.
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
22. **Visual Notification System**: Implemented subtle animation for categories with unread messages, making only the category icons "jiggle" to draw user attention while maintaining text readability.
23. **Authentication Strategy**: Decided on provider-based authentication (OAuth) with account linking for multiple email providers, using a single user identity in our system.

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
14. **Animation Performance**: Balancing visual attention-grabbing features with performance considerations.
15. **Mobile Responsiveness**: Adapting the resizable two-pane layout for mobile devices.
16. **Multi-Provider Authentication**: Designing a system that supports both Gmail and Outlook authentication while maintaining a unified user experience.
17. **User Identity Management**: Implementing a system that links multiple provider accounts to a single DyzBox user identity.

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
- Implementing notification features to draw attention to unread messages
- Creating the database schema for user identity and provider linking

### Next Phase: Enhanced AI Features & Multi-Provider Support (Q2 2025)
- Adding AI-powered email categorization and summary capabilities
- Implementing smart reply suggestions
- Enhancing the email organization capabilities
- Developing speed-optimized keyboard navigation
- Adding support for Microsoft Outlook integration
- Implementing account linking for users with multiple providers
- Creating provider-switching capabilities for users

## Next Steps

1. **Database Setup**: Create Supabase tables for emails, contents, and summaries
2. **Email Identification**: Implement the email identification and referencing system
3. **Python Microservice Setup**: Create initial Python service for AI processing
4. **Service Communication**: Implement API endpoints for Next.js to Python communication
5. **Thread View**: Implement email thread/conversation view
6. **Mobile Responsiveness**: Ensure the UI works well on mobile devices
7. **Error Handling**: Continue improving error handling across all components
8. **UI Refinement**: Further refine the resizable panel experience and interactions
9. **Notification Features**: Expand the animation system to other notifications beyond unread count
10. **User Identity Schema**: Implement the database schema for user identity and provider linking
11. **Account Linking UI**: Design the interface for users to link multiple email accounts

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

11. **Animation System Implementation**: We've created a notification system for unread messages:
    - CSS keyframe animations for performance-optimized jiggle effect
    - React context provider for centralized animation timing
    - Component wrappers that apply animations only to non-text elements
    - Staggered animation start times to prevent all elements animating simultaneously
    - Scheduled animations that run at regular intervals but only for short durations
    - Visual unread count badges complementing the animation system

12. **Multi-Provider Authentication Strategy**: We've designed a provider-based authentication approach:
    - Users authenticate with either Google or Microsoft through OAuth
    - Primary provider identity stored in our database as the user identifier
    - Ability to link additional email providers to the same user identity
    - Support for changing primary provider while maintaining single user account
    - Clear separation between authentication identity and email provider access

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
13. How can we expand the animation system to include other types of notifications?
14. What's the most secure way to store and refresh OAuth tokens for multiple providers?
15. How should we handle the situation where a user's provider OAuth access is revoked?

## Current Team Focus

- **Frontend Team**: Refining UI components and implementing resizable two-pane layout
- **API Integration**: Connecting to Gmail API and handling authentication
- **UX Team**: Improving the user interface with better spacing and responsive design
- **Animation Team**: Implementing subtle visual notifications for unread messages
- **Backend Planning**: Preparing for server-side components and data storage
- **AI Team**: Designing the AI processing pipeline for email summarization
- **DevOps**: Setting up the infrastructure for Next.js and Python microservices
- **QA**: Developing testing strategies for error handling and resilience
- **Architecture Team**: Designing the multi-provider authentication and user identity system

## Reference Materials

- Project Brief: Complete project overview and requirements
- Competitive Analysis: Detailed comparison with existing email clients
- Gmail API Documentation: https://developers.google.com/gmail/api
- Microsoft Graph API Documentation: https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview
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
13. The subtle animation for unread messages will draw attention without being distracting
14. Users will prefer OAuth-based authentication over creating separate DyzBox credentials
15. Provider-based authentication with account linking will provide the optimal balance of security and user experience

## Recent Changes

Recent development has focused on:

1. Design and implementation of the animation system architecture using React Context and custom components
2. Development of the `JiggleWrapper` component for periodic animation of icon elements
3. Integration of animation system with email categories in the sidebar
4. Performance optimization for animations using CSS keyframes and GPU acceleration
5. Staggered animation timing to create visual interest without overwhelming the UI

## Technical Considerations

The animation implementation is guided by several key technical considerations:

1. **Performance**: Animations must be smooth and not cause UI jank
   - Using CSS keyframes for GPU-accelerated performance
   - Limiting animations to non-text elements
   - Using will-change property judiciously
   - Keeping animations under 1 second duration

2. **User Experience**: Animations should enhance rather than distract
   - Subtle movements that draw attention without annoyance
   - Periodic reminders timed with minute changes
   - Only animating when unread messages exist
   - Limiting animation to icons and badges, not text content
   - Staggered timing to prevent overwhelming visual effects

3. **Accessibility**: Animations must respect user preferences
   - Respecting prefers-reduced-motion media query
   - No critical information conveyed solely through animation
   - Static visual indicators (badges) accompanying animations
   - Ensuring keyboard focus remains clear during animations

4. **Code Architecture**: Clean implementation for maintainability
   - Centralized animation control through Context API
   - Reusable component for consistent animation behavior
   - Clear separation of animation logic from component rendering
   - Type-safe interfaces for animation components

## Implementation Approach

The animation system implementation follows this approach:

1. **Animation Context Provider**
   - Centralized timing system for coordinated animations
   - Minute-based timer for periodic animation triggers
   - Shared state for animation coordination across components
   - Simple API for components to tap into animation timing

2. **Animation Component Wrapper**
   - Reusable JiggleWrapper component
   - Handles animation timing and state
   - Applies animations based on unread state
   - Implements staggered timing based on element index

3. **CSS Animation Definitions**
   - Define keyframe animations in global CSS
   - Subtle jiggle effect for unread indicators
   - Hardware-accelerated properties for performance
   - Consistent animation styling across the application

4. **Integration with Email Categories**
   - Apply animations to category icons in sidebar
   - Link animation state to unread message counts
   - Ensure animations only apply when unread messages exist
   - Maintain clear visual hierarchy during animations

## Next Steps

The following steps are planned for the animation system:

1. **Testing and Refinement**
   - Performance testing across different devices
   - User testing for animation subtlety and effectiveness
   - Accessibility testing with screen readers and motion preferences
   - Browser compatibility testing

2. **Extended Implementation**
   - Apply animation system to other UI elements (inbox tabs, etc.)
   - Add animation for newly arrived messages
   - Implement different animation types for different notifications
   - Create animation feedback for user actions

3. **Documentation**
   - Document animation components and patterns
   - Create animation guidelines for developers
   - Update storybook with animation examples
   - Add animation testing utilities

## Implementation Timeline

| Task | Timeframe | Status |
|------|-----------|--------|
| Animation system architecture design | Week 1 | Completed |
| Core animation components implementation | Week 1-2 | In Progress |
| Integration with sidebar categories | Week 2 | In Progress |
| Performance testing and optimization | Week 2-3 | Not Started |
| Extended implementation to other UI elements | Week 3 | Not Started |
| Documentation | Week 3 | Not Started |

## Related Components

The animation system interacts with these key components:

1. **Sidebar Navigation**
   - Category list items with unread counts
   - Icon elements that receive animation
   - Badge components showing unread counts

2. **Email List Components**
   - Unread email indicators
   - Category badges within email list
   - New message notifications

3. **Layout Components**
   - Animation provider wrapping application layout
   - Coordinated timing across different parts of the UI
   - Context-aware animation behavior

## Design Goals

The animation system is designed to achieve these goals:

1. Draw user attention to areas with unread messages
2. Provide subtle reminder of pending items
3. Enhance the perception of application responsiveness
4. Create a polished, modern feel to the interface
5. Maintain high performance and accessibility standards

## Key Decisions

Several important decisions have shaped the animation implementation:

1. **React Context for Timing**: Using React Context API for timing coordination rather than individual component timers to ensure synchronization and reduce resource usage

2. **CSS Keyframes over JS Animations**: Selecting CSS keyframes for performance advantages over JavaScript-based animations, leveraging GPU acceleration

3. **Staggered Animation Pattern**: Implementing staggered timing for visual interest rather than simultaneous animations

4. **Icon-Only Animation**: Limiting animation to non-text elements to maintain readability and reduce distraction

5. **Periodic Reminder Approach**: Using minute-based periodic animations rather than continuous animation to balance attention-drawing with user focus

## Questions and Concerns

Open questions about the animation implementation include:

1. Should animations be user-configurable (on/off, frequency)?
2. Is the current animation timing (every minute) appropriate for user experience?
3. Are there performance concerns for devices with limited resources?
4. Should we implement different animation types for different notification severities?

## Resources

Key resources for the animation implementation:

1. [CSS Animation Performance](https://web.dev/animations-guide/)
2. [React useEffect Timing](https://reactjs.org/docs/hooks-effect.html)
3. [Accessibility Guidelines for Motion](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
4. [GPU Acceleration in CSS](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)
