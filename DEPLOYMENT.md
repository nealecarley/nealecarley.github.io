# GitHub Pages Deployment Guide

This guide will help you deploy Neale's Weekly Art Showcase to GitHub Pages.

## Quick Setup (Recommended)

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new public repository
2. Name it `nealecarley.github.io` (or `your-username.github.io`)
3. Make sure it's set to **Public**
4. Don't initialize with README (we already have one)

### 2. Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Neale's Weekly Art Showcase"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR-USERNAME/nealecarley.github.io.git

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The site will automatically build and deploy!

### 4. Access Your Site

Your site will be available at: `https://YOUR-USERNAME.github.io`

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

### 1. Build the Project Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Deploy to GitHub Pages

1. In your repository settings, set **Source** to **Deploy from a branch**
2. Select **main** branch and **/ (root)** folder
3. Your site will be deployed from the root directory

## File Structure for GitHub Pages

The following files are essential for GitHub Pages deployment:

```
├── index.html              # Main entry point
├── src/                    # Source files
│   ├── css/main.css       # Styles
│   ├── js/app.js          # JavaScript
│   └── data/              # Story data
├── images/                # All artwork and thumbnails
├── .github/workflows/     # GitHub Actions (automatic deployment)
├── package.json           # Dependencies and build scripts
└── README.md              # Documentation
```

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Ensure Node.js version is 16 or higher in GitHub Actions
- Check the Actions tab in your repository for error details

### Images Not Loading
- Verify all image files are committed to the repository
- Check that thumbnail generation completed successfully
- Ensure image paths are relative (not absolute)

### Stories Not Displaying
- Verify `src/data/compiled-stories.json` exists and is valid JSON
- Check browser console for JavaScript errors
- Ensure all story files are properly formatted

## Updating Content

To add new artwork or update stories:

1. Add new images to `images/2025/` directory
2. Run `npm run generate-thumbnails` to create optimized versions
3. Update or create story files in `src/data/stories/`
4. Run `npm run build-stories` to compile stories
5. Commit and push changes - GitHub Actions will automatically redeploy

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the root directory with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in repository settings

## Support

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the Actions tab for build logs
3. Ensure all files are properly committed to the repository

---

Happy showcasing! 🎨