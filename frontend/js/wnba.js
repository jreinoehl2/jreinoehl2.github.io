// DOM Elements for WNBA
const wnbaNewsContent = document.getElementById('news-content');

// Fetch WNBA scores
async function fetchWNBAScores() {
    try {
        const dateStr = formatDateForAPI(currentDate);
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates=${dateStr}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch WNBA data');
        }
        
        const data = await response.json();
        displayScores(data.events);
    } catch (error) {
        console.error('Error fetching WNBA scores:', error);
        scoresContainer.innerHTML = '<div class="loading">Error loading WNBA scores. Please try again later.</div>';
    }
}

// Fetch WNBA news
async function fetchWNBANews() {
    try {
        if (newsTitle) {
            newsTitle.textContent = 'WNBA Basketball News';
        }
        
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/news');
        
        if (!response.ok) {
            throw new Error('Failed to fetch WNBA basketball news');
        }
        
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        console.error('Error fetching WNBA news:', error);
        newsContent.innerHTML = '<div class="error-message">Error loading WNBA news. Please try again later.</div>';
    }
}

// Fetch WNBA rankings/standings
async function fetchWNBARankings() {
    try {
        const response = await fetch('https://site.api.espn.com/apis/v2/sports/basketball/wnba/standings');
        
        if (!response.ok) {
            throw new Error('Failed to fetch WNBA standings');
        }
        
        const data = await response.json();
        displayWNBARankings(data);
    } catch (error) {
        console.error('Error fetching WNBA rankings:', error);
        rankingsContent.innerHTML = '<div class="error-message">Error loading WNBA standings. Please try again later.</div>';
    }
}

// Display WNBA rankings/standings
function displayWNBARankings(data) {
    rankingsContent.innerHTML = '';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = 'WNBA Standings';
    rankingsContent.appendChild(titleElement);
    
    if (!data || !data.standings || data.standings.length === 0) {
        rankingsContent.innerHTML += '<div class="error-message">No WNBA standings data available at this time.</div>';
        return;
    }
    
    data.standings.forEach(conference => {
        const conferenceTitle = document.createElement('h4');
        conferenceTitle.textContent = conference.name || 'WNBA';
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
        conference.entries.forEach(team => {
            const row = document.createElement('tr');
            
            // Fill row with team data
            row.innerHTML = `
                <td class="rank">${team.position}</td>
                <td class="team-name">
                    <img class="team-logo" src="${team.team.logos[0].href}" alt="${team.team.displayName} logo">
                    <span>${team.team.displayName}</span>
                </td>
                <td class="record">${team.stats.wins}</td>
                <td class="record">${team.stats.losses}</td>
                <td class="record">${team.stats.winPercent}</td>
                <td class="record">${team.stats.gamesBehind || '-'}</td>
                <td class="record">${team.stats.streak}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        rankingsContent.appendChild(table);
    });
}