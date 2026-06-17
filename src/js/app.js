/**
 * Weekly Art Showcase - Main Application
 * 
 * This file contains the main application logic for the Weekly Art Showcase website.
 */

/* ============================
   Cover Thumbnail Grid
   ============================ */
async function populateCoverThumbnails() {
  const grid = document.getElementById('cover-thumbnail-grid');
  if (!grid) return;
  try {
    const res = await fetch('src/data/compiled-stories.json');
    const data = await res.json();
    const stories = data.stories || [];
    grid.innerHTML = stories.map(s => {
      const file = s.artwork.filename;
      const base = file.replace(/\.[^/.]+$/, '');
      const title = s.artwork.title.en || '';
      return `
        <div class="cover-thumbnail" title="${title}" onclick="document.getElementById('enter-showcase').click()">
          <img src="images/2025/thumbnails/${base}_300.webp"
               alt="${title}"
               loading="lazy"
               onerror="this.onerror=null;this.src='images/2025/thumbnails/${base}_300.jpg';this.onerror=null;this.src='images/2025/${file}';">
        </div>
      `;
    }).join('');
  } catch (e) {
    console.log('Cover thumbnails not available:', e.message);
  }
}

/* ============================
   Lightbox
   ============================ */
let lightboxCurrentWeek = 1;

function openLightbox(src, week) {
  const overlay = document.getElementById('lightbox-overlay');
  const img = document.getElementById('lightbox-image');
  if (!overlay || !img) return;
  lightboxCurrentWeek = week;
  img.src = src;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(ev) {
  if (ev && ev.target !== ev.currentTarget) return;
  const overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  let newWeek = lightboxCurrentWeek + dir;
  const showcase = window.__showcaseInstance;
  if (!showcase || !showcase.stories) return;
  if (newWeek < 1) newWeek = showcase.stories.length;
  if (newWeek > showcase.stories.length) newWeek = 1;
  const story = showcase.stories.find(s => s.week === newWeek);
  if (story) {
    const filename = story.artwork.filename;
    const img = document.getElementById('lightbox-image');
    if (img) img.src = `images/2025/${filename}`;
    lightboxCurrentWeek = newWeek;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

/* ============================
   Swipe Detection
   ============================ */
function setupSwipe(el, onSwipeLeft, onSwipeRight) {
  if (!el) return;
  let startX = 0;
  let startY = 0;
  el.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - startX;
    const diffY = e.changedTouches[0].screenY - startY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX < 0) onSwipeLeft && onSwipeLeft();
      else onSwipeRight && onSwipeRight();
    }
  }, { passive: true });
}

/* ============================
   Confetti Animation
   ============================ */
function spawnConfetti() {
  const colors = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1', '#6BCF7F', '#FF8E8E', '#FFA726', '#667eea'];
  const container = document.body;
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (Math.random() * 8 + 4) + 'px';
    el.style.height = (Math.random() * 8 + 4) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    el.style.animationDelay = (Math.random() * 0.8) + 's';
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function spawnConfettiMini() {
  const colors = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1', '#6BCF7F'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (Math.random() * 6 + 3) + 'px';
    el.style.height = (Math.random() * 6 + 3) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
    el.style.animationDelay = (Math.random() * 0.3) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

/* ============================
   Read Aloud (Web Speech API)
   ============================ */
let speechSynth = null;
let isSpeaking = false;

function readAloud(text, lang) {
  if (!window.speechSynthesis) {
    alert('Sorry, your browser does not support read-aloud. Try Chrome or Safari!');
    return;
  }
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    updateReadAloudBtn(false);
    return;
  }
  speechSynth = new SpeechSynthesisUtterance(text);
  speechSynth.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
  speechSynth.rate = 0.9;
  speechSynth.pitch = 1.2;
  speechSynth.onend = () => { isSpeaking = false; updateReadAloudBtn(false); };
  speechSynth.onerror = () => { isSpeaking = false; updateReadAloudBtn(false); };
  isSpeaking = true;
  updateReadAloudBtn(true);
  window.speechSynthesis.speak(speechSynth);
}

function updateReadAloudBtn(active) {
  const btn = document.getElementById('read-aloud-btn');
  const label = document.getElementById('read-aloud-label');
  if (btn && label) {
    btn.innerHTML = `${active ? '⏹️' : '🔊'} <span id="read-aloud-label">${active ? 'Stop' : 'Listen to Story'}</span>`;
    btn.classList.toggle('speaking', active);
  }
}

/* ============================
   Star Rating
   ============================ */
function setRating(week, value) {
  const key = `star_rating_${week}`;
  const current = parseInt(localStorage.getItem(key)) || 0;
  const newRating = current === value ? 0 : value;
  localStorage.setItem(key, newRating);
  const container = document.querySelector(`.star-rating[data-week="${week}"]`);
  if (container) {
    container.querySelectorAll('.star-btn').forEach((btn, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= newRating;
      btn.textContent = isFilled ? '⭐' : '☆';
      btn.classList.toggle('filled', isFilled);
      if (starValue === newRating) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 300);
      }
    });
  }
}

// Main application class
class WeeklyArtShowcase {
  constructor() {
    // Configuration
    this.config = null;
    this.stories = null;
    this.currentWeek = 1;
    this.currentLanguage = 'en';
    this.currentStory = null;
    
    // DOM elements
    this.weekIndicator = null;
    this.prevButton = null;
    this.nextButton = null;
    this.artworkContainer = null;
    this.storyContainer = null;
    this.languageButtons = null;
    
    // Expose globally for lightbox navigation
    window.__showcaseInstance = this;
    
    // Initialize the application
    this.init();
  }
  
  // Initialize the application
  async init() {
    try {
      // Load data
      await this.loadData();
      
      // Initialize DOM elements
      this.initDomElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Determine current week
      this.determineCurrentWeek();
      
      // Display current week
      this.displayCurrentWeek();
      
      console.log('Weekly Art Showcase initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
      this.displayError('Failed to initialize the application. Please try again later.');
    }
  }
  
  // Load data from JSON file
  async loadData() {
    try {
      const response = await fetch('src/data/compiled-stories.json');
      const data = await response.json();
      
      this.config = data.config;
      this.stories = data.stories;
      
      // If no stories, display error
      if (!this.stories || this.stories.length === 0) {
        throw new Error('No stories found');
      }
      
      console.log(`Loaded ${this.stories.length} stories`);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
  
  // Initialize DOM elements
  initDomElements() {
    this.weekIndicator = document.getElementById('week-indicator');
    this.prevButton = document.getElementById('prev-week');
    this.nextButton = document.getElementById('next-week');
    this.artworkContainer = document.getElementById('artwork-container');
    this.storyContainer = document.getElementById('story-container');
    this.languageButtons = document.querySelectorAll('.language-button');
    
    // Check if all elements exist
    if (!this.weekIndicator || !this.prevButton || !this.nextButton || 
        !this.artworkContainer || !this.storyContainer || !this.languageButtons.length) {
      throw new Error('Required DOM elements not found');
    }
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.navigateWeek(-1));
    this.nextButton.addEventListener('click', () => this.navigateWeek(1));
    
    // Language buttons
    this.languageButtons.forEach(button => {
      button.addEventListener('click', () => {
        const language = button.dataset.language;
        this.setLanguage(language);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        this.navigateWeek(-1);
      } else if (event.key === 'ArrowRight') {
        this.navigateWeek(1);
      }
    });
    
    // URL handling
    window.addEventListener('popstate', () => {
      this.handleUrlChange();
    });
  }
  
  // Determine current week based on URL or date
  determineCurrentWeek() {
    // Check URL for week parameter
    const urlParams = new URLSearchParams(window.location.search);
    const weekParam = urlParams.get('week');
    
    if (weekParam && !isNaN(weekParam)) {
      const week = parseInt(weekParam);
      if (week >= 1 && week <= this.config.totalWeeks) {
        this.currentWeek = week;
        return;
      }
    }
    
    // If no valid week parameter, calculate based on start date
    if (this.config.startDate) {
      const startDate = new Date(this.config.startDate);
      const currentDate = new Date();
      const diffTime = currentDate - startDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      
      // Calculate current week with rotation
      this.currentWeek = (diffWeeks % this.config.totalWeeks) + 1;
    }
  }
  
  // Handle URL changes
  handleUrlChange() {
    const urlParams = new URLSearchParams(window.location.search);
    const weekParam = urlParams.get('week');
    
    if (weekParam && !isNaN(weekParam)) {
      const week = parseInt(weekParam);
      if (week >= 1 && week <= this.config.totalWeeks && week !== this.currentWeek) {
        this.currentWeek = week;
        this.displayCurrentWeek();
      }
    }
  }
  
  // Navigate to a different week
  navigateWeek(direction) {
    let newWeek = this.currentWeek + direction;
    
    // Handle circular navigation
    if (newWeek < 1) {
      newWeek = this.config.totalWeeks;
    } else if (newWeek > this.config.totalWeeks) {
      newWeek = 1;
    }
    
    this.currentWeek = newWeek;
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('week', this.currentWeek);
    window.history.pushState({}, '', url);
    
    // Confetti on navigation!
    spawnConfettiMini();
    
    // Display new week
    this.displayCurrentWeek();
  }
  
  // Set language
  setLanguage(language) {
    if (language !== 'en' && language !== 'zh') {
      return;
    }
    
    this.currentLanguage = language;
    
    // Update active button
    this.languageButtons.forEach(button => {
      if (button.dataset.language === language) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Save preference to localStorage
    localStorage.setItem('language', language);
    
    // Update display - redisplay current week with new language
    this.displayCurrentWeek();
  }
  
  // Display current week
  displayCurrentWeek(animate = true) {
    this.weekIndicator.textContent = `Week ${this.currentWeek} of ${this.config.totalWeeks}`;
    
    const story = this.stories.find(s => s.week === this.currentWeek);
    this.currentStory = story || null;
    
    if (story) {
      this.displayArtwork(story, animate);
      this.displayStory(story, animate);
      // Setup swipe on artwork container
      setupSwipe(this.artworkContainer, () => this.navigateWeek(1), () => this.navigateWeek(-1));
    } else {
      this.displayPlaceholder(animate);
    }
  }
  
  // Animate content container
  animateContent(container) {
    if (!container) return;
    container.classList.remove('week-content-enter');
    void container.offsetWidth; // reflow
    container.classList.add('week-content-enter');
  }
  
  // Display artwork
  displayArtwork(story, animate = true) {
    const filename = story.artwork.filename;
    const title = story.artwork.title[this.currentLanguage];
    const baseFilename = filename.replace(/\.[^/.]+$/, '');
    
    const html = `
      <img 
        src="images/2025/${filename}"
        srcset="
          images/2025/thumbnails/${baseFilename}_300.webp 300w,
          images/2025/medium/${baseFilename}_800.webp 800w,
          images/2025/large/${baseFilename}_1200.webp 1200w
        "
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
        alt="${title}"
        class="artwork-image"
        loading="lazy"
        onclick="openLightbox('images/2025/${filename}', ${story.week})"
        onerror="this.onerror=null; this.src='images/2025/${filename}';"
      />
      <p style="margin-top:0.5rem;font-size:0.9rem;opacity:0.6;">👆 Tap artwork for full screen</p>
    `;
    
    this.artworkContainer.innerHTML = html;
    if (animate) this.animateContent(this.artworkContainer);
  }
  
  // Display story
  displayStory(story, animate = true) {
    const title = story.story[this.currentLanguage].title;
    const content = story.story[this.currentLanguage].content;
    const lang = this.currentLanguage;
    
    // Build character cards
    let charactersHtml = '';
    if (story.characters && story.characters[lang] && story.characters[lang].length) {
      const emojiMap = { 'Neale': '👦', 'seabirds': '🐦', 'gentle giant': '🌉', 'Dad': '👨', 'lion': '🦁', 'tree': '🌳', 'Pikachu': '⚡', 'Pokémon': '🐭', 'panda': '🐼', 'bamboo': '🎋' };
      const langKey = lang;
      charactersHtml = `
        <div class="character-section">
          <div class="character-section-title">👥 Characters in this story</div>
          <div class="character-list">
            ${story.characters[langKey].map(c => {
              const emoji = emojiMap[c] || '✨';
              return `<span class="character-card">${emoji} ${c}</span>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    // Star rating for this week
    const weekKey = `star_rating_${story.week}`;
    const savedRating = parseInt(localStorage.getItem(weekKey)) || 0;
    
    const html = `
      <button class="read-aloud-btn" onclick="readAloud(\`${content.replace(/`/g, '\\`').replace(/'/g, "\\'").replace(/"/g, '&quot;')}\`, '${lang}')" id="read-aloud-btn">
        ${isSpeaking ? '⏹️' : '🔊'} <span id="read-aloud-label">${isSpeaking ? 'Stop' : 'Listen to Story'}</span>
      </button>
      <h2 class="story-title ${lang === 'zh' ? 'zh-text' : ''}">${title}</h2>
      <div class="story-content ${lang === 'zh' ? 'zh-text' : ''}">
        ${content}
      </div>
      ${charactersHtml}
      <div class="star-rating" data-week="${story.week}">
        ${[1,2,3,4,5].map(i => `
          <button class="star-btn ${i <= savedRating ? 'filled' : ''}" data-value="${i}" onclick="setRating(${story.week}, ${i})" aria-label="${i} star${i > 1 ? 's' : ''}">
            ${i <= savedRating ? '⭐' : '☆'}
          </button>
        `).join('')}
      </div>
    `;
    
    this.storyContainer.innerHTML = html;
    if (animate) this.animateContent(this.storyContainer);
  }
  
  // Display placeholder
  displayPlaceholder() {
    // Placeholder artwork
    this.artworkContainer.innerHTML = `
      <div class="placeholder-artwork">
        <p>No artwork available for this week</p>
      </div>
    `;
    
    // Placeholder story
    this.storyContainer.innerHTML = `
      <h2 class="story-title">Coming Soon</h2>
      <div class="story-content">
        <p>Neale's story for this week is still being written. Check back soon!</p>
      </div>
    `;
  }
  
  // Display error
  displayError(message) {
    const errorHtml = `
      <div class="error-message">
        <h2>Oops! Something went wrong</h2>
        <p>${message}</p>
      </div>
    `;
    
    if (this.artworkContainer) {
      this.artworkContainer.innerHTML = errorHtml;
    }
    
    if (this.storyContainer) {
      this.storyContainer.innerHTML = '';
    }
  }
}

// Cover page navigation with smooth transitions
class CoverPageManager {
  constructor() {
    this.coverPage = document.getElementById('cover-page');
    this.mainShowcase = document.getElementById('main-showcase');
    this.enterButton = document.getElementById('enter-showcase');
    this.backButton = document.getElementById('back-to-cover');
    this.transitioning = false;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.enterButton) {
      this.enterButton.addEventListener('click', () => {
        this.showMainShowcase();
      });
    }
    
    if (this.backButton) {
      this.backButton.addEventListener('click', () => {
        this.showCoverPage();
      });
    }
  }
  
  showMainShowcase() {
    if (this.transitioning || !this.coverPage || !this.mainShowcase) return;
    this.transitioning = true;
    
    // Confetti burst
    spawnConfetti();
    
    // Fade out cover
    this.coverPage.classList.add('fade-out');
    
    setTimeout(() => {
      this.coverPage.style.display = 'none';
      this.coverPage.classList.remove('fade-out');
      
      // Show gallery with slide-up
      this.mainShowcase.style.display = 'block';
      this.mainShowcase.classList.add('active');
      this.mainShowcase.classList.remove('week-content-enter');
      void this.mainShowcase.offsetWidth;
      this.mainShowcase.classList.add('week-content-enter');
      
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('view', 'gallery');
      window.history.pushState({}, '', url);
      
      this.transitioning = false;
    }, 350);
  }
  
  showCoverPage() {
    if (this.transitioning || !this.coverPage || !this.mainShowcase) return;
    this.transitioning = true;
    
    this.mainShowcase.style.display = 'none';
    this.mainShowcase.classList.remove('active');
    this.coverPage.style.display = 'block';
    this.coverPage.classList.add('week-content-enter');
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.delete('view');
    url.searchParams.delete('week');
    window.history.pushState({}, '', url);
    
    this.transitioning = false;
  }
  
  // Check URL on load to determine which view to show
  checkInitialView() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    
    if (view === 'gallery') {
      this.showMainShowcase();
    } else {
      this.showCoverPage();
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Populate cover thumbnail grid
  populateCoverThumbnails();
  
  // Initialize cover page manager
  const coverManager = new CoverPageManager();
  coverManager.checkInitialView();
  
  let showcase = null;
  
  const enterButton = document.getElementById('enter-showcase');
  if (enterButton) {
    enterButton.addEventListener('click', () => {
      if (!showcase) {
        showcase = new WeeklyArtShowcase();
      }
    });
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('view') === 'gallery') {
    showcase = new WeeklyArtShowcase();
  }
});