# NFL Betting Model Builder - MVP Context for Claude Code

## Project Overview
Build a web application that allows users to create personalized NFL betting models using sliders to weight different aspects of football based on their philosophy. The app will provide win probability percentages and point spreads for weekly NFL matchups.

## Target User
- Casual to serious NFL bettors
- People who want to test their football philosophy against real data
- Mobile users who bet on-the-go

## Business Model
- **Free Tier**: Basic offense/defense/special teams sliders (this MVP)
- **Paid Tiers**: Position-specific controls and individual player impact (future phases)

## MVP Features (Page 1 - Free)

### Core Functionality
1. **Weekly NFL Matchups Display**
   - Show current week's NFL games in clean card format
   - Team names, game time, basic info
   - Responsive grid layout for mobile

2. **Three Interactive Sliders**
   - **Offense Slider**: 0-100% weight
   - **Defense Slider**: 0-100% weight  
   - **Special Teams Slider**: 0-100% weight
   - **Constraint**: All three must total exactly 100%
   - **Real-time validation**: Auto-adjust other sliders when one changes

3. **Live Prediction Engine**
   - Updates instantly as sliders move
   - Shows both **Win Probability %** and **Point Spread** for each game
   - Based on weighted team rankings from 2023 season data

4. **User Experience Features**
   - Save slider preferences (in-memory, no localStorage)
   - Reset to default settings
   - Smooth animations and transitions
   - Mobile-first responsive design

## Design Requirements

### Visual Style
- **Background**: Black (#000000 or very dark gray)
- **Accent Colors**: Vibrant colors that pop against black (electric blue, bright green, orange, etc.)
- **Typography**: Modern, clean sans-serif fonts
- **Style**: Sleek, professional sports betting aesthetic
- **Mobile-first**: Touch-friendly controls, readable on phone screens

### UI Components Needed
- Game cards with team matchups
- Slider controls with percentage displays
- Prediction displays (prominent win % and spread)
- Header with app branding
- Clean navigation (for future pages)

## Football Philosophy & Algorithm

### User's Core Beliefs (Weight These Heavily)
1. **Offensive Line**: Pass protection + run blocking effectiveness
2. **Defensive Line**: Pass rush + run stopping ability
3. **Defensive Takeaways**: Interceptions and fumble recoveries
4. **Run Game**: Overall rushing attack effectiveness

### Prediction Algorithm Approach
- Use 2023 NFL team statistics as baseline data
- Weight each team's performance in offense/defense/special teams based on user sliders
- Calculate win probability using weighted team strength differential
- Convert to point spread using standard probability-to-spread conversion

## Data Requirements

### 2023 NFL Team Statistics Needed
**Offensive Metrics:**
- Passing yards per game
- Rushing yards per game  
- Points per game
- Red zone efficiency
- Third down conversions
- Offensive line stats (sacks allowed, rushing yards per attempt)

**Defensive Metrics:**
- Passing yards allowed per game
- Rushing yards allowed per game
- Points allowed per game
- Sacks per game
- Interceptions per game
- Fumbles recovered per game
- Third down stops

**Special Teams Metrics:**
- Field goal percentage
- Punt return average
- Kick return average
- Points scored via special teams

### Current Season Data
- Weekly NFL schedule/matchups
- Team names and basic information
- Game times and locations (if available)

### Data Sources (Need Help Finding Free Sources)
- ESPN public APIs
- NFL.com statistics
- Pro Football Reference data
- Sports Reference CSV downloads
- Any other free, reliable NFL data sources

## Technical Requirements

### Technology Stack
- **Frontend**: React with hooks (useState for slider state management)
- **Styling**: Tailwind CSS utility classes only
- **Responsive**: Mobile-first design
- **Performance**: Fast loading, smooth interactions
- **Storage**: In-memory only (no localStorage/sessionStorage)

### Key React Components Needed
1. **GameCard Component**: Display individual matchups with predictions
2. **SliderControl Component**: Interactive slider with percentage display
3. **PredictionDisplay Component**: Win probability and point spread
4. **WeeklyGames Component**: Container for all games
5. **SliderPanel Component**: Container for all three sliders

### Specific Functionality
- Slider validation ensuring 100% total
- Real-time prediction calculations
- Smooth state updates as sliders change
- Mobile touch interactions
- Error handling for data loading

## User Flow
1. User arrives at app and sees current week's NFL games
2. Default sliders show balanced approach (e.g., 40% offense, 50% defense, 10% special teams)
3. User adjusts sliders based on their football philosophy
4. Predictions update in real-time for all games
5. User can save preferences or reset to defaults
6. Mobile users can easily interact with sliders using touch

## Success Metrics for MVP
- Users engage with sliders (not just view static predictions)
- Predictions feel reasonable and responsive to slider changes
- Mobile experience is smooth and usable
- Interface is intuitive for non-technical sports fans

## Future Expansion Hooks
- User account system placeholder
- Navigation structure for additional pages
- Data structure that can accommodate more detailed statistics
- Component architecture that supports position-specific controls

## Development Priorities
1. **Core slider functionality** - Get the prediction engine working
2. **Mobile responsiveness** - Ensure great mobile experience
3. **Visual polish** - Make it look professional and engaging
4. **Performance** - Fast, smooth interactions
5. **Data integration** - Connect to real NFL statistics

## Additional Context
- User is non-technical but passionate about football strategy
- Believes strongly in "trenches" football (offensive/defensive lines)
- Values defensive takeaways and running game
- Wants something that looks modern and professional
- Planning to expand to paid tiers with more detailed features

This MVP should demonstrate the core concept effectively and provide a foundation for building out the full multi-page application with premium features.