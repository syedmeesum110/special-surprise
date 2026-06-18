import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Background Music ---
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
if (bgMusic) bgMusic.volume = 0.45;

function playMusic() {
  if (!bgMusic) return;
  bgMusic.play()
    .then(() => musicToggle && musicToggle.classList.add('playing'))
    .catch(() => {/* file missing or autoplay blocked — toggle stays off */ });
}

if (musicToggle && bgMusic) {
  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => musicToggle.classList.add('playing')).catch(() => {});
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });
}

// --- Custom Cursor Logic ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
  // Center the cursors on their coordinates
  gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
  gsap.set(cursorOutline, { xPercent: -50, yPercent: -50 });

  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows instantly
    gsap.set(cursorDot, { x: posX, y: posY });
    // Outline trails smoothly
    gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.15, ease: "power2.out" });
  });

  // Add hover effect for interactive elements
  const interactives = document.querySelectorAll('a, button, input, .flip-leaf, .gallery-item, .cake, .person');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
  });
}

// --- Gate Logic ---
const gate = document.getElementById('gate');
const nameInput = document.getElementById('nameInput');
const foodInput = document.getElementById('foodInput');
const submitName = document.getElementById('submitName');
const gateError = document.getElementById('gateError');

// Prevent scrolling while gate is active
document.body.style.overflow = 'hidden';

const timerScreen = document.getElementById('timerScreen');
// Unlocks at 11:59 PM on 7 July (Pakistan Standard Time, UTC+5) — right before her birthday on 8 July.
const targetDate = new Date("2026-07-07T23:59:00+05:00").getTime();
let timerInterval;

function startTimer() {
  timerScreen.style.display = 'flex';
  gate.style.display = 'none';

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(timerInterval);
      timerScreen.style.display = 'none';
      document.body.style.overflow = ''; // restore scrolling
      tl.play(); // Allow access to website
      playMusic();
      const startMusicOnce = () => {
        if (bgMusic && bgMusic.paused) playMusic();
        window.removeEventListener('pointerdown', startMusicOnce);
      };
      window.addEventListener('pointerdown', startMusicOnce);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
  }

  update();
  timerInterval = setInterval(update, 1000);
}

function checkName() {
  const nameVal = nameInput.value.trim().toLowerCase();
  const foodVal = foodInput.value.trim().toLowerCase();
  if (nameVal === 'senorita' && foodVal === 'alu') {
    // Access Granted
    gateError.style.opacity = '0';
    gsap.to(gate, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        localStorage.setItem('birthdayGatePassed', '1'); // remember so the gate only shows once
        const now = new Date().getTime();
        if (now >= targetDate) {
          // It's her birthday — open the website
          gate.style.display = 'none';
          document.body.style.overflow = ''; // restore scrolling
          tl.play();
          playMusic(); // gate "Enter" is a user gesture, so audio is allowed to start
        } else {
          // Not yet — show the countdown until 11:59 PM on 7 July
          startTimer();
        }
      }
    });
  } else {
    // Access Denied
    gateError.textContent = "Decline";
    gateError.style.opacity = '1';
    
    // Shake animation
    gsap.fromTo(gate.querySelector('.gate-content'), 
      { x: -10 }, 
      { x: 10, duration: 0.1, yoyo: true, repeat: 5, onComplete: () => gsap.set(gate.querySelector('.gate-content'), {x: 0}) }
    );
  }
}

submitName.addEventListener('click', checkName);
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    checkName();
  }
});

// --- Initial Loader & Hero Animation ---
const tl = gsap.timeline({ paused: true });

// 1. Loader
tl.to(".loader-text", { opacity: 1, duration: 1, yoyo: true, repeat: 1, ease: "power2.inOut" })
  .to(".loader", { y: "-100%", duration: 1, ease: "power4.inOut" })
  
// 2. New Hero entrance
  .from(".nav-link", { opacity: 0, y: -20, stagger: 0.1, duration: 0.8, ease: "power3.out" }, "-=0.5")
  .from(".hero-main-title", { opacity: 0, x: -50, duration: 1, ease: "power3.out" }, "-=0.6")
  .from(".hero-date", { opacity: 0, x: -30, duration: 0.8, ease: "power3.out" }, "-=0.6")
  .from(".hero-desc", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.6")
  .from(".hero-btn", { opacity: 0, scale: 0.8, duration: 0.8, ease: "back.out(1.7)" }, "-=0.6")
  .from(".image-wrapper", { opacity: 0, x: 100, rotation: 5, duration: 1.2, ease: "power4.out" }, "-=1")
  .from(".floral, .bg-shape", { opacity: 0, scale: 0, stagger: 0.1, duration: 1, ease: "back.out(1.2)" }, "-=0.8");

// Float animation for background elements
gsap.to(".floral, .bg-shape-2", {
  y: 15,
  rotation: 5,
  duration: 3,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut",
  stagger: {
    each: 0.5,
    from: "random"
  }
});

// Returning visitor? Skip the gate (only shows the first time) — but still honour the timer.
if (localStorage.getItem('birthdayGatePassed') === '1') {
  gate.style.display = 'none';
  const now = new Date().getTime();
  if (now >= targetDate) {
    // Birthday has arrived — open straight to the website
    if (timerScreen) timerScreen.style.display = 'none';
    document.body.style.overflow = '';
    tl.play();
    // No "Enter" gesture this time, so let the music start on the first interaction.
    playMusic();
    const startMusicOnce = () => {
      if (bgMusic && bgMusic.paused) playMusic();
      window.removeEventListener('pointerdown', startMusicOnce);
    };
    window.addEventListener('pointerdown', startMusicOnce);
  } else {
    // Still counting down to 11:59 PM on 7 July
    startTimer();
  }
}


// --- Scroll Animations ---

// Message Reveal
const revealTexts = document.querySelectorAll('.reveal-text');
revealTexts.forEach((text) => {
  gsap.fromTo(text, 
    { opacity: 0.2, y: 50 },
    {
      opacity: 1,
      y: 0,
      color: "#f6e3b6", // warms to champagne gold when fully in view
      duration: 1,
      scrollTrigger: {
        trigger: text,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      }
    }
  );
});

// Initialize Swiper
const swiper = new Swiper('.mySwiper', {
  effect: 'coverflow',
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  loopedSlides: 6, // Fix for loop alignment with 'auto' views
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: true,
});

// Gallery Slider Fade Up
gsap.from('.swiper', {
  opacity: 0,
  y: 100,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: '.gallery',
    start: "top 85%",
    toggleActions: "play none none reverse"
  }
});

// Final Toast
gsap.from(".final-wish", {
  scale: 0.8,
  opacity: 0,
  duration: 1.5,
  ease: "back.out(1.7)",
  scrollTrigger: {
    trigger: ".toast-section",
    start: "top 60%"
  }
});

// --- Multi-page Book Interaction ---
const multiPageBook = document.getElementById('multiPageBook');
const leaf1 = document.getElementById('leaf1');
const leaf2 = document.getElementById('leaf2');

if (multiPageBook && leaf1 && leaf2) {
  let isCoverOpen = false;

  leaf1.addEventListener('click', () => {
    leaf1.classList.toggle('flipped');
    isCoverOpen = !isCoverOpen;
    multiPageBook.classList.toggle('is-open', isCoverOpen);
    // If the cover closes, fold the middle leaf back too
    if (!isCoverOpen) leaf2.classList.remove('flipped');
  });

  leaf2.addEventListener('click', () => {
    // Only flip the middle leaf once the cover is open
    if (isCoverOpen) leaf2.classList.toggle('flipped');
  });
}

// --- Memory Buttons Logic ---
const btnYes = document.getElementById('memoriesYesBtn');
const btnNo = document.getElementById('memoriesNoBtn');

if(btnYes && btnNo) {
  btnYes.addEventListener('click', () => {
    // Open our own polished memories page
    window.location.href = "memories.html";
  });

  btnNo.addEventListener('click', () => {
    alert("No worries, we will make new ones! ✨");
  });

  // Playful: "Maybe not" dodges the cursor so only "Yes, let's" is clickable.
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const teases = ["Maybe not", "Nope 🙈", "Catch me!", "Try again 😜", "Nuh uh"];
    let teaseIdx = 0;

    const dodge = () => {
      const x = (Math.random() - 0.5) * 340;
      const y = (Math.random() - 0.5) * 160;
      teaseIdx = (teaseIdx + 1) % teases.length;
      btnNo.textContent = teases[teaseIdx];
      gsap.to(btnNo, { x, y, duration: 0.3, ease: 'power3.out' });
    };

    btnNo.addEventListener('mouseenter', dodge);
    // Extra-evasive: also flee if the cursor gets close
    btnNo.addEventListener('mousemove', dodge);
  }
}

// --- Celebrate → Cake Cutting Celebration ---
const celebrateBtn = document.getElementById('celebrateBtn');
const toastSection = document.querySelector('.toast-section');

const overlay = document.getElementById('celebrationOverlay');
const overlayClose = document.getElementById('celebrationClose');
const cakeEl = document.getElementById('cake');
const cakeHint = document.getElementById('cakeHint');
const cutCakeBtn = document.getElementById('cutCakeBtn');
const surpriseBtn = document.getElementById('surpriseBtn');
const romanceReplayBtn = document.getElementById('romanceReplayBtn');
const celebrationMessage = document.getElementById('celebrationMessage');
const cakeStageEl = document.getElementById('cakeStage');
const romanceStage = document.getElementById('romanceStage');

const wishMessages = [
  "Happy Birthday, Senorita! 🎉",
  "May all your wishes come true ✨",
  "You deserve the whole world 💖",
  "Here's to your most beautiful year 🥂"
];
let cakeIsCut = false;

function openCelebration() {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  resetCake();
  // a gentle welcome shower of confetti
  burstConfetti(40);
  launchBalloons(8);
}

function closeCelebration() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function resetCake() {
  cakeIsCut = false;
  cakeEl.classList.remove('cut', 'cutting');
  celebrationMessage.classList.remove('show');
  celebrationMessage.style.display = '';
  surpriseBtn.classList.remove('show');
  romanceReplayBtn.classList.remove('show');
  cutCakeBtn.style.display = 'inline-block';
  surpriseBtn.style.display = '';
  cakeHint.style.opacity = '1';
  cakeHint.textContent = 'Tap the cake to cut it 🎂';
  // back to the cake; hide the romance scene
  if (cakeStageEl) cakeStageEl.style.display = '';
  if (romanceStage) romanceStage.classList.remove('active');
}

function cutCake() {
  if (cakeIsCut) return;
  cakeIsCut = true;

  cakeHint.style.opacity = '0';
  cutCakeBtn.style.display = 'none';
  cakeEl.classList.add('cutting');

  // Knife slices in → release the slice, blow candles, celebrate
  gsap.delayedCall(0.55, () => {
    cakeEl.classList.add('cut');
    burstConfetti(120);
    launchBalloons(14);

    celebrationMessage.textContent = wishMessages[Math.floor(Math.random() * wishMessages.length)];
    celebrationMessage.classList.add('show');
    cakeHint.textContent = 'Yaaay! 🎂✨';
    cakeHint.style.opacity = '1';
    // cake can't be re-cut; offer the surprise instead
    surpriseBtn.classList.add('show');
  });
}

// --- Romance surprise scene (letter → flower → kiss) ---
const loveLetter = document.getElementById('loveLetter');
const letterOpen = document.getElementById('letterOpen');
const coupleEl = document.getElementById('couple');
const boyEl = document.getElementById('boy');
const girlEl = document.getElementById('girl');
const roseEl = document.getElementById('rose');
const kissMark = document.getElementById('kissMark');

// Crop a face region from a source image (via canvas) and set it as a div's background.
function cropFaceInto(el, src, sx, sy, size) {
  if (!el) return;
  const img = new Image();
  img.onload = () => {
    const out = 320;
    const c = document.createElement('canvas');
    c.width = out; c.height = out;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, sx, sy, size, size, 0, 0, out, out);
    el.style.backgroundImage = `url(${c.toDataURL('image/jpeg', 0.9)})`;
  };
  img.onerror = () => { el.style.backgroundImage = `url(${src})`; }; // fallback: whole image
  img.src = src;
}
// Female (5.jpg, 899x1599) + Male (right half of collage 3.jpg, 1598x1200)
cropFaceInto(girlEl, '/memories/5.jpg', 120, 200, 700);
cropFaceInto(boyEl, '/memories/3.jpg', 790, 70, 700);

function spawnHearts(count) {
  if (!overlay.classList.contains('open') || prefersReducedMotion) return;
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.textContent = ['💕', '💗', '❤️', '💞'][Math.floor(Math.random() * 4)];
    h.style.position = 'fixed';
    h.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
    h.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 160) + 'px';
    h.style.top = (window.innerHeight * 0.55) + 'px';
    h.style.zIndex = '10006';
    h.style.pointerEvents = 'none';
    overlay.appendChild(h);
    gsap.to(h, {
      y: -(180 + Math.random() * 220),
      x: (Math.random() - 0.5) * 160,
      opacity: 0,
      rotation: (Math.random() - 0.5) * 50,
      duration: 1.8 + Math.random() * 1.2,
      ease: 'power1.out',
      onComplete: () => h.remove()
    });
  }
}

function playSurprise() {
  // Switch from the cake to the romance scene
  if (cakeStageEl) cakeStageEl.style.display = 'none';
  celebrationMessage.style.display = 'none';
  cutCakeBtn.style.display = 'none';
  surpriseBtn.classList.remove('show');
  romanceReplayBtn.classList.remove('show');
  romanceStage.classList.add('active');

  // reset scene elements
  gsap.set(loveLetter, { scale: 0, rotation: -18, opacity: 0, y: 0 });
  gsap.set(letterOpen, { opacity: 0, y: 14 });
  gsap.set(coupleEl, { opacity: 0, y: 20 });
  gsap.set(boyEl, { x: -30, rotation: 0 });
  gsap.set(girlEl, { x: 30, rotation: 0 });
  gsap.set(roseEl, { opacity: 0, x: -60, scale: 0.8 });
  gsap.set(kissMark, { opacity: 0, scale: 0, y: 0 });

  const tl = gsap.timeline({
    onComplete: () => romanceReplayBtn.classList.add('show')
  });

  // 1) Letter pops open and reveals her photo + a line
  tl.to(loveLetter, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' })
    .to(loveLetter, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1 })
    .to(loveLetter, { y: -18, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.2')
    .to(letterOpen, { opacity: 1, y: 0, duration: 0.6 }, '-=0.1')
    .add(() => spawnHearts(6))

  // 2) The couple appears
    .to(coupleEl, { opacity: 1, y: 0, duration: 0.5 }, '+=0.3')
    .to(boyEl, { x: 0, duration: 0.5, ease: 'power2.out' }, '<')
    .to(girlEl, { x: 0, duration: 0.5, ease: 'power2.out' }, '<')

  // 3) He offers the rose; it travels across to her
    .to(roseEl, { opacity: 1, x: -50, scale: 1, duration: 0.4 })
    .to(roseEl, { x: 50, duration: 0.9, ease: 'power1.inOut' })
    .to(girlEl, { keyframes: [{ scale: 1.16, duration: 0.2 }, { scale: 1, duration: 0.25 }] }, '-=0.1')
    .add(() => spawnHearts(10))

  // 4) They lean in for a kiss
    .to(boyEl, { x: 30, rotation: 8, duration: 0.5, ease: 'power2.inOut' }, '+=0.15')
    .to(girlEl, { x: -30, rotation: -8, duration: 0.5, ease: 'power2.inOut' }, '<')
    .to(roseEl, { opacity: 0, duration: 0.3 }, '<')
    .to(kissMark, { opacity: 1, scale: 1.35, y: -10, duration: 0.4, ease: 'back.out(2)' })
    .add(() => spawnHearts(22))
    .to(kissMark, { opacity: 0, y: -46, duration: 0.9, ease: 'power1.out' }, '+=0.3')

  // 5) Settle, still close together
    .to(boyEl, { rotation: 0, duration: 0.4 }, '-=0.3')
    .to(girlEl, { rotation: 0, duration: 0.4 }, '<');
}

// Confetti that rains down inside the overlay
function burstConfetti(count) {
  if (!overlay.classList.contains('open') || prefersReducedMotion) return;
  const palette = ['#e7c78c', '#ec88a4', '#f6e3b6', '#c25c79', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.style.position = 'fixed';
    c.style.width = (6 + Math.random() * 8) + 'px';
    c.style.height = (8 + Math.random() * 10) + 'px';
    c.style.backgroundColor = palette[Math.floor(Math.random() * palette.length)];
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.zIndex = '10006';
    c.style.pointerEvents = 'none';
    c.style.left = (window.innerWidth / 2) + 'px';
    c.style.top = (window.innerHeight * 0.42) + 'px';
    overlay.appendChild(c);

    gsap.to(c, {
      x: (Math.random() - 0.5) * window.innerWidth * 1.1,
      y: (Math.random() - 0.3) * window.innerHeight,
      rotation: Math.random() * 720,
      opacity: 0,
      duration: 1.6 + Math.random() * 1.8,
      ease: 'power2.out',
      onComplete: () => c.remove()
    });
  }
}

// Balloons floating up inside the overlay
function launchBalloons(count) {
  if (prefersReducedMotion || !overlay.classList.contains('open')) return;
  const balloons = ['🎈', '🎀', '💖', '🎉'];
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.textContent = balloons[Math.floor(Math.random() * balloons.length)];
    b.style.position = 'fixed';
    b.style.fontSize = (1.8 + Math.random() * 2.2) + 'rem';
    b.style.left = (Math.random() * 100) + 'vw';
    b.style.bottom = '-60px';
    b.style.zIndex = '10006';
    b.style.pointerEvents = 'none';
    overlay.appendChild(b);

    gsap.to(b, {
      y: -(window.innerHeight + 140),
      x: (Math.random() - 0.5) * 160,
      rotation: (Math.random() - 0.5) * 40,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 0.8,
      ease: 'power1.out',
      onComplete: () => b.remove()
    });
  }
}

if (celebrateBtn) celebrateBtn.addEventListener('click', openCelebration);
if (overlayClose) overlayClose.addEventListener('click', closeCelebration);
if (cutCakeBtn) cutCakeBtn.addEventListener('click', cutCake);
if (cakeEl) cakeEl.addEventListener('click', cutCake);
if (surpriseBtn) surpriseBtn.addEventListener('click', playSurprise);
if (romanceReplayBtn) romanceReplayBtn.addEventListener('click', playSurprise);
// Close on Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeCelebration();
});

// Legacy confetti kept for any other callers
function createConfetti() {
  const confetti = document.createElement('div');
  confetti.style.position = 'absolute';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  const palette = ['#e7c78c', '#ec88a4', '#f6e3b6', '#c25c79'];
  confetti.style.backgroundColor = palette[Math.floor(Math.random() * palette.length)];
  confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
  confetti.style.left = (window.innerWidth / 2) + 'px';
  confetti.style.top = (window.innerHeight * 0.8) + 'px';
  toastSection.appendChild(confetti);
  gsap.to(confetti, {
    x: (Math.random() - 0.5) * window.innerWidth,
    y: -window.innerHeight - Math.random() * 500,
    rotation: Math.random() * 360,
    duration: 2 + Math.random() * 2,
    ease: "power1.out",
    onComplete: () => confetti.remove()
  });
}

/* ===========================================================
   Interactive Enhancements
   =========================================================== */

// --- 1. Scroll Progress Bar ---
const progressBar = document.querySelector('.scroll-progress');
if (progressBar) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// --- 2. Floating particles in the hero (balloons / petals) ---
const heroSection = document.querySelector('.hero');
if (heroSection && !prefersReducedMotion) {
  const emojis = ['🎈', '🌸', '✨', '💖', '🎀', '🌿'];

  function spawnParticle() {
    const p = document.createElement('span');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + '%';
    p.style.fontSize = (1.2 + Math.random() * 1.8) + 'rem';
    p.style.opacity = 0.4 + Math.random() * 0.5;
    heroSection.appendChild(p);

    const drift = (Math.random() - 0.5) * 160;
    const rise = heroSection.offsetHeight + 120;

    gsap.to(p, {
      y: -rise,
      x: drift,
      rotation: (Math.random() - 0.5) * 120,
      duration: 7 + Math.random() * 7,
      ease: 'none',
      onComplete: () => p.remove()
    });
  }

  // Stagger an initial batch, then keep a gentle stream going
  for (let i = 0; i < 6; i++) {
    gsap.delayedCall(i * 0.8, spawnParticle);
  }
  setInterval(spawnParticle, 1600);
}

// --- 3. Magnetic buttons ---
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const magnets = document.querySelectorAll('.hero-btn, .luxury-btn, .gate-btn');
  magnets.forEach((btn) => {
    if (btn.id === 'memoriesNoBtn') return; // this one runs away instead
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: mx * 0.35, y: my * 0.45, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

// --- 4. 3D tilt on hero image + gallery cards ---
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const tiltEls = document.querySelectorAll('.image-wrapper, .gallery-item');
  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotationY: px * 14,
        rotationX: -py * 14,
        scale: 1.03,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
    });
  });
}

// --- 5. Click anywhere → burst of hearts / confetti ---
if (!prefersReducedMotion) {
  const burstEmojis = ['💖', '✨', '🎉', '💕', '🌟'];
  window.addEventListener('click', (e) => {
    // Ignore clicks on form controls so it doesn't distract from typing
    if (e.target.closest('input')) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'click-heart';
      h.textContent = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
      h.style.left = e.clientX + 'px';
      h.style.top = e.clientY + 'px';
      document.body.appendChild(h);

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 50 + Math.random() * 80;
      gsap.fromTo(h,
        { x: -10, y: -10, scale: 0.4, opacity: 1 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 30,
          scale: 1 + Math.random() * 0.6,
          opacity: 0,
          rotation: (Math.random() - 0.5) * 180,
          duration: 0.9 + Math.random() * 0.5,
          ease: 'power2.out',
          onComplete: () => h.remove()
        }
      );
    }
  });
}

// --- 6. Sparkle trail behind the cursor ---
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const sparkleChars = ['✨', '⭐', '💫', '·'];
  let lastSparkle = 0;
  window.addEventListener('mousemove', (e) => {
    const now = e.timeStamp;
    if (now - lastSparkle < 60) return; // throttle
    lastSparkle = now;

    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.appendChild(s);

    gsap.fromTo(s,
      { scale: 0.6, opacity: 0.9, x: -7, y: -7 },
      {
        scale: 0,
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power1.out',
        onComplete: () => s.remove()
      }
    );
  });
}
