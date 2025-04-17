import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blotatoApiRequest } from './GenericFunctions';

/**
 * Node for getting and managing social media accounts in Blotato
 */
export class SocialAccounts implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blotato Social Accounts',
		name: 'blotatoSocialAccounts',
		icon: 'file:blotato.svg',
		group: ['transform'],
		version: 1,
		description: 'Get and manage social media accounts connected to Blotato',
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get All Accounts',
						value: 'getAll',
						description: 'Get all connected social media accounts',
						action: 'Get all connected social media accounts',
					},
					{
						name: 'Get By Platform',
						value: 'getByPlatform',
						description: 'Get social media accounts by platform type',
						action: 'Get accounts by platform type',
					},
					{
						name: 'Get By ID',
						value: 'getById',
						description: 'Get a specific social media account by ID',
						action: 'Get a specific account by ID',
					},
				],
				default: 'getAll',
			},
			
			// Parameters for getByPlatform operation
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'Twitter', value: 'twitter' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'Pinterest', value: 'pinterest' },
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'Threads', value: 'threads' },
					{ name: 'Bluesky', value: 'bluesky' },
					{ name: 'YouTube', value: 'youtube' },
				],
				default: 'twitter',
				description: 'Social media platform to get accounts for',
				displayOptions: {
					show: {
						operation: ['getByPlatform'],
					},
				},
				required: true,
			},
			
			// Parameters for getById operation
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'ID of the social media account to get',
				displayOptions: {
					show: {
						operation: ['getById'],
					},
				},
				required: true,
			},
			
			// Return options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Analytics',
						name: 'includeAnalytics',
						type: 'boolean',
						default: false,
						description: 'Whether to include account analytics data',
					},
					{
						displayName: 'Include Recent Posts',
						name: 'includeRecentPosts',
						type: 'boolean',
						default: false,
						description: 'Whether to include recent posts data',
					},
					{
						displayName: 'Raw Data',
						name: 'rawData',
						type: 'boolean',
						default: false,
						description: 'Whether to return the full response data',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as {
					includeAnalytics?: boolean;
					includeRecentPosts?: boolean;
					rawData?: boolean;
				};

				// Build query parameters
				const qs: Record<string, any> = {};
				if (options.includeAnalytics) {
					qs.includeAnalytics = 'true';
				}
				if (options.includeRecentPosts) {
					qs.includeRecentPosts = 'true';
				}

				let responseData;

				// Execute based on the operation
				if (operation === 'getAll') {
					// Get all accounts
					responseData = await blotatoApiRequest.call(
						this,
						'GET',
						'/accounts',
						{},
						qs,
					);
				} else if (operation === 'getByPlatform') {
					// Get accounts by platform
					const platform = this.getNodeParameter('platform', i) as string;
					responseData = await blotatoApiRequest.call(
						this,
						'GET',
						`/accounts/platform/${platform}`,
						{},
						qs,
					);
				} else if (operation === 'getById') {
					// Get account by ID
					const accountId = this.getNodeParameter('accountId', i) as string;
					responseData = await blotatoApiRequest.call(
						this,
						'GET',
						`/accounts/${accountId}`,
						{},
						qs,
					);
				}

				// Format the response
				let outputData: INodeExecutionData;

				if (options.rawData) {
					// Return raw response
					outputData = {
						json: responseData,
						pairedItem: { item: i },
					};
				} else {
					// Process accounts data into a more usable format
					let accounts = [];
					
					if (operation === 'getById') {
						// Single account response
						accounts = [this.formatAccountData(responseData)];
					} else {
						// Multiple accounts response
						if (Array.isArray(responseData)) {
							accounts = responseData.map(account => this.formatAccountData(account));
						} else if (responseData.accounts && Array.isArray(responseData.accounts)) {
							accounts = responseData.accounts.map(account => this.formatAccountData(account));
						}
					}

					outputData = {
						json: { accounts },
						pairedItem: { item: i },
					};
				}

				returnData.push(outputData);
			} catch (error) {
				// Handle errors
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
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

	/**
	 * Helper method to format account data into a consistent structure
	 */
	private formatAccountData(account: any): any {
		// Basic account details that should exist across platforms
		const formattedAccount = {
			id: account.id || '',
			platform: account.platform || '',
			username: account.username || account.screenName || account.name || '',
			displayName: account.displayName || account.name || account.username || '',
			profileUrl: account.profileUrl || '',
			avatar: account.avatarUrl || account.profileImageUrl || '',
			isConnected: account.isConnected || true,
			connectionStatus: account.status || 'active',
		};

		// Include analytics if present
		if (account.analytics) {
			formattedAccount.analytics = account.analytics;
		}

		// Include recent posts if present
		if (account.recentPosts) {
			formattedAccount.recentPosts = account.recentPosts;
		}

		// Include platform-specific fields
		switch (account.platform) {
			case 'facebook':
				if (account.pageId) formattedAccount.pageId = account.pageId;
				if (account.pageAccessToken) formattedAccount.pageAccessToken = account.pageAccessToken;
				break;
			case 'linkedin':
				if (account.companyId) formattedAccount.companyId = account.companyId;
				break;
			case 'pinterest':
				if (account.boardId) formattedAccount.boardId = account.boardId;
				break;
			// Additional platform-specific fields can be added here
		}

		return formattedAccount;
	}
}
