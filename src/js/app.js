/**
 * Weekly Art Showcase - Main Application
 * 
 * This file contains the main application logic for the Weekly Art Showcase website.
 */

// Main application class
class WeeklyArtShowcase {
  constructor() {
    // Configuration
    this.config = null;
    this.stories = null;
    this.currentWeek = 1;
    this.currentLanguage = 'en';
    
    // DOM elements
    this.weekIndicator = null;
    this.prevButton = null;
    this.nextButton = null;
    this.artworkContainer = null;
    this.storyContainer = null;
    this.languageButtons = null;
    
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
  displayCurrentWeek() {
    // Update week indicator
    this.weekIndicator.textContent = `Week ${this.currentWeek} of ${this.config.totalWeeks}`;
    
    console.log('Current week:', this.currentWeek);
    console.log('Available stories:', this.stories.map(s => s.week));
    
    // Find story for current week
    const story = this.stories.find(s => s.week === this.currentWeek);
    
    console.log('Found story for current week:', story ? 'Yes' : 'No');
    
    if (story) {
      // Display artwork
      this.displayArtwork(story);
      
      // Display story
      this.displayStory(story);
    } else {
      console.log('No story found for week', this.currentWeek);
      // Display placeholder
      this.displayPlaceholder();
    }
  }
  
  // Display artwork
  displayArtwork(story) {
    const filename = story.artwork.filename;
    const title = story.artwork.title[this.currentLanguage];
    const baseFilename = filename.replace(/\.[^/.]+$/, '');
    
    console.log('Displaying artwork for week:', this.currentWeek);
    console.log('Filename:', filename);
    
    // Create responsive image HTML with fallback to original image
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
        onerror="this.onerror=null; this.src='images/2025/${filename}';"
      />
    `;
    
    this.artworkContainer.innerHTML = html;
  }
  
  // Display story
  displayStory(story) {
    const title = story.story[this.currentLanguage].title;
    const content = story.story[this.currentLanguage].content;
    
    // Create story HTML
    const html = `
      <h2 class="story-title ${this.currentLanguage === 'zh' ? 'zh-text' : ''}">${title}</h2>
      <div class="story-content ${this.currentLanguage === 'zh' ? 'zh-text' : ''}">
        ${content}
      </div>
    `;
    
    this.storyContainer.innerHTML = html;
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

// Cover page navigation
class CoverPageManager {
  constructor() {
    this.coverPage = document.getElementById('cover-page');
    this.mainShowcase = document.getElementById('main-showcase');
    this.enterButton = document.getElementById('enter-showcase');
    this.backButton = document.getElementById('back-to-cover');
    
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
    if (this.coverPage && this.mainShowcase) {
      this.coverPage.style.display = 'none';
      this.mainShowcase.style.display = 'block';
      
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('view', 'gallery');
      window.history.pushState({}, '', url);
    }
  }
  
  showCoverPage() {
    if (this.coverPage && this.mainShowcase) {
      this.coverPage.style.display = 'block';
      this.mainShowcase.style.display = 'none';
      
      // Update URL
      const url = new URL(window.location);
      url.searchParams.delete('view');
      url.searchParams.delete('week');
      window.history.pushState({}, '', url);
    }
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
  // Initialize cover page manager
  const coverManager = new CoverPageManager();
  coverManager.checkInitialView();
  
  // Always initialize the showcase, but only show it when needed
  let showcase = null;
  
  // Initialize showcase when entering gallery
  const enterButton = document.getElementById('enter-showcase');
  if (enterButton) {
    enterButton.addEventListener('click', () => {
      if (!showcase) {
        showcase = new WeeklyArtShowcase();
      }
    });
  }
  
  // If we're starting in gallery view, initialize immediately
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('view') === 'gallery') {
    showcase = new WeeklyArtShowcase();
  }
});