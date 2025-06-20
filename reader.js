const body = document.body;
const chapterFolder = body.getAttribute('data-chapter');
const totalImages = parseInt(body.getAttribute('data-total-images'));
const musicTracks = JSON.parse(body.getAttribute('data-tracks'));

const container = document.getElementById('mangaContainer');
const audio = document.getElementById('music');

for (let i = 1; i <= totalImages; i++) {
  const img = document.createElement('img');
  const imgNum = String(i).padStart(3, '0');
  img.src = `${chapterFolder}/${imgNum}.jpg`;
  img.className = 'manga-img';
  container.appendChild(img);
}

let audioStarted = false;
window.addEventListener('scroll', () => {

  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const imgs = document.querySelectorAll('.manga-img');

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
