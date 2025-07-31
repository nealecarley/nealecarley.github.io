/**
 * Process New Image Script
 * 
 * Downloads an image from a URL and processes it for the gallery
 */

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Get command line arguments
const imageUrl = process.argv[2];
const imageName = process.argv[3];

if (!imageUrl || !imageName) {
    console.error('Usage: node process-new-image.js <image_url> <image_name>');
    process.exit(1);
}

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const file = fs.createWriteStream(filename);
        
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
            
            file.on('error', (err) => {
                fs.unlink(filename);
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function updateConfig(imageName) {
    const configPath = 'src/data/config.json';
    
    try {
        const config = await fs.readJson(configPath);
        
        // Add new image to rotation if not already present
        if (!config.artworkRotation.includes(imageName)) {
            config.artworkRotation.push(imageName);
            config.totalWeeks = config.artworkRotation.length;
            
            await fs.writeJson(configPath, config, { spaces: 2 });
            console.log(`✓ Updated config.json with new image: ${imageName}`);
        }
    } catch (error) {
        console.error('Error updating config:', error);
    }
}

async function processNewImage() {
    try {
        console.log(`Processing new image: ${imageName}`);
        console.log(`Downloading from: ${imageUrl}`);
        
        // Ensure images directory exists
        await fs.ensureDir('images/2025');
        
        // Determine file extension from URL or use .jpg as default
        const urlPath = new URL(imageUrl).pathname;
        const extension = path.extname(urlPath) || '.jpg';
        const fileName = imageName.endsWith(extension) ? imageName : `${imageName}${extension}`;
        const filePath = path.join('images/2025', fileName);
        
        // Download the image
        await downloadImage(imageUrl, filePath);
        console.log(`✓ Downloaded image to: ${filePath}`);
        
        // Update configuration
        await updateConfig(fileName);
        
        console.log('✓ Image processing complete!');
        
    } catch (error) {
        console.error('Error processing image:', error);
        process.exit(1);
    }
}

// Run the script
processNewImage();