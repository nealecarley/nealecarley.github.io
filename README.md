# Neale's Weekly Art Showcase

A responsive website that showcases artwork on a weekly basis, with each piece accompanied by a charming story told from a 5-year-old boy's perspective. The stories are presented in both English and Chinese using kid-friendly character descriptions.

🌐 **Live Demo**: [https://nealecarley.github.io](https://nealecarley.github.io)

## Features

- 📅 Weekly artwork showcase with automatic rotation (11 weeks total)
- 🌍 Bilingual stories (English and Chinese)
- 🎨 Kid-friendly character descriptions from Neale's perspective
- 📱 Responsive design for all devices
- 🖼️ Automatic image optimization and thumbnail generation
- ⚡ Fast loading with progressive image enhancement
- 🎯 Easy content management system

## Project Structure

```
weekly-art-showcase/
├── images/                  # Image assets
│   └── 2025/                # Images organized by year
│       ├── thumbnails/      # 300px wide thumbnails
│       ├── medium/          # 800px wide images
│       └── large/           # 1200px wide images
├── src/                     # Source code
│   ├── css/                 # CSS styles
│   ├── js/                  # JavaScript files
│   └── data/                # Data files
│       ├── stories/         # Individual story JSON files
│       └── config.json      # Configuration file
├── scripts/                 # Build and utility scripts
├── .github/workflows/       # GitHub Actions for deployment
├── index.html               # Main HTML file
└── package.json             # Project configuration
```

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Fork or clone this repository**
2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"
3. **Push to main branch** - deployment happens automatically!

### Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
npm run build

# The site is ready to deploy from the root directory
# All necessary files are in the repository root
```

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/nealecarley/nealecarley.github.io.git
cd nealecarley.github.io

# Install dependencies
npm install

# Build the project
npm run build

# Start local development server
npm run serve
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Generate thumbnails for images
npm run generate-thumbnails

# Scan for new images
npm run scan-images

# Generate story templates for new images
npm run generate-stories

# Serve locally
npm run serve
```

## Content Management

### Adding New Artwork

1. Add new image files to the `images/2025/` directory
2. Run `npm run scan-images` to detect new images
3. Run `npm run generate-thumbnails` to create optimized versions
4. Run `npm run generate-stories` to create story templates
5. Edit the generated story templates in `src/data/stories/`
6. Run `npm run build-stories` to compile the stories

### Editing Stories

1. Edit the JSON files in the `src/data/stories/` directory
2. Run `npm run build-stories` to compile the stories
3. Test locally with `npm run serve`
4. Commit and push to deploy

## Technical Details

- **Static Site**: No server required, runs entirely in the browser
- **Responsive Images**: Multiple sizes generated automatically (300px, 800px, 1200px)
- **Progressive Enhancement**: WebP format with JPG fallbacks
- **Bilingual Support**: Easy language switching between English and Chinese
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Fast Loading**: Optimized images and minimal JavaScript

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

---

Made with ❤️ for showcasing Neale's amazing artwork!