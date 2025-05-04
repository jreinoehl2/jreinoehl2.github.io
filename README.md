# Basketball Hub
# CSCE464 Final Project

A responsive web application that provides real-time basketball scores, news, and rankings for NBA, WNBA, and NCAA basketball (men's and women's).

## Features

### Scores
- Real-time scores for NBA, WNBA, men's and women's college basketball games
- Date navigation to view past and upcoming games
- Calendar widget for easy date selection
- Game status indicators (live, final, scheduled)
- Team logos and scores displayed in an easy-to-read format
- Toggle between different leagues

### News
- Latest articles for all basketball leagues
- Article previews with images, headlines, and publication dates
- Links to full articles
- Filter news by league (NBA, WNBA, Men's College, Women's College)

### Rankings
- Current standings for NBA and WNBA teams
- Conference-based organization
- Team records, win percentages, and streak information
- College basketball rankings structure implemented
- Visual representation with team logos

### Statistics
- UI framework for displaying player and team statistics (coming soon)
- This section remains a placeholder as there are no freely available comprehensive statistics APIs
- Commercial APIs are available but require paid subscriptions

## Technical Details

### Frontend
- Pure HTML, CSS, and JavaScript implementation
- No frameworks or libraries used
- Responsive design that works on mobile, tablet, and desktop
- CSS Grid and Flexbox for layout

### Data Sources
- ESPN public APIs for scores, news content, and standings
- Data fetched dynamically using JavaScript fetch API
- Asynchronous loading of content

### Code Structure
- Modular JavaScript files separated by functionality:
  - `main.js`: Main application logic and initialization
  - `scores.js`: Score fetching and display functionality
  - `news.js`: News article fetching and display
  - `rankings.js`: Rankings display
  - `nba.js`: NBA-specific functionality
  - `wnba.js`: WNBA-specific functionality
  - `utils.js`: Shared utility functions
  - `calendar.js`: Date selection and calendar widget

## Setup and Usage

1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or dependencies required

- Also going to https://jreinoehl2.github.io/ works.

## Limitations

- Statistics section is not implemented due to lack of free API access
  - Comprehensive basketball statistics typically require paid API subscriptions
  - Services like SportRadar, Stats Perform, and MySportsFeeds offer this data commercially
- Some features may be limited by the ESPN API's rate limits and data availability
- Historical data beyond a certain timeframe may not be available through the public APIs

## Future Improvements

- Implement basic statistics using available free data points
- Add favorite teams feature
- Implement local storage for user preferences
- Enhance mobile experience with touch-optimized controls
- Add dark mode toggle
- Implement conference-specific filtering
- Introduce score alerts for favorite teams
