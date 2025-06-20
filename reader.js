const body = document.body;
const chapterFolder = body.getAttribute('data-chapter');
const fanartFolder = body.getAttribute('data-fanart-folder');
const infoFolder = body.getAttribute('data-info-folder');

const totalFanarts = parseInt(body.getAttribute('data-total-fanart'));
const totalPages = parseInt(body.getAttribute('data-total-pages'));
const totalInfo = parseInt(body.getAttribute('data-total-info'));

const musicTracks = JSON.parse(body.getAttribute('data-tracks'));

const container = document.getElementById('mangaContainer');
const audio = document.getElementById('music');

function loadImages(folder, count, cssClass) {
  for (let i = 1; i <= count; i++) {
    const img = document.createElement('img');
    const imgNum = String(i).padStart(3, '0');
    img.src = `${folder}/${imgNum}.png`;
    img.className = cssClass;
    container.appendChild(img);
  }
}

// Primero fanarts
loadImages(fanartFolder, totalFanarts, 'fanart-img');

// Luego páginas del capítulo
loadImages(chapterFolder, totalPages, 'chapter-img');

// Finalmente info extra del capítulo
loadImages(infoFolder, totalInfo, 'info-img');

let audioStarted = false;
window.addEventListener('scroll', () => {

  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const imgs = document.querySelectorAll('.chapter-img');

  for (let i = musicTracks.length - 1; i >= 0; i--) {
    const triggerImg = imgs[musicTracks[i].startAt];
    if (triggerImg && triggerImg.offsetTop < scrollY + windowHeight / 2) {
      if (!audio.src.includes(musicTracks[i].track)) {
        audio.src = musicTracks[i].track;
        audio.volume = 0.1;
        audio.loop = true;
        audio.play();
      }
      break;
    }
  }
});
