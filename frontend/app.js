const apiBase = 'http://localhost:8000';
let allMudras = [];
let favorites = JSON.parse(localStorage.getItem('mudraFavorites') || '[]');
let currentMood = null;
let timerInterval = null;
let timeLeft = 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentDifficulty = 'all';

// Initialize dark mode
if (isDarkMode) {
  document.body.classList.add('dark-mode');
  document.getElementById('themeToggle').textContent = '☀️';
}

// Load statistics from localStorage
function loadStats() {
  const stats = JSON.parse(localStorage.getItem('mudraStats') || '{"practiced": 0, "streak": 0, "minutes": 0, "lastPracticeDate": null}');
  return stats;
}

function saveStats(stats) {
  localStorage.setItem('mudraStats', JSON.stringify(stats));
}

function updateStatsDisplay() {
  const stats = loadStats();
  document.getElementById('totalPracticed').textContent = stats.practiced;
  document.getElementById('practiceStreak').textContent = stats.streak;
  document.getElementById('favoritesCount').textContent = favorites.length;
  document.getElementById('totalMinutes').textContent = stats.minutes;
}

async function fetchMudras() {
  const res = await fetch(`${apiBase}/mudras`);
  if (!res.ok) {
    throw new Error(`Failed to load mudras: ${res.status}`);
  }
  return res.json();
}

// Add difficulty levels to mudras (mock data)
function addDifficultyLevels(mudras) {
  const difficulties = {};
  mudras.forEach((m, i) => {
    const levels = ['beginner', 'intermediate', 'advanced'];
    difficulties[m.name] = levels[i % 3];
  });
  return difficulties;
}

async function recommend() {
  const goal = document.getElementById('goal').value;
  const result = document.getElementById('recommendation-result');
  result.innerHTML = '<div style="text-align: center; color: #4ecdc4;">🔄 Finding your perfect mudras...</div>';

  try {
    const res = await fetch(`${apiBase}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });

    if (!res.ok) {
      const body = await res.json();
      result.innerHTML = `<div style="color: #ff6b35;">❌ ${body.detail || 'Recommendation failed.'}</div>`;
      return;
    }

    const mudras = await res.json();
    result.innerHTML = `<div style="color: #4ecdc4; margin-bottom: 15px;">✨ Here are ${mudras.length} mudras for your ${goal} goal:</div>`;
    
    const difficulties = addDifficultyLevels(mudras);
    
    mudras.forEach(m => {
      const card = document.createElement('div');
      card.className = 'mudra-item animate-fade-in';
      const isFavorite = favorites.includes(m.name);
      const difficulty = difficulties[m.name];
      const difficultyClass = `difficulty-${difficulty}`;
      
      card.innerHTML = `
        <strong>${m.name}<span class="difficulty-badge ${difficultyClass}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></strong>
        <p>${m.meaning}</p>
        <em>Benefits: ${m.benefits.join(', ')}</em>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${m.name}')">
          ${isFavorite ? '❤️' : '🤍'} ${isFavorite ? 'Saved' : 'Save'}
        </button>
      `;
      result.appendChild(card);
    });
    
    recordPractice();
  } catch (error) {
    result.innerHTML = `<div style="color: #ff6b35;">❌ Recommendation error: ${error.message}</div>`;
  }
}

async function detect() {
  const hint = document.getElementById('hint').value;
  const result = document.getElementById('detection-result');
  result.innerHTML = '<div style="text-align: center; color: #4ecdc4;">🔍 Analyzing your gesture...</div>';

  try {
    const res = await fetch(`${apiBase}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gesture_hint: hint }),
    });

    if (!res.ok) {
      const body = await res.json();
      result.innerHTML = `<div style="color: #ff6b35;">❌ ${body.detail || 'Detection failed.'}</div>`;
      return;
    }

    const payload = await res.json();
    result.innerHTML = `
      <div style="color: #4ecdc4; font-size: 1.2em;">🎯 Detected: <strong>${payload.mudra}</strong></div>
      <div>Confidence: <strong>${payload.confidence}</strong></div>
      <div style="margin-top: 10px; font-size: 0.9em; color: #6c757d;">
        💡 Try describing the position of your fingers or how it makes you feel!
      </div>
    `;
  } catch (error) {
    result.innerHTML = `<div style="color: #ff6b35;">❌ Detection error: ${error.message}</div>`;
  }
}

function toggleFavorite(mudraName) {
  const index = favorites.indexOf(mudraName);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(mudraName);
  }
  localStorage.setItem('mudraFavorites', JSON.stringify(favorites));
  updateMudraList();
  updateFavoritesList();
  updateStatsDisplay();
}

function updateMudraList(searchTerm = '') {
  const mudraList = document.getElementById('mudra-list');
  mudraList.innerHTML = '';

  const difficulties = addDifficultyLevels(allMudras);

  const filteredMudras = allMudras.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.benefits.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = currentDifficulty === 'all' || difficulties[m.name] === currentDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  if (filteredMudras.length === 0) {
    mudraList.innerHTML = '<p style="text-align: center; color: #999;">No mudras found matching your criteria.</p>';
    return;
  }

  filteredMudras.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mudra-item animate-fade-in';
    const isFavorite = favorites.includes(m.name);
    const difficulty = difficulties[m.name];
    const difficultyClass = `difficulty-${difficulty}`;
    
    card.innerHTML = `
      <strong>${m.name}<span class="difficulty-badge ${difficultyClass}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></strong> — ${m.meaning}<br/>
      <small>Benefits: ${m.benefits.join(', ')}</small>
      <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${m.name}')">
        ${isFavorite ? '❤️' : '🤍'} ${isFavorite ? 'Saved' : 'Save'}
      </button>
    `;
    mudraList.appendChild(card);
  });
}

function updateFavoritesList() {
  const favoritesSection = document.getElementById('favorites-section');
  const favoritesList = document.getElementById('favorites-list');

  if (favorites.length === 0) {
    favoritesSection.style.display = 'none';
    return;
  }

  favoritesSection.style.display = 'block';
  favoritesList.innerHTML = '';

  const difficulties = addDifficultyLevels(allMudras);

  favorites.forEach(name => {
    const mudra = allMudras.find(m => m.name === name);
    if (mudra) {
      const card = document.createElement('div');
      card.className = 'mudra-item animate-fade-in';
      const difficulty = difficulties[mudra.name];
      const difficultyClass = `difficulty-${difficulty}`;
      
      card.innerHTML = `
        <strong>${mudra.name}<span class="difficulty-badge ${difficultyClass}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></strong> — ${mudra.meaning}<br/>
        <small>Benefits: ${mudra.benefits.join(', ')}</small>
        <button class="favorite-btn active" onclick="toggleFavorite('${mudra.name}')">
          ❤️ Remove
        </button>
      `;
      favoritesList.appendChild(card);
    }
  });
}

function handleMoodSelection(event) {
  if (!event.target.classList.contains('mood-btn')) return;

  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  currentMood = event.target.dataset.mood;

  const moodGoals = {
    calm: 'stress',
    energetic: 'energy',
    stressed: 'stress',
    focused: 'focus',
    tired: 'sleep'
  };

  if (moodGoals[currentMood]) {
    document.getElementById('goal').value = moodGoals[currentMood];
  }
}

function showTutorial() {
  const tutorial = `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-top: 15px; font-family: 'Inter', sans-serif;">
      <h3 style="color: #4ecdc4; margin-top: 0; font-family: 'Poppins', sans-serif;">📚 Mudra Basics</h3>
      <p><strong>What are Mudras?</strong> Mudras are symbolic hand gestures used in yoga and meditation to channel energy and promote healing.</p>
      <p><strong>How to Practice:</strong></p>
      <ul>
        <li>Sit comfortably with spine straight</li>
        <li>Place hands on lap or knees</li>
        <li>Hold the mudra for 5-15 minutes while breathing deeply</li>
        <li>Focus on the intention or benefit</li>
      </ul>
      <p><strong>Pro Tips:</strong></p>
      <ul>
        <li>Practice daily for best results</li>
        <li>Combine with deep breathing</li>
        <li>Be patient - effects may take time</li>
        <li>Use our timer feature to maintain proper duration</li>
      </ul>
      <button onclick="this.parentElement.remove()" style="background: #ff6b35; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: 'Poppins', sans-serif;">Got it!</button>
    </div>
  `;

  const result = document.getElementById('recommendation-result');
  result.innerHTML = tutorial;
}

function getDailyMudra() {
  if (allMudras.length === 0) return null;
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return allMudras[seed % allMudras.length];
}

function displayDailySuggestion() {
  const dailyMudra = getDailyMudra();
  if (dailyMudra) {
    const difficulties = addDifficultyLevels(allMudras);
    const difficulty = difficulties[dailyMudra.name];
    document.getElementById('daily-mudra-text').innerHTML = `
      <strong>${dailyMudra.name}</strong> - ${dailyMudra.meaning}<br/>
      <em style="font-size: 0.9em;">Benefits: ${dailyMudra.benefits.join(', ')}</em><br/>
      <span style="display: inline-block; margin-top: 10px; padding: 4px 10px; background: #fff; border-radius: 20px; font-size: 0.85em;">
        📊 ${difficulty} level
      </span>
    `;
  }
}

function recordPractice() {
  const stats = loadStats();
  const today = new Date().toDateString();
  
  if (stats.lastPracticeDate !== today) {
    stats.practiced += 1;
    stats.streak += 1;
    stats.lastPracticeDate = today;
  }
  
  saveStats(stats);
  updateStatsDisplay();
}

function addTimerMinutes(minutes) {
  const stats = loadStats();
  stats.minutes += minutes;
  saveStats(stats);
  updateStatsDisplay();
}

function startTimer() {
  if (timerInterval) return;

  const duration = parseInt(document.getElementById('timer-duration').value) * 60;
  timeLeft = duration;
  
  document.getElementById('start-timer').style.display = 'none';
  document.getElementById('stop-timer').style.display = 'inline-block';
  document.getElementById('timer-duration').disabled = true;

  timerInterval = setInterval(() => {
    timeLeft--;
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById('timer-display').textContent = '⏰ Done!';
      document.getElementById('start-timer').style.display = 'inline-block';
      document.getElementById('stop-timer').style.display = 'none';
      document.getElementById('timer-duration').disabled = false;
      
      const duration = parseInt(document.getElementById('timer-duration').value);
      addTimerMinutes(duration);
      recordPractice();
      
      alert('Great job! Your mudra practice session is complete. 🧘‍♂️');
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  document.getElementById('start-timer').style.display = 'inline-block';
  document.getElementById('stop-timer').style.display = 'none';
  document.getElementById('timer-duration').disabled = false;
  
  const duration = parseInt(document.getElementById('timer-duration').value);
  document.getElementById('timer-display').textContent = `${duration}:00`;
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggle').textContent = '🌙';
  }
}

async function loadMudras() {
  try {
    allMudras = await fetchMudras();
    updateMudraList();
    updateFavoritesList();
    displayDailySuggestion();
    updateStatsDisplay();
  } catch (error) {
    document.getElementById('mudra-list').innerHTML = `<div style="color: #ff6b35;">❌ Failed to load mudras: ${error.message}</div>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('recommend').addEventListener('click', recommend);
  document.getElementById('detect').addEventListener('click', detect);
  document.getElementById('tutorial').addEventListener('click', showTutorial);
  document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
  document.getElementById('start-timer').addEventListener('click', startTimer);
  document.getElementById('stop-timer').addEventListener('click', stopTimer);
  document.getElementById('try-daily').addEventListener('click', () => {
    const dailyMudra = getDailyMudra();
    if (dailyMudra) {
      document.getElementById('goal').value = 'stress';
      document.getElementById('recommend').click();
    }
  });
  
  document.querySelector('.mood-tracker').addEventListener('click', handleMoodSelection);
  document.getElementById('search').addEventListener('input', (e) => updateMudraList(e.target.value));
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentDifficulty = e.target.dataset.filter;
      updateMudraList(document.getElementById('search').value);
    });
  });

  loadMudras();
});
