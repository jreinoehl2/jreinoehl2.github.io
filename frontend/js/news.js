// DOM Elements for news
const newsContainer = document.getElementById('news-container');
const newsTitle = document.getElementById('news-title');
const newsContent = document.getElementById('news-content');

// Load news
function loadNews() {
    newsContent.innerHTML = '<div class="loading">Loading news articles...</div>';
    
    if (currentView === 'mens') {
        fetchMensNews();
    } else {
        fetchWomensNews();
    }
}

// Show news section
function showNewsSection(title) {
    currentSection = 'news';
    
    hideAllSections();
    if (newsTitle) {
        newsTitle.textContent = title || 'Basketball News';
    }
    newsContainer.style.display = 'block';
    resetNavigation();
    document.querySelector('.dropdown-toggle').classList.add('active');
    
    updateToggleButtons();
}

// Hide news section
function hideNewsSection() {
    currentSection = 'scores';
    
    newsContainer.style.display = 'none';
    showScoresSection();
}

// Men's news
async function fetchMensNews() {
    try {
        if (newsTitle) {
            newsTitle.textContent = 'Men\'s Basketball News';
        }
        
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news');
        
        if (!response.ok) {
            throw new Error('Failed to fetch men\'s basketball news');
        }
        
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        console.error('Error fetching men\'s news:', error);
    }
}

// Women's news
async function fetchWomensNews() {
    try {
        if (newsTitle) {
            newsTitle.textContent = 'Women\'s Basketball News';
        }
        
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/news');
        
        if (!response.ok) {
            throw new Error('Failed to fetch women\'s basketball news');
        }
        
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        console.error('Error fetching women\'s news:', error);
    }
}

// Display news articles
function displayNews(articles) {
    newsContent.innerHTML = '';
    
    if (!articles || articles.length === 0) {
        newsContent.innerHTML = '<div class="loading">No news articles available.</div>';
        return;
    }
    
    articles.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'news-card';
        
        // Format the date
        const publishDate = new Date(article.published);
        const formattedDate = publishDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Get first image if available
        const imageUrl = article.images && article.images.length > 0 
            ? article.images[0].url 
            : 'https://a.espncdn.com/combiner/i?img=/i/espn/misc_logos/500/ncb.png';
        
        // Create HTML for article card
        articleCard.innerHTML = `
            <div class="news-header">
                <h3 class="news-title">${article.headline}</h3>
                <span class="news-date">${formattedDate}</span>
            </div>
            <div class="news-image">
                <img src="${imageUrl}" alt="${article.headline}">
            </div>
            <div class="news-description">
                <p>${article.description || article.headline}</p>
            </div>
            <a href="${article.links.web.href}" class="news-link" target="_blank">Read full article</a>
        `;
        
        newsContent.appendChild(articleCard);
    });
}