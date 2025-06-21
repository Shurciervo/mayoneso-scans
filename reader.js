const body = document.body;
const chapterFolder = body.getAttribute('data-chapter');
const fanartFolder = body.getAttribute('data-fanart-folder');
const infoFolder = body.getAttribute('data-info-folder');

const totalFanarts = parseInt(body.getAttribute('data-total-fanart'));
const totalPages = parseInt(body.getAttribute('data-total-pages'));
const totalInfo = parseInt(body.getAttribute('data-total-info'));
const totalVideos = parseInt(body.getAttribute('data-total-videos'));

const musicTracks = JSON.parse(body.getAttribute('data-tracks'));

const container = document.getElementById('mangaContainer');
const audio = document.getElementById('music');

function loadImages(folder, count, cssClass) {
  for (let i = 1; i <= count; i++) {
    const img = document.createElement('img');
    const imgNum = String(i).padStart(3, '0');
    img.src = `${folder}/${imgNum}.png`;
    img.className = `manga-img ${cssClass}`;
    container.appendChild(img);
  }
}

function loadVideos(folder, count, cssClass) {
  for (let i = 1; i <= count; i++) {
    const video = document.createElement('video');
    const vidNum = String(i).padStart(3, '0');
    video.src = `${folder}/${vidNum}.mp4`;
    video.className = `manga-video ${cssClass}`;
    video.controls = true;
    video.style.margin = '20px 0';
    video.style.maxWidth = '100%';
    video.style.display = 'block';
    video.muted = true; // Necesario para autoplay en algunos navegadores

    container.appendChild(video);
  }

  // 👇 Esto activa el autoplay por scroll
  setupVideoAutoplay();
}

function setupVideoAutoplay() {
  const videos = document.querySelectorAll('.info-video');

  videos.forEach(video => {
    video.muted = false;      // sin mute
    video.volume = 1.0;       // volumen máximo
    video.playsInline = true; // para móviles
    video.autoplay = true;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {
          // Si autoplay falla (por políticas del navegador), muteamos y reproducimos:
          video.muted = true;
          video.play();
        });
      } else {
        video.pause();
      }
    });
  }, {
    threshold: 0.5
  });

  videos.forEach(video => observer.observe(video));
}

// Cargar imágenes y videos
loadImages(fanartFolder, totalFanarts, 'fanart-img');
loadImages(chapterFolder, totalPages, 'chapter-img');
loadImages(infoFolder, totalInfo, 'info-img');
loadVideos(infoFolder, totalVideos, 'info-video');

let extraMusicStarted = false;

// ——— NUEVAS FUNCIONES DE FADE ———
let isFading = false;

function fadeOut(audio, duration = 2000) {
  return new Promise(resolve => {
    const stepTime = 50;
    const steps = duration / stepTime;
    const volumeStep = audio.volume / steps;

    const fade = setInterval(() => {
      if (audio.volume - volumeStep > 0) {
        audio.volume = Math.max(0, audio.volume - volumeStep);
      } else {
        audio.volume = 0;
        clearInterval(fade);
        resolve();
      }
    }, stepTime);
  });
}

function fadeIn(audio, targetVolume = 0.1, duration = 2000) {
  return new Promise(resolve => {
    const stepTime = 50;
    const steps = duration / stepTime;
    const volumeStep = targetVolume / steps;

    audio.volume = 0;
    audio.play();

    const fade = setInterval(() => {
      if (audio.volume + volumeStep < targetVolume) {
        audio.volume = Math.min(targetVolume, audio.volume + volumeStep);
      } else {
        audio.volume = targetVolume;
        clearInterval(fade);
        resolve();
      }
    }, stepTime);
  });
}

async function changeTrackWithFade(newTrack) {
  if (isFading) return;
  isFading = true;

  if (!audio.paused) {
    await fadeOut(audio, 2000);
  }

  audio.src = newTrack;
  audio.currentTime = 0;
  audio.loop = !(
    newTrack.includes('title.mp3') || newTrack.includes('tobecontinued.mp3')
  );

  await fadeIn(audio, 0.1, 2000);

  isFading = false;
}

// EVENTO SCROLL para manejar música y extras
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;

  // Detectar si entró en los extras
  if (!extraMusicStarted) {
    const firstInfoImg = document.querySelector('.info-img');
    if (firstInfoImg && firstInfoImg.offsetTop < scrollY + windowHeight / 2) {
      audio.pause();
      audio.currentTime = 0;

      audio.src = 'music/tobecontinued.mp3';
      audio.volume = 0.1;
      audio.loop = false;
      audio.play();

      extraMusicStarted = true;
      return;
    }
  }

  if (extraMusicStarted) return;

  // Lógica para reproducir música según página
  const imgs = document.querySelectorAll('.chapter-img');

  for (let i = musicTracks.length - 1; i >= 0; i--) {
    const startAt = musicTracks[i].startAt;
    const lowerIndex = Math.floor(startAt);
    const upperIndex = Math.ceil(startAt);

    const lowerImg = imgs[lowerIndex];
    const upperImg = imgs[upperIndex];

    if (!lowerImg || !upperImg) continue;

    const lowerTop = lowerImg.offsetTop;
    const upperTop = upperImg.offsetTop;
    const ratio = startAt - lowerIndex;

    const triggerPoint = lowerTop + (upperTop - lowerTop) * ratio;

    if (triggerPoint < scrollY + windowHeight / 2) {
      const currentTrack = musicTracks[i].track;

      if (!audio.src.includes(currentTrack)) {
        changeTrackWithFade(currentTrack);
      }

      break;
    }
  }
});

// ——— NUEVO: Función para crear botones Anterior / Siguiente más bonitos ———
function createChapterNavigation() {
  const chapterStr = chapterFolder; // ej: "chapter1130"
  const chapterNum = parseInt(chapterStr.replace('chapter', ''), 10);
  if (isNaN(chapterNum)) return;

  const prevChapter = chapterNum - 1;
  const nextChapter = chapterNum + 1;

  const navDiv = document.createElement('div');
  navDiv.id = 'chapter-navigation';
  navDiv.style.display = 'flex';
  navDiv.style.justifyContent = 'center';
  navDiv.style.gap = '40px';
  navDiv.style.margin = '30px 0';
  navDiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

  function createButton(href, arrow, label, chapterNumber, isPrev) {
    const btn = document.createElement('a');
    btn.href = href;
    btn.style.textDecoration = 'none';
    btn.style.color = '#f0f0f0';
    btn.style.display = 'flex';
    btn.style.flexDirection = 'column';
    btn.style.alignItems = 'center';
    btn.style.padding = '12px 24px';
    btn.style.backgroundColor = '#1e1e1e';
    btn.style.borderRadius = '10px';
    btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)';
    btn.style.transition = 'background-color 0.3s, color 0.3s';
    btn.style.width = '90px';
    btn.style.cursor = 'pointer';

    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#333';
      btn.style.color = '#fff';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#1e1e1e';
      btn.style.color = '#f0f0f0';
    });

    // Contenedor horizontal para flecha + texto
    const textWithArrow = document.createElement('div');
    textWithArrow.style.display = 'flex';
    textWithArrow.style.alignItems = 'center';
    textWithArrow.style.gap = '6px'; // espacio entre flecha y texto
    textWithArrow.style.fontWeight = '600';
    textWithArrow.style.fontSize = '16px';

    const arrowSpan = document.createElement('span');
    arrowSpan.textContent = arrow;
    arrowSpan.style.fontSize = '24px';
    arrowSpan.style.fontWeight = '700';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;

    // Orden según si es previo o siguiente
    if (isPrev) {
      textWithArrow.appendChild(arrowSpan);
      textWithArrow.appendChild(labelSpan);
    } else {
      textWithArrow.appendChild(labelSpan);
      textWithArrow.appendChild(arrowSpan);
    }

    const chapterSpan = document.createElement('span');
    chapterSpan.textContent = `Capítulo ${chapterNumber}`;
    chapterSpan.style.fontSize = '12px';
    chapterSpan.style.color = '#aaa';
    chapterSpan.style.marginTop = '4px';

    btn.appendChild(textWithArrow);
    btn.appendChild(chapterSpan);

    return btn;
  }

  const prevBtn = createButton(`chapter${prevChapter}.html`, '←', 'Anterior', prevChapter, true);
  const nextBtn = createButton(`chapter${nextChapter}.html`, '→', 'Siguiente', nextChapter, false);

  navDiv.appendChild(prevBtn);
  navDiv.appendChild(nextBtn);

  container.appendChild(navDiv);
}

window.addEventListener('load', () => {
  createChapterNavigation();
});
