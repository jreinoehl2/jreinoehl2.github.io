// DOM Elements
const allBtn = document.getElementById('all-btn');
const nbaBtn = document.getElementById('nba-btn');
const wnbaBtn = document.getElementById('wnba-btn');
const mensBtn = document.getElementById('mens-btn');
const womensBtn = document.getElementById('womens-btn');
const prevDayBtn = document.getElementById('prev-day');
const nextDayBtn = document.getElementById('next-day');
const calendar = new Calendar();

// News link elements
const nbaNewsLink = document.getElementById('nba-news');
const wnbaNewsLink = document.getElementById('wnba-news');
const mensNewsLink = document.getElementById('mens-news');
const womensNewsLink = document.getElementById('womens-news');

// League toggle elements in dropdown menu
const nbaToggle = document.getElementById('nba-toggle');
const wnbaToggle = document.getElementById('wnba-toggle');
const mensCollegeToggle = document.getElementById('mens-college-toggle');
const womensCollegeToggle = document.getElementById('womens-college-toggle');
const allLeaguesToggle = document.getElementById('all-leagues-toggle');

const rankingsLink = document.getElementById('rankings-link');
const backToScoresBtn = document.getElementById('back-to-scores');
const backFromRankingsBtn = document.getElementById('back-from-rankings');

// Stats elements
const statsContainer = document.getElementById('stats-container');
const statsLinks = document.querySelectorAll('.dropdown:last-child .dropdown-menu a');
const backFromStatsBtn = document.getElementById('back-from-stats');

// Event Listeners for scores view
allBtn.addEventListener('click', () => {
    setActiveView('all');
});
nbaBtn.addEventListener('click', () => {
    setActiveView('nba');
});
wnbaBtn.addEventListener('click', () => {
    setActiveView('wnba');
});
mensBtn.addEventListener('click', () => {
    setActiveView('mens');
});
womensBtn.addEventListener('click', () => {
    setActiveView('womens');
});
prevDayBtn.addEventListener('click', () => {
    changeDate(-1);
});
nextDayBtn.addEventListener('click', () => {
    changeDate(1);
});

// Add event listeners for league toggles
nbaToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveView('nba');
});
wnbaToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveView('wnba');
});
mensCollegeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveView('mens');
});
womensCollegeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveView('womens');
});
allLeaguesToggle.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveView('all');
});

// Event Listeners for news
if (nbaNewsLink) {
    nbaNewsLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentView = 'nba';
        showNewsSection('NBA Basketball News');
        fetchNBANews();
    });
}
if (wnbaNewsLink) {
    wnbaNewsLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentView = 'wnba';
        showNewsSection('WNBA Basketball News');
        fetchWNBANews();
    });
}
if (mensNewsLink) {
    mensNewsLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentView = 'mens';
        showNewsSection('Men\'s Basketball News');
        fetchMensNews();
    });
}
if (womensNewsLink) {
    womensNewsLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentView = 'womens';
        showNewsSection('Women\'s Basketball News');
        fetchWomensNews();
    });
}

// Event Listeners for rankings
if (rankingsLink) {
    rankingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showRankingsSection();
        
        // Fetch the appropriate rankings based on current view
        if (currentView === 'nba') {
            fetchNBARankings();
        } else if (currentView === 'wnba') {
            fetchWNBARankings();
        } else if (currentView === 'mens') {
            fetchMensRankings();
        } else if (currentView === 'womens') {
            // Implement women's college rankings
        } else {
            // For 'all' view, show a combined or tabbed rankings page
            showCombinedRankings();
        }
    });
}

// Back from rankings
if (backFromRankingsBtn) {
    backFromRankingsBtn.addEventListener('click', function() {
        hideRankingsSection();
    });
}

// Event Listeners for stats
statsLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        showStatsSection();
    });
});

// Back from stats
if (backFromStatsBtn) {
    backFromStatsBtn.addEventListener('click', function() {
        hideStatsSection();
    });
}

// Back to scores
if (backToScoresBtn) {
    backToScoresBtn.addEventListener('click', function() {
        hideNewsSection();
    });
}

// Set active view
function setActiveView(view) {
    currentView = view;
    updateToggleButtons();
    if (currentSection === 'scores') {
        loadScores();
    } else if (currentSection === 'news') {
        loadNews();
    }
}

// Show stats section with "not available" message
function showStatsSection() {
    hideAllSections();
    statsContainer.style.display = 'block';
    resetNavigation();
    document.querySelector('.nav-links .dropdown:last-child > a').classList.add('active');
}

// Hide stats section
function hideStatsSection() {
    statsContainer.style.display = 'none';
    showScoresSection();
}

// Function to show combined rankings with tabs
function showCombinedRankings() {
    rankingsContent.innerHTML = `
        <div class="rankings-tabs">
            <button class="tab-btn active" data-league="nba">NBA</button>
            <button class="tab-btn" data-league="wnba">WNBA</button>
            <button class="tab-btn" data-league="mens">Men's College</button>
            <button class="tab-btn" data-league="womens">Women's College</button>
        </div>
        <div id="rankings-tab-content">
            <div class="loading">Loading NBA rankings...</div>
        </div>
    `;
    
    // Add event listeners to tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const rankingsTabContent = document.getElementById('rankings-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show loading
            rankingsTabContent.innerHTML = `<div class="loading">Loading ${this.textContent} rankings...</div>`;
            
            // Fetch appropriate rankings
            const league = this.dataset.league;
            if (league === 'nba') {
                fetchNBARankings();
            } else if (league === 'wnba') {
                fetchWNBARankings();
            } else if (league === 'mens') {
                fetchMensRankings();
            } else if (league === 'womens') {
                // Implement women's college rankings
            }
        });
    });
    
    // Load NBA rankings by default
    fetchNBARankings();
}

// Set up date change callback
calendar.setOnDateSelected((date) => {
    // Format date for display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = formattedDate;
    
    // Get scores for the selected date
    currentDate = date;
    loadScores();
});

// Event listeners for header buttons affecting rankings
document.getElementById('nba-btn').addEventListener('click', () => {
    currentView = 'nba';
    if (currentSection === 'rankings') {
        loadCurrentRankings();
    }
});

document.getElementById('wnba-btn').addEventListener('click', () => {
    currentView = 'wnba';
    if (currentSection === 'rankings') {
        loadCurrentRankings();
    }
});

document.getElementById('mens-btn').addEventListener('click', () => {
    currentView = 'mens';
    if (currentSection === 'rankings') {
        loadCurrentRankings();
    }
});

document.getElementById('womens-btn').addEventListener('click', () => {
    currentView = 'womens';
    if (currentSection === 'rankings') {
        loadCurrentRankings();
    }
});

document.getElementById('all-btn').addEventListener('click', () => {
    currentView = 'all';
    if (currentSection === 'rankings') {
        loadCurrentRankings();
    }
});

function init() {
    updateDateDisplay();
    loadScores();
}

document.addEventListener('DOMContentLoaded', init);

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = document.querySelectorAll('.dropdown');
  
  // Toggle mobile menu
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
  
  // Handle dropdown toggles on mobile
  dropdowns.forEach(dropdown => {
    const toggleLink = dropdown.querySelector('.dropdown-toggle');
    
    if (toggleLink) {
      toggleLink.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        }
      });
    }
  });
});