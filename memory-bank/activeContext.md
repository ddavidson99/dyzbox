# Active Context: DyzBox

## Current Focus

The DyzBox project is currently in the initial planning and design phase. We are working on establishing the foundation for the email management client with the following immediate priorities:

1. **System Architecture Design**: Defining the core architecture and technical approach for the application.
2. **Feature Prioritization**: Finalizing the scope and priority of features for the initial release.
3. **UI/UX Design**: Creating the design system and user interface mockups for core features.
4. **Technical Proof of Concepts**: Validating the technical feasibility of key components.

## Recent Decisions

1. **Tech Stack Selection**: Next.js frontend with Tailwind CSS, Supabase (PostgreSQL) backend, Python microservices for AI integration.
2. **AI Provider**: Gemini 2.0 Flash selected as the primary LLM for AI capabilities.
3. **Email Provider Support**: Initial focus on Gmail and Outlook integration with IMAP/POP3 support planned for later phases.
4. **Privacy Approach**: Commitment to on-device processing where possible, with opt-in for cloud processing.

## Current Challenges

1. **AI Performance vs. Privacy**: Balancing on-device processing for privacy with the need for powerful AI capabilities.
2. **Email Provider Limitations**: Working within the constraints of various email provider APIs.
3. **Performance Targets**: Achieving sub-100ms response times while handling large email volumes.
4. **Cross-Platform Strategy**: Ensuring consistent experience across web, desktop, and mobile platforms.

## Implementation Strategy

The development approach follows a phased implementation plan:

### Current Phase: Planning & Design (Q1 2025)
- Finalizing architecture and technical design
- Creating detailed UI/UX designs
- Setting up development environment and CI/CD pipeline
- Establishing core development practices and patterns

### Next Phase: Core Experience Development (Q2 2025)
- Building basic email client functionality
- Implementing initial AI categorization and summary capabilities
- Developing speed-optimized interface for individual users
- Integrating Gmail and Outlook account support

## Next Steps

1. **Architecture Documentation**: Finalize system architecture documentation
2. **UI/UX Design System**: Complete design system for consistent UI components
3. **Email Provider API Research**: Document capabilities and limitations of target email APIs
4. **AI Capability Prototype**: Create proof of concept for key AI features
5. **Development Environment Setup**: Establish the initial project structure and dev environment

## Open Questions

1. How will we handle the synchronization of large email volumes while maintaining performance?
2. What is the right balance between automatic AI processing and user control?
3. How should we approach the implementation of offline capabilities?
4. What testing strategy will ensure the reliability of AI-powered features?
5. How will we measure and optimize the accuracy of AI-generated summaries and replies?

## Current Team Focus

- **Architecture Team**: System design and technical planning
- **UX Team**: User research and interface design
- **AI Research**: Evaluating AI capabilities and integration approaches
- **Backend Infrastructure**: Setting up database and backend services

## Reference Materials

- Project Brief: Complete project overview and requirements
- Competitive Analysis: Detailed comparison with existing email clients
- Market Research: Analysis of target user needs and pain points
- Technical Constraints: Documentation of known technical limitations

## Active Assumptions

1. Email will remain a primary business communication channel through 2030
2. Users are increasingly willing to adopt AI tools for productivity
3. Privacy concerns can be adequately addressed through transparent policies and local processing
4. The selected tech stack will provide the performance and flexibility needed 