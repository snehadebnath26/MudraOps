const apiBase = 'http://localhost:8000';
let allMudras = [
  {
    "name": "Gyan Mudra",
    "meaning": "Gesture of knowledge",
    "benefits": ["Improves concentration", "Promotes calm and memory", "Enhances intuition"],
    "duration_minutes": 10,
    "difficulty": "beginner",
    "chakra": "Crown",
    "instructions": "Touch thumb and index finger, keep other fingers extended",
    "image": "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    "name": "Prana Mudra",
    "meaning": "Gesture of life force",
    "benefits": ["Increases energy", "Supports digestion", "Boosts immunity"],
    "duration_minutes": 5,
    "difficulty": "beginner",
    "chakra": "Root",
    "instructions": "Touch thumb, ring, and pinky finger together",
    "image": "https://images.pexels.com/photos/3822417/pexels-photo-3822417.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    "name": "Apana Mudra",
    "meaning": "Gesture of elimination",
    "benefits": ["Cleanses the system", "Supports detoxification", "Aids digestion"],
    "duration_minutes": 15,
    "difficulty": "beginner",
    "chakra": "Sacral",
    "instructions": "Touch thumb with middle and ring finger",
    "image": "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    "name": "Shuni Mudra",
    "meaning": "Gesture of patience",
    "benefits": ["Improves discipline", "Eases anxiety", "Reduces stress"],
    "duration_minutes": 12,
    "difficulty": "beginner",
    "chakra": "Root",
    "instructions": "Touch thumb with middle finger, keep others extended",
    "image": "https://images.pexels.com/photos/3552413/pexels-photo-3552413.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    "name": "Vayu Mudra",
    "meaning": "Gesture of air",
    "benefits": ["Relieves anxiety", "Reduces trembling", "Improves focus"],
    "duration_minutes": 8,
    "difficulty": "intermediate",
    "chakra": "Heart",
    "instructions": "Fold index finger, touch thumb tip with it",
    "image": "https://images.pexels.com/photos/3822719/pexels-photo-3822719.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];
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
  // Return static data instead of API call
  return allMudras;
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

function getMudraImage(mudra) {
  if (mudra.image) {
    return mudra.image;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="26" fill="#93c5fd"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="52">🙏</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function recommend() {
  const goal = document.getElementById('goal').value;
  const result = document.getElementById('recommendation-result');
  result.innerHTML = '<div style="text-align: center; color: #4ecdc4;">🔄 Finding your perfect mudras...</div>';

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Static recommendations based on goal
  const recommendations = {
    "stress": ["Gyan Mudra", "Shuni Mudra", "Vayu Mudra"],
    "focus": ["Gyan Mudra", "Prana Mudra", "Vayu Mudra"],
    "energy": ["Prana Mudra", "Apana Mudra"],
    "digestion": ["Prana Mudra", "Apana Mudra"],
    "sleep": ["Gyan Mudra", "Shuni Mudra"],
    "anxiety": ["Vayu Mudra", "Shuni Mudra"],
    "confidence": ["Prana Mudra", "Apana Mudra"],
    "creativity": ["Gyan Mudra", "Prana Mudra"]
  };

  const mudraNames = recommendations[goal] || ["Gyan Mudra", "Prana Mudra"];
  const mudras = allMudras.filter(m => mudraNames.includes(m.name));

  result.innerHTML = `<div style="color: #4ecdc4; margin-bottom: 15px;">✨ Here are ${mudras.length} mudras for your ${goal} goal:</div>`;

  const difficulties = addDifficultyLevels(mudras);

  mudras.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mudra-item animate-fade-in';
    const isFavorite = favorites.includes(m.name);
    const difficulty = difficulties[m.name];
    const difficultyClass = `difficulty-${difficulty}`;
    const image = getMudraImage(m);

    card.innerHTML = `
      <img class="mudra-image" src="${image}" alt="${m.name}" />
      <strong>${m.name}<span class="difficulty-badge ${difficultyClass}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></strong>
      <p>${m.meaning}</p>
      <em>Benefits: ${m.benefits.join(', ')}</em>
      <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-mudra="${m.name}" onclick="toggleFavorite('${m.name}')">
        ${isFavorite ? '❤️' : '🤍'} ${isFavorite ? 'Saved' : 'Save'}
      </button>
    `;
    result.appendChild(card);
  });

  recordPractice();
}

function showExamples() {
  const result = document.getElementById('detection-result');
  result.innerHTML = '<div style="color: #4ecdc4; margin-bottom: 15px;">🎭 Here are some popular mudras you can try:</div>';

  const examples = allMudras.slice(0, 3); // Show first 3 mudras

  examples.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mudra-item animate-fade-in';
    const isFavorite = favorites.includes(m.name);
    const image = getMudraImage(m);

    card.innerHTML = `
      <img class="mudra-image" src="${image}" alt="${m.name}" />
      <strong>${m.name}</strong> - ${m.meaning}<br/>
      <small>Benefits: ${m.benefits.join(', ')}</small><br/>
      <small><em>Instructions: ${m.instructions}</em></small>
      <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-mudra="${m.name}" onclick="toggleFavorite('${m.name}')">
        ${isFavorite ? '❤️' : '🤍'} ${isFavorite ? 'Saved' : 'Save'}
      </button>
    `;
    result.appendChild(card);
  });
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
  refreshFavoriteButtons(mudraName);
}

function refreshFavoriteButtons(mudraName) {
  const isFavorite = favorites.includes(mudraName);
  document.querySelectorAll(`.favorite-btn[data-mudra="${mudraName}"]`).forEach(button => {
    button.classList.toggle('active', isFavorite);
    button.innerHTML = isFavorite ? '❤️ Saved' : '🤍 Save';
  });
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
    
    const image = getMudraImage(m);
    card.innerHTML = `
      <img class="mudra-image" src="${image}" alt="${m.name}" />
      <strong>${m.name}<span class="difficulty-badge ${difficultyClass}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></strong> — ${m.meaning}<br/>
      <small>Benefits: ${m.benefits.join(', ')}</small>
      <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-mudra="${m.name}" onclick="toggleFavorite('${m.name}')">
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
      
      const image = getMudraImage(mudra);
      card.innerHTML = `
        <img class="mudra-image" src="${image}" alt="${mudra.name}" />
        <strong>${mudra.name}<span class="difficulty-badge ${difficultyClass}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></strong> — ${mudra.meaning}<br/>
        <small>Benefits: ${mudra.benefits.join(', ')}</small>
        <button class="favorite-btn active" data-mudra="${mudra.name}" onclick="toggleFavorite('${mudra.name}')">
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
    const image = getMudraImage(dailyMudra);
    document.getElementById('daily-mudra-text').innerHTML = `
      <img class="mudra-image" src="${image}" alt="${dailyMudra.name}" />
      <strong>${dailyMudra.name}</strong> - ${dailyMudra.meaning}<br/>
      <em style="font-size: 0.9em;">Benefits: ${dailyMudra.benefits.join(', ')}</em><br/>
      <em style="font-size: 0.8em;">Instructions: ${dailyMudra.instructions}</em><br/>
      <span style="display: inline-block; margin-top: 10px; padding: 4px 10px; background: #fff; border-radius: 20px; font-size: 0.85em;">
        📊 ${difficulty} level
      </span>
    `;
  }
}

function populateChakraGuide() {
  const chakraMap = {
    'Root': { color: '#ef4444', description: 'Stability, grounding, and basic survival energy.' },
    'Sacral': { color: '#f97316', description: 'Creativity, emotion, sensuality, and flow.' },
    'Solar Plexus': { color: '#eab308', description: 'Confidence, motivation, and personal power.' },
    'Heart': { color: '#22c55e', description: 'Love, compassion, balance, and healing.' },
    'Throat': { color: '#0ea5e9', description: 'Communication, self-expression, and truth.' },
    'Third Eye': { color: '#8b5cf6', description: 'Intuition, insight, and inner vision.' },
    'Crown': { color: '#6366f1', description: 'Spiritual connection, wisdom, and higher purpose.' }
  };

  const chakraInfo = document.getElementById('chakra-info');
  chakraInfo.innerHTML = '';

  const chakras = Array.from(new Set(allMudras.map(m => m.chakra))).map(chakra => ({
    name: chakra,
    ...chakraMap[chakra] || { color: '#38bdf8', description: 'Supports your energy flow and practice.' }
  }));

  chakras.forEach(chakra => {
    const card = document.createElement('div');
    card.style.padding = '20px';
    card.style.borderRadius = '16px';
    card.style.background = '#ffffff';
    card.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.08)';
    card.style.borderLeft = `6px solid ${chakra.color}`;
    card.innerHTML = `
      <h3 style="margin-top: 0; color: ${chakra.color}; font-family: 'Poppins', sans-serif;">${chakra.name} Chakra</h3>
      <p style="margin: 0.4em 0 0; color: #334155; line-height: 1.6;">${chakra.description}</p>
      <p style="margin: 0.8em 0 0; color: #64748b; font-size: 0.95em;">Mudras for this chakra:</p>
      <ul style="margin: 8px 0 0 18px; color: #334155;">
        ${allMudras.filter(m => m.chakra === chakra.name).map(m => `<li>${m.name} — ${m.meaning}</li>`).join('')}
      </ul>
    `;
    chakraInfo.appendChild(card);
  });
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
    // Use static data instead of API call
    updateMudraList();
    updateFavoritesList();
    updateStatsDisplay();
    displayDailySuggestion();
    populateChakraGuide();
  } catch (error) {
    document.getElementById('mudra-list').innerHTML = `<div style="color: #ff6b35;">❌ Failed to load mudras: ${error.message}</div>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('recommend').addEventListener('click', recommend);
  document.getElementById('show-examples').addEventListener('click', showExamples);
  document.getElementById('tutorial').addEventListener('click', showTutorial);
  document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
  document.getElementById('start-timer').addEventListener('click', startTimer);
  document.getElementById('stop-timer').addEventListener('click', stopTimer);
  
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
