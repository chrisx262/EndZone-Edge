# NFL Prediction App - Comprehensive Development Prompt for Manus.ai

## Project Overview
Build a full-stack NFL prediction web application that works on both web and mobile platforms. The app integrates NFL data to help users predict game winners based on weighted performance metrics.

## Core Requirements

### Technology Stack
- **Frontend**: React/Next.js with responsive design for web and mobile deployment
- **Backend**: Supabase for database and API management
- **Data Source**: Pro Football Focus (PFF) API integration
- **API Management**: PicaOS.com for API orchestration
- **Deployment**: Web-first with mobile PWA capabilities

### Application Features

#### 1. Data Integration
- Integrate Pro Football Focus API for NFL data
- Organize data into three main categories:
  - **Offense**: Passing yards, rushing yards, red zone efficiency, third down conversion, etc.
  - **Defense**: Points allowed, yards allowed, turnovers forced, sacks, etc.
  - **Special Teams**: Field goal percentage, punt/kick return averages, etc.

#### 2. User Interface Design
- **Modern UI/UX**: Clean, intuitive interface with contemporary design
- **Vertical Layout**: Display the three categories (Offense, Defense, Special Teams) in vertical sections
- **Interactive Sliders**: Each category has a horizontal slider (0% to 100%)
- **Real-time Updates**: Sliders update percentages dynamically
- **Mobile Responsive**: Touch-friendly controls and optimized layouts

#### 3. Prediction Engine
- Users set importance percentages for each category using sliders
- Total percentages must equal 100% (implement validation)
- Calculate predicted winners based on weighted team performance
- Display confidence levels and prediction rationale

## Development Approach - Phased Implementation

### Phase 1: Project Setup & Foundation
**Tasks:**
1. Initialize React/Next.js project with TypeScript
2. Set up Supabase project and database schema
3. Configure development environment
4. Create basic project structure

**Testing Criteria:**
- [ ] Project builds successfully
- [ ] Supabase connection established
- [ ] Basic routing works
- [ ] Development server runs without errors

### Phase 2: API Integration
**Tasks:**
1. Set up PFF API integration through PicaOS.com
2. Create API endpoints for NFL data retrieval
3. Implement data fetching services
4. Set up error handling and rate limiting

**Testing Criteria:**
- [ ] API successfully fetches NFL data
- [ ] Data is properly structured and stored
- [ ] Error handling works for API failures
- [ ] Rate limiting prevents API abuse

### Phase 3: Database Design & Setup
**Tasks:**
1. Design Supabase tables for:
   - Teams and their stats
   - User preferences
   - Prediction history
2. Set up database relationships
3. Create stored procedures for predictions
4. Implement data validation

**Testing Criteria:**
- [ ] Database schema created successfully
- [ ] CRUD operations work correctly
- [ ] Data integrity constraints enforced
- [ ] Performance queries execute efficiently

### Phase 4: Frontend Core Components
**Tasks:**
1. Create main layout components
2. Build category sections (Offense, Defense, Special Teams)
3. Implement slider components with validation
4. Create responsive design system

**Testing Criteria:**
- [ ] All components render correctly
- [ ] Sliders function smoothly
- [ ] Percentage validation works (totals 100%)
- [ ] Mobile responsiveness verified

### Phase 5: Prediction Logic
**Tasks:**
1. Implement weighted scoring algorithm
2. Create prediction calculation service
3. Build results display components
4. Add confidence level indicators

**Testing Criteria:**
- [ ] Predictions calculate correctly
- [ ] Weighted percentages applied properly
- [ ] Results display accurate information
- [ ] Confidence levels make sense

### Phase 6: User Experience & Polish
**Tasks:**
1. Add loading states and transitions
2. Implement user preference saving
3. Create prediction history tracking
4. Add data visualization components

**Testing Criteria:**
- [ ] Loading states improve UX
- [ ] User preferences persist
- [ ] History tracking works
- [ ] Visualizations are clear and helpful

### Phase 7: Testing & Deployment
**Tasks:**
1. Comprehensive testing (unit, integration, e2e)
2. Performance optimization
3. Mobile PWA configuration
4. Production deployment

**Testing Criteria:**
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] PWA features work on mobile
- [ ] Production deployment successful

## Technical Specifications

### Frontend Requirements
- **Framework**: React 18+ with Next.js 14+
- **Styling**: Tailwind CSS or Styled Components
- **State Management**: React Context or Zustand
- **UI Components**: Modern component library (Radix UI, Shadcn/ui)
- **Responsive Design**: Mobile-first approach

### Backend Requirements
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (if user accounts needed)
- **API**: Supabase Edge Functions for custom logic
- **Real-time**: Supabase Realtime for live updates

### Data Structure
```
Teams: {
  id, name, abbreviation, logo_url,
  offense_stats: { passing_yards, rushing_yards, ... },
  defense_stats: { points_allowed, yards_allowed, ... },
  special_teams_stats: { fg_percentage, return_avg, ... }
}

User_Preferences: {
  user_id, offense_weight, defense_weight, special_teams_weight
}

Predictions: {
  id, user_id, game_id, predicted_winner, confidence_level, timestamp
}
```

## Quality Assurance Rules

### Development Standards
1. **The Presumption of Falsehood**: Every feature implementation begins as "Incorrect" until verified through testing
2. **Evidence is Non-Negotiable**: Each completed task must have verifiable test results
3. **Penalty for Forgery**: Any non-functional feature or fabricated test result fails the entire phase
4. **Embrace Negative Evidence**: Document failed attempts and debugging steps
5. **No Hallucinations**: Only implement features explicitly defined in requirements

### Testing Protocol
- Run tests after each task completion
- Document test results and any issues
- Fix issues before proceeding to next task
- Maintain test coverage above 80%

## Deliverables
1. Fully functional web application
2. Mobile-responsive design
3. API integration with PFF data
4. Prediction algorithm implementation
5. User interface with interactive sliders
6. Deployment-ready codebase
7. Documentation and testing reports

## Success Criteria
- [ ] App loads and displays NFL data correctly
- [ ] Sliders work smoothly and validate to 100%
- [ ] Predictions generate based on user weights
- [ ] Mobile experience is intuitive and responsive
- [ ] All API integrations function reliably
- [ ] Performance meets modern web standards

**Note**: Break down any task that seems too large into smaller, manageable subtasks. Each subtask should be testable and completable within a focused development session.