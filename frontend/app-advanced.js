const apiBase = 'http://localhost:8000';
let allMudras = [];
let favorites = JSON.parse(localStorage.getItem('mudraFavorites') || '[]');
let currentMood = null;
let timerInterval = null;
let timeLeft = 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentDifficulty = 'all';
let meditationSessions = JSON.parse(localStorage.getItem('meditationSessions') || '[]');

// Initialize dark mode
if (isDarkMode) {
  document.body.classList.add('dark-mode');
  document.getElementById('themeToggle').textContent = '☀️';
}

// Advanced Statistics
class StatisticsTracker {
  constructor() {
    this.stats = this.loadStats();
  }

  loadStats() {
    return JSON.parse(localStorage.getItem('mudraStats') || '{"practiced": 0, "streak": 0, "minutes": 0, "lastPracticeDate": null, "mostUsedMudra": null, "totalSessions": 0}');
  }

  saveStats() {
    localStorage.setItem('mudraStats', JSON.stringify(this.stats));
  }

  recordSession(mudra, duration, mood) {
    this.stats.practiced++;
    this.stats.minutes += duration;
    this.stats.totalSessions++;
    this.stats.mostUsedMudra = mudra;
    this.stats.lastPracticeDate = new Date().toISOString().split('T')[0];
    
    meditationSessions.push({
      mudra,
      duration,
      mood,
      date: new Date().toISOString(),
    });
    localStorage.setItem('meditationSessions', JSON.stringify(meditationSessions));
    this.saveStats();
  }

  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.stats.lastPracticeDate;
    
    if (!lastDate) {
      this.stats.streak = 1;
    } else if (lastDate === today) {
      // Already practiced today
    } else {
      const lastDateObj = new Date(lastDate);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj - lastDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        this.stats.streak++;
      } else {
        this.stats.streak = 1;
      }
    }
    this.saveStats();
  }
}

const statsTracker = new StatisticsTracker();

// Update stats display
function updateStatsDisplay() {
  const stats = statsTracker.stats;
  document.getElementById('totalPracticed').textContent = stats.practiced;
  document.getElementById('practiceStreak').textContent = stats.streak;
  document.getElementById('favoritesCount').textContent = favorites.length;
  document.getElementById('totalMinutes').textContent = stats.minutes;
  
  if (stats.mostUsedMudra) {
    document.getElementById('mostUsedMudra').textContent = stats.mostUsedMudra;
  }
  if (stats.totalSessions) {
    document.getElementById('totalSessions').textContent = stats.totalSessions;
  }
}

// Load all mudras on page load
async function fetchMudras() {
  try {
    const res = await fetch(`${apiBase}/mudras`);
    if (!res.ok) throw new Error(`Failed to load mudras: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error loading mudras:', error);
    return [];
  }
}

// Display chakras
async function displayChakras() {
  const chakras = await getChakras();
  const chakraInfo = document.getElementById('chakra-info');
  
  const chakraColors = {
    'Root': '#e74c3c',
    'Sacral': '#f39c12',
    'Solar Plexus': '#f1c40f',
    'Heart': '#27ae60',
    'Throat': '#3498db',
    'Third Eye': '#9b59b6',
    'Crown': '#ecf0f1'
  };
  
  chakraInfo.innerHTML = Object.entries(chakras).map(([chakra, mudras]) => `
    <div style="background: ${chakraColors[chakra] || '#3498db'}22; border-left: 4px solid ${chakraColors[chakra] || '#3498db'}; padding: 15px; border-radius: 8px;">
      <h4 style="margin-top: 0; color: ${chakraColors[chakra] || '#3498db'};">${chakra} Chakra</h4>
      <p style="font-size: 0.9em;">${mudras.join(', ')}</p>
    </div>
  `).join('');
}

// Search mudras
async function searchMudras(query) {
  try {
    const res = await fetch(`${apiBase}/mudras/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
}

// Get chakra information
async function getChakras() {
  try {
    const res = await fetch(`${apiBase}/chakras`);
    if (!res.ok) return {};
    return res.json();
  } catch (error) {
    console.error('Error loading chakras:', error);
    return {};
  }
}

// Get stats
async function getStats() {
  try {
    const res = await fetch(`${apiBase}/stats/daily`);
    if (!res.ok) return {};
    return res.json();
  } catch (error) {
    console.error('Error loading stats:', error);
    return {};
  }
}

// Advanced recommendations with mood
async function getAdvancedRecommendations(goal, mood, difficulty = 'all') {
  try {
    const endpoint = difficulty !== 'all' 
      ? `${apiBase}/recommend/advanced?goal=${goal}&mood=${mood}&difficulty=${difficulty}`
      : `${apiBase}/recommend`;
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, mood }),
    });
    
    if (!res.ok) throw new Error('Recommendation failed');
    return res.json();
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Timer functionality
function startTimer() {
  const duration = parseInt(document.getElementById('timer-duration').value);
  timeLeft = duration * 60;
  
  document.getElementById('start-timer').style.display = 'none';
  document.getElementById('stop-timer').style.display = 'inline-block';
  
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById('start-timer').style.display = 'inline-block';
      document.getElementById('stop-timer').style.display = 'none';
      showNotification('Practice session completed! 🎉');
      statsTracker.recordSession('Daily Practice', duration, currentMood || 'neutral');
      updateStatsDisplay();
    }
    timeLeft--;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById('start-timer').style.display = 'inline-block';
  document.getElementById('stop-timer').style.display = 'none';
}

// Display mudras
function displayMudras(mudras) {
  const list = document.getElementById('mudra-list');
  list.innerHTML = mudras.map(mudra => `
    <div class="mudra-item">
      <strong>${mudra.name}</strong>
      <span class="difficulty-badge difficulty-${mudra.difficulty || 'beginner'}">
        ${mudra.difficulty || 'Beginner'}
      </span>
      ${mudra.chakra ? `<div style="font-size: 0.9em; color: #8b5cf6; margin-top: 5px;">🔮 ${mudra.chakra} Chakra</div>` : ''}
      <em>${mudra.meaning}</em>
      <p style="margin: 10px 0; color: #555;">
        <strong>Benefits:</strong> ${mudra.benefits.join(', ')}
      </p>
      ${mudra.instructions ? `<p style="background: #f0f9ff; padding: 8px; border-radius: 6px; font-size: 0.9em;"><strong>How:</strong> ${mudra.instructions}</p>` : ''}
      <p style="font-size: 0.85em; color: #888;">⏱️ ${mudra.duration_minutes} min</p>
      <button class="favorite-btn" onclick="toggleFavorite('${mudra.name}')">⭐ Save</button>
    </div>
  `).join('');
}

// Favorites
function toggleFavorite(mudraName) {
  if (favorites.includes(mudraName)) {
    favorites = favorites.filter(m => m !== mudraName);
  } else {
    favorites.push(mudraName);
  }
  localStorage.setItem('mudraFavorites', JSON.stringify(favorites));
  updateStatsDisplay();
  showFavorites();
}

function showFavorites() {
  const section = document.getElementById('favorites-section');
  const favoritesList = document.getElementById('favorites-list');
  
  if (favorites.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  const favoriteMudras = allMudras.filter(m => favorites.includes(m.name));
  displayMudras(favoriteMudras);
}

// Search functionality
document.addEventListener('DOMContentLoaded', async () => {
  allMudras = await fetchMudras();
  displayMudras(allMudras);
  updateStatsDisplay();
  displayChakras();
  showFavorites();
  
  // Search
  document.getElementById('search').addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length > 1) {
      const results = await searchMudras(query);
      displayMudras(results);
    } else {
      displayMudras(allMudras);
    }
  });
  
  // Recommendations
  document.getElementById('recommend').addEventListener('click', async () => {
    const goal = document.getElementById('goal').value;
    const recommendations = await getAdvancedRecommendations(goal, currentMood, currentDifficulty);
    document.getElementById('recommendation-result').innerHTML = 
      `<strong>Recommended mudras:</strong><br>` + 
      recommendations.map(m => `${m.name} - ${m.meaning}`).join('<br>');
  });
  
  // Mood tracking
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMood = btn.dataset.mood;
    });
  });
  
  // Difficulty filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDifficulty = btn.dataset.filter;
      displayMudras(allMudras.filter(m => 
        currentDifficulty === 'all' || m.difficulty === currentDifficulty
      ));
    });
  });
  
  // Timer
  document.getElementById('start-timer').addEventListener('click', startTimer);
  document.getElementById('stop-timer').addEventListener('click', stopTimer);
  
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    document.getElementById('themeToggle').textContent = isDarkMode ? '☀️' : '🌙';
  });
  
  // Detect mudra
  document.getElementById('detect').addEventListener('click', async () => {
    const hint = document.getElementById('hint').value;
    const res = await fetch(`${apiBase}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gesture_hint: hint }),
    });
    const result = await res.json();
    document.getElementById('detection-result').innerHTML = 
      `<strong>Detected:</strong> ${result.mudra}<br>` +
      `<strong>Meaning:</strong> ${result.details?.meaning}<br>` +
      `<strong>Benefits:</strong> ${result.details?.benefits?.join(', ')}`;
  });
  
  // Daily suggestion
  const randomMudra = allMudras[Math.floor(Math.random() * allMudras.length)];
  document.getElementById('daily-mudra-text').textContent = 
    `${randomMudra.name} - ${randomMudra.meaning}`;
});

function showNotification(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0891b2; color: white; padding: 15px 20px; border-radius: 8px; z-index: 9999;';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}
