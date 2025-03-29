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
        scoresContainer.appendChild(gameCard);
    });
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
        scoresContainer.appendChild(gameCard);
    });
}