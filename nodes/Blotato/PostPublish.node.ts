import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blotatoApiRequest } from './GenericFunctions';

export class PostPublish implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blotato Post Publish',
		name: 'blotatoPostPublish',
		icon: 'file:blotato.svg',
		group: ['transform'],
		version: 1,
		description: 'Publish content to social media platforms',
		defaults: {
			name: 'Post Publish',
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
			// Base post content
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
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'twitter',
				description: 'The platform to publish the post to',
				required: true,
			},
			{
				displayName: 'Post Text',
				name: 'text',
				type: 'string',
				default: '',
				description: 'The text content of the post',
				typeOptions: {
					rows: 5,
				},
				required: true,
			},
			{
				displayName: 'Media URLs',
				name: 'mediaUrls',
				type: 'string',
				default: '',
				description: 'URLs of media to include in the post (comma-separated). These must be from blotato.com domain.',
				placeholder: 'https://blotato.com/media1.jpg, https://blotato.com/media2.jpg',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'The ID of the connected account to publish from. Leave blank to use ID from credentials.',
				required: false,
			},

			// Scheduled time
			{
				displayName: 'Schedule Post',
				name: 'schedulePost',
				type: 'boolean',
				default: false,
				description: 'Whether to schedule the post for a future time',
			},
			{
				displayName: 'Scheduled Time',
				name: 'scheduledTime',
				type: 'dateTime',
				default: '',
				description: 'The date and time when the post should be published',
				displayOptions: {
					show: {
						schedulePost: [true],
					},
				},
				required: true,
			},

			// Thread settings
			{
				displayName: 'Create Thread',
				name: 'createThread',
				type: 'boolean',
				default: false,
				description: 'Whether to create a thread with additional posts',
				displayOptions: {
					show: {
						platform: ['twitter', 'bluesky', 'threads'],
					},
				},
			},
			{
				displayName: 'Additional Posts',
				name: 'additionalPosts',
				placeholder: 'Add Post',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						createThread: [true],
						platform: ['twitter', 'bluesky', 'threads'],
					},
				},
				options: [
					{
						name: 'posts',
						displayName: 'Posts',
						values: [
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								description: 'The text content of the additional post',
								typeOptions: {
									rows: 3,
								},
								required: true,
							},
							{
								displayName: 'Media URLs',
								name: 'mediaUrls',
								type: 'string',
								default: '',
								description: 'URLs of media to include in this post (comma-separated)',
								placeholder: 'https://blotato.com/media1.jpg, https://blotato.com/media2.jpg',
							},
						],
					},
				],
			},

			// Platform-specific parameters - Facebook
			{
				displayName: 'Facebook Page ID',
				name: 'facebookPageId',
				type: 'string',
				default: '',
				description: 'ID of the Facebook Page to post to. Leave blank to use ID from credentials.',
				displayOptions: {
					show: {
						platform: ['facebook'],
					},
				},
			},

			// Platform-specific parameters - LinkedIn
			{
				displayName: 'LinkedIn Page ID',
				name: 'linkedinPageId',
				type: 'string',
				default: '',
				description: 'Optional LinkedIn Page ID. Leave blank to post to personal profile.',
				displayOptions: {
					show: {
						platform: ['linkedin'],
					},
				},
				required: false,
			},

			// Platform-specific parameters - Pinterest
			{
				displayName: 'Pinterest Board ID',
				name: 'pinterestBoardId',
				type: 'string',
				default: '',
				description: 'ID of the Pinterest board to post to. Leave blank to use ID from credentials.',
				displayOptions: {
					show: {
						platform: ['pinterest'],
					},
				},
			},
			{
				displayName: 'Pin Title',
				name: 'pinterestTitle',
				type: 'string',
				default: '',
				description: 'Title for the Pinterest pin',
				displayOptions: {
					show: {
						platform: ['pinterest'],
					},
				},
				required: false,
			},
			{
				displayName: 'Pin Alt Text',
				name: 'pinterestAltText',
				type: 'string',
				default: '',
				description: 'Alternative text for the Pinterest pin',
				displayOptions: {
					show: {
						platform: ['pinterest'],
					},
				},
				required: false,
			},
			{
				displayName: 'Pin URL',
				name: 'pinterestLink',
				type: 'string',
				default: '',
				description: 'URL to link from the Pinterest pin',
				displayOptions: {
					show: {
						platform: ['pinterest'],
					},
				},
				required: false,
			},

			// Platform-specific parameters - TikTok
			{
				displayName: 'TikTok Privacy Level',
				name: 'tiktokPrivacyLevel',
				type: 'options',
				options: [
					{ name: 'Public', value: 'PUBLIC_TO_EVERYONE' },
					{ name: 'Followers Only', value: 'FOLLOWER_OF_CREATOR' },
					{ name: 'Friends Only', value: 'MUTUAL_FOLLOW_FRIENDS' },
					{ name: 'Private', value: 'SELF_ONLY' },
				],
				default: 'PUBLIC_TO_EVERYONE',
				description: 'Privacy level of the TikTok post',
				displayOptions: {
					show: {
						platform: ['tiktok'],
					},
				},
				required: true,
			},
			{
				displayName: 'TikTok Options',
				name: 'tiktokOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
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

			// Platform-specific parameters - Threads
			{
				displayName: 'Reply Control',
				name: 'threadsReplyControl',
				type: 'options',
				options: [
					{ name: 'Everyone', value: 'everyone' },
					{ name: 'Accounts You Follow', value: 'accounts_you_follow' },
					{ name: 'Mentioned Only', value: 'mentioned_only' },
				],
				default: 'everyone',
				description: 'Who can reply to the Threads post',
				displayOptions: {
					show: {
						platform: ['threads'],
					},
				},
				required: false,
			},

			// Platform-specific parameters - YouTube
			{
				displayName: 'Video Title',
				name: 'youtubeTitle',
				type: 'string',
				default: '',
				description: 'Title for the YouTube video',
				displayOptions: {
					show: {
						platform: ['youtube'],
					},
				},
				required: true,
			},
			{
				displayName: 'Privacy Status',
				name: 'youtubePrivacyStatus',
				type: 'options',
				options: [
					{ name: 'Public', value: 'public' },
					{ name: 'Private', value: 'private' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				default: 'public',
				description: 'Privacy status of the YouTube video',
				displayOptions: {
					show: {
						platform: ['youtube'],
					},
				},
				required: true,
			},
			{
				displayName: 'Notify Subscribers',
				name: 'youtubeNotifySubscribers',
				type: 'boolean',
				default: true,
				description: 'Whether to notify subscribers about the new video',
				displayOptions: {
					show: {
						platform: ['youtube'],
					},
				},
			},

			// Platform-specific parameters - Webhook
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				description: 'URL of the webhook to send the post data to',
				displayOptions: {
					show: {
						platform: ['webhook'],
					},
				},
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials for social account IDs
		const credentials = await this.getCredentials('blotatoApi');

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				// Get base parameters
				const platform = this.getNodeParameter('platform', i) as string;
				const text = this.getNodeParameter('text', i) as string;
				let accountId = this.getNodeParameter('accountId', i) as string;
				const mediaUrlsString = this.getNodeParameter('mediaUrls', i) as string;

				// Get media URLs as array
				const mediaUrls = mediaUrlsString ?
					mediaUrlsString.split(',').map(url => url.trim()).filter(url => url) :
					[];

				// If no account ID provided, try to get from credentials
				if (!accountId) {
					const credentialField = `${platform}_id` as keyof typeof credentials;
					accountId = credentials[credentialField] as string || '';

					if (!accountId) {
						throw new Error(`No ${platform} account ID provided in node parameters or credentials`);
					}
				}

				// Start building the request body
				const postData: any = {
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

				// Add additional posts for thread if applicable
				if (['twitter', 'bluesky', 'threads'].includes(platform)) {
					const createThread = this.getNodeParameter('createThread', i, false) as boolean;
					if (createThread) {
						const additionalPostsData = this.getNodeParameter('additionalPosts', i, { posts: [] }) as { posts: Array<{text: string, mediaUrls: string}> };

						if (additionalPostsData.posts.length > 0) {
							postData.post.content.additionalPosts = additionalPostsData.posts.map(post => {
								const mediaUrls = post.mediaUrls ?
									post.mediaUrls.split(',').map(url => url.trim()).filter(url => url) :
									[];

								return {
									text: post.text,
									mediaUrls,
								};
							});
						}
					}
				}

				// Add platform-specific parameters
				switch (platform) {
					case 'facebook':
						let facebookPageId = this.getNodeParameter('facebookPageId', i, '') as string;
						if (!facebookPageId) {
							facebookPageId = credentials.facebook_page_id as string || '';
							if (!facebookPageId) {
								throw new Error('Facebook Page ID is required for posting to Facebook');
							}
						}
						postData.post.target.pageId = facebookPageId;
						break;

					case 'linkedin':
						const linkedinPageId = this.getNodeParameter('linkedinPageId', i, '') as string;
						if (linkedinPageId) {
							postData.post.target.pageId = linkedinPageId;
						}
						break;

					case 'pinterest':
						let pinterestBoardId = this.getNodeParameter('pinterestBoardId', i, '') as string;
						if (!pinterestBoardId) {
							pinterestBoardId = credentials.pinterest_board_id as string || '';
							if (!pinterestBoardId) {
								throw new Error('Pinterest Board ID is required for posting to Pinterest');
							}
						}
						postData.post.target.boardId = pinterestBoardId;

						// Add optional Pinterest parameters
						const pinterestTitle = this.getNodeParameter('pinterestTitle', i, '') as string;
						if (pinterestTitle) {
							postData.post.target.title = pinterestTitle;
						}

						const pinterestAltText = this.getNodeParameter('pinterestAltText', i, '') as string;
						if (pinterestAltText) {
							postData.post.target.altText = pinterestAltText;
						}

						const pinterestLink = this.getNodeParameter('pinterestLink', i, '') as string;
						if (pinterestLink) {
							postData.post.target.link = pinterestLink;
						}
						break;

					case 'tiktok':
						// Add required TikTok parameters
						postData.post.target.privacyLevel = this.getNodeParameter('tiktokPrivacyLevel', i) as string;

						// Add optional TikTok parameters
						const tiktokOptions = this.getNodeParameter('tiktokOptions', i, {}) as {
							disabledComments?: boolean;
							disabledDuet?: boolean;
							disabledStitch?: boolean;
							isBrandedContent?: boolean;
							isYourBrand?: boolean;
							isAiGenerated?: boolean;
						};

						postData.post.target = {
							...postData.post.target,
							disabledComments: tiktokOptions.disabledComments ?? false,
							disabledDuet: tiktokOptions.disabledDuet ?? false,
							disabledStitch: tiktokOptions.disabledStitch ?? false,
							isBrandedContent: tiktokOptions.isBrandedContent ?? false,
							isYourBrand: tiktokOptions.isYourBrand ?? false,
							isAiGenerated: tiktokOptions.isAiGenerated ?? false,
						};
						break;

					case 'threads':
						const threadsReplyControl = this.getNodeParameter('threadsReplyControl', i, '') as string;
						if (threadsReplyControl) {
							postData.post.target.replyControl = threadsReplyControl;
						}
						break;

					case 'youtube':
						postData.post.target.title = this.getNodeParameter('youtubeTitle', i) as string;
						postData.post.target.privacyStatus = this.getNodeParameter('youtubePrivacyStatus', i) as string;
						postData.post.target.shouldNotifySubscribers = this.getNodeParameter('youtubeNotifySubscribers', i, true) as boolean;
						break;

					case 'webhook':
						postData.post.target.url = this.getNodeParameter('webhookUrl', i) as string;
						break;
				}

				// Add scheduled time if specified
				const schedulePost = this.getNodeParameter('schedulePost', i, false) as boolean;
				if (schedulePost) {
					const scheduledTime = this.getNodeParameter('scheduledTime', i) as string;
					postData.scheduledTime = scheduledTime;
				}

				// Send the post request
				const responseData = await blotatoApiRequest.call(
					this,
					'POST',
					'/posts',
					postData,
				);

				// Prepare the output item
				const newItem: INodeExecutionData = {
					json: {
						success: true,
						postSubmissionId: responseData.postSubmissionId,
						platform,
						scheduledTime: postData.scheduledTime || null,
					},
					pairedItem: { item: i },
				};

				returnData.push(newItem);
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
}
