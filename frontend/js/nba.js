// DOM Elements for NBA
const nbaNewsContent = document.getElementById('news-content');

// Fetch NBA scores
async function fetchNBAScores() {
    try {
        const dateStr = formatDateForAPI(currentDate);
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch NBA data');
        }
        
        const data = await response.json();
        displayScores(data.events);
    } catch (error) {
        console.error('Error fetching NBA scores:', error);
        scoresContainer.innerHTML = '<div class="loading">Error loading NBA scores. Please try again later.</div>';
    }
}

// Fetch NBA news
async function fetchNBANews() {
    try {
        if (newsTitle) {
            newsTitle.textContent = 'NBA Basketball News';
        }
        
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news');
        
        if (!response.ok) {
            throw new Error('Failed to fetch NBA basketball news');
        }
        
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        console.error('Error fetching NBA news:', error);
        newsContent.innerHTML = '<div class="error-message">Error loading NBA news. Please try again later.</div>';
    }
}

// Fetch NBA rankings/standings
async function fetchNBARankings() {
    try {
        const response = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/nba/standings');
        
        if (!response.ok) {
            throw new Error('Failed to fetch NBA standings');
        }
        
        const data = await response.json();
        displayNBARankings(data);
    } catch (error) {
        console.error('Error fetching NBA rankings:', error);
        rankingsContent.innerHTML = '<div class="error-message">Error loading NBA standings. Please try again later.</div>';
    }
}

// Display NBA rankings/standings
function displayNBARankings(data) {
    rankingsContent.innerHTML = '';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = 'NBA Standings';
    rankingsContent.appendChild(titleElement);
    
    // Check the actual structure of the data
    if (!data || !data.children || data.children.length === 0) {
        rankingsContent.innerHTML += '<div class="error-message">No NBA standings data available at this time.</div>';
        return;
    }
    
    // Create a table for each conference
    data.children.forEach(conference => {
        if (!conference.standings || !conference.standings.entries) {
            return;
        }
        
        const conferenceTitle = document.createElement('h4');
        conferenceTitle.textContent = conference.name;
        rankingsContent.appendChild(conferenceTitle);
        
        const table = document.createElement('table');
        table.className = 'rankings-table';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>W</th>
                <th>L</th>
                <th>Pct</th>
                <th>GB</th>
                <th>Streak</th>
            </tr>
        `;
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        conference.standings.entries.forEach(team => {
            const row = document.createElement('tr');
            
            // Get the stats from the API response
            const wins = team.stats.find(stat => stat.name === "wins")?.value || 0;
            const losses = team.stats.find(stat => stat.name === "losses")?.value || 0;
            const winPercent = team.stats.find(stat => stat.name === "winPercent")?.displayValue || ".000";
            const gamesBehind = team.stats.find(stat => stat.name === "gamesBehind")?.displayValue || "-";
            const streak = team.stats.find(stat => stat.name === "streak")?.displayValue || "-";
            
            // Fill row with team data
            row.innerHTML = `
                <td class="rank">${team.stats.find(stat => stat.name === "playoffSeed")?.value || "-"}</td>
                <td class="team-name">
                    <img class="team-logo" src="${team.team.logos[0].href}" alt="${team.team.displayName} logo">
                    <span>${team.team.displayName}</span>
                </td>
                <td class="record">${wins}</td>
                <td class="record">${losses}</td>
                <td class="record">${winPercent}</td>
                <td class="record">${gamesBehind}</td>
                <td class="record">${streak}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        rankingsContent.appendChild(table);
    });
}