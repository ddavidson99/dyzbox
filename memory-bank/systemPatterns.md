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

### 4. Data Management System

**Purpose**: Handles persistence, caching, and synchronization of application data

**Key Patterns**:
- Repository pattern for data access
- Unit of Work for transaction management
- Cache-aside pattern for performance

**Components**:
- `UserPreferencesRepository` - Stores user settings and preferences
- `EmailRepository` - Manages email data and state
- `CategoryRepository` - Handles email categorization rules and assignments
- `SyncEngine` - Coordinates data synchronization across devices

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