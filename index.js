/**
 * Blotato nodes for n8n
 *
 * @module n8n-nodes-blotato
 */

// Load credentials
const { BlotatoApi } = require('./credentials/BlotatoApi.credentials');

// Load nodes
const { MediaUpload } = require('./nodes/Blotato/MediaUpload.node');
const { PostPublish } = require('./nodes/Blotato/PostPublish.node');
const { SocialAccounts } = require('./nodes/Blotato/SocialAccounts.node');

// Export the nodes and credentials
module.exports = {
    // Credentials
    credentialTypes: {
        blotatoApi: {
            type: BlotatoApi,
        },
    },
    
    // Nodes
    nodeTypes: {
        blotatoMediaUpload: {
            type: MediaUpload,
            sourcePath: './nodes/Blotato/MediaUpload.node.js',
        },
        blotatoPostPublish: {
            type: PostPublish,
            sourcePath: './nodes/Blotato/PostPublish.node.js',
        },
        blotatoSocialAccounts: {
            type: SocialAccounts,
            sourcePath: './nodes/Blotato/SocialAccounts.node.js',
        },
    },
};
