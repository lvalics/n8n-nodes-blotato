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
	documentationUrl = 'https://blotatoapi.docs';
	
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
	];
}
