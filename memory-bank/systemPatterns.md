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

### Key Architectural Patterns

1. **Microservices for AI Processing**
   - Isolated Python services for AI operations
   - Communicates via API with main application
   - Enables independent scaling of compute-intensive operations

2. **Adapter Pattern for Email Providers**
   - Common interface for all email provider interactions
   - Provider-specific implementations behind consistent API
   - Facilitates adding new provider support

3. **Event-Driven Architecture**
   - Publish-subscribe model for email and state changes
   - Enables real-time updates and offline synchronization
   - Supports extensibility for integrations

4. **Command Query Responsibility Segregation (CQRS)**
   - Separate models for reading and writing data
   - Optimizes for performance in email operations
   - Supports complex querying for email organization

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