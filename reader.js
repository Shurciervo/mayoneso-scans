const musicTracks = [
  { track: 'music/imu.mp3', startAt: 0 },   // desde la imagen 0 (la primera)
  { track: 'music/ono.mp3', startAt: 3 },   // cambia en la página 3
  { track: 'music/saturn.mp3', startAt: 5 } // cambia en la página 5
];

const totalImages = 12;
const container = document.getElementById('mangaContainer');
const audio = document.getElementById('music');

for (let i = 1; i <= totalImages; i++) {
  const img = document.createElement('img');
  const imgNum = String(i).padStart(3, '0'); // 001, 002, etc.
  img.src = `chapter1/${imgNum}.jpg`;
  img.className = 'manga-img';
  container.appendChild(img);
}

let audioStarted = false;
window.addEventListener('scroll', () => {
  if (!audioStarted) {
    audio.play().catch(err => console.log('Autoplay bloqueado'));
    audioStarted = true;
  }

  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const imgs = document.querySelectorAll('.manga-img');

  for (let i = musicTracks.length - 1; i >= 0; i--) {
    const triggerImg = imgs[musicTracks[i].startAt];
    if (triggerImg && triggerImg.offsetTop < scrollY + windowHeight / 2) {
      if (!audio.src.includes(musicTracks[i].track)) {
        audio.src = musicTracks[i].track;
        audio.loop = true;       // Que la canción se repita
        audio.volume = 0.1;      // Volumen bajo
        audio.play();
      }
      break;
    }
  }
});
