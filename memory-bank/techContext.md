# Technical Context: DyzBox

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.1
- **State Management**: React Context + Hooks
- **Component Library**: Custom components with Tailwind
- **UI Design Approach**: Atomic design methodology

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth with Google provider
- **API Layer**: Next.js server components and API routes for core operations
- **Email Service Communication**: Direct integration with email provider APIs
- **File Storage**: Supabase Storage

### AI Services
- **Language**: Python
- **Primary LLM**: Gemini 2.0 Flash
- **Architecture**: Microservices for AI processing
- **Communication**: REST API between Next.js and Python services
- **Processing Modes**: On-device (when possible) and cloud-based

### Email Provider Integration
- **Primary Provider**: Gmail API
- **Future Providers**: Outlook, IMAP/POP3
- **Integration Pattern**: Adapter pattern with provider-specific implementations
- **Communication**: Direct from Next.js server components for core operations

## System Architecture

DyzBox follows a hybrid communication architecture that optimizes for both performance and specialized processing:

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

### Key Technical Decisions
1. **Direct Provider Communication**: Core email operations (fetch, send, read, write) flow directly from Next.js to email providers for maximum performance
2. **AI-Mediated Processing**: Email content requiring analysis routes through Python microservices for specialized AI processing
3. **Common Adapter Interface**: Provider-specific implementations hidden behind consistent API regardless of email service
4. **Separation of Concerns**: Clear boundaries between UI, business logic, AI processing, and data storage

## Development Environment

### Local Development
- **Node.js**: v18.x (LTS)
- **Package Manager**: npm
- **Python**: v3.11+
- **IDE**: VS Code with TypeScript and Tailwind extensions
- **Development Server**: Next.js dev server
- **API Testing**: Postman/Insomnia

### CI/CD
- **Source Control**: Git (GitHub)
- **CI Pipeline**: GitHub Actions
- **Deployment**: Vercel (frontend), Cloud Run (Python microservices)
- **Environment Variables**: Stored in Vercel and Cloud Run

### Testing
- **Unit Testing**: Jest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **AI Testing**: Custom evaluation framework

## External Dependencies

### Frontend Dependencies
- `next`: Next.js framework
- `react`, `react-dom`: React library
- `typescript`: TypeScript language
- `tailwindcss`: Utility-first CSS framework
- `next-auth`: Authentication framework
- `lucide-react`: Icon components
- `clsx`, `tailwind-merge`: Utility for merging class names

### Backend Dependencies
- Supabase client libraries
- Gmail API client libraries
- Outlook API client libraries (future)

### AI Service Dependencies
- `gemini-ai`: Gemini API client
- `fastapi`: API framework for Python microservices
- `pydantic`: Data validation
- `uvicorn`: ASGI server
- `langchain`: LLM framework (optional)
- NLP processing libraries

## Infrastructure Requirements

### Frontend Hosting
- **Platform**: Vercel
- **Regions**: Multi-region deployment
- **Edge Functions**: For performant server components

### Backend Services
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: NextAuth + Google OAuth

### AI Microservices
- **Hosting**: Google Cloud Run or similar containerized service
- **Scaling**: Auto-scaling based on demand
- **GPU Access**: Optional for more complex AI tasks

## Security Considerations

### Authentication
- OAuth 2.0 with Google for Gmail access
- JWT for service-to-service communication
- PKCE flow for added security

### Data Protection
- End-to-end encryption for sensitive data
- On-device processing where possible
- Clear data retention policies

### API Security
- Rate limiting for all endpoints
- Input validation and sanitization
- CORS configuration
- API keys for service-to-service communication

## Performance Considerations

### Frontend
- Server components for improved loading performance
- Static generation where possible
- Edge functions for low-latency operations
- Code splitting and lazy loading

### Email Operations
- Direct communication with providers for core operations
- Optimistic UI updates for immediate feedback
- Background synchronization
- Efficient caching strategies

### AI Processing
- Selective processing based on email importance
- Batch processing for efficiency
- Throttling during high load periods
- Progressive enhancement approach

## Technical Roadmap

### Phase 1: Core Infrastructure
- Next.js application setup
- Basic UI components
- Gmail authentication
- Email provider adapter layer
- Direct email operations

### Phase 2: AI Integration
- Python microservice setup
- AI summary generation
- Next.js to Python communication
- Initial on-device processing

### Phase 3: Advanced Features
- Additional email providers
- Enhanced AI capabilities
- Performance optimizations
- Mobile responsive design

### Phase 4: Enterprise Features
- Team collaboration
- Advanced security features
- Custom AI models
- Enterprise authentication options

## Technical Configuration

### Next.js Setup
- **App Router**: Using the Next.js App Router for routing
- **Server Components**: Will use React Server Components for performance
- **TypeScript**: Strict typing throughout the application
- **Tailwind Configuration**: Custom colors and extensions in tailwind.config.ts
- **PostCSS**: CommonJS format for compatibility with Next.js 15

### Tailwind Configuration
- **Version**: Using stable Tailwind CSS v3.4.1 (avoided v4 alpha due to compatibility issues)
- **Custom Colors**: Extended default color palette with application-specific colors
- **Components**: Building custom components with consistent styling patterns
- **Utility Classes**: Extending Tailwind with custom utility classes as needed

## Technical Requirements

### Email Provider Support
- Gmail/Google Workspace
- Microsoft Outlook/Exchange
- IMAP/POP3 standard providers

### Performance Specifications
- Maximum 1-second initial load time
- Sub-100ms response time for common actions
- Support for mailboxes with 100,000+ emails
- Offline functionality with synchronization upon reconnection

### AI Processing Requirements
- Natural Language Processing for content understanding
- On-device inference capabilities for privacy-sensitive operations
- Cloud-based processing for complex operations (with user consent)
- Continuous learning from user interactions with privacy safeguards

### Security Standards
- SOC 2 Type II compliance
- GDPR and CCPA compliance
- End-to-end encryption for message content
- Multi-factor authentication support

## Architecture Overview

### Component Architecture
- **Email Client Core**: Handles connection to email providers, synchronization, and basic operations
- **AI Processing Pipeline**: Manages email analysis, categorization, and content generation
- **User Interface Layer**: Provides speed-optimized interface across platforms
- **Data Storage Layer**: Manages user preferences, AI models, and cached data
- **Integration Layer**: Connects with external systems and services

### UI Component Structure
- **Layout Components**: Handle overall page structure and positioning
  - Header: Top navigation and user controls
  - Sidebar: Primary navigation and categories
  - EmailLayout: Three-panel layout structure

- **Feature Components**: Provide specific functionality
  - EmailList: Displays emails with summaries
  - EmailListItem: Individual email preview in list
  - EmailPreview: Detailed view of selected email

- **UI Elements**: Reusable interface components
  - Buttons, inputs, badges, and other interactive elements
  - Icons and visual indicators

### Data Flow
1. Emails retrieved from provider APIs and stored in local cache
2. AI pipeline processes emails for categorization and summarization
3. UI presents processed data to users with minimal latency
4. User interactions feed back into AI learning system
5. Changes synchronized back to email providers

## Privacy & Security Architecture

### On-Device vs. Cloud Processing
- Sensitive content processed locally when possible
- User-configurable settings for what data can be processed in the cloud
- Anonymization techniques for data used in model improvement

### Data Access Controls
- End-to-end encryption for all email content
- Role-based access for team environments
- Audit logging for security monitoring
- User-controlled data retention policies

## Implementation Constraints

### Technical Limitations
- Email protocol restrictions may limit some automation capabilities
- Different email providers have varying API capabilities
- Mobile device processing power may limit on-device AI capabilities
- Offline functionality requires robust synchronization

### Integration Challenges
- Calendar systems vary across providers
- CRM and project management tools have diverse APIs
- Document management systems use different standards
- User expectations for integration depth may exceed feasibility

## Development Tools

### Development Environment
- **Package Manager**: npm
- **Code Editor**: VSCode with TypeScript and Tailwind extensions
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Version Control**: Git with GitHub

### Technical Decisions and Learnings

1. **Tailwind CSS Configuration**: We found that Tailwind CSS v4 alpha had compatibility issues with Next.js 15. We downgraded to v3.4.1 for better stability. Key learnings:
   - PostCSS configuration must use CommonJS format for Next.js compatibility
   - Color definitions needed to be explicitly added to the Tailwind config
   - Utility class usage needed to match the version of Tailwind being used

2. **Next.js 15 Requirements**:
   - Specific package versions are needed for compatibility
   - Turbopack has limitations with certain CSS processing approaches
   - The App Router requires a different file structure than previous Next.js versions

## Development Approach

### Implementation Phases

#### Phase 1: Core Experience (Q2 2025)
- Basic email client functionality
- Initial AI categorization and summary capabilities
- Speed-optimized interface for individual users
- Support for Gmail and Outlook accounts

#### Phase 2: Enhanced AI Features (Q3 2025)
- Expanded AI capabilities for reply generation and intent recognition
- Improved categorization with learning capabilities
- Additional email provider support
- Mobile application release

#### Phase 3: Team Collaboration (Q4 2025)
- Shared inbox functionality
- Team analytics and insights
- Enterprise security features
- Advanced integration capabilities

#### Phase 4: Advanced Personalization (Q1 2026)
- Enhanced learning from user behavior
- Workflow automation capabilities
- Additional language support
- Performance optimizations for large organizations

## Technical Assumptions

1. AI models can achieve required accuracy with available training data
2. On-device processing can handle basic AI features on modern devices
3. Email provider APIs will remain stable during development
4. Security requirements can be met while maintaining performance goals
5. Cross-platform consistency is achievable with selected technologies

## Technical Risks

1. **AI Performance Risk**: Models may not achieve expected accuracy or performance
2. **API Limitations**: Email provider restrictions could impact functionality
3. **Privacy-Performance Tradeoff**: On-device processing may not meet speed requirements
4. **Security Compliance**: Meeting enterprise security standards might delay development
5. **Technical Debt**: Rapid development could create maintenance challenges 