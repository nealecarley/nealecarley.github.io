/**
 * Image Scanner Script
 * 
 * This script scans the images directory and detects new files,
 * generating metadata and updating the configuration.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const IMAGES_DIR = 'images/2025';
const CONFIG_FILE = 'src/data/config.json';

// Scan images
async function scanImages() {
  try {
    console.log(chalk.yellow('Scanning images...'));
    
    // Ensure config directory exists
    await fs.ensureDir(path.dirname(CONFIG_FILE));
    
    // Create default config if it doesn't exist
    if (!fs.existsSync(CONFIG_FILE)) {
      const defaultConfig = {
        totalWeeks: 11,
        artworkRotation: [
          "golden_gate_bridge.jpg",
          "fathers_day.jpg",
          "lion.jpg",
          "boats.jpg",
          "boats2.jpg",
          "mona_lisa.jpg",
          "panda.jpg",
          "3_pokemon.jpg",
          "goose.jpg",
          "pikachu.jpg",
          "ice_cream_houses.jpg"
        ],
        startDate: "2025-01-20"
      };
      
      await fs.writeJson(CONFIG_FILE, defaultConfig, { spaces: 2 });
      console.log(chalk.green('✓ Created default config file'));
    }
    
    // Read config
    const config = await fs.readJson(CONFIG_FILE);
    
    // Get all image files
    const imageFiles = glob.sync(path.join(IMAGES_DIR, '*.{jpg,jpeg,png,webp}'));
    
    if (imageFiles.length === 0) {
      console.log(chalk.yellow('No image files found'));
      return;
    }
    
    console.log(chalk.blue(`Found ${imageFiles.length} image files`));
    
    // Extract filenames
    const filenames = imageFiles.map(file => path.basename(file));
    
    // Update config with new images
    const updatedRotation = [...config.artworkRotation];
    let updated = false;
    
    for (const filename of filenames) {
      if (!updatedRotation.includes(filename)) {
        updatedRotation.push(filename);
        updated = true;
        console.log(chalk.blue(`Added new image to rotation: ${filename}`));
      }
    }
    
    if (updated) {
      const updatedConfig = {
        ...config,
        totalWeeks: updatedRotation.length,
        artworkRotation: updatedRotation
      };
      
      // Save updated config
      await fs.writeJson(CONFIG_FILE, updatedConfig, { spaces: 2 });
      console.log(chalk.green('✓ Updated config with new images'));
    } else {
      console.log(chalk.green('✓ No new images to add to rotation'));
    }
    
    console.log(chalk.green('✓ Image scanning complete!'));
  } catch (error) {
    console.error(chalk.red('Error scanning images:'), error);
    process.exit(1);
  }
}

// Run the script
scanImages();