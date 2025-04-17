import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

/**
 * Node for retrieving social media account IDs from credentials
 */
export class SocialAccounts implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blotato Social Accounts',
		name: 'blotatoSocialAccounts',
		icon: 'file:blotato.svg',
		group: ['transform'],
		version: 1,
		description: 'Get social media account IDs from your Blotato credentials',
		defaults: {
			name: 'Social Accounts',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'blotatoApi',
				required: true,
			},
		],
		properties: [
			// Filter empty accounts
			{
				displayName: 'Filter Empty Accounts',
				name: 'filterEmpty',
				type: 'boolean',
				default: true,
				description: 'Whether to exclude accounts with empty/undefined IDs',
			},
			
			// Output format options
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Standard Object',
						value: 'standard',
						description: 'Output as { platform_id: "value" }',
					},
					{
						name: 'Nested Object',
						value: 'nested',
						description: 'Output as { socialAccounts: { platform_id: "value" } }',
					},
				],
				default: 'nested',
				description: 'Format of the output data',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const filterEmpty = this.getNodeParameter('filterEmpty', i, true) as boolean;
				const outputFormat = this.getNodeParameter('outputFormat', i) as string;
				
				// Get credentials
				const credentials = await this.getCredentials('blotatoApi');
				
				// Create a social accounts object
				const socialAccounts: { [key: string]: string } = {};
				
				// Add all account IDs from credentials (filtering empty if needed)
				const accountTypes = [
					'instagram_id',
					'youtube_id',
					'tiktok_id',
					'facebook_id',
					'facebook_page_id',
					'threads_id',
					'twitter_id',
					'linkedin_id',
					'pinterest_id',
					'pinterest_board_id',
					'bluesky_id',
				];
				
				for (const accountType of accountTypes) {
					const accountId = credentials[accountType] as string || '';
					if (!filterEmpty || accountId) {
						socialAccounts[accountType] = accountId;
					}
				}
				
				// Create output item based on selected format
				const outputItem: INodeExecutionData = {
					json: outputFormat === 'nested' 
						? { socialAccounts } 
						: socialAccounts,
					pairedItem: { item: i },
				};
				
				returnData.push(outputItem);
			} catch (error) {
				// Handle errors
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
