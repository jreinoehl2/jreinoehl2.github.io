// DOM Elements for rankings
const rankingsContainer = document.getElementById('rankings-container');
const rankingsContent = document.getElementById('rankings-content');

// Show rankings section
function showRankingsSection() {
    currentSection = 'rankings'; // Make sure this line exists
    hideAllSections();
    rankingsContainer.style.display = 'block';
    
    resetNavigation();
    document.getElementById('rankings-link').classList.add('active');
    
    // Load rankings based on currently selected sport
    loadCurrentRankings();
}

// Hide rankings section
function hideRankingsSection() {
    rankingsContainer.style.display = 'none';
    showScoresSection();
}

// Determine which rankings to show based on current sport selection
function loadCurrentRankings() {
    // Clear previous content
    rankingsContent.innerHTML = '<div class="loading">Loading rankings...</div>';
    
    // Log current view for debugging
    console.log('Loading rankings for:', currentView);
    
    // Check which sport is currently active
    switch(currentView) {
        case 'mens':
            fetchMensRankings();
            break;
        case 'womens':
            fetchWomensRankings();
            break;
        case 'nba':
            fetchNBARankings();
            break;
        case 'wnba':
            fetchWNBARankings();
            break;
        default:
            // Default to NBA rankings if sport isn't specified or if "all" is selected
            fetchNBARankings();
    }
}

// Fetch men's rankings
async function fetchMensRankings() {
    try {
        const response = await fetch('https://ncaa-api.henrygd.me/rankings/basketball-men/d1/associated-press');
        
        if (!response.ok) {
            throw new Error('Failed to fetch men\'s basketball rankings');
        }
        
        const data = await response.json();
        displayRankings(data, 'Men\'s Basketball Rankings');
    } catch (error) {
        console.error('Error fetching men\'s rankings:', error);
        rankingsContent.innerHTML = '<div class="error-message">Error loading rankings. Please try again later.</div>';
    }
}

// Fetch women's rankings
async function fetchWomensRankings() {
    try {
        const response = await fetch('https://ncaa-api.henrygd.me/rankings/basketball-women/d1/associated-press');
        
        if (!response.ok) {
            throw new Error('Failed to fetch women\'s basketball rankings');
        }
        
        const data = await response.json();
        displayRankings(data, 'Women\'s Basketball Rankings');
    } catch (error) {
        console.error('Error fetching women\'s rankings:', error);
        rankingsContent.innerHTML = '<div class="error-message">Error loading rankings. Please try again later.</div>';
    }
}

// Fetch NBA rankings
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

// Fetch WNBA rankings
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

// Display rankings
function displayRankings(data, title) {
    rankingsContent.innerHTML = '';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    rankingsContent.appendChild(titleElement);
    
    // Check for rankings
    if (!data || !data.rankings || data.rankings.length === 0) {
        rankingsContent.innerHTML += '<div class="error-message">No rankings data available at this time.</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'rankings-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Record</th>
            <th>Points</th>
            <th>Previous</th>
        </tr>
    `;
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    data.rankings.forEach(team => {
        const row = document.createElement('tr');
        
        let rankChangeIcon = '';
        let rankChangeClass = '';
        
        // Fill row with team data
        row.innerHTML = `
            <td class="rank">${team.rank}</td>
            <td class="team-name">
                <span>${team.school}</span>
            </td>
            <td class="record">${team.record || 'N/A'}</td>
            <td class="points">${team.points || 'N/A'}</td>
            <td class="previous ${rankChangeClass}">
                ${team.previous || 'NR'} ${rankChangeIcon}
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    rankingsContent.appendChild(table);
    
    // Add last updated info if available
    if (data.updated) {
        const lastUpdated = document.createElement('div');
        lastUpdated.className = 'last-updated';
        lastUpdated.textContent = `Last updated: ${new Date(data.updated).toLocaleDateString()}`;
        rankingsContent.appendChild(lastUpdated);
    }
}

// Display NBA rankings
function displayNBARankings(data) {
    rankingsContent.innerHTML = '';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = 'NBA Standings';
    rankingsContent.appendChild(titleElement);
    
    if (!data || !data.children || data.children.length === 0) {
        rankingsContent.innerHTML += '<div class="error-message">No NBA standings data available at this time.</div>';
        return;
    }
    
    // Create a table for each conference
    data.children.forEach(conference => {
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
        
        // Sort entries by win percentage
        const sortedEntries = [...conference.standings.entries].sort((a, b) => {
            const pctA = a.stats.find(stat => stat.name === "winPercent")?.value || 0;
            const pctB = b.stats.find(stat => stat.name === "winPercent")?.value || 0;
            return pctB - pctA; // Higher percentage comes first
        });
        
        sortedEntries.forEach(team => {
            const row = document.createElement('tr');
            
            // Get the stats from the API response
            const wins = team.stats.find(stat => stat.name === "wins")?.value || 0;
            const losses = team.stats.find(stat => stat.name === "losses")?.value || 0;
            const winPercent = team.stats.find(stat => stat.name === "winPercent")?.displayValue || ".000";
            const gamesBehind = team.stats.find(stat => stat.name === "gamesBehind")?.displayValue || "-";
            const streak = team.stats.find(stat => stat.name === "streak")?.displayValue || "-";
            const seed = team.stats.find(stat => stat.name === "playoffSeed")?.value || "-";
            
            // Fill row with team data
            row.innerHTML = `
                <td class="rank">${seed}</td>
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

// Display WNBA rankings
function displayWNBARankings(data) {
    rankingsContent.innerHTML = '';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = 'WNBA Standings';
    rankingsContent.appendChild(titleElement);
    
    if (!data || !data.children || data.children.length === 0) {
        rankingsContent.innerHTML += '<div class="error-message">No WNBA standings data available at this time.</div>';
        return;
    }
    
    // Create a table for each conference
    data.children.forEach(conference => {
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
        
        // Sort entries by win percentage
        const sortedEntries = [...conference.standings.entries].sort((a, b) => {
            const pctA = a.stats.find(stat => stat.name === "winPercent")?.value || 0;
            const pctB = b.stats.find(stat => stat.name === "winPercent")?.value || 0;
            return pctB - pctA; // Higher percentage comes first
        });
        
        sortedEntries.forEach(team => {
            const row = document.createElement('tr');
            
            // Get the stats from the API response
            const wins = team.stats.find(stat => stat.name === "wins")?.value || 0;
            const losses = team.stats.find(stat => stat.name === "losses")?.value || 0;
            const winPercent = team.stats.find(stat => stat.name === "winPercent")?.displayValue || ".000";
            const gamesBehind = team.stats.find(stat => stat.name === "gamesBehind")?.displayValue || "-";
            const streak = team.stats.find(stat => stat.name === "streak")?.displayValue || "-";
            const seed = team.stats.find(stat => stat.name === "playoffSeed")?.value || "-";
            
            // Fill row with team data
            row.innerHTML = `
                <td class="rank">${seed}</td>
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

// Add event listeners for header buttons to update rankings
document.addEventListener('DOMContentLoaded', () => {
    // Get header toggle buttons
    const allBtn = document.getElementById('all-btn');
    const nbaBtn = document.getElementById('nba-btn');
    const wnbaBtn = document.getElementById('wnba-btn');
    const mensBtn = document.getElementById('mens-btn');
    const womensBtn = document.getElementById('womens-btn');
    
    // Add click event listeners to update rankings when buttons are clicked
    allBtn.addEventListener('click', () => {
        if (currentSection === 'rankings') {
            loadCurrentRankings();
        }
    });
    
    nbaBtn.addEventListener('click', () => {
        if (currentSection === 'rankings') {
            currentView = 'nba';
            loadCurrentRankings();
        }
    });
    
    wnbaBtn.addEventListener('click', () => {
        if (currentSection === 'rankings') {
            currentView = 'wnba';
            loadCurrentRankings();
        }
    });
    
    mensBtn.addEventListener('click', () => {
        if (currentSection === 'rankings') {
            currentView = 'mens';
            loadCurrentRankings();
        }
    });
    
    womensBtn.addEventListener('click', () => {
        if (currentSection === 'rankings') {
            currentView = 'womens';
            loadCurrentRankings();
        }
    });
});