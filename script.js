const opening = document.querySelector('#opening');
const openButton = document.querySelector('#openButton');
const bloomButton = document.querySelector('#bloomButton');
const garden = document.querySelector('#garden');
const soundButton = document.querySelector('#soundButton');
const wishFlower = document.querySelector('#wishFlower');
const wishStatus = document.querySelector('#wishStatus');
const nameSection = document.querySelector('#constelacion');
const nameMagic = document.querySelector('#nameMagic');
const nameMessage = document.querySelector('#nameMessage');
const scrollProgress = document.querySelector('#scrollProgress');
const magicCursor = document.querySelector('#magicCursor');
const heroCopy = document.querySelector('.hero-copy');
const canvas = document.querySelector('#sky');
const ctx = canvas.getContext('2d');

let particles = [];
let width = 0;
let height = 0;
let audioContext;
let musicTimer;
let holdingTimer;
let trailTime = 0;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

class Particle {
  constructor(type = 'glow', burst = false) {
    this.type = type;
    this.reset(burst);
  }

  reset(burst = false) {
    this.x = burst ? width / 2 + (Math.random() - .5) * 100 : Math.random() * width;
    this.y = burst ? height * .5 : Math.random() * height;
    this.size = this.type === 'petal' ? 3 + Math.random() * 5 : .7 + Math.random() * 1.7;
    this.speedY = this.type === 'petal' ? .35 + Math.random() * .8 : -.08 - Math.random() * .16;
    this.speedX = burst ? (Math.random() - .5) * 5 : (Math.random() - .5) * .18;
    this.alpha = .18 + Math.random() * .55;
    this.phase = Math.random() * Math.PI * 2;
    this.rotation = Math.random() * Math.PI;
    this.spin = (Math.random() - .5) * .035;
    this.burst = burst;
  }

  update() {
    this.phase += .012;
    this.x += this.speedX + Math.sin(this.phase) * .12;
    this.y += this.speedY;
    this.rotation += this.spin;
    if (this.burst) {
      this.speedY += .035;
      this.alpha -= .004;
    }
    if (this.y < -20 || this.y > height + 20 || this.x < -30 || this.x > width + 30 || this.alpha <= 0) {
      if (this.burst) {
        this.dead = true;
        return;
      }
      this.reset(false);
      if (this.type === 'petal') this.y = -10;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    if (this.type === 'petal') {
      ctx.rotate(this.rotation);
      ctx.fillStyle = '#ffd83f';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * .55, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 5);
      glow.addColorStop(0, '#fff9b0');
      glow.addColorStop(.25, '#ffdc46');
      glow.addColorStop(1, 'rgba(255,210,42,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function seedParticles() {
  particles = [];
  const amount = Math.min(window.innerWidth < 700 ? 30 : 70, Math.round(width / 18));
  for (let i = 0; i < amount; i++) particles.push(new Particle('glow'));
  for (let i = 0; i < Math.round(amount / 5); i++) particles.push(new Particle('petal'));
}

function animateSky() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => { p.update(); p.draw(); });
  particles = particles.filter(p => !p.dead);
  if (!prefersReducedMotion) requestAnimationFrame(animateSky);
}

function petalMarkup(count) {
  return Array.from({ length: count }, (_, i) =>
    `<i class="petal" style="transform:rotate(${(360 / count) * i}deg)"></i>`
  ).join('');
}

function createGarden() {
  const amount = window.innerWidth < 700 ? 14 : 24;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < amount; i++) {
    const flower = document.createElement('div');
    const edge = i < 2 ? (i === 0 ? 3 : 97) : 5 + Math.random() * 90;
    const size = 38 + Math.random() * 58;
    const h = 160 + Math.random() * 230;
    const delay = .05 + Math.random() * 1.35;
    const lean = -8 + Math.random() * 16;
    const petals = 9 + Math.floor(Math.random() * 4);
    flower.className = 'flower';
    flower.style.cssText = `--x:${edge}%;--h:${h}px;--size:${size}px;--delay:${delay}s;--lean:${lean}deg;z-index:${Math.round(h)}`;
    flower.innerHTML = `
      <span class="stem"></span>
      <span class="leaf left"></span>
      <span class="leaf right"></span>
      <span class="flower-head">${petalMarkup(petals)}<b class="flower-center"></b></span>`;
    fragment.appendChild(flower);
  }

  garden.replaceChildren(fragment);
}

function bloomAgain() {
  createGarden();
  for (let i = 0; i < 24; i++) particles.push(new Particle('petal', true));
  bloomButton.querySelector('span:first-child').textContent = 'Tu jardín está floreciendo';
  setTimeout(() => {
    bloomButton.querySelector('span:first-child').textContent = 'Hazlo florecer otra vez';
  }, 2300);
}

function sparkleFlower(event) {
  const flower = event.target.closest('.flower');
  if (!flower) return;
  const head = flower.querySelector('.flower-head');
  const rect = head.getBoundingClientRect();
  if (!prefersReducedMotion) {
    head.animate([
      { transform: 'translateX(-50%) scale(1) rotate(16deg)' },
      { transform: 'translateX(-50%) scale(1.28) rotate(25deg)', offset: .45 },
      { transform: 'translateX(-50%) scale(1) rotate(16deg)' }
    ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  for (let i = 0; i < 14; i++) {
    const particle = new Particle(i % 3 === 0 ? 'petal' : 'glow', true);
    particle.x = rect.left + rect.width / 2;
    particle.y = rect.top + rect.height / 2;
    particle.speedX = (Math.random() - .5) * 3.5;
    particle.speedY = -1.8 + Math.random() * 2.5;
    particles.push(particle);
  }
}

function burstAt(x, y, amount = 36) {
  for (let i = 0; i < amount; i++) {
    const particle = new Particle(i % 4 === 0 ? 'petal' : 'glow', true);
    particle.x = x;
    particle.y = y;
    particle.speedX = (Math.random() - .5) * 7;
    particle.speedY = -3.8 + Math.random() * 6.4;
    particle.alpha = .4 + Math.random() * .6;
    particles.push(particle);
  }
}

function illuminateName() {
  const alreadyLit = nameMagic.classList.contains('lit');
  nameMagic.classList.add('lit');
  nameSection.classList.add('is-lit');
  nameMessage.textContent = alreadyLit
    ? 'Y el tuyo siempre vuelve a encender algo bonito en mí.'
    : 'Hay nombres que el corazón aprende a guardar.';
  const rect = nameMagic.getBoundingClientRect();
  burstAt(rect.left + rect.width / 2, Math.min(height * .68, rect.top + rect.height * .58), window.innerWidth < 700 ? 38 : 70);
  if (navigator.vibrate) navigator.vibrate([25, 35, 25]);
}

function startMusic() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume();
  const notes = [261.63, 329.63, 392, 493.88, 392, 329.63, 293.66, 349.23];
  let step = 0;

  const playNote = () => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.value = notes[step++ % notes.length] / 2;
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(.045, audioContext.currentTime + .2);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + 2.4);
    osc.connect(filter).connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 2.5);
  };

  playNote();
  musicTimer = setInterval(playNote, 850);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

function toggleMusic() {
  const playing = soundButton.getAttribute('aria-pressed') === 'true';
  soundButton.setAttribute('aria-pressed', String(!playing));
  soundButton.setAttribute('aria-label', playing ? 'Activar música' : 'Desactivar música');
  if (playing) stopMusic(); else startMusic();
}

function grantWish() {
  wishFlower.classList.remove('holding');
  wishFlower.classList.add('granted');
  wishStatus.textContent = 'Tu deseo quedó guardado ✦';
  for (let i = 0; i < 40; i++) {
    const particle = new Particle(i % 3 === 0 ? 'petal' : 'glow', true);
    particle.y = window.innerHeight * .54;
    particles.push(particle);
  }
  if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
  setTimeout(() => wishFlower.classList.remove('granted'), 900);
}

function startWish(event) {
  event.preventDefault();
  clearTimeout(holdingTimer);
  wishFlower.classList.add('holding');
  wishStatus.textContent = 'El jardín está escuchando...';
  holdingTimer = setTimeout(grantWish, 1800);
}

function cancelWish() {
  clearTimeout(holdingTimer);
  if (wishFlower.classList.contains('holding')) wishStatus.textContent = 'Mantén presionado un poquito más';
  wishFlower.classList.remove('holding');
}

function updateScrollEffects() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(1, progress)})`;
  if (!prefersReducedMotion && window.scrollY < window.innerHeight) {
    garden.style.transform = `translate3d(0, ${window.scrollY * .045}px, 0)`;
  }
}

function setupPointerMagic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion) return;

  window.addEventListener('pointermove', event => {
    magicCursor.classList.add('visible');
    magicCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    const overAction = event.target.closest('button, a, .reason-card');
    magicCursor.classList.toggle('over-action', Boolean(overAction));

    const now = performance.now();
    if (now - trailTime > 75 && !document.body.classList.contains('is-locked')) {
      trailTime = now;
      const spark = new Particle('glow', true);
      spark.x = event.clientX;
      spark.y = event.clientY;
      spark.speedX = (Math.random() - .5) * .45;
      spark.speedY = -.2;
      spark.alpha = .32;
      particles.push(spark);
    }

    if (window.scrollY < window.innerHeight) {
      const offsetX = (event.clientX / width - .5) * 9;
      const offsetY = (event.clientY / height - .5) * 6;
      heroCopy.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    }
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => magicCursor.classList.remove('visible'));

  document.querySelectorAll('.reason-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!card.classList.contains('in-view')) return;
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 8;
      const rotateX = (.5 - (event.clientY - rect.top) / rect.height) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

openButton.addEventListener('click', () => {
  opening.classList.add('opened');
  document.body.classList.remove('is-locked');
  document.body.classList.add('ready');
  createGarden();
});

bloomButton.addEventListener('click', bloomAgain);
garden.addEventListener('pointerdown', sparkleFlower);
nameMagic.addEventListener('click', illuminateName);
soundButton.addEventListener('click', toggleMusic);
wishFlower.addEventListener('pointerdown', startWish);
wishFlower.addEventListener('pointerup', cancelWish);
wishFlower.addEventListener('pointerleave', cancelWish);
wishFlower.addEventListener('pointercancel', cancelWish);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: .28 });
observer.observe(document.querySelector('.letter-card'));
document.querySelectorAll('.reason-card').forEach(card => observer.observe(card));
document.querySelectorAll('.section-reveal').forEach(item => observer.observe(item));
observer.observe(nameSection);

window.addEventListener('scroll', updateScrollEffects, { passive: true });

window.addEventListener('resize', () => {
  resizeCanvas();
  seedParticles();
});

resizeCanvas();
seedParticles();
animateSky();
updateScrollEffects();
setupPointerMagic();
