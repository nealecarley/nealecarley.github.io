/**
 * Mobile Upload Webhook Handler
 * 
 * This script can be deployed to a serverless function (Vercel, Netlify, etc.)
 * to handle image uploads from mobile devices and trigger GitHub Actions
 */

const crypto = require('crypto');

// Configuration - set these as environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // format: "username/repo-name"
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

async function triggerGitHubAction(imageUrl, imageName) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/dispatches`;
    
    const payload = {
        event_type: 'new-artwork',
        client_payload: {
            image_url: imageUrl,
            image_name: imageName
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return response;
}

// Vercel/Netlify Function Handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Verify webhook signature if secret is set
        if (WEBHOOK_SECRET) {
            const signature = req.headers['x-webhook-signature'];
            const body = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(body)
                .digest('hex');
            
            if (signature !== `sha256=${expectedSignature}`) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }
        
        const { image_url, image_name } = req.body;
        
        if (!image_url || !image_name) {
            return res.status(400).json({ 
                error: 'Missing required fields: image_url, image_name' 
            });
        }
        
        // Trigger GitHub Action
        await triggerGitHubAction(image_url, image_name);
        
        res.status(200).json({ 
            success: true, 
            message: 'Artwork processing started' 
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// Alternative: Express.js handler for custom server
export function expressHandler(req, res) {
    handler(req, res);
}