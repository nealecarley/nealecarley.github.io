/**
 * Test Image URL Script
 * 
 * Use this to test if an image URL works before running the full workflow
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

function convertCloudUrl(url) {
    // Google Drive
    const googleDriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (googleDriveMatch) {
        const fileId = googleDriveMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    // Dropbox
    if (url.includes('dropbox.com') && url.includes('?dl=0')) {
        return url.replace('?dl=0', '?dl=1');
    }
    
    return url;
}

async function testImageUrl(url) {
    return new Promise((resolve, reject) => {
        const downloadUrl = convertCloudUrl(url);
        console.log(`Original URL: ${url}`);
        console.log(`Converted URL: ${downloadUrl}`);
        
        const parsedUrl = new URL(downloadUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const request = client.get(downloadUrl, (response) => {
            console.log(`Status Code: ${response.statusCode}`);
            console.log(`Content-Type: ${response.headers['content-type']}`);
            console.log(`Content-Length: ${response.headers['content-length']}`);
            
            if (response.statusCode === 301 || response.statusCode === 302) {
                console.log(`Redirect Location: ${response.headers.location}`);
            }
            
            // Don't download the full file, just check headers
            response.destroy();
            
            if (response.statusCode === 200) {
                console.log('✅ URL is accessible and ready for download!');
                resolve(true);
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                console.log('🔄 URL redirects (this is normal for cloud storage)');
                resolve(true);
            } else {
                console.log('❌ URL is not accessible');
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('❌ Error accessing URL:', err.message);
            reject(err);
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            console.log('⏰ Request timeout');
            reject(new Error('Timeout'));
        });
    });
}

// Get URL from command line
const testUrl = process.argv[2];

if (!testUrl) {
    console.log('Usage: node test-image-url.js <image_url>');
    console.log('');
    console.log('Examples:');
    console.log('  Google Drive: https://drive.google.com/file/d/1GcKZOf6ZBNWASQ-zPt3Usgvj_SkIV5rY/view?usp=drive_link');
    console.log('  Dropbox: https://www.dropbox.com/s/abc123/image.jpg?dl=0');
    console.log('  Direct URL: https://example.com/image.jpg');
    process.exit(1);
}

console.log('🧪 Testing image URL...\n');
testImageUrl(testUrl)
    .then(() => {
        console.log('\n✅ Test completed successfully!');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
        process.exit(1);
    });