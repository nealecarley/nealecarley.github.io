/**
 * Thumbnail Generation Script
 * 
 * This script generates optimized thumbnails for all images in the images directory.
 * It creates multiple sizes for responsive image loading:
 * - Thumbnail (300px width)
 * - Medium (800px width)
 * - Large (1200px width)
 * 
 * For each size, it creates both WebP and original format (JPG/PNG) versions.
 */

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const SIZES = {
  thumbnails: 300,
  medium: 800,
  large: 1200
};

const IMAGE_DIR = 'images/2025';
const OUTPUT_BASE_DIR = 'images/2025';

// Ensure output directories exist
async function ensureDirectories() {
  await fs.ensureDir(path.join(OUTPUT_BASE_DIR, 'thumbnails'));
  await fs.ensureDir(path.join(OUTPUT_BASE_DIR, 'medium'));
  await fs.ensureDir(path.join(OUTPUT_BASE_DIR, 'large'));
  console.log(chalk.green('✓ Output directories created'));
}

// Process a single image
async function processImage(imagePath) {
  const filename = path.basename(imagePath);
  const nameWithoutExt = path.parse(filename).name;
  const ext = path.parse(filename).ext.toLowerCase();
  
  // Only process image files
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return;
  }
  
  console.log(chalk.blue(`Processing: ${filename}`));
  
  try {
    // Load the image
    const image = sharp(imagePath);
    
    // Generate each size
    for (const [size, width] of Object.entries(SIZES)) {
      const outputDir = path.join(OUTPUT_BASE_DIR, size);
      
      // Generate WebP version
      await image
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(outputDir, `${nameWithoutExt}_${width}.webp`));
      
      // Generate original format version (JPG or PNG)
      if (ext === '.png') {
        await image
          .clone()
          .resize({ width, withoutEnlargement: true })
          .png({ quality: 80 })
          .toFile(path.join(outputDir, `${nameWithoutExt}_${width}${ext}`));
      } else {
        await image
          .clone()
          .resize({ width, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(path.join(outputDir, `${nameWithoutExt}_${width}.jpg`));
      }
    }
    
    console.log(chalk.green(`✓ Generated thumbnails for: ${filename}`));
  } catch (error) {
    console.error(chalk.red(`Error processing ${filename}:`), error);
  }
}

// Main function
async function generateThumbnails() {
  try {
    console.log(chalk.yellow('Starting thumbnail generation...'));
    
    // Ensure output directories exist
    await ensureDirectories();
    
    // Get all images
    const images = glob.sync(path.join(IMAGE_DIR, '*.{jpg,jpeg,png,webp}'));
    
    if (images.length === 0) {
      console.log(chalk.yellow('No images found to process'));
      return;
    }
    
    console.log(chalk.blue(`Found ${images.length} images to process`));
    
    // Process each image
    for (const imagePath of images) {
      await processImage(imagePath);
    }
    
    console.log(chalk.green('✓ Thumbnail generation complete!'));
  } catch (error) {
    console.error(chalk.red('Error generating thumbnails:'), error);
    process.exit(1);
  }
}

// Run the script
generateThumbnails();