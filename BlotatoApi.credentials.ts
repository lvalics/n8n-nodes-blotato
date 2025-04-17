import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BlotatoApi implements ICredentialType {
	// Name of the credential (unique identifier)
	name = 'blotatoApi';

	// Display name shown in the UI
	displayName = 'Blotato API';

	// Documentation URL
	documentationUrl = 'https://help.blotato.com/';

	// Properties to collect from the user
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true, // Hide the API key in the UI
			},
			description: 'The Blotato API key from your account settings',
		},
		// Social Media Accounts Section
		{
			displayName: 'Social Media Accounts',
			name: 'socialMediaAccounts',
			type: 'fixedCollection',
			default: {},
			description: 'Configure your social media account IDs for publishing',
			typeOptions: {
				multipleValues: false,
			},
			options: [
				{
					name: 'accounts',
					displayName: 'Accounts',
					values: [
						{
							displayName: 'Instagram ID',
							name: 'instagram_id',
							type: 'string',
							default: '',
							description: 'Instagram account ID for publishing',
						},
						{
							displayName: 'YouTube ID',
							name: 'youtube_id',
							type: 'string',
							default: '',
							description: 'YouTube channel ID for publishing',
						},
						{
							displayName: 'TikTok ID',
							name: 'tiktok_id',
							type: 'string',
							default: '',
							description: 'TikTok account ID for publishing',
						},
						{
							displayName: 'Facebook ID',
							name: 'facebook_id',
							type: 'string',
							default: '',
							description: 'Facebook user ID for publishing',
						},
						{
							displayName: 'Facebook Page ID',
							name: 'facebook_page_id',
							type: 'string',
							default: '',
							description: 'Facebook page ID for publishing',
						},
						{
							displayName: 'Threads ID',
							name: 'threads_id',
							type: 'string',
							default: '',
							description: 'Threads account ID for publishing',
						},
						{
							displayName: 'Twitter ID',
							name: 'twitter_id',
							type: 'string',
							default: '',
							description: 'Twitter account ID for publishing',
						},
						{
							displayName: 'LinkedIn ID',
							name: 'linkedin_id',
							type: 'string',
							default: '',
							description: 'LinkedIn account ID for publishing',
						},
						{
							displayName: 'Pinterest ID',
							name: 'pinterest_id',
							type: 'string',
							default: '',
							description: 'Pinterest account ID for publishing',
						},
						{
							displayName: 'Pinterest Board ID',
							name: 'pinterest_board_id',
							type: 'string',
							default: '',
							description: 'Pinterest board ID for publishing',
						},
						{
							displayName: 'Bluesky ID',
							name: 'bluesky_id',
							type: 'string',
							default: '',
							description: 'Bluesky account ID for publishing',
						},
					],
				},
			],
		},
	];
}
