import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blotatoApiRequest } from './GenericFunctions';

export class Blotato implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blotato',
		name: 'blotato',
		icon: 'file:blotato.svg', // Custom icon needs to be created
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Blotato API for social media publishing',
		defaults: {
			name: 'Blotato',
		},
		inputs: [
			{
				name: 'main',
				type: NodeConnectionType.Main,
			},
		],
		outputs: [
			{
				name: 'main',
				type: NodeConnectionType.Main,
			},
		],
		credentials: [
			{
				name: 'blotatoApi',
				required: true,
			},
		],
		properties: [
			// Resource definition - Media or Post
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Post',
						value: 'post',
					},
				],
				default: 'media',
				description: 'Resource to interact with',
			},
			
			// MEDIA OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['media'],
					},
				},
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload media by providing a URL',
						action: 'Upload media by URL',
					},
				],
				default: 'upload',
			},
			
			// Media Upload Parameters
			{
				displayName: 'Media URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['upload'],
					},
				},
				description: 'URL of the media to upload',
			},
			
			// POST OPERATIONS
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['post'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new post',
						action: 'Create a new post',
					},
				],
				default: 'create',
			},
			
			// Common Post Parameters
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
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
				description: 'Platform to post to',
			},
			
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				description: 'ID of the connected account for publishing the post (if not provided, will use the ID from credentials)',
			},
			
			{
				displayName: 'Post Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				description: 'The main textual content of the post',
			},
			
			{
				displayName: 'Media URLs',
				name: 'mediaUrls',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				description: 'URLs of media to attach to the post (should be from blotato.com domain)',
			},
			
			// Schedule Post Option
			{
				displayName: 'Schedule Post',
				name: 'schedulePost',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
					},
				},
				description: 'Whether to schedule the post for later',
			},
			
			{
				displayName: 'Scheduled Time',
				name: 'scheduledTime',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						schedulePost: [true],
					},
				},
				description: 'The time to schedule the post for (ISO 8601 format)',
			},
			
			// PLATFORM-SPECIFIC PARAMETERS
			
			// Facebook parameters
			{
				displayName: 'Page ID',
				name: 'pageId',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['facebook'],
					},
				},
				description: 'Facebook Page ID (if not provided, will use the ID from credentials)',
			},
			
			// LinkedIn parameters
			{
				displayName: 'Page ID (Optional)',
				name: 'pageId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['linkedin'],
					},
				},
				description: 'Optional LinkedIn Page ID',
			},
			
			// Pinterest parameters
			{
				displayName: 'Board ID',
				name: 'boardId',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['pinterest'],
					},
				},
				description: 'Pinterest board ID (if not provided, will use the ID from credentials)',
			},
			
			{
				displayName: 'Pin Title (Optional)',
				name: 'pinTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['pinterest'],
					},
				},
				description: 'Optional title for the pin',
			},
			
			{
				displayName: 'Alt Text (Optional)',
				name: 'altText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['pinterest'],
					},
				},
				description: 'Alternative text for the pin image',
			},
			
			{
				displayName: 'Link URL (Optional)',
				name: 'link',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['pinterest'],
					},
				},
				description: 'URL link for the pin',
			},
			
			// TikTok parameters
			{
				displayName: 'Privacy Level',
				name: 'privacyLevel',
				type: 'options',
				options: [
					{ name: 'Self Only', value: 'SELF_ONLY' },
					{ name: 'Public To Everyone', value: 'PUBLIC_TO_EVERYONE' },
					{ name: 'Mutual Follow Friends', value: 'MUTUAL_FOLLOW_FRIENDS' },
					{ name: 'Follower Of Creator', value: 'FOLLOWER_OF_CREATOR' },
				],
				default: 'PUBLIC_TO_EVERYONE',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['tiktok'],
					},
				},
				description: 'Privacy level of the TikTok post',
			},
			
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['tiktok'],
					},
				},
				options: [
					{
						displayName: 'Disable Comments',
						name: 'disabledComments',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Disable Duet',
						name: 'disabledDuet',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Disable Stitch',
						name: 'disabledStitch',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Is Branded Content',
						name: 'isBrandedContent',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Is Your Brand',
						name: 'isYourBrand',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Is AI Generated',
						name: 'isAiGenerated',
						type: 'boolean',
						default: false,
					},
				],
			},
			
			// Threads parameters
			{
				displayName: 'Reply Control',
				name: 'replyControl',
				type: 'options',
				options: [
					{ name: 'Everyone', value: 'everyone' },
					{ name: 'Accounts You Follow', value: 'accounts_you_follow' },
					{ name: 'Mentioned Only', value: 'mentioned_only' },
				],
				default: 'everyone',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['threads'],
					},
				},
				description: 'Who can reply to the post',
			},
			
			// YouTube parameters
			{
				displayName: 'Video Title',
				name: 'videoTitle',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['youtube'],
					},
				},
				description: 'Title of the YouTube video',
			},
			
			{
				displayName: 'Privacy Status',
				name: 'privacyStatus',
				type: 'options',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				default: 'public',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['youtube'],
					},
				},
				description: 'Privacy status of the YouTube video',
			},
			
			{
				displayName: 'Notify Subscribers',
				name: 'shouldNotifySubscribers',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['create'],
						platform: ['youtube'],
					},
				},
				description: 'Whether to notify subscribers about the new video',
			},
		],
	};

	// The execute method will run for each item in the input data
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		
		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				
				// MEDIA RESOURCE OPERATIONS
				if (resource === 'media') {
					// Upload media operation
					if (operation === 'upload') {
						const url = this.getNodeParameter('url', i) as string;
						
						// Make API request to upload media
						const responseData = await blotatoApiRequest.call(
							this,
							'POST',
							'/media',
							{ url },
						);
						
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				}
				
				// POST RESOURCE OPERATIONS
				if (resource === 'post') {
					// Create post operation
					if (operation === 'create') {
						const platform = this.getNodeParameter('platform', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const mediaUrls = this.getNodeParameter('mediaUrls', i) as string[];
						
						// Get account ID from node parameters or credentials
						let accountId = this.getNodeParameter('accountId', i, '') as string;
						
						// Get credentials with social media accounts
						const credentials = await this.getCredentials('blotatoApi') as {
							apiKey: string;
							socialMediaAccounts?: {
								accounts?: {
									instagram_id?: string;
									youtube_id?: string;
									tiktok_id?: string;
									facebook_id?: string;
									facebook_page_id?: string;
									threads_id?: string;
									twitter_id?: string;
									linkedin_id?: string;
									pinterest_id?: string;
									pinterest_board_id?: string;
									bluesky_id?: string;
								}
							}
						};
						
						// If account ID not provided, try to get from credentials
						if (!accountId && credentials.socialMediaAccounts?.accounts) {
							const accountField = `${platform}_id` as keyof typeof credentials.socialMediaAccounts.accounts;
							const savedAccountId = credentials.socialMediaAccounts.accounts[accountField];
							
							if (savedAccountId) {
								accountId = savedAccountId;
							}
						}
						
						// Initialize the post data structure
						const postData: {
							post: {
								accountId: string;
								content: {
									text: string;
									mediaUrls: string[];
									platform: string;
								};
								target: {
									targetType: string;
									[key: string]: any;
								};
							};
							scheduledTime?: string;
						} = {
							post: {
								accountId,
								content: {
									text,
									mediaUrls,
									platform,
								},
								target: {
									targetType: platform,
								},
							},
						};
						
						// Handle scheduled posts
						const schedulePost = this.getNodeParameter('schedulePost', i) as boolean;
						if (schedulePost) {
							const scheduledTime = this.getNodeParameter('scheduledTime', i) as string;
							postData.scheduledTime = scheduledTime;
						}
						
						// Add platform-specific parameters
						switch (platform) {
							case 'facebook':
								let pageId = this.getNodeParameter('pageId', i, '') as string;
								
								// If page ID not provided, try to get from credentials
								if (!pageId && credentials.socialMediaAccounts?.accounts?.facebook_page_id) {
									pageId = credentials.socialMediaAccounts.accounts.facebook_page_id;
								}
								
								postData.post.target.pageId = pageId;
								break;
							
							case 'linkedin':
								const linkedinPageId = this.getNodeParameter('pageId', i, '') as string;
								if (linkedinPageId) {
									postData.post.target.pageId = linkedinPageId;
								}
								break;
							
							case 'pinterest':
								let boardId = this.getNodeParameter('boardId', i, '') as string;
								
								// If board ID not provided, try to get from credentials
								if (!boardId && credentials.socialMediaAccounts?.accounts?.pinterest_board_id) {
									boardId = credentials.socialMediaAccounts.accounts.pinterest_board_id;
								}
								
								postData.post.target.boardId = boardId;
								
								const pinTitle = this.getNodeParameter('pinTitle', i, '') as string;
								if (pinTitle) {
									postData.post.target.title = pinTitle;
								}
								
								const altText = this.getNodeParameter('altText', i, '') as string;
								if (altText) {
									postData.post.target.altText = altText;
								}
								
								const link = this.getNodeParameter('link', i, '') as string;
								if (link) {
									postData.post.target.link = link;
								}
								break;
							
							case 'tiktok':
								postData.post.target.privacyLevel = this.getNodeParameter('privacyLevel', i) as string;
								
								// Get additional TikTok options
								const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
									disabledComments?: boolean;
									disabledDuet?: boolean;
									disabledStitch?: boolean;
									isBrandedContent?: boolean;
									isYourBrand?: boolean;
									isAiGenerated?: boolean;
								};
								
								// Add all additional options to the target
								Object.assign(postData.post.target, additionalOptions);
								break;
							
							case 'threads':
								const replyControl = this.getNodeParameter('replyControl', i, '') as string;
								if (replyControl) {
									postData.post.target.replyControl = replyControl;
								}
								break;
							
							case 'youtube':
								postData.post.target.title = this.getNodeParameter('videoTitle', i) as string;
								postData.post.target.privacyStatus = this.getNodeParameter('privacyStatus', i) as string;
								postData.post.target.shouldNotifySubscribers = this.getNodeParameter('shouldNotifySubscribers', i) as boolean;
								break;
						}
						
						// Make API request to create post
						const responseData = await blotatoApiRequest.call(
							this,
							'POST',
							'/posts',
							postData,
						);
						
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				}
				
			} catch (error) {
				// If the option continueOnFail is set to true, we simply append the error to the returned items
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
