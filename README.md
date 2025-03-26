# College Basketball Scoreboard
# CSCE464 Midterm Project

A responsive web application that provides real-time college basketball scores, news, and rankings for both men's and women's NCAA basketball.

## Features

### Scores
- Real-time scores for men's and women's college basketball games
- Date navigation to view past and upcoming games
- Game status indicators (live, final, scheduled)
- Team logos and scores displayed in an easy-to-read format
- Toggle between men's and women's games

### News
- Latest articles for men's and women's college basketball
- Article previews with images, headlines, and publication dates
- Links to full articles
- Toggle between men's and women's basketball news

### Rankings
- UI for displaying basketball rankings (API integration in progress)
- Men's basketball rankings structure implemented
- Currently using placeholder data as the ranking API is not available

### Statistics
- UI framework for displaying player and team statistics (coming soon)
- Placeholder for future implementation

## Technical Details

### Frontend
- Pure HTML, CSS, and JavaScript implementation
- No frameworks or libraries used
- Responsive design that works on mobile, tablet, and desktop
- CSS Grid and Flexbox for layout

### Data Sources
- ESPN public APIs for scores and news content
- Data fetched dynamically using JavaScript fetch API
- Asynchronous loading of content

### Code Structure
- Modular JavaScript files separated by functionality:
  - `main.js`: Main application logic and initialization
  - `scores.js`: Score fetching and display functionality
  - `news.js`: News article fetching and display
  - `rankings.js`: Rankings display (API integration pending)
  - `utils.js`: Shared utility functions

## Setup and Usage

1. Clone the repository
2. Open `index.html` in a web browser
3. No build process or dependencies required

## Limitations

- Rankings data is currently not available as the API endpoint is not functioning
- Statistics section is planned but not yet implemented
- Some features may be limited by the ESPN API's rate limits and data availability

## Future Improvements

- Add statistics section with player and team stats
- Implement conference standings
- Add search functionality
- Add favorite teams feature
- Implement local storage for user preferences
- Introduce NAIA and lower division teams
