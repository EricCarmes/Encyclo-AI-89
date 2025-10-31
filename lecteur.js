// ==============================
// Initialisation Plyr
// ==============================
const audio = document.getElementById('audioPlayer');
const player = new Plyr(audio, {
  controls: [
    'play', 'progress', 'current-time', 'duration',
    'mute', 'volume'
  ],
  storage: { enabled: false }
});

// ==============================
// Gestion de la playlist
// ==============================
const links = document.querySelectorAll('#playlist a');
let currentIndex = 0;

function playTrack(index) {
  if (index < 0 || index >= links.length) return;

  links.forEach(a => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });

  const link = links[index];
  link.classList.add('active');
  link.setAttribute('aria-current', 'true');

  player.source = {
    type: 'audio',
    sources: [{ src: link.getAttribute('href'), type: 'audio/mp3' }]
  };

  currentIndex = index;
  player.play();
}

links.forEach((link, index) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    playTrack(index);
  });
});

if (links.length > 0) {
  playTrack(0);
}

player.on('ended', () => {
  if (currentIndex + 1 < links.length) {
    playTrack(currentIndex + 1);
  }
});

// ==============================
// Formatage temps
// ==============================
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// ==============================
// Calcul des durées des pistes
// ==============================
let trackDurations = {};
let totalDuration = 0;

links.forEach((link, i) => {
  const audioTemp = new Audio();
  audioTemp.preload = "metadata";
  audioTemp.src = link.getAttribute('href');

  audioTemp.addEventListener('loadedmetadata', () => {
    const duration = formatTime(audioTemp.duration);

    const span = document.createElement('span');
    span.textContent = ` (${duration})`;
    span.style.fontSize = "0.9em";
    span.style.color = "#555";
    link.parentNode.appendChild(span);

    trackDurations[i] = audioTemp.duration;
    totalDuration = Object.values(trackDurations).reduce((a, b) => a + b, 0);

    updateGlobalInfo();
  });
});

// ==============================
// GROS BOUTON PLAY PERSONNALISÉ
// ==============================
const bigPlayBtn = document.getElementById('bigPlayBtn');

bigPlayBtn.addEventListener('click', () => {
  if (player.playing) {
    player.pause();
    bigPlayBtn.textContent = '▶';
  } else {
    player.play();
    bigPlayBtn.textContent = '❚❚';
  }
});

player.on('play', () => {
  bigPlayBtn.textContent = '❚❚';
});
player.on('pause', () => {
  bigPlayBtn.textContent = '▶';
});

// ==============================
// POTENTIOMÈTRE VITESSE (vertical)
// ==============================
const speedKnob = document.getElementById('speedKnob');
const speedValue = document.getElementById('speedValue');

if (speedKnob) {
  speedKnob.addEventListener('input', () => {
    const val = parseFloat(speedKnob.value);
    player.speed = val;

    let label;
    switch (val.toFixed(2)) {
      case "0.90": label = "--"; break;
      case "0.95": label = "-"; break;
      case "1.00": label = "="; break;
      case "1.05": label = "+"; break;
      case "1.10": label = "++"; break;
      default: label = val.toFixed(2) + "x";
    }
    speedValue.textContent = label;
  });
}

// ==============================
// TEMPS GLOBAL AUDIOBOOK
// ==============================

// Créer et insérer le bloc juste au-dessus de la barre de lecture Plyr
const globalInfo = document.createElement('div');
globalInfo.id = 'globalInfo';
globalInfo.style.textAlign = 'center';
globalInfo.style.margin = '6px 0';
globalInfo.style.fontWeight = 'bold';
globalInfo.style.fontSize = '1.2em';
globalInfo.textContent = "";

const controls = document.querySelector('.plyr__controls');
if (controls && controls.parentNode) {
  controls.parentNode.insertBefore(globalInfo, controls);
}

function updateGlobalInfo() {
  let timeElapsed = 0;
  for (let i = 0; i < currentIndex; i++) {
    timeElapsed += trackDurations[i] || 0;
  }
  timeElapsed += player.currentTime;

  const remaining = totalDuration - timeElapsed;
  if (totalDuration > 0 && !isNaN(remaining)) {
    globalInfo.textContent =
      "⏳ " + formatTime(remaining) +
      " / Total : " + formatTime(totalDuration);
  }
}

player.on('timeupdate', updateGlobalInfo);
