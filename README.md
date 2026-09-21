# Accenture Practice Platform

A comprehensive practice platform for Accenture interview preparation, featuring MCQ practice, mock tests, and detailed analytics. This open-source project helps candidates prepare for Accenture's recruitment process with realistic exam simulations and performance tracking.

## 🎯 Project Goals

- **Realistic Exam Simulation**: Provide authentic exam experience with timed tests and CBT interface
- **Comprehensive Coverage**: Cover all major topics in Accenture's recruitment process
- **Performance Tracking**: Help users identify strengths and weaknesses through detailed analytics
- **Accessibility**: Free and open-source for all candidates
- **Continuous Improvement**: Community-driven content updates and feature enhancements

## 🚀 Features

### Core Functionality
- **MCQ Practice Mode**: Practice multiple-choice questions with immediate feedback and explanations
  - Filter by category/topic
  - Paginated question lists for better performance
  - Option shuffling for authentic exam experience
  - Real-time validation and scoring
- **Mock Tests**: Simulated exam environment with timed tests
  - Computer-based test (CBT) interface
  - Configurable time limits
  - Randomized question selection
  - Question review and detailed explanations
- **Progress Tracking**: Track your progress across different modules and topics
  - User-specific progress tracking
  - Solved question indicators
  - Module completion statistics
- **Analytics Dashboard**: Detailed performance analytics with accuracy metrics and trends
  - Historical test performance
  - Topic-wise accuracy analysis
  - Weakness identification
  - Score trends over time
- **Module-based Learning**: Organized by topic (Coding, Networking, Cloud, MS Office, etc.)
  - Canonical topic separation
  - Frequency-based question importance
  - Difficulty categorization
- **User Authentication**: Secure login system with session management
  - Session-based authentication
  - User data isolation
  - Secure password handling with bcrypt

### Technical Features
- **Responsive Design**: Beautiful, dark-themed UI built with Tailwind CSS
  - Mobile-friendly interface
  - GitHub-inspired dark theme
  - Consistent design system
- **Real-time Scoring**: Instant score calculation and review system
  - Immediate feedback on answers
  - Detailed explanations for each question
  - Performance metrics calculation
- **Performance Optimization**: 
  - User-scoped caching for better performance
  - Paginated data loading
  - Efficient database queries with bounded limits
  - In-memory caching for frequently accessed data
- **Loading States**: 
  - Skeleton loaders for better UX
  - Optimistic UI updates
  - Smooth transitions

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor
- **Validation**: Zod

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Custom session-based auth with bcryptjs

### Development Tools
- **Package Manager**: npm/yarn/pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier (if configured)

## 🏗️ Architecture

### Data Flow
1. **User Request** → Next.js Page/Component
2. **Server Components** → Direct database access via Prisma
3. **API Routes** → Business logic → Database
4. **Caching Layer** → In-memory caching for performance
5. **Response** → Formatted data → UI rendering

### Key Patterns
- **Server Components**: For data-heavy pages with SEO benefits
- **Client Components**: For interactive UI elements
- **API Routes**: For complex business logic and external integrations
- **Service Layer**: Separation of concerns in `lib/` directory
- **Caching Strategy**: User-scoped in-memory caching with TTL

### State Management
- **Server State**: Managed through React Server Components and Prisma
- **Client State**: React hooks for component-level state
- **Session State**: Custom authentication system
- **Cache State**: In-memory caching with expiration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (version 12+ recommended)
- npm, yarn, pnpm, or bun package manager
- Git for version control

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amanjeet233/accenture-practice.git
   cd accenture-practice
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/accenture_db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb accenture_db
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Seed database with sample data
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXTAUTH_SECRET` | Secret key for session encryption | Yes | - |
| `NEXTAUTH_URL` | Base URL for NextAuth | Yes | `http://localhost:3000` |

### Next.js Configuration

Key settings in `next.config.ts`:
- `devIndicators: false` - Disables development indicators
- Experimental package imports for Lucide React and Monaco Editor
- Optimized for performance with proper caching strategies

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured (`@/` for `src/`)
- Proper type checking for Prisma models

## 📁 Project Structure

```
accenture-practice/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── accenture/       # Accenture-specific pages
│   │   │   ├── [module]/    # Dynamic module pages
│   │   │   ├── analytics/   # Analytics dashboard
│   │   │   ├── history/     # Test history
│   │   │   ├── mcq/         # MCQ practice interface
│   │   │   └── test/        # Mock test interface
│   │   ├── api/             # API routes
│   │   │   └── accenture/   # Accenture-specific APIs
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── layout/          # Layout components (Navbar, Sidebar, AppShell)
│   │   ├── mcq/             # MCQ-related components
│   │   │   ├── AccentureMockTestInterface.tsx
│   │   │   ├── CbtExamInterface.tsx
│   │   │   └── McqPracticeWorkspace.tsx
│   │   ├── analytics/       # Analytics components
│   │   └── navigation/      # Navigation components
│   └── lib/                 # Utility functions and services
│       ├── accentureModules.ts    # Module definitions and routing
│       ├── mcqService.ts          # MCQ formatting and caching
│       ├── mockTestService.ts     # Mock test logic
│       ├── testAnalyticsService.ts # Analytics calculations
│       └── auth.ts                # Authentication utilities
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema definition
│   └── migrations/          # Database migration files
├── public/                  # Static assets
├── .env                     # Environment variables (not committed)
├── .env.example             # Example environment variables
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json
```

## 🧪 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes Prisma generate)
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

### Core Tables

- **Question**: Stores MCQ questions with options, solutions, and metadata
  - Fields: id, title, description, category, difficulty, solution, explanation
  - Supports frequency tracking and importance ranking
  - Includes verification status and audit notes
- **UserProgress**: Tracks user progress on questions
  - Fields: userId, questionId, isSolved, attempts, accuracy
  - Enables personalized learning paths
- **MockTest**: Defines test configurations
  - Fields: name, duration, questionCount, topicFilter
  - Supports both general and topic-specific tests
- **TestAttempt**: Records user test attempts
  - Fields: userId, mockTestId, score, totalQuestions, submittedAt
  - Tracks historical performance for analytics
- **TestQuestion**: Links tests with questions and stores user answers
  - Fields: testAttemptId, questionId, userAnswer, isCorrect
  - Enables detailed review and analysis

### Question Metadata

- **Frequency**: How often a question appears in real exams
- **Importance**: Subjective importance rating (1-5)
- **Importance Reason**: Explanation for importance rating
- **Verification Status**: UNVERIFIED, NEEDS_VERIFICATION, VERIFIED
- **Source Document**: Reference to original study material
- **Category**: Topic classification (Coding, Networking, etc.)

### Indexes and Performance

- Indexed on: questionId, userId, category, difficulty
- Composite indexes for common query patterns
- Optimized for paginated queries

## 🔌 API Endpoints

### MCQ Related
- `GET /api/accenture/mcqs` - Fetch MCQ questions with pagination
  - Query params: `category`, `page`, `limit`
  - Returns: Paginated question list with metadata
  - Response format:
    ```json
    {
      "questions": [...],
      "totalCount": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
    ```

### Authentication
- Session-based authentication utilities in `lib/auth.ts`
- User session management for data isolation
- Secure session handling with proper expiration

### Module Data
- Module definitions and routing in `lib/accentureModules.ts`
- Canonical topic resolution for consistent categorization
- Frequency-based question ranking

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] User login/logout functionality
- [ ] Session persistence across page refreshes
- [ ] Data isolation between different users

**MCQ Practice**
- [ ] Question loading with pagination
- [ ] Category filtering
- [ ] Answer submission and validation
- [ ] Score calculation
- [ ] Explanation display
- [ ] Progress tracking

**Mock Tests**
- [ ] Test creation and configuration
- [ ] Timer functionality
- [ ] Question randomization
- [ ] Answer submission during test
- [ ] Test completion and scoring
- [ ] Review mode functionality

**Analytics**
- [ ] Dashboard data loading
- [ ] Historical test display
- [ ] Accuracy calculations
- [ ] Topic-wise analysis
- [ ] Performance trends

**Performance**
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] Database query optimization
- [ ] Cache effectiveness

### Automated Testing (Future)

Currently, the project relies on manual testing. Planned additions:
- Unit tests for service functions
- Integration tests for API routes
- E2E tests with Playwright or Cypress
- Database migration tests

## 🎨 UI Components

### Layout Components
- **AppShell**: Main application layout wrapper
- **Navbar**: Top navigation with user menu
- **Sidebar**: Side navigation for module selection
- **BackButton**: Navigation back button component

### MCQ Components
- **McqPracticeWorkspace**: Practice mode interface with question cards
- **CbtExamInterface**: Computer-based test interface for mock exams
- **AccentureMockTestInterface**: Mock test configuration and execution

### Analytics Components
- **AccentureTestAnalyticsView**: Comprehensive analytics dashboard
- Performance charts and trend analysis
- Topic-wise accuracy breakdown

## 🔧 Development Workflow

### Adding New Questions
1. Prepare question data in the required format
2. Use Prisma client to insert into database
3. Ensure proper categorization and difficulty levels
4. Add explanations and importance reasons

### Adding New Modules
1. Update `src/lib/accentureModules.ts` with new module definition
2. Create corresponding page in `src/app/accenture/[module]/`
3. Add module-specific filters and routing logic
4. Update navigation components

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (use with caution)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database exists and credentials are correct

**Build Errors**
- Run `npx prisma generate` before building
- Clear `.next` cache: `rm -rf .next`
- Ensure all dependencies are installed

**TypeScript Errors**
- Run `npx prisma generate` to regenerate types
- Check `tsconfig.json` configuration
- Ensure all imports are correct

**Performance Issues**
- Check cache configuration in service files
- Verify database indexes are properly set
- Monitor query performance with Prisma logging

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Code Style**
   - Follow existing code patterns and conventions
   - Use TypeScript for type safety
   - Write meaningful commit messages
   - Keep functions small and focused

2. **Testing**
   - Test new features thoroughly
   - Ensure database migrations work correctly
   - Verify responsive design on different screen sizes
   - Test with different user roles and permissions

3. **Documentation**
   - Update README for significant changes
   - Add comments for complex logic
   - Document new API endpoints
   - Update environment variable examples

### Contribution Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request with a clear description

### Pull Request Guidelines

- Provide a clear description of changes
- Reference related issues if applicable
- Ensure all tests pass
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components inspired by modern design systems
- Question database for Accenture interview preparation
- Icons by [Lucide](https://lucide.dev)
- Database ORM by [Prisma](https://www.prisma.io)

## 📧 Support

For support, please open an issue in the GitHub repository.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t accenture-practice .

# Run container
docker run -p 3000:3000 --env-file .env accenture-practice
```

## 📊 Performance Considerations

- **Caching Strategy**: User-scoped caching for frequently accessed data
- **Database Optimization**: Indexed queries and bounded result sets
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for static assets
- **Bundle Size**: Optimized imports and tree-shaking

## 🔒 Security Considerations

- User data isolation through session-based authentication
- Secure password hashing with bcryptjs
- Environment variable protection
- SQL injection prevention through Prisma ORM
- XSS protection through React's built-in escaping

## 🗺️ Roadmap

### Planned Features
- [ ] User registration and account management
- [ ] Social authentication (Google, GitHub)
- [ ] Advanced analytics with ML-based recommendations
- [ ] Mobile app (React Native)
- [ ] Collaborative study features
- [ ] Question contribution system
- [ ] Performance leaderboards
- [ ] API for third-party integrations

### Known Limitations
- Currently requires manual database setup
- Limited to Accenture-specific content
- Single-user session focus (no real-time collaboration)

## 📈 Usage Statistics

- **Total Questions**: Hundreds of MCQs across multiple topics
- **Categories**: Coding, Networking, Cloud, MS Office, Pseudo Code
- **Difficulty Levels**: Easy, Medium, Hard
- **Test Types**: Practice tests, Mock exams, Topic-specific tests

## 📚 Content Sources

The question database is curated from various sources including:
- Official Accenture preparation materials
- Previous year question papers
- Industry-standard technical assessments
- Community contributions and verified content

### Content Verification

- **Verification Status**: Each question has a verification status
  - `VERIFIED`: Answer key confirmed from reliable sources
  - `NEEDS_VERIFICATION`: Requires additional verification
  - `UNVERIFIED`: Not yet verified
- **Audit System**: Comprehensive audit trail for content quality
- **Community Review**: User feedback mechanism for accuracy

## 🌟 Key Features Deep Dive

### CBT Exam Interface
The Computer-Based Test (CBT) interface simulates the actual Accenture exam environment:
- **Timer**: Configurable countdown timer with auto-submit
- **Question Navigation**: Easy navigation between questions
- **Question Palette**: Visual overview of answered/unanswered questions
- **Review Mode**: Mark questions for review during the test
- **Fullscreen Mode**: Immersive exam experience

### Smart Caching System
The application implements intelligent caching strategies:
- **User-Scoped Caching**: Cache keys include user ID for data isolation
- **TTL-Based Expiration**: Automatic cache invalidation after set time
- **Pagination Caching**: Cache individual pages rather than full datasets
- **Cache Invalidation**: Smart invalidation on data updates

### Analytics Engine
Comprehensive analytics provide actionable insights:
- **Accuracy Trends**: Track improvement over time
- **Topic Analysis**: Identify strong and weak areas
- **Time Management**: Analyze time spent per question
- **Comparison**: Compare performance across different attempts
- **Recommendations**: Personalized study suggestions based on performance

## 🔍 Advanced Topics

### Custom Module Development

To add a new module to the platform:

1. **Define Module**: Add to `ACCENTURE_MODULES` in `lib/accentureModules.ts`
   ```typescript
   {
     id: "new-module",
     name: "New Module",
     slug: "new-module",
     description: "Module description",
     type: "QUESTIONS", // or "PROGRESS"
     icon: SomeIcon,
     queryFilter: { category: "New Category" }
   }
   ```

2. **Create Page**: Add page in `src/app/accenture/[module]/page.tsx`
3. **Add Loading State**: Create `loading.tsx` for better UX
4. **Update Navigation**: Ensure it appears in navigation components

### Database Query Optimization

The platform uses several optimization techniques:
- **Selective Field Loading**: Only fetch required fields from database
- **Indexed Queries**: Leverage database indexes for common queries
- **Bounded Results**: Use pagination to limit result sets
- **Connection Pooling**: Prisma handles connection pooling automatically
- **Query Batching**: Use Promise.all for parallel queries where possible

### Performance Monitoring

Key performance metrics to monitor:
- **Page Load Time**: Target < 2 seconds for initial load
- **API Response Time**: Target < 500ms for most endpoints
- **Database Query Time**: Monitor slow queries with Prisma logging
- **Cache Hit Rate**: Monitor cache effectiveness
- **Memory Usage**: Ensure in-memory caches don't grow unbounded
