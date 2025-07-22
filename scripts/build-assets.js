/**
 * Asset Builder Script
 * 
 * This script builds and processes all static assets for the website,
 * including CSS and JavaScript files.
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Configuration
const SRC_DIR = 'src';
const DIST_DIR = 'dist';
const CSS_SRC = path.join(SRC_DIR, 'css');
const JS_SRC = path.join(SRC_DIR, 'js');
const CSS_DIST = path.join(DIST_DIR, 'css');
const JS_DIST = path.join(DIST_DIR, 'js');

// Build assets
async function buildAssets() {
  try {
    console.log(chalk.yellow('Building assets...'));
    
    // Ensure directories exist
    await fs.ensureDir(CSS_DIST);
    await fs.ensureDir(JS_DIST);
    
    // Copy CSS files
    const cssFiles = await fs.readdir(CSS_SRC);
    for (const file of cssFiles) {
      if (file.endsWith('.css') && !file.startsWith('.')) {
        await fs.copy(path.join(CSS_SRC, file), path.join(CSS_DIST, file));
        console.log(chalk.green(`✓ Copied CSS: ${file}`));
      }
    }
    
    // Copy JS files
    const jsFiles = await fs.readdir(JS_SRC);
    for (const file of jsFiles) {
      if (file.endsWith('.js') && !file.startsWith('.')) {
        await fs.copy(path.join(JS_SRC, file), path.join(JS_DIST, file));
        console.log(chalk.green(`✓ Copied JS: ${file}`));
      }
    }
    
    // Copy root CSS and JS files
    if (fs.existsSync('styles.css')) {
      await fs.copy('styles.css', path.join(DIST_DIR, 'styles.css'));
      console.log(chalk.green('✓ Copied root styles.css'));
    }
    
    if (fs.existsSync('script.js')) {
      await fs.copy('script.js', path.join(DIST_DIR, 'script.js'));
      console.log(chalk.green('✓ Copied root script.js'));
    }
    
    // Copy index.html
    if (fs.existsSync('index.html')) {
      await fs.copy('index.html', path.join(DIST_DIR, 'index.html'));
      console.log(chalk.green('✓ Copied index.html'));
    }
    
    console.log(chalk.green('✓ Asset building complete!'));
  } catch (error) {
    console.error(chalk.red('Error building assets:'), error);
    process.exit(1);
  }
}

// Run the script
buildAssets();