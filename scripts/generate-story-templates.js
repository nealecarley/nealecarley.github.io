/**
 * Story Template Generator
 * 
 * This script generates placeholder story templates for new artwork images.
 * It scans the images directory and creates story templates for any images
 * that don't already have associated story files.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const IMAGES_DIR = 'images/2025';
const STORIES_DIR = 'src/data/stories';
const CONFIG_FILE = 'src/data/config.json';

// Generate a title from filename
function generateTitleFromFilename(filename) {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .split(/[_\-.]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate a story template for an image
function generateStoryTemplate(filename, week) {
  const title = generateTitleFromFilename(filename);
  
  // Create varied story starters and themes
  const storyVariations = [
    {
      starter: "In a quiet moment",
      theme: "peaceful observation"
    },
    {
      starter: "One sunny afternoon",
      theme: "adventure discovery"
    },
    {
      starter: "While exploring",
      theme: "curious exploration"
    },
    {
      starter: "During art time",
      theme: "creative expression"
    },
    {
      starter: "On a special day",
      theme: "memorable experience"
    }
  ];
  
  const variation = storyVariations[week % storyVariations.length];
  
  return {
    week,
    artwork: {
      filename,
      title: {
        en: title,
        zh: `${title} (中文)`
      }
    },
    story: {
      en: {
        title: `${variation.starter}: ${title}`,
        content: `[PLACEHOLDER: Create a ${variation.theme} story about this black and white pencil artwork. Focus on what's actually visible in the drawing without adding colors that aren't there.]`
      },
      zh: {
        title: `${variation.starter}: ${title} (中文)`,
        content: `[占位符：创建一个关于这幅黑白铅笔艺术作品的${variation.theme}故事。专注于画中实际可见的内容，不要添加不存在的颜色。]`
      }
    },
    characters: {
      en: ["Neale"],
      zh: ["恩恩"]
    },
    artworkType: "pencil_drawing",
    colorScheme: "black_and_white"
  };
}

// Generate story templates
async function generateStoryTemplates() {
  try {
    console.log(chalk.yellow('Generating story templates...'));
    
    // Ensure directories exist
    await fs.ensureDir(STORIES_DIR);
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
    
    // Get all existing story files
    const storyFiles = glob.sync(path.join(STORIES_DIR, '*.json'));
    const existingStories = [];
    
    for (const storyFile of storyFiles) {
      try {
        const story = await fs.readJson(storyFile);
        existingStories.push(story);
      } catch (error) {
        console.error(chalk.red(`Error reading ${storyFile}:`), error);
      }
    }
    
    // Find images without stories
    const existingFilenames = existingStories.map(story => story.artwork.filename);
    const newImages = imageFiles
      .map(file => path.basename(file))
      .filter(filename => !existingFilenames.includes(filename));
    
    if (newImages.length === 0) {
      console.log(chalk.green('✓ All images already have story templates'));
      return;
    }
    
    console.log(chalk.blue(`Found ${newImages.length} new images without stories`));
    
    // Update config with new images
    const updatedRotation = [...config.artworkRotation];
    
    for (const newImage of newImages) {
      if (!updatedRotation.includes(newImage)) {
        updatedRotation.push(newImage);
      }
    }
    
    const updatedConfig = {
      ...config,
      totalWeeks: updatedRotation.length,
      artworkRotation: updatedRotation
    };
    
    // Save updated config
    await fs.writeJson(CONFIG_FILE, updatedConfig, { spaces: 2 });
    console.log(chalk.green('✓ Updated config with new images'));
    
    // Generate story templates for new images
    for (const [index, newImage] of newImages.entries()) {
      const week = updatedRotation.indexOf(newImage) + 1;
      const template = generateStoryTemplate(newImage, week);
      const outputFile = path.join(STORIES_DIR, `${path.parse(newImage).name}.json`);
      
      await fs.writeJson(outputFile, template, { spaces: 2 });
      console.log(chalk.green(`✓ Generated story template for ${newImage} (Week ${week})`));
    }
    
    console.log(chalk.green(`✓ Successfully generated ${newImages.length} story templates`));
  } catch (error) {
    console.error(chalk.red('Error generating story templates:'), error);
    process.exit(1);
  }
}

// Run the script
generateStoryTemplates();