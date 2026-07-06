import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------------------------------------------
   Memories data — drop your own photos into /public/memories/
   and update src + caption below. Order = top-to-bottom.
   --------------------------------------------------------------- */
const memories = [
  { src: '/memories/1.jpg', caption: 'You are so Beautiful 💝', note: 'You are beautiful in a way that has nothing to do with mirrors. It is the kindness in how you treat people, the warmth in your voice, the gentle heart you carry through even your hardest days. Every time I look at you I am reminded that real beauty is not just seen — it is felt. And being around you, I feel it every single day.' },
  { src: '/memories/2.jpg', caption: 'You are So Cute 💕', note: 'That little smile of yours? It is honestly my favourite view in the whole world. The way your eyes light up, the way you laugh at your own jokes, the small things you do without even realising — all of it melts me completely. You could be doing absolutely nothing and I would still think you are the cutest person alive.' },
  { src: '/memories/3.jpg', caption: 'I feel so lucky to be with you 🫶', note: 'Out of all the people, all the places, and all the chances in the world, somehow our paths crossed — and I will never stop being grateful for it. Of every moment I have ever lived, the luckiest ones are the ones spent with you. You make life feel softer, brighter, and so much more worth it.' },
  { src: '/memories/4.jpg', caption: 'Your eyes are so beautiful 😍', note: 'There is a whole world in your eyes, and I could happily get lost in it forever. They hold so much — your dreams, your feelings, every unspoken thing you never have to say out loud because I can already see it. When you look at me, everything else just quietly fades away.' },
  { src: '/memories/6.jpg', caption: 'You are amazing 💓', note: 'You amaze me constantly — the way you handle things, the way you care, the strength you carry without ever asking for credit. Everything you do leaves me in awe of the person you are. The world is genuinely a better, brighter place simply because you are in it, and I am so proud to call you mine.' },
  { src: '/memories/5.jpg', caption: 'You are My Senorita ❤️', note: 'Of every name in the world, the one I love most is yours. You are my calm on the loud days, my smile for no reason, and the person my heart quietly chooses again and again. Thank you for being mine — for the little texts, the long talks, and the way you make ordinary moments feel like home. On your birthday and on every day after, I just want you to know: you are loved beyond words, today, tomorrow, and always. Happy birthday, my Senorita. 💍' },
]

/* ---- Render gallery ---- */
const gallery = document.getElementById('memGallery')
if (gallery) {
  memories.forEach((m, i) => {
    const row = document.createElement('article')
    row.className = 'memory-row' + (i % 2 ? ' reverse' : '')
    row.innerHTML = `
      <div class="memory-photo" data-index="${i}">
        <img src="${m.src}" alt="${m.caption}" loading="lazy" />
        <span class="memory-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="memory-tag">${m.caption}</span>
      </div>
      <div class="memory-note">
        <h3 class="memory-caption">${m.caption}</h3>
        <p class="memory-text">${m.note}</p>
      </div>`
    gallery.appendChild(row)
  })
}

/* ---- Scroll reveals + gentle parallax ---- */
if (!prefersReducedMotion) {
  document.querySelectorAll('.memory-row').forEach((row) => {
    const photo = row.querySelector('.memory-photo')
    const note = row.querySelector('.memory-note')
    const fromX = row.classList.contains('reverse') ? 60 : -60

    gsap.from(photo, {
      opacity: 0, x: fromX, scale: 0.94, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 78%' }
    })
    gsap.from(note, {
      opacity: 0, x: -fromX, duration: 1, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: row, start: 'top 78%' }
    })
    // Parallax drift on the image as it passes through the viewport
    gsap.to(photo.querySelector('img'), {
      yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true }
    })
  })

  // Hero entrance
  gsap.from('.mem-hero > *', { opacity: 0, y: 30, stagger: 0.12, duration: 1, ease: 'power3.out', delay: 0.15 })
}

/* ---- Lightbox ---- */
const lightbox = document.getElementById('memLightbox')
const lbImg = document.getElementById('memLightboxImg')
const lbCap = document.getElementById('memLightboxCap')
const lbClose = document.getElementById('memLightboxClose')

function openLightbox(i) {
  const m = memories[i]
  if (!m) return
  lbImg.src = m.src
  lbImg.alt = m.caption
  lbCap.textContent = m.caption
  lightbox.classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
}

document.querySelectorAll('.memory-photo').forEach((p) => {
  p.addEventListener('click', () => openLightbox(parseInt(p.dataset.index, 10)))
})
if (lbClose) lbClose.addEventListener('click', closeLightbox)
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox() })
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox() })

/* ---- 3D tilt on photos (desktop) ---- */
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.memory-photo').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      gsap.to(el, { rotationY: px * 10, rotationX: -py * 10, scale: 1.02, transformPerspective: 900, duration: 0.4, ease: 'power2.out' })
    })
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
    })
  })
}

/* ---- Custom cursor (shared look) ---- */
const cursorDot = document.querySelector('.cursor-dot')
const cursorOutline = document.querySelector('.cursor-outline')
if (cursorDot && cursorOutline) {
  gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50 })
  window.addEventListener('mousemove', (e) => {
    gsap.set(cursorDot, { x: e.clientX, y: e.clientY })
    gsap.to(cursorOutline, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' })
  })
  document.querySelectorAll('a, button, .memory-photo').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'))
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'))
  })
}

/* ---- Background music (continues the mood from the main page) ---- */
const bgMusic = document.getElementById('bgMusic')
const musicToggle = document.getElementById('musicToggle')

if (bgMusic) bgMusic.volume = 0.45

function playMusic() {
  if (!bgMusic) return
  bgMusic.play()
    .then(() => musicToggle && musicToggle.classList.add('playing'))
    .catch(() => {/* blocked until a gesture — handled below */ })
}

if (bgMusic) {
  playMusic() // attempt immediately (often allowed after interacting with the site)
  // Fallback: start on the first interaction if the browser blocked autoplay
  const startOnce = () => { if (bgMusic.paused) playMusic(); window.removeEventListener('pointerdown', startOnce) }
  window.addEventListener('pointerdown', startOnce)
}

if (musicToggle && bgMusic) {
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    if (bgMusic.paused) {
      bgMusic.play().then(() => musicToggle.classList.add('playing')).catch(() => {})
    } else {
      bgMusic.pause()
      musicToggle.classList.remove('playing')
    }
  })
}

/* ---- Scroll progress bar ---- */
const progressBar = document.querySelector('.scroll-progress')
if (progressBar) {
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    progressBar.style.width = (scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0) + '%'
  }
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

/* ---- Sparkle trail (desktop) ---- */
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const chars = ['✨', '⭐', '💫', '·']
  let last = 0
  window.addEventListener('mousemove', (e) => {
    if (e.timeStamp - last < 70) return
    last = e.timeStamp
    const s = document.createElement('span')
    s.className = 'sparkle'
    s.textContent = chars[Math.floor(Math.random() * chars.length)]
    s.style.left = e.clientX + 'px'
    s.style.top = e.clientY + 'px'
    document.body.appendChild(s)
    gsap.fromTo(s, { scale: 0.6, opacity: 0.9, x: -7, y: -7 },
      { scale: 0, opacity: 0, y: 18, duration: 0.8, ease: 'power1.out', onComplete: () => s.remove() })
  })
}
