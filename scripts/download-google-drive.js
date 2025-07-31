/**
 * Alternative Google Drive Download Script
 * 
 * This script uses a different approach for downloading from Google Drive
 */

const fs = require('fs-extra');
const path = require('path');
const https = require('https');

function extractGoogleDriveFileId(url) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

async function downloadFromGoogleDrive(fileId, filename) {
    return new Promise((resolve, reject) => {
        // Use the direct download URL format that works better
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        
        console.log(`Downloading from Google Drive: ${downloadUrl}`);
        
        const file = fs.createWriteStream(filename);
        
        https.get(downloadUrl, (response) => {
            console.log(`Response status: ${response.statusCode}`);
            console.log(`Content-Type: ${response.headers['content-type']}`);
            
            // For large files, Google Drive might show a virus scan warning
            // In that case, we need to extract the actual download URL from the HTML
            if (response.headers['content-type']?.includes('text/html')) {
                let htmlData = '';
                response.on('data', (chunk) => {
                    htmlData += chunk;
                });
                
                response.on('end', () => {
                    // Look for the actual download URL in the HTML
                    const downloadMatch = htmlData.match(/href="([^"]*&amp;export=download[^"]*)"/);
                    if (downloadMatch) {
                        const actualUrl = downloadMatch[1].replace(/&amp;/g, '&');
                        console.log(`Found actual download URL: ${actualUrl}`);
                        
                        // Close current file and retry with actual URL
                        file.close();
                        fs.unlink(filename).catch(() => {});
                        
                        // Download from the actual URL
                        https.get(actualUrl, (actualResponse) => {
                            if (actualResponse.statusCode === 200) {
                                const newFile = fs.createWriteStream(filename);
                                actualResponse.pipe(newFile);
                                newFile.on('finish', () => {
                                    newFile.close();
                                    resolve();
                                });
                                newFile.on('error', reject);
                            } else {
                                reject(new Error(`Failed to download: ${actualResponse.statusCode}`));
                            }
                        }).on('error', reject);
                    } else {
                        reject(new Error('Could not find download URL in Google Drive response'));
                    }
                });
            } else if (response.statusCode === 200) {
                // Direct download worked
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                file.on('error', reject);
            } else {
                file.close();
                fs.unlink(filename).catch(() => {});
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            fs.unlink(filename).catch(() => {});
            reject(err);
        });
    });
}

// Command line usage
if (require.main === module) {
    const googleDriveUrl = process.argv[2];
    const outputName = process.argv[3] || 'downloaded_image.jpg';
    
    if (!googleDriveUrl) {
        console.log('Usage: node download-google-drive.js <google_drive_url> [output_filename]');
        process.exit(1);
    }
    
    const fileId = extractGoogleDriveFileId(googleDriveUrl);
    if (!fileId) {
        console.error('Could not extract file ID from Google Drive URL');
        process.exit(1);
    }
    
    console.log(`File ID: ${fileId}`);
    console.log(`Output: ${outputName}`);
    
    downloadFromGoogleDrive(fileId, outputName)
        .then(() => {
            console.log('✅ Download completed successfully!');
        })
        .catch((error) => {
            console.error('❌ Download failed:', error.message);
            process.exit(1);
        });
}

module.exports = { downloadFromGoogleDrive, extractGoogleDriveFileId };