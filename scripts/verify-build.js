/**
 * Build Verification Script
 * 
 * This script verifies that all necessary files are present and valid
 * for GitHub Pages deployment.
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Files that must exist for deployment
const REQUIRED_FILES = [
  'index.html',
  'src/css/main.css',
  'src/js/app.js',
  'src/data/compiled-stories.json',
  'src/data/config.json',
  'package.json',
  'README.md'
];

// Directories that should exist
const REQUIRED_DIRS = [
  'images/2025',
  'images/2025/thumbnails',
  'images/2025/medium',
  'images/2025/large',
  'src/data/stories'
];

async function verifyBuild() {
  console.log(chalk.yellow('🔍 Verifying build for GitHub Pages deployment...\n'));
  
  let allGood = true;
  
  // Check required files
  console.log(chalk.blue('📄 Checking required files:'));
  for (const file of REQUIRED_FILES) {
    if (await fs.pathExists(file)) {
      console.log(chalk.green(`  ✓ ${file}`));
    } else {
      console.log(chalk.red(`  ✗ ${file} - MISSING`));
      allGood = false;
    }
  }
  
  // Check required directories
  console.log(chalk.blue('\n📁 Checking required directories:'));
  for (const dir of REQUIRED_DIRS) {
    if (await fs.pathExists(dir)) {
      console.log(chalk.green(`  ✓ ${dir}`));
    } else {
      console.log(chalk.red(`  ✗ ${dir} - MISSING`));
      allGood = false;
    }
  }
  
  // Check compiled stories
  console.log(chalk.blue('\n📚 Checking story data:'));
  try {
    const storiesData = await fs.readJson('src/data/compiled-stories.json');
    if (storiesData.stories && storiesData.stories.length > 0) {
      console.log(chalk.green(`  ✓ Found ${storiesData.stories.length} stories`));
    } else {
      console.log(chalk.red('  ✗ No stories found in compiled data'));
      allGood = false;
    }
  } catch (error) {
    console.log(chalk.red('  ✗ Error reading compiled stories:', error.message));
    allGood = false;
  }
  
  // Check images
  console.log(chalk.blue('\n🖼️  Checking images:'));
  try {
    const originalImages = await fs.readdir('images/2025');
    const imageFiles = originalImages.filter(file => 
      file.match(/\.(jpg|jpeg|png|webp)$/i) && !file.startsWith('.')
    );
    
    if (imageFiles.length > 0) {
      console.log(chalk.green(`  ✓ Found ${imageFiles.length} original images`));
      
      // Check thumbnails
      const thumbnailDir = 'images/2025/thumbnails';
      if (await fs.pathExists(thumbnailDir)) {
        const thumbnails = await fs.readdir(thumbnailDir);
        console.log(chalk.green(`  ✓ Found ${thumbnails.length} thumbnail files`));
      } else {
        console.log(chalk.yellow('  ⚠ No thumbnails directory found - run npm run generate-thumbnails'));
      }
    } else {
      console.log(chalk.red('  ✗ No image files found'));
      allGood = false;
    }
  } catch (error) {
    console.log(chalk.red('  ✗ Error checking images:', error.message));
    allGood = false;
  }
  
  // Final result
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log(chalk.green('🎉 Build verification PASSED!'));
    console.log(chalk.green('✅ Ready for GitHub Pages deployment'));
    console.log(chalk.blue('\nNext steps:'));
    console.log('  1. Commit all changes: git add . && git commit -m "Ready for deployment"');
    console.log('  2. Push to GitHub: git push origin main');
    console.log('  3. Enable GitHub Pages in repository settings');
  } else {
    console.log(chalk.red('❌ Build verification FAILED!'));
    console.log(chalk.yellow('Please fix the issues above before deploying.'));
    process.exit(1);
  }
}

// Run verification
verifyBuild().catch(error => {
  console.error(chalk.red('Error during verification:'), error);
  process.exit(1);
});