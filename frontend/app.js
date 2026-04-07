const apiBase = 'http://localhost:8000';

async function fetchMudras() {
  const res = await fetch(`${apiBase}/mudras`);
  if (!res.ok) {
    throw new Error(`Failed to load mudras: ${res.status}`);
  }
  return res.json();
}

async function recommend() {
  const goal = document.getElementById('goal').value;
  const result = document.getElementById('recommendation-result');
  result.innerHTML = '';

  try {
    const res = await fetch(`${apiBase}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });

    if (!res.ok) {
      const body = await res.json();
      result.textContent = body.detail || 'Recommendation failed.';
      return;
    }

    const mudras = await res.json();
    mudras.forEach(m => {
      const card = document.createElement('div');
      card.className = 'mudra-item';
      card.innerHTML = `<strong>${m.name}</strong><p>${m.meaning}</p><em>Benefits: ${m.benefits.join(', ')}</em>`;
      result.appendChild(card);
    });
  } catch (error) {
    result.textContent = `Recommendation error: ${error.message}`;
  }
}

async function detect() {
  const hint = document.getElementById('hint').value;
  const result = document.getElementById('detection-result');
  result.innerHTML = '';

  try {
    const res = await fetch(`${apiBase}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gesture_hint: hint }),
    });

    if (!res.ok) {
      const body = await res.json();
      result.textContent = body.detail || 'Detection failed.';
      return;
    }

    const payload = await res.json();
    result.innerHTML = `<strong>Detected:</strong> ${payload.mudra} <br /><strong>Confidence:</strong> ${payload.confidence}`;
  } catch (error) {
    result.textContent = `Detection error: ${error.message}`;
  }
}

async function loadMudras() {
  const mudraList = document.getElementById('mudra-list');
  const mudras = await fetchMudras();
  mudras.forEach(m => {
    const card = document.createElement('div');
    card.className = 'mudra-item';
    card.innerHTML = `<strong>${m.name}</strong> — ${m.meaning}<br/><small>Benefits: ${m.benefits.join(', ')}</small>`;
    mudraList.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('recommend').addEventListener('click', recommend);
  document.getElementById('detect').addEventListener('click', detect);
  loadMudras();
});
