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


// Cargar imágenes
loadImages(fanartFolder, totalFanarts, 'fanart-img');
loadImages(chapterFolder, totalPages, 'chapter-img');
loadImages(infoFolder, totalInfo, 'info-img');
loadVideos(infoFolder, totalVideos, 'info-video');

let extraMusicStarted = false;

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
        audio.pause();
        audio.currentTime = 0;
        audio.src = currentTrack;
        audio.volume = 0.1;

        if (
          currentTrack.includes('title.mp3') ||
          currentTrack.includes('tobecontinued.mp3')
        ) {
          audio.loop = false;
        } else {
          audio.loop = true;
        }

        audio.play();
      }

      break;
    }
  }
});
