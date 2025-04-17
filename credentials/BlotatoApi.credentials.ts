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
	documentationUrl = 'https://blotato.com/docs';

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
