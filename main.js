import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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
  const interactives = document.querySelectorAll('a, button, input, .book-page, .gallery-item');
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
// Set explicitly to Pakistan Standard Time (UTC+5)
const targetDate = new Date("2026-07-08T00:00:00+05:00").getTime();
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
        const now = new Date().getTime();
        if (now >= targetDate) {
           gate.style.display = 'none';
           document.body.style.overflow = ''; // restore scrolling
           tl.play(); 
        } else {
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


// --- Scroll Animations ---

// Message Reveal
const revealTexts = document.querySelectorAll('.reveal-text');
revealTexts.forEach((text) => {
  gsap.fromTo(text, 
    { opacity: 0.2, y: 50 },
    {
      opacity: 1,
      y: 0,
      color: "#d96c6c", // turns red when fully in view
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
  loopedSlides: 5, // Fix for loop alignment with 'auto' views
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
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');

if (multiPageBook && page1 && page2) {
  let isCoverOpen = false;

  page1.addEventListener('click', () => {
    page1.classList.toggle('flipped');
    isCoverOpen = !isCoverOpen;
    if (isCoverOpen) {
      multiPageBook.classList.add('is-open');
    } else {
      // If cover closes, make sure page 2 also closes so it doesn't clip
      page2.classList.remove('flipped');
      multiPageBook.classList.remove('is-open');
    }
  });

  page2.addEventListener('click', () => {
    // Only flip page 2 if page 1 (cover) is already open
    if (isCoverOpen) {
      page2.classList.toggle('flipped');
    }
  });
}

// --- Memory Buttons Logic ---
const btnYes = document.getElementById('memoriesYesBtn');
const btnNo = document.getElementById('memoriesNoBtn');

if(btnYes && btnNo) {
  btnYes.addEventListener('click', () => {
    // Redirect to the older memories link
    window.location.href = "https://syedmeesum110.github.io/Senorita/";
  });

  btnNo.addEventListener('click', () => {
    alert("No worries, we will make new ones! ✨");
  });
}

// --- Button Interaction (Confetti Simulation) ---
const celebrateBtn = document.getElementById('celebrateBtn');
const toastSection = document.querySelector('.toast-section');

celebrateBtn.addEventListener('click', () => {
  // Simple CSS-based confetti effect using GSAP
  for(let i=0; i < 50; i++) {
    createConfetti();
  }
});

function createConfetti() {
  const confetti = document.createElement('div');
  confetti.style.position = 'absolute';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.backgroundColor = Math.random() > 0.5 ? '#d96c6c' : '#3b42c4';
  confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
  
  // Random starting position within button area
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.8; 
  
  confetti.style.left = startX + 'px';
  confetti.style.top = startY + 'px';
  
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
