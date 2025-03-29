// DOM Elements for rankings
const rankingsContainer = document.getElementById('rankings-container');
const rankingsContent = document.getElementById('rankings-content');

// Show rankings section
function showRankingsSection() {
    hideAllSections();
    rankingsContainer.style.display = 'block';
    
    resetNavigation();
    document.getElementById('rankings-link').classList.add('active');
}

// Hide rankings section
function hideRankingsSection() {
    rankingsContainer.style.display = 'none';
    showScoresSection();
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