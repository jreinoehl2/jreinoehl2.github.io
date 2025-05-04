// DOM Elements for scores
const scoresContainer = document.getElementById('scores-container');
const currentDateElement = document.getElementById('current-date');

// Update date display
function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = currentDate.toLocaleDateString('en-US', options);
}

// Change date
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateDateDisplay();
    loadScores();
}

// Update loadScores function to handle all leagues
function loadScores() {
    scoresContainer.innerHTML = '<div class="loading">Loading scores...</div>';
    
    if (currentView === 'all') {
        fetchAllScores();
    } else if (currentView === 'nba') {
        fetchNBAScores();
    } else if (currentView === 'wnba') {
        fetchWNBAScores();
    } else if (currentView === 'mens') {
        fetchMensScores();
    } else {
        fetchWomensScores();
    }
}

// Show scores section
function showScoresSection() {
    currentSection = 'scores';
    hideAllSections();
    scoresContainer.style.display = 'grid';
    if (document.querySelector('.filters-container')) 
        document.querySelector('.filters-container').style.display = 'block';
    if (document.querySelector('.pagination'))
        document.querySelector('.pagination').style.display = 'flex';
    resetNavigation();
    document.querySelector('.nav-links a[href="#"]').classList.add('active');
    
    updateToggleButtons();
    loadScores();
}

// Men's scores
async function fetchMensScores() {
    try {
        const dateStr = formatDateForAPI(currentDate);
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${dateStr}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        displayScores(data.events);
    } catch (error) {
        console.error('Error fetching men\'s scores:', error);
        scoresContainer.innerHTML = '<div class="loading">Error loading scores. Please try again later.</div>';
    }
}

// Women's scores
async function fetchWomensScores() {
    try {
        const dateStr = formatDateForAPI(currentDate);
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard?dates=${dateStr}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        displayScores(data.events);
    } catch (error) {
        console.error('Error fetching women\'s scores:', error);
        scoresContainer.innerHTML = '<div class="loading">Error loading scores. Please try again later.</div>';
    }
}

// Add a new function to fetch scores from all leagues
async function fetchAllScores() {
    scoresContainer.innerHTML = '<div class="loading">Loading all basketball scores...</div>';
    
    try {
        const dateStr = formatDateForAPI(currentDate);
        
        // Fetch all leagues in parallel
        const [nbaProm, wnbaProm, mensProm, womensProm] = await Promise.allSettled([
            fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`),
            fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates=${dateStr}`),
            fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${dateStr}`),
            fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/scoreboard?dates=${dateStr}`)
        ]);
        
        // Process results
        const allEvents = [];
        
        // Process NBA
        if (nbaProm.status === 'fulfilled' && nbaProm.value.ok) {
            const nbaData = await nbaProm.value.json();
            nbaData.events.forEach(event => {
                event.league = 'NBA';
                allEvents.push(event);
            });
        }
        
        // Process WNBA
        if (wnbaProm.status === 'fulfilled' && wnbaProm.value.ok) {
            const wnbaData = await wnbaProm.value.json();
            wnbaData.events.forEach(event => {
                event.league = 'WNBA';
                allEvents.push(event);
            });
        }
        
        // Process Men's College
        if (mensProm.status === 'fulfilled' && mensProm.value.ok) {
            const mensData = await mensProm.value.json();
            mensData.events.forEach(event => {
                event.league = "Men's College";
                allEvents.push(event);
            });
        }
        
        // Process Women's College
        if (womensProm.status === 'fulfilled' && womensProm.value.ok) {
            const womensData = await womensProm.value.json();
            womensData.events.forEach(event => {
                event.league = "Women's College";
                allEvents.push(event);
            });
        }
        
        // Sort events by start time
        allEvents.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        // Display all events
        displayAllScores(allEvents);
        
    } catch (error) {
        console.error('Error fetching all scores:', error);
        scoresContainer.innerHTML = '<div class="loading">Error loading scores. Please try again later.</div>';
    }
}

// Display scores
function displayScores(events) {
    scoresContainer.innerHTML = '';

    if (!events || events.length === 0) {
        scoresContainer.innerHTML = '<div class="loading">No games scheduled for this date.</div>';
        return;
    }

    // Game card for each event
    events.forEach(event => {
        const gameCard = createGameCard(event);
        
        // Add click event to show game details popup
        gameCard.addEventListener('click', () => showGameDetails(event));
        
        scoresContainer.appendChild(gameCard);
    });
}

// Create game card element
function createGameCard(event) {
    const homeTeam = event.competitions[0].competitors.find(team => team.homeAway === 'home');
    const awayTeam = event.competitions[0].competitors.find(team => team.homeAway === 'away');
    
    // Game status
    let statusClass = 'scheduled';
    let statusText = event.status.type.shortDetail;
    
    if (event.status.type.completed) {
        statusClass = 'final';
        statusText = 'Final';
    } else if (event.status.type.state === 'in') {
        statusClass = 'live';
    }
    
    // Winner?
    const homeWinner = homeTeam.winner;
    const awayWinner = awayTeam.winner;
    
    // Game card HTML with team logos from ESPN API
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.innerHTML = `
        <div class="game-status ${statusClass}">${statusText}</div>
        
        <div class="team">
            <div class="team-info ${awayWinner ? 'winner' : ''}">
                <img class="team-logo" src="${awayTeam.team.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png'}" alt="${awayTeam.team.displayName} logo">
                <span>${awayTeam.team.displayName}</span>
            </div>
            <div class="score">${awayTeam.score || '-'}</div>
        </div>
        
        <div class="team">
            <div class="team-info ${homeWinner ? 'winner' : ''}">
                <img class="team-logo" src="${homeTeam.team.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png'}" alt="${homeTeam.team.displayName} logo">
                <span>${homeTeam.team.displayName}</span>
            </div>
            <div class="score">${homeTeam.score || '-'}</div>
        </div>
    `;
    return gameCard;
}

// Display scores from all leagues with league labels
function displayAllScores(events) {
    scoresContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        scoresContainer.innerHTML = '<div class="loading">No games scheduled for this date.</div>';
        return;
    }
    
    // Game card for each event
    events.forEach(event => {
        const gameCard = createAllLeagueGameCard(event);
        
        // Add click event to show game details popup
        gameCard.addEventListener('click', () => showGameDetails(event));
        
        scoresContainer.appendChild(gameCard);
    });
}

// Create game card for all leagues view
function createAllLeagueGameCard(event) {
    const homeTeam = event.competitions[0].competitors.find(team => team.homeAway === 'home');
    const awayTeam = event.competitions[0].competitors.find(team => team.homeAway === 'away');
    
    // Game status
    let statusClass = 'scheduled';
    let statusText = event.status.type.shortDetail;
    
    if (event.status.type.completed) {
        statusClass = 'final';
        statusText = 'Final';
    } else if (event.status.type.state === 'in') {
        statusClass = 'live';
    }
    
    // Winner?
    const homeWinner = homeTeam.winner;
    const awayWinner = awayTeam.winner;
    
    // Game card HTML with team logos from ESPN API
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.innerHTML = `
        <div class="game-status ${statusClass}">
            <span class="league-badge">${event.league}</span>
            ${statusText}
        </div>
        
        <div class="team">
            <div class="team-info ${awayWinner ? 'winner' : ''}">
                <img class="team-logo" src="${awayTeam.team.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png'}" alt="${awayTeam.team.displayName} logo">
                <span>${awayTeam.team.displayName}</span>
            </div>
            <div class="score">${awayTeam.score || '-'}</div>
        </div>
        
        <div class="team">
            <div class="team-info ${homeWinner ? 'winner' : ''}">
                <img class="team-logo" src="${homeTeam.team.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png'}" alt="${homeTeam.team.displayName} logo">
                <span>${homeTeam.team.displayName}</span>
            </div>
            <div class="score">${homeTeam.score || '-'}</div>
        </div>
    `;
    return gameCard;
}

// Function to display game details popup
function showGameDetails(game) {
    // Create overlay and popup container
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'game-details-popup';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-popup';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.removeChild(overlay);
    });
    
    // Game header section
    const header = document.createElement('div');
    header.className = 'popup-header';
    
    // Extract teams data
    const homeTeam = game.competitions[0].competitors.find(team => team.homeAway === 'home');
    const awayTeam = game.competitions[0].competitors.find(team => team.homeAway === 'away');
    
    // Get game status information
    const gameState = game.status.type.state;
    const gameDesc = game.status.type.description;
    const gameDate = new Date(game.date);
    const formattedDate = gameDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Format the game status/info
    let statusInfo = '';
    if (gameState === 'pre') {
        const timeString = gameDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
        statusInfo = `${formattedDate} | ${timeString}`;
    } else if (gameState === 'in') {
        statusInfo = game.status.displayClock + ' ' + game.status.period;
    } else {
        statusInfo = `Final${game.status.period > 4 ? ' - OT' : ''}`;
    }
    
    // Additional game info (venue, series, etc.)
    const venue = game.competitions[0].venue?.fullName || 'Venue not available';
    const location = game.competitions[0].venue?.address?.city + ', ' + game.competitions[0].venue?.address?.state || '';
    const seriesInfo = game.competitions[0].series?.summary || '';
    
    // Construct header HTML
    header.innerHTML = `
        <div class="teams-score">
            <div class="team away">
                <img src="${awayTeam.team.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png'}" alt="${awayTeam.team.displayName}" class="team-logo">
                <div class="team-info">
                    <h3>${awayTeam.team.displayName}</h3>
                    ${gameState !== 'pre' ? `<p class="record">${awayTeam.records?.[0]?.summary || ''}</p>` : ''}
                </div>
                <div class="score">${awayTeam.score || '-'}</div>
            </div>
            <div class="vs">@</div>
            <div class="team home">
                <img src="${homeTeam.team.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default-team-logo-500.png'}" alt="${homeTeam.team.displayName}" class="team-logo">
                <div class="team-info">
                    <h3>${homeTeam.team.displayName}</h3>
                    ${gameState !== 'pre' ? `<p class="record">${homeTeam.records?.[0]?.summary || ''}</p>` : ''}
                </div>
                <div class="score">${homeTeam.score || '-'}</div>
            </div>
        </div>
        <div class="game-info">
            <p class="status">${statusInfo}</p>
            <p class="venue">${venue} - ${location}</p>
            ${seriesInfo ? `<p class="series">${seriesInfo}</p>` : ''}
        </div>
    `;
    
    // Create tabs for different sections
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'popup-tabs';
    tabsContainer.innerHTML = `
        <button class="tab-btn active" data-tab="box-score">Box Score</button>
        <button class="tab-btn" data-tab="team-stats">Team Stats</button>
        <button class="tab-btn" data-tab="player-stats">Player Stats</button>
    `;
    
    // Create content container for tabs
    const contentContainer = document.createElement('div');
    contentContainer.className = 'popup-content';
    
    // Create box score content (initially visible)
    const boxScoreContent = document.createElement('div');
    boxScoreContent.className = 'tab-content active';
    boxScoreContent.id = 'box-score';
    
    // Create box score table (quarters/periods scoring)
    const boxScoreTable = document.createElement('table');
    boxScoreTable.className = 'box-score-table';
    
    // Get periods data if available
    let periods = [];
    let homeLinescores = [];
    let awayLinescores = [];
    
    if (gameState !== 'pre' && game.competitions[0].competitors[0].linescores) {
        homeLinescores = homeTeam.linescores || [];
        awayLinescores = awayTeam.linescores || [];
        periods = homeLinescores.map(line => line.period);
    }
    
    // Create box score header
    let boxScoreHeader = '<tr><th>Team</th>';
    
    // If we have period scores
    if (periods.length > 0) {
        periods.forEach(period => {
            boxScoreHeader += `<th>${period <= 4 ? period : 'OT' + (period - 4)}</th>`;
        });
        boxScoreHeader += '<th>Total</th></tr>';
        
        // Away team row
        let awayRow = `<tr><td>${awayTeam.team.abbreviation}</td>`;
        awayLinescores.forEach(period => {
            awayRow += `<td>${period.value}</td>`;
        });
        awayRow += `<td>${awayTeam.score}</td></tr>`;
        
        // Home team row
        let homeRow = `<tr><td>${homeTeam.team.abbreviation}</td>`;
        homeLinescores.forEach(period => {
            homeRow += `<td>${period.value}</td>`;
        });
        homeRow += `<td>${homeTeam.score}</td></tr>`;
        
        boxScoreTable.innerHTML = boxScoreHeader + awayRow + homeRow;
    } else {
        boxScoreTable.innerHTML = `<tr><td>Game has not started yet</td></tr>`;
    }
    
    boxScoreContent.appendChild(boxScoreTable);
    
    // Create team stats content
    const teamStatsContent = document.createElement('div');
    teamStatsContent.className = 'tab-content';
    teamStatsContent.id = 'team-stats';
    
    // Populate team stats if game has stats
    if (gameState !== 'pre') {
        const statsTable = document.createElement('table');
        statsTable.className = 'stats-table';
        
        let statsHeader = '<tr><th>Stat</th>';
        statsHeader += `<th>${awayTeam.team.abbreviation}</th>`;
        statsHeader += `<th>${homeTeam.team.abbreviation}</th></tr>`;
        
        let statsRows = '';
        
        // Common team stats to display with their exact API names
        const statCategories = [
            { name: 'Field Goal %', key: 'fieldGoalPct' },
            { name: '3-Point %', key: 'threePointPct' },
            { name: 'Free Throw %', key: 'freeThrowPct' },
            { name: 'Rebounds', key: 'rebounds' },
            { name: 'Assists', key: 'assists' }
        ];
        
        // Loop through each stat category and create rows
        statCategories.forEach(category => {
            const awayStat = awayTeam.statistics?.find(s => s.name === category.key)?.displayValue || '-';
            const homeStat = homeTeam.statistics?.find(s => s.name === category.key)?.displayValue || '-';
            
            statsRows += `
                <tr>
                    <td>${category.name}</td>
                    <td>${awayStat}</td>
                    <td>${homeStat}</td>
                </tr>
            `;
        });
        
        statsTable.innerHTML = statsHeader + statsRows;
        teamStatsContent.appendChild(statsTable);
    } else {
        teamStatsContent.innerHTML = '<p class="no-data-message">Team stats will be available once the game starts.</p>';
    }
    
    // Create player stats content
    const playerStatsContent = document.createElement('div');
    playerStatsContent.className = 'tab-content';
    playerStatsContent.id = 'player-stats';
    
    // Populate player stats if available
    if (gameState !== 'pre' && game.competitions[0].competitors[0].leaders) {
        // Create player leaders section
        const createLeadersSection = (team) => {
            const section = document.createElement('div');
            section.className = 'team-leaders';
            
            const teamHeader = document.createElement('h4');
            teamHeader.textContent = team.team.displayName + ' Leaders';
            section.appendChild(teamHeader);
            
            if (team.leaders && team.leaders.length > 0) {
                const leadersList = document.createElement('ul');
                
                team.leaders.forEach(leaderCategory => {
                    // Skip if the stat name contains "Rating"
                    if (leaderCategory.displayName.includes('Rating')) {
                        return; // Skip this iteration
                    }
                    
                    const leaderItem = document.createElement('li');
                    const leader = leaderCategory.leaders[0]; // Get the top leader
                    const statName = leaderCategory.displayName;
                    const statValue = leader.displayValue;
                    const playerName = leader.athlete?.displayName || 'Unknown Player';
                    
                    leaderItem.innerHTML = `
                        <strong>${statName}:</strong> 
                        ${playerName} - ${statValue}
                    `;
                    
                    leadersList.appendChild(leaderItem);
                });
                
                section.appendChild(leadersList);
            } else {
                section.innerHTML += '<p>No player stats available.</p>';
            }
            
            return section;
        };
        
        // Add both teams' leaders
        playerStatsContent.appendChild(createLeadersSection(awayTeam));
        playerStatsContent.appendChild(createLeadersSection(homeTeam));
    } else {
        playerStatsContent.innerHTML = '<p class="no-data-message">Player stats will be available once the game starts.</p>';
    }
    
    // Add all content sections to container
    contentContainer.appendChild(boxScoreContent);
    contentContainer.appendChild(teamStatsContent);
    contentContainer.appendChild(playerStatsContent);
    
    // Build final popup
    popup.appendChild(closeButton);
    popup.appendChild(header);
    popup.appendChild(tabsContainer);
    popup.appendChild(contentContainer);
    overlay.appendChild(popup);
    
    // Add click event for tabs
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // Remove active class from all tabs/content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            e.target.classList.add('active');
            const tabId = e.target.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        }
    });
    
    // Close when clicking outside the popup
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    // Add popup to page
    document.body.appendChild(overlay);
}