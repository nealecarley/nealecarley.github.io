# Automated Artwork Processing Setup

This guide explains how to set up automated processing of new artwork uploads for Neale's gallery.

## 🏗️ Architecture Overview

```
📱 Mobile Upload → ☁️ Cloud Storage → 🔗 Webhook → ⚙️ GitHub Actions → 🎨 Gallery Update
```

## 🚀 Quick Setup Options

### Option 1: GitHub Actions + Manual Trigger (Simplest)

1. **Upload image manually** to `images/2025/` folder
2. **Run GitHub Action** with image URL
3. **Automatic processing** happens

### Option 2: Cloud Storage + Webhook (Recommended)

1. **Upload from phone** to cloud storage
2. **Webhook triggers** GitHub Action automatically
3. **Complete automation**

## 📋 Detailed Setup Instructions

### Step 1: GitHub Repository Setup

1. **Enable GitHub Actions** in your repository settings
2. **Add repository secrets**:
   - `GITHUB_TOKEN` (automatically available)
   - `WEBHOOK_SECRET` (optional, for security)

### Step 2: Cloud Storage Setup (Choose One)

#### Option A: Cloudinary (Recommended for images)

```bash
# Sign up at cloudinary.com
# Get your cloud name, API key, and API secret
# Set up upload preset for unsigned uploads
```

#### Option B: AWS S3

```bash
# Create S3 bucket
# Set up IAM user with S3 permissions
# Configure bucket for public read access
```

#### Option C: Google Cloud Storage

```bash
# Create GCS bucket
# Set up service account
# Configure public access
```

### Step 3: Webhook Deployment

Deploy the webhook handler to a serverless platform:

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy the webhook
vercel --prod

# Set environment variables
vercel env add GITHUB_TOKEN
vercel env add GITHUB_REPO
vercel env add WEBHOOK_SECRET
```

#### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Step 4: Mobile Upload Setup

1. **Host the upload page** (`mobile-upload.html`) on your domain
2. **Configure cloud storage** credentials
3. **Test the upload flow**

## 🔧 Configuration Files

### GitHub Action Workflow

The workflow (`.github/workflows/process-new-artwork.yml`) automatically:

- ✅ Downloads the uploaded image
- ✅ Generates thumbnails (300px, 800px, 1200px)
- ✅ Creates story template
- ✅ Updates configuration
- ✅ Commits changes to repository
- ✅ Triggers site rebuild

### Image Processing Script

The script (`scripts/process-new-image.js`) handles:

- 📥 Image download from URL
- 📁 File organization
- ⚙️ Config updates
- 🔄 Gallery integration

## 📱 Mobile Upload Workflow

1. **Take photo** of Neale's artwork
2. **Open upload page** on phone
3. **Select/drag image** to upload area
4. **Enter artwork name** (e.g., "rainbow_castle")
5. **Add description** (optional)
6. **Click "Add to Gallery"**
7. **Automatic processing** begins!

## 🎯 What Happens Automatically

1. **Image Upload** → Cloud storage receives image
2. **Webhook Trigger** → Notifies GitHub repository
3. **GitHub Action Runs**:
   - Downloads image to `images/2025/`
   - Generates 3 sizes (thumbnails, medium, large)
   - Creates story template in `src/data/stories/`
   - Updates `src/data/config.json`
   - Builds compiled stories
   - Commits all changes
4. **Site Rebuilds** → New artwork appears in gallery!

## 🛠️ Manual Trigger (Alternative)

If you prefer manual control:

1. **Upload image** to any cloud storage
2. **Go to GitHub Actions** tab in your repository
3. **Run "Process New Artwork" workflow**
4. **Enter image URL and name**
5. **Click "Run workflow"**

## 🔒 Security Considerations

- Use **webhook secrets** to verify requests
- Set up **CORS policies** for upload endpoints
- Use **signed URLs** for temporary access
- **Validate file types** and sizes
- **Rate limit** upload endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Image not downloading**
   - Check image URL accessibility
   - Verify CORS settings
   - Ensure proper file permissions

2. **GitHub Action failing**
   - Check repository secrets
   - Verify token permissions
   - Review action logs

3. **Thumbnails not generating**
   - Ensure Sharp dependency is installed
   - Check image format compatibility
   - Verify write permissions

### Debug Steps

1. **Check GitHub Actions logs**
2. **Verify webhook payload**
3. **Test image URL manually**
4. **Review repository permissions**

## 🎨 Customization

### Story Template Customization

Edit `scripts/generate-story-templates.js` to customize:
- Story structure
- Character names
- Template content
- Metadata fields

### Image Processing Customization

Modify `scripts/process-new-image.js` to:
- Change image sizes
- Add watermarks
- Apply filters
- Extract metadata

## 📞 Support

If you need help setting up the automation:

1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Test each component individually
4. Verify all configuration settings

---

🎉 **Once set up, you can upload Neale's artwork from anywhere and it will automatically appear in the gallery within minutes!**