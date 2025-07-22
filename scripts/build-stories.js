/**
 * Story Builder Script
 * 
 * This script processes story data from JSON files and builds the necessary
 * data structures for the website to display stories for each artwork.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const STORIES_DIR = 'src/data/stories';
const CONFIG_FILE = 'src/data/config.json';
const OUTPUT_FILE = 'src/data/compiled-stories.json';

// Validate story data
function validateStory(story) {
  const requiredFields = [
    'week',
    'artwork.filename',
    'artwork.title.en',
    'artwork.title.zh',
    'story.en.title',
    'story.en.content',
    'story.zh.title',
    'story.zh.content'
  ];
  
  for (const field of requiredFields) {
    const parts = field.split('.');
    let value = story;
    
    for (const part of parts) {
      if (!value || !value[part]) {
        console.error(chalk.red(`Missing required field: ${field}`));
        return false;
      }
      value = value[part];
    }
  }
  
  return true;
}

// Build stories
async function buildStories() {
  try {
    console.log(chalk.yellow('Building story data...'));
    
    // Ensure directories exist
    await fs.ensureDir(STORIES_DIR);
    await fs.ensureDir(path.dirname(OUTPUT_FILE));
    
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
    
    // Get all story files
    const storyFiles = glob.sync(path.join(STORIES_DIR, '*.json'));
    
    if (storyFiles.length === 0) {
      console.log(chalk.yellow('No story files found'));
      
      // Create empty compiled stories file
      await fs.writeJson(OUTPUT_FILE, { stories: [], config }, { spaces: 2 });
      console.log(chalk.green('✓ Created empty compiled stories file'));
      return;
    }
    
    console.log(chalk.blue(`Found ${storyFiles.length} story files`));
    
    // Process each story file
    const stories = [];
    
    for (const storyFile of storyFiles) {
      try {
        const story = await fs.readJson(storyFile);
        
        if (validateStory(story)) {
          stories.push(story);
        } else {
          console.error(chalk.red(`Invalid story data in ${storyFile}`));
        }
      } catch (error) {
        console.error(chalk.red(`Error processing ${storyFile}:`), error);
      }
    }
    
    // Sort stories by week number
    stories.sort((a, b) => a.week - b.week);
    
    // Write compiled stories
    await fs.writeJson(OUTPUT_FILE, { stories, config }, { spaces: 2 });
    
    console.log(chalk.green(`✓ Successfully compiled ${stories.length} stories`));
  } catch (error) {
    console.error(chalk.red('Error building stories:'), error);
    process.exit(1);
  }
}

// Run the script
buildStories();