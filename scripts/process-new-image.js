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
const { downloadFromGoogleDrive, extractGoogleDriveFileId } = require('./download-google-drive');

// Get command line arguments
const imageUrl = process.argv[2];
const imageName = process.argv[3];

if (!imageUrl || !imageName) {
    console.error('Usage: node process-new-image.js <image_url> <image_name>');
    process.exit(1);
}

function convertCloudUrl(url, attempt = 1) {
    // Convert various cloud storage URLs to direct download URLs
    
    // Google Drive - try different approaches
    const googleDriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (googleDriveMatch) {
        const fileId = googleDriveMatch[1];
        
        if (attempt === 1) {
            // First attempt: standard download URL
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        } else if (attempt === 2) {
            // Second attempt: with confirmation bypass
            return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        } else {
            // Third attempt: direct file access
            return `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
        }
    }
    
    // Dropbox
    if (url.includes('dropbox.com') && url.includes('?dl=0')) {
        return url.replace('?dl=0', '?dl=1');
    }
    
    // OneDrive
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
        if (url.includes('?')) {
            return url + '&download=1';
        } else {
            return url + '?download=1';
        }
    }
    
    return url;
}

async function downloadImage(url, filename, redirectCount = 0) {
    // Prevent infinite redirects
    if (redirectCount > 5) {
        throw new Error('Too many redirects');
    }
    
    return new Promise((resolve, reject) => {
        // Convert cloud storage URLs to direct download format
        const downloadUrl = convertCloudUrl(url);
        console.log(`Converted URL: ${downloadUrl}`);
        
        const parsedUrl = new URL(downloadUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const file = fs.createWriteStream(filename);
        
        const request = client.get(downloadUrl, (response) => {
            // Handle redirects (Google Drive uses 301, 302, 303, 307, 308)
            if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
                const redirectUrl = response.headers.location;
                console.log(`Following redirect (${response.statusCode}) to: ${redirectUrl}`);
                
                // Close current file stream
                file.close();
                fs.unlink(filename).catch(() => {}); // Clean up partial file
                
                // Retry with redirect URL
                downloadImage(redirectUrl, filename, redirectCount + 1).then(resolve).catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(filename).catch(() => {});
                reject(new Error(`Failed to download image: ${response.statusCode} - ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✓ Successfully downloaded: ${filename}`);
                resolve();
            });
            
            file.on('error', (err) => {
                fs.unlink(filename).catch(() => {});
                reject(err);
            });
        }).on('error', (err) => {
            file.close();
            fs.unlink(filename).catch(() => {});
            reject(err);
        });
        
        // Set timeout for the request
        request.setTimeout(30000, () => {
            request.destroy();
            file.close();
            fs.unlink(filename).catch(() => {});
            reject(new Error('Download timeout'));
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
        
        // Check if it's a Google Drive URL and use specialized downloader
        const googleDriveFileId = extractGoogleDriveFileId(imageUrl);
        if (googleDriveFileId) {
            console.log(`Detected Google Drive URL, using specialized downloader...`);
            await downloadFromGoogleDrive(googleDriveFileId, filePath);
        } else {
            // Use regular download for other URLs
            await downloadImage(imageUrl, filePath);
        }
        
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