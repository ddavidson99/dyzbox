# System Patterns: DyzBox

## System Architecture

### Overview

DyzBox follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                User Interface Layer                  │
│   (Next.js, Tailwind, Speed-Optimized Components)   │
├─────────────────────────────────────────────────────┤
│                Business Logic Layer                  │
│     (Email Processing, Categorization, Workflow)     │
├─────────────────────────────────────────────────────┤
│                  AI Service Layer                    │
│ (Gemini Integration, On-device/Cloud AI Processing)  │
├─────────────────────────────────────────────────────┤
│              Email Provider Integration              │
│   (Gmail, Outlook, IMAP/POP3 Provider Adapters)     │
├─────────────────────────────────────────────────────┤
│                   Data Storage                       │
│    (Supabase PostgreSQL, Local Cache, Sync Engine)   │
└─────────────────────────────────────────────────────┘
```

### Service Communication Architecture

DyzBox implements a hybrid communication architecture:

```
┌─────────────────────┐
│  Next.js Frontend   │
│  & Server Components│
└────────┬─────┬──────┘
         │     │
         │     ▼
         │  ┌─────────────────┐
         │  │ Python AI       │
         │  │ Microservices   │
         │  └─────────────────┘
         │
         ▼
┌─────────────────────┐
│ Email Provider      │
│ Adapter Layer       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Email Providers     │
│ (Gmail, Outlook)    │
└─────────────────────┘
```

**Direct vs. AI-Mediated Communication:**
- Core email operations (fetch, send, read, write) flow directly from Next.js to email providers
- AI-dependent operations (summarization, categorization, intent recognition) route through Python microservices
- This hybrid approach optimizes for both performance and specialized AI processing

### Key Architectural Patterns

1. **Microservices for AI Processing**
   - Isolated Python services for AI operations
   - Communicates via API with main application
   - Enables independent scaling of compute-intensive operations

2. **Adapter Pattern for Email Providers**
   - Common interface for all email provider interactions
   - Provider-specific implementations behind consistent API
   - Direct communication from Next.js for core operations
   - Facilitates adding new provider support without changing business logic

3. **Event-Driven Architecture**
   - Publish-subscribe model for email and state changes
   - Enables real-time updates and offline synchronization
   - Supports extensibility for integrations

4. **Command Query Responsibility Segregation (CQRS)**
   - Separate models for reading and writing data
   - Optimizes for performance in email operations
   - Supports complex querying for email organization

5. **Animation System Architecture**
   - Context provider pattern for centralized animation timing
   - Component wrapper pattern for isolated animation behavior
   - Staggered execution pattern for visual interest and performance
   - CSS keyframe animation for GPU-accelerated performance
   - Adaptive rendering based on unread state

## Authentication & User Identity Strategy

DyzBox uses a provider-based authentication strategy with a unified user identity system:

### Authentication Flow

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  User initiates     │     │  OAuth with         │     │  DyzBox creates     │
│  sign-in with       │ ──► │  Google or          │ ──► │  user record with   │
│  Google/Microsoft   │     │  Microsoft          │     │  provider info      │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                                                │
┌─────────────────────┐     ┌─────────────────────┐            │
│  User accesses      │     │  Email provider     │            │
│  email client       │ ◄── │  adapter uses       │ ◄──────────┘
│  features           │     │  stored tokens      │
└─────────────────────┘     └─────────────────────┘
```

### Key Authentication Patterns

1. **Provider-Based Authentication**
   - Users authenticate with Google or Microsoft OAuth
   - No separate DyzBox password required
   - OAuth tokens securely stored for provider access
   - Primary email address serves as unique identifier

2. **Account Linking System**
   - Support for multiple email providers per user
   - Primary provider designation for billing and notifications
   - "Add Account" flow via additional OAuth authentication
   - All accounts linked to a single user identity

3. **Provider Switching Mechanism**
   - User can change primary provider while maintaining single identity
   - Database records updated to reflect new primary provider
   - All user data, preferences, and payment information preserved
   - Notifications and billing references automatically updated

4. **User Identity Management**
   - User record created on first authentication
   - Email address serves as primary identifier
   - Provider type and provider-specific ID stored
   - Profile data may be synced from provider

### Database Model

```
Table: users
  - id (primary key, uuid)
  - primary_email (unique)
  - primary_provider (enum: google, microsoft, etc.)
  - primary_provider_id (string)
  - created_at (timestamp)
  - last_active (timestamp)
  - payment_info (jsonb)
  - preferences (jsonb)

Table: linked_accounts
  - id (primary key, uuid)
  - user_id (foreign key → users.id)
  - provider (enum: google, microsoft, etc.)
  - provider_id (string)
  - email (string)
  - access_token (encrypted)
  - refresh_token (encrypted)
  - scopes (array)
  - added_at (timestamp)
  - last_used (timestamp)
```

### Implementation Considerations

1. **Token Refresh Handling**:
   - Implement proper refresh token flow for each provider
   - Schedule token refresh before expiration
   - Handle failed refresh with re-authentication prompt

2. **Security Measures**:
   - Encrypt all stored access and refresh tokens
   - Implement principle of least privilege for OAuth scopes
   - Session management with appropriate timeouts
   - Clear audit trail for authentication events

3. **Provider Switching Process**:
   - User initiates "Change Primary Account" from settings
   - Verification of access to both accounts
   - Update primary_provider, primary_provider_id, and primary_email fields
   - Update billing references and notification preferences
   - Maintain old provider as linked account unless explicitly removed

4. **Error Handling**:
   - Graceful handling of revoked OAuth permissions
   - Account recovery process for lost provider access
   - Clear user guidance for authentication issues

5. **Privacy Considerations**:
   - Transparent explanation of data usage
   - Minimal collection of provider account data
   - Clear user controls for account linking/unlinking

This authentication strategy provides a streamlined user experience with a single sign-in while supporting the multi-provider nature of DyzBox, and ensures continuity of user data even when the primary email provider changes.

## Core System Components

### 1. Email Processing Engine

**Purpose**: Handles retrieval, processing, and synchronization of emails

**Key Patterns**:
- Observer pattern for monitoring email changes
- Strategy pattern for different processing approaches
- Command pattern for email operations

**Interfaces**:
- `EmailProvider` - Abstraction for email service connections
- `EmailProcessor` - Processes raw emails into application model
- `SynchronizationService` - Manages bidirectional sync with providers

**Email Routes Pattern**:
- Consistent route structure for email categories (inbox, sent, archive, etc.)
- Parallel components for list and detail views 
- Route-specific functionality with shared underlying services
- URL parameter-based navigation between related views

**Email Operations Pattern**:
- Standardized server actions for common operations
- Stateful client components with operation feedback
- Error-resilient transaction approach for critical operations
- Optimistic UI updates with fallback for failed operations

### 2. AI Analysis Pipeline

**Purpose**: Processes emails for categorization, summarization, and response generation

**Key Patterns**:
- Pipeline pattern for sequential processing stages
- Factory pattern for creating appropriate analyzers
- Decorator pattern for enhancing base analysis with additional features

**Components**:
- `IntentRecognizer` - Identifies email purpose and requested actions
- `ContentSummarizer` - Generates concise email summaries
- `ReplyGenerator` - Creates context-aware reply suggestions
- `CategoryClassifier` - Assigns emails to appropriate categories

### 3. User Interface Framework

**Purpose**: Provides high-performance, consistent UI across platforms

**Key Patterns**:
- Component-based architecture
- Virtual DOM for performance
- Observer pattern for real-time updates

**Design Principles**:
- Sub-100ms response time for all interactions
- Keyboard-first interaction model
- Progressive enhancement for accessibility

**Email Interaction Patterns**:
- Consistent navigation between list and detail views
- Common actions available across different email contexts
- Context-preserving transitions between related views
- Stateful components that maintain user selections

### 4. Notification System

**Purpose**: Provides visual cues to draw user attention to important email events

**Key Patterns**:
- Context Provider pattern for centralized animation state
- Component Wrapper pattern for isolated animation effects
- Staggered Execution pattern for distributed notifications
- Throttled Animation pattern for performance optimization

**Components**:
- `AnimationContext` - Shared timing and coordination service
- `JiggleWrapper` - Component wrapper for animated UI elements
- `UnreadCountBadge` - Visual indicator for message counts
- `NotificationScheduler` - Manages timing of periodic animations

**Animation Architecture**:
```
┌───────────────────────────┐
│     AnimationProvider     │
│  (Minute-based Scheduler) │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Animation Context     │
│  (Shared Animation State) │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│     Component Wrappers    │
│  (JiggleWrapper, etc.)    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│      Target Elements      │
│  (Icons, Badges, etc.)    │
└───────────────────────────┘
```

**Design Principles**:
- Subtle animations that draw attention without distraction
- Performance-optimized with CSS keyframes and GPU acceleration
- Clear visual indicators that complement animations
- Staggered timing to create visual interest
- Animation limited to non-text elements for readability

**Implementation Approach**:
- CSS keyframes for performance-optimized animations
- React.useEffect for timing and animation triggers
- Component-based architecture for reusable animation patterns
- Context API for coordination across components
- Conditionally applied animations based on unread state

### 4. Rich Text Editor Implementation

**Purpose**: Provides powerful email composition capabilities with a minimal UI

**Key Patterns**:
- Strategy pattern for different formatting operations
- Command pattern for undo/redo operations
- Decorator pattern for text formatting
- Observer pattern for change tracking

**Quill.js Integration**:
- Custom theme matching DyzBox design system
- Limited toolbar with icon-only actions
- HTML output with inline CSS for email clients
- Module-based customization for our specific needs

**UI Components**:
- Icon-based action bar for core operations (send, attach, etc.)
- Formatting toolbar with essential text operations
- Recipient field with chip-based interaction
- Drag-and-drop attachment zone
- Status bar with auto-save indicators

**Implementation Phases**:
1. Core editor integration with basic formatting
2. Enhanced features (templates, scheduling)
3. AI integration for smart compose and suggestions
4. Keyboard shortcuts after core functionality is stable

**Accessibility Considerations**:
- ARIA attributes for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

**Mobile Adaptations**:
- Responsive design adjustments
- Touch-friendly controls
- Simplified toolbar for small screens
- Bottom sheet for additional options

## User Interface Patterns

### Email Organization Pattern

DyzBox organizes emails using a consistent pattern across views:

1. **Two-Pane Layout**
   - Email list on left (resizable width)
   - Email detail on right
   - Draggable splitter for width adjustment
   - Responsive design for different screen sizes

2. **List and Detail Views**
   - Common pattern across inbox, sent, archive, etc.
   - List shows summary information
   - Detail shows complete email content
   - State preserved during navigation

3. **Category-Based Navigation**
   - Primary categories in main navigation
   - User-defined labels/tags for organization
   - Visual cues for unread/important emails
   - Smart categorization using AI

### Attention Management Patterns

DyzBox uses specific patterns to help users focus on important emails:

1. **Unread Item Highlighting**
   - Distinct visual treatment for unread emails
   - Clear indication of unread state in lists
   - Count indicators in navigation elements
   - Animated icons for categories with unread messages

2. **Animation Usage Guidelines**
   - Subtle animations limited to 1 second duration
   - Only applied to icons and non-text elements
   - Staggered timing to prevent distraction
   - Triggered on specific events (new emails) and periodic intervals
   - GPU-accelerated animations for performance

3. **Visual Priority System**
   - Important emails receive stronger visual emphasis
   - AI-determined priority reflected in UI
   - User-defined importance honored
   - Consistent visual language across app

4. **Focus Assistance**
   - Smart inbox shows human-to-human messages first
   - Promotional and system emails categorized separately
   - Keyboard shortcuts for rapid triage
   - Contextual commands based on email type

### Component Architecture

DyzBox uses atomic design methodology for UI components:

1. **Atoms**
   - Buttons, inputs, icons
   - Typography elements
   - Form controls
   - Animation wrappers

2. **Molecules**
   - Email list items
   - Form groups
   - Search components
   - Navigation items with notification badges

3. **Organisms**
   - Email lists with headers and actions
   - Navigation sidebar with categories
   - Email detail view with actions
   - Compose form with attachments

4. **Templates**
   - Two-pane email layout
   - Settings layouts
   - Authentication screens
   - Onboarding flows

5. **Pages**
   - Inbox view
   - Category/label views
   - Settings pages
   - Account management

### Responsive Design Pattern

DyzBox adapts its UI for different screen sizes:

1. **Desktop Focus**
   - Two-pane layout with resizable panels
   - Keyboard shortcuts for power users
   - Information density optimized for productivity
   - Full feature access

2. **Tablet Adaptation**
   - Collapsible panels for space efficiency
   - Touch-friendly targets
   - Simplified layouts
   - Context-aware features

3. **Mobile Approach**
   - Single-pane views with navigation between list and detail
   - Bottom navigation for key actions
   - Limited feature set focused on reading and triage
   - Touch-optimized UI

### Error Handling Pattern

DyzBox implements consistent error handling across the UI:

1. **Operation Feedback**
   - Clear success/failure indicators
   - Non-blocking notifications
   - Context-specific error messages
   - Retry options for failed operations

2. **Graceful Degradation**
   - Fallback UI for unavailable features
   - Offline capability where possible
   - Progressive enhancement approach
   - Helpful guidance when operations fail

3. **Recovery Patterns**
   - Automatic retry for transient failures
   - Clear user guidance for persistent issues
   - Data preservation during errors
   - Session recovery mechanisms

## Cross-Cutting Concerns

### Privacy & Security

**Patterns**:
- Privacy by Design principles throughout
- Defense in Depth for security controls
- Principle of Least Privilege for data access

**Implementation**:
- End-to-end encryption for email content
- On-device processing where possible
- Data minimization and retention controls

### Performance Optimization

**Patterns**:
- Lazy loading for non-critical data
- Virtual scrolling for large datasets
- Progressive rendering for responsive UI

**Implementation**:
- Background synchronization of email data
- Prefetching based on user behavior patterns
- Optimistic UI updates for improved perceived performance

### Error Handling & Resilience

**Patterns**:
- Circuit Breaker for external service failures
- Retry with exponential backoff
- Graceful degradation of features

**Implementation**:
- Offline-first approach with local data availability
- Conflict resolution for synchronization issues
- Fallback mechanisms for AI features when service unavailable

## Email Handling Patterns

### Email Content Handling

**Content Types**:
- Plain text email handling with proper formatting
- HTML email rendering with security considerations
- Mixed content handling with fallback mechanisms

**Reply Formatting**:
- Original message quotation with proper attribution
- Date and sender information in quoted content
- Different quotation styles for HTML vs plain text
- Cursor positioning at logical reply location

### Email Actions Framework

**Server Action Pattern**:
- Consistent structure for all email operations
- Authentication validation as first step
- Provider-specific operations through adapter interface
- Structured response objects with success/error information
- Comprehensive error handling with graceful degradation

**Client Action Pattern**:
- Loading state indication during operations
- Optimistic UI updates with rollback capabilities
- Toast notifications for operation feedback
- Error display with contextual recovery options

### Email Routing and Navigation

**Route Structure**:
- Consistent patterns across email categories
- `/[category]` for list views (inbox, sent, archive)
- `/[category]/[id]` for detail views
- Query parameters for additional context (reply, forward)

**Navigation Patterns**:
- Preserving context during navigation
- Back navigation with return to correct list view
- Compose with context from originating view
- Reply with appropriate relationship to original

## Data Models

### Email Model

```
Email {
  id: string
  provider: EmailProviderType
  subject: string
  sender: EmailAddress
  recipients: EmailAddress[]
  content: EmailContent
  attachments: Attachment[]
  metadata: {
    receivedAt: DateTime
    readStatus: ReadStatus
    importance: ImportanceLevel
    category: Category
    summary: string
    intentType: IntentType
    aiProcessingStatus: ProcessingStatus
  }
  threadId: string
  references: string[]
}
```

### Category Model

```
Category {
  id: string
  name: string
  type: CategoryType (System | Custom)
  rules: CategoryRule[]
  userCreated: boolean
  displayOrder: number
  icon: string
  color: string
}
```

### User Preferences Model

```
UserPreferences {
  id: string
  emailAccounts: ConnectedAccount[]
  categories: UserCategoryPreference[]
  aiSettings: {
    processingLocation: ProcessingLocationType
    summaryEnabled: boolean
    replyGenerationEnabled: boolean
    learningEnabled: boolean
  }
  uiSettings: {
    theme: ThemeType
    layout: LayoutType
    keyboardShortcuts: KeyboardShortcutMap
    density: DensityType
  }
  notificationSettings: NotificationPreference[]
}
```

## Integration Patterns

### External System Integration

**Pattern**: API Gateway + Adapter

**Implementation**:
- Unified API Gateway for external service communication
- Service-specific adapters for integration implementation
- OAuth-based authentication for third-party services

**Key Integrations**:
- Calendar systems for scheduling
- CRM systems for contact enrichment
- Project management tools for task creation
- Document management for attachment handling

### Extension Framework

**Pattern**: Plugin Architecture

**Implementation**:
- Defined extension points throughout application
- Sandboxed execution environment
- Capability-based permission model

**Extension Types**:
- Custom email processors
- UI extensions
- Integration adapters
- Custom AI models

## Email Identification and AI Summary Processing

### Email Identification Strategy

Each email is uniquely identified using a combination of provider-specific IDs and internal tracking:

```
EmailIdentifier
├── provider_id      # Original ID from email provider (e.g., Gmail Message ID)
├── thread_id        # Conversation thread identifier
├── user_id          # User account identifier
└── internal_id      # DyzBox-generated unique identifier
```

This approach ensures:
- Emails can be uniquely identified across different providers
- Threads/conversations can be properly grouped
- All operations are scoped to the correct user account
- We maintain our own stable identifiers independent of provider changes

Gmail-specific considerations:
- Gmail Message IDs are globally unique and never change
- Gmail Thread IDs allow proper conversation grouping
- Labels provide additional organization context

### AI Summary Processing Flow

The system follows a defined workflow for generating and managing AI summaries:

1. **Email Selection**
   - New emails are automatically queued for AI processing
   - Priority is given to important senders and time-sensitive content
   - User-flagged emails receive immediate processing
   - Emails from certain senders or matching privacy rules can be excluded

2. **Processing Pipeline**
   ```
   EmailProcessor
   ├── ContentExtractor   # Extracts relevant content from email
   ├── SummaryGenerator   # Creates concise summary using Gemini 2.0
   ├── EntityDetector     # Identifies people, dates, action items
   ├── IntentClassifier   # Determines email purpose/category
   └── InsightEngine      # Generates contextual insights
   ```

3. **Storage Strategy**
   - Summaries are stored separately from email content
   - Processing status is tracked to handle retries and updates
   - Version tracking for AI model improvements
   ```
   SummaryRecord
   ├── email_reference    # Link to original email
   ├── summary_text       # Generated summary (1-2 sentences)
   ├── entities           # Extracted entities
   ├── intent             # Classified purpose
   ├── confidence_score   # AI confidence metric
   ├── model_version      # AI model identifier
   └── generated_at       # Timestamp
   ```

4. **Refresh Strategy**
   - Summaries for ongoing threads are updated when new replies arrive
   - Periodic reprocessing for improved AI models
   - User feedback incorporated to improve summary quality
   - Thread-level summaries created by combining message summaries

### Privacy & Performance Considerations

The system implements several patterns to balance AI capabilities with privacy and performance:

1. **Processing Location Pattern**
   ```
   ProcessingLocationSelector
   ├── DeviceProcessor      # On-device processing for sensitive content
   ├── EdgeProcessor        # Edge computing for faster processing
   └── CloudProcessor       # Cloud processing for complex operations
   ```

2. **Consent Management Pattern**
   ```
   AIConsentManager
   ├── GlobalSettings       # User's default AI processing preferences
   ├── SenderExceptions     # Specific rules for certain senders
   ├── ContentRules         # Content-based processing decisions
   └── TemporaryOverrides   # Time-limited processing changes
   ```

3. **Batch Processing Pattern**
   ```
   BatchProcessor
   ├── PriorityQueue        # Orders emails by importance
   ├── ResourceMonitor      # Manages system load
   ├── RateLimiter          # Prevents API overuse
   └── BackgroundWorker     # Processes without blocking UI
   ```

### Optimization Strategies

1. **Selective Processing**
   - Process only human-to-human emails (skip newsletters, promotions)
   - Prioritize unread messages and new threads
   - Focus on emails requiring action or response

2. **Caching Strategy**
   - Cache summaries for offline access
   - Implement LRU (Least Recently Used) cache for frequently accessed emails
   - Use incremental summary updates for thread continuations

3. **Resource Management**
   - Throttle processing during high system load
   - Schedule bulk processing during idle periods
   - Implement rate limiting for API calls to Gemini

## Supabase Database Schema

The database schema is designed to efficiently store email data and AI-generated content:

```
Table: users
  - id (primary key, uuid)
  - email (unique)
  - provider_details (jsonb)
  - preferences (jsonb)
  - created_at (timestamp)
  - last_active (timestamp)

Table: emails
  - id (primary key, uuid)
  - user_id (foreign key → users.id)
  - provider_id (string, unique per user)
  - thread_id (string)
  - sender (string)
  - recipients (jsonb)
  - subject (string)
  - received_at (timestamp)
  - is_read (boolean)
  - is_starred (boolean)
  - category_id (foreign key → categories.id)
  - labels (array)
  - metadata (jsonb)

Table: email_contents
  - id (primary key, uuid)
  - email_id (foreign key → emails.id)
  - content_type (string)
  - content (text)
  - attachments (jsonb)

Table: email_summaries
  - id (primary key, uuid)
  - email_id (foreign key → emails.id)
  - summary_text (text)
  - entities (jsonb)
  - action_items (jsonb)
  - intent (string)
  - sentiment (string)
  - confidence_score (decimal)
  - model_version (string)
  - generated_at (timestamp)
  - user_feedback (jsonb)

Table: categories
  - id (primary key, uuid)
  - user_id (foreign key → users.id)
  - name (string)
  - color (string)
  - is_system (boolean)
  - rules (jsonb)

Table: threads
  - id (primary key, uuid)
  - user_id (foreign key → users.id)
  - provider_thread_id (string)
  - subject (string)
  - participants (jsonb)
  - last_activity (timestamp)
  - is_complete (boolean)
  - summary (text)
```

## Synchronization Patterns

The system implements robust synchronization to keep local data in sync with email providers:

### Delta Synchronization
Only fetches changes since last sync, reducing bandwidth and processing requirements.

### Conflict Resolution
Implements strategies for handling conflicts when changes are made both locally and on the provider side.

### Background Synchronization
Maintains up-to-date state without interrupting user experience.

## AI Component Design

The AI system is composed of several specialized components:

### EmailClassifier
Categorizes emails based on content and user behavior patterns.

### IntentRecognizer
Identifies the purpose of emails (request, information, introduction, etc.).

### EntityExtractor
Identifies important entities like people, dates, locations, and action items.

### SummaryGenerator
Creates concise, useful summaries of email content.

### ReplyGenerator
Creates context-aware reply suggestions that match user's tone and style.

## Component Architecture

### Email Compose and Management

The email compose functionality uses a modular architecture:

1. **ComposeEmail Component**: Manages the overall composition interface:
   - Handles recipient input/parsing
   - Manages subject and body state
   - Coordinates with the editor component
   - Handles draft saving and sending operations
   - Processes responses from server actions

2. **TipTap Editor Component**: Provides rich text editing capabilities:
   - Implements TipTap editor with necessary extensions
   - Offers formatting controls (bold, italic, underline, lists, etc.)
   - Exposes methods for getting/setting content
   - Maintains consistent styling with the application's design theme
   - Replaces React Quill for better React 19 compatibility

3. **RecipientInput Component**: Handles email recipient entry:
   - Validates email addresses
   - Manages recipient chips for To/Cc/Bcc fields
   - Provides type-ahead suggestions
   - Handles keyboard navigation

4. **Draft Management System**: Handles saving and managing drafts:
   - Automatically determines whether to save or discard based on content
   - Uses Gmail API for storing drafts in the user's Gmail account
   - Provides user feedback through toast notifications
   - Manages browser navigation behavior to prevent unwanted confirmation dialogs
   - Implements state management to prevent duplicate operations

## Data Flow Patterns

### Email Composition and Sending

The email composition and sending flow follows these steps:

1. User initiates email composition through Compose button or Reply action
2. ComposeEmail component renders with empty fields or prefilled data for replies
3. As user enters information, state is maintained in the ComposeEmail component
4. When ready to send:
   - Data is validated (recipients, subject)
   - Email content is retrieved from the TipTap editor
   - Server action is called to send the email through the Gmail API
   - User receives feedback via toast notifications
   - On success, user is redirected to the appropriate view
5. When closing without sending:
   - Component checks if the email has any content
   - If empty, it simply closes without saving
   - If there's content, it calls the saveDraft server action
   - Draft is saved to Gmail and user is notified
   - Component exits and returns to previous view

### Draft Saving Process

The draft saving process follows these steps:

1. User closes the compose view by clicking X
2. ComposeEmail checks for any content in recipients, subject, or body fields
3. If completely empty, it simply closes without saving
4. If any content exists:
   - Email data is prepared in correct format
   - saveDraft server action is called
   - Draft is created in Gmail through the Gmail API
   - User receives a "Draft saved" notification
   - Component redirects back to previous view

## Service Communication

### Gmail API Integration

The application communicates with Gmail API using these patterns:

1. **Authentication**: OAuth 2.0 authentication using NextAuth with proper scopes:
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.labels`

2. **Email Operations**:
   - Fetching emails: Uses Gmail API's `users.messages.list` and `users.messages.get`
   - Sending emails: Uses Gmail API's `users.messages.send`
   - Managing labels: Uses Gmail API's `users.labels` endpoints
   - Getting counts: Uses Gmail API's `users.labels.get`
   - Saving drafts: Uses Gmail API's `users.drafts.create`

3. **Data Transformation**:
   - Email content is formatted as required by Gmail API
   - Base64url encoding is used for email content
   - Proper headers are included for email formatting

4. **Error Handling**:
   - API errors are caught and presented to user
   - Rate limiting is handled with exponential backoff
   - Network errors result in retry attempts
   - User feedback is provided for all operations

## Email Threading Implementation

Email threading will be a key feature in DyzBox's organization capabilities, designed to reduce inbox clutter and improve conversation context:

### Thread Identification
- Gmail Thread IDs will be used as the primary grouping mechanism for Gmail accounts
- For other providers, we'll implement custom threading using subject line analysis, In-Reply-To and References headers
- Each thread will have a unique identifier in our system, linking related messages across providers

### UI Representation
- Threads will be displayed in a chronological view with the most recent message visible in the thread preview
- Expanding a thread will show all related messages in time order with proper indentation for reply depth
- Visual indicators will show thread length and participants at a glance
- Unread messages within threads will be highlighted with the same styling as individual unread messages

### Threading Logic
- Messages will be grouped based on conversation flow rather than just subject line matching
- Messages with the same thread ID will be automatically grouped
- Threading algorithm will handle edge cases like:
  - Subject line changes within a conversation
  - Forks in conversation when multiple people reply to the same message
  - Late replies to earlier messages in a thread

### User Experience
- Users can expand/collapse threads to manage visual complexity
- Actions can be applied to entire threads (archive, delete, mark as read)
- Thread snippets will prioritize showing unread content when available
- The interface will maintain context when viewing a single message within a thread

This implementation will require enhancements to our data model to properly track thread relationships and modifications to the UI components to support the hierarchical display of threaded conversations.