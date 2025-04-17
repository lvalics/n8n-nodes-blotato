import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BlotatoApi implements ICredentialType {
	// Name by which these credentials will be referenced in the workflow
	name = 'blotatoApi';
	
	// Human-readable display name shown in the UI
	displayName = 'Blotato API';
	
	// Short documentation displayed in the credentials modal
	documentationUrl = 'https://blotato.com/docs'; // Replace with actual docs URL if available
	
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
}
