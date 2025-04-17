import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class BlotatoApi implements ICredentialType {
	// Unique name for the credential type
	name = 'blotatoApi';

	// Display name shown in the UI
	displayName = 'Blotato API';

	// Documentation URL if available
	documentationUrl = 'https://help.blotato.com/';

	// Properties to collect from the user
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Blotato API key',
		},
		// Social Media Accounts Section - as direct fields
		{
			displayName: '--- Social Media Accounts ---',
			name: 'socialMediaAccountsHeader',
			type: 'notice',
			default: '',
			description: 'Configure your social media account IDs for publishing',
		},
		{
			displayName: 'Instagram ID',
			name: 'instagram_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Instagram account ID for publishing',
		},
		{
			displayName: 'YouTube ID',
			name: 'youtube_id',
			type: 'string',
			default: '',
			required: false,
			description: 'YouTube channel ID for publishing',
		},
		{
			displayName: 'TikTok ID',
			name: 'tiktok_id',
			type: 'string',
			default: '',
			required: false,
			description: 'TikTok account ID for publishing',
		},
		{
			displayName: 'Facebook ID',
			name: 'facebook_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Facebook user ID for publishing',
		},
		{
			displayName: 'Facebook Page ID',
			name: 'facebook_page_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Facebook page ID for publishing',
		},
		{
			displayName: 'Threads ID',
			name: 'threads_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Threads account ID for publishing',
		},
		{
			displayName: 'Twitter ID',
			name: 'twitter_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Twitter account ID for publishing',
		},
		{
			displayName: 'LinkedIn ID',
			name: 'linkedin_id',
			type: 'string',
			default: '',
			required: false,
			description: 'LinkedIn account ID for publishing',
		},
		{
			displayName: 'Pinterest ID',
			name: 'pinterest_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Pinterest account ID for publishing',
		},
		{
			displayName: 'Pinterest Board ID',
			name: 'pinterest_board_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Pinterest board ID for publishing',
		},
		{
			displayName: 'Bluesky ID',
			name: 'bluesky_id',
			type: 'string',
			default: '',
			required: false,
			description: 'Bluesky account ID for publishing',
		},
	];

	// Authentication method - this defines how the credentials are used in requests
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'blotato-api-key': '={{ $credentials.apiKey }}',
			},
		},
	};

	// Test function to validate the credentials
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://backend.blotato.com',
			url: '/v2/media',
			method: 'POST',
			body: {
				// Use a data URI for a 1x1 transparent GIF
				url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
			},
		},
	};
}
