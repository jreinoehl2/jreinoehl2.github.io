from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Cache directory
CACHE_DIR = 'cache'
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# Cache expiration (seconds)
CACHE_EXPIRATION = 300  # 5 minutes

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/scores/<league>')
def scores(league):
    date_str = request.args.get('date', datetime.now().strftime('%Y%m%d'))
    
    # Check cache first
    cache_file = os.path.join(CACHE_DIR, f'scores_{league}_{date_str}.json')
    if os.path.exists(cache_file):
        cache_time = os.path.getmtime(cache_file)
        if datetime.now().timestamp() - cache_time < CACHE_EXPIRATION:
            with open(cache_file, 'r') as f:
                return jsonify(json.load(f))
    
    # Map league to ESPN endpoint
    league_endpoints = {
        'nba': 'basketball/nba',
        'wnba': 'basketball/wnba',
        'mens-college': 'basketball/mens-college-basketball',
        'womens-college': 'basketball/womens-college-basketball'
    }
    
    if league not in league_endpoints:
        return jsonify({'error': 'Invalid league'}), 400
    
    # Fetch from ESPN API
    url = f'https://site.api.espn.com/apis/site/v2/sports/{league_endpoints[league]}/scoreboard?dates={date_str}'
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from ESPN'}), response.status_code
    
    data = response.json()
    
    # Save to cache
    with open(cache_file, 'w') as f:
        json.dump(data, f)
    
    return jsonify(data)

@app.route('/api/news/<league>')
def news(league):
    # Similar cache and API fetching logic as the scores endpoint
    cache_file = os.path.join(CACHE_DIR, f'news_{league}.json')
    if os.path.exists(cache_file):
        cache_time = os.path.getmtime(cache_file)
        if datetime.now().timestamp() - cache_time < CACHE_EXPIRATION:
            with open(cache_file, 'r') as f:
                return jsonify(json.load(f))
    
    league_endpoints = {
        'nba': 'basketball/nba',
        'wnba': 'basketball/wnba',
        'mens-college': 'basketball/mens-college-basketball',
        'womens-college': 'basketball/womens-college-basketball'
    }
    
    if league not in league_endpoints:
        return jsonify({'error': 'Invalid league'}), 400
    
    url = f'https://site.api.espn.com/apis/site/v2/sports/{league_endpoints[league]}/news'
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch news from ESPN'}), response.status_code
    
    data = response.json()
    
    with open(cache_file, 'w') as f:
        json.dump(data, f)
    
    return jsonify(data)

@app.route('/api/rankings/<league>')
def rankings(league):
    # Similar cache and API fetching logic, different endpoints for rankings/standings
    cache_file = os.path.join(CACHE_DIR, f'rankings_{league}.json')
    if os.path.exists(cache_file):
        cache_time = os.path.getmtime(cache_file)
        if datetime.now().timestamp() - cache_time < CACHE_EXPIRATION:
            with open(cache_file, 'r') as f:
                return jsonify(json.load(f))
    
    url = None
    if league == 'nba' or league == 'wnba':
        url = f'https://site.api.espn.com/apis/v2/sports/basketball/{league}/standings'
    elif league == 'mens-college':
        url = 'https://ncaa-api.henrygd.me/rankings/basketball-men/d1/associated-press'
    
    if not url:
        return jsonify({'error': 'Invalid league or rankings not available'}), 400
    
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch rankings'}), response.status_code
    
    data = response.json()
    
    with open(cache_file, 'w') as f:
        json.dump(data, f)
    
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)