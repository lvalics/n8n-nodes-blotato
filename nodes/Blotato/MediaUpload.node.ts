import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blotatoApiRequest } from './GenericFunctions';

export class MediaUpload implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Blotato Media Upload',
		name: 'blotatoMediaUpload',
		icon: 'file:blotato.svg',
		group: ['transform'],
		version: 1,
		description: 'Upload media to Blotato for social media publishing',
		defaults: {
			name: 'Media Upload',
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
			// Upload method selection
			{
				displayName: 'Upload Method',
				name: 'uploadMethod',
				type: 'options',
				options: [
					{
						name: 'URL',
						value: 'url',
						description: 'Upload media from a URL',
					},
					{
						name: 'Binary Data',
						value: 'binaryData',
						description: 'Upload media from binary data',
					},
				],
				default: 'url',
				description: 'Method to upload the media',
			},

			// URL upload parameters
			{
				displayName: 'Media URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						uploadMethod: ['url'],
					},
				},
				description: 'URL of the media to upload (image or video)',
			},

			// Binary data upload parameters
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						uploadMethod: ['binaryData'],
					},
				},
				description: 'Binary property containing the file to upload',
			},

			// Output field for all methods
			{
				displayName: 'Output Field',
				name: 'outputField',
				type: 'string',
				default: 'mediaUrl',
				description: 'Field name to store the uploaded media URL',
			},

			// Include credentials in output
			{
				displayName: 'Include Social Account IDs',
				name: 'includeSocialAccounts',
				type: 'boolean',
				default: true,
				description: 'Whether to include social media account IDs in the output for use in later nodes',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials for possible use of social media account IDs
		const credentials = await this.getCredentials('blotatoApi');

		// Process each input item
		for (let i = 0; i < items.length; i++) {
			try {
				const uploadMethod = this.getNodeParameter('uploadMethod', i) as string;
				const outputField = this.getNodeParameter('outputField', i) as string;
				const includeSocialAccounts = this.getNodeParameter('includeSocialAccounts', i) as boolean;

				let responseData;

				// Handle URL uploads
				if (uploadMethod === 'url') {
					const url = this.getNodeParameter('url', i) as string;

					// Upload media via URL
					responseData = await blotatoApiRequest.call(
						this,
						'POST',
						'/media',
						{ url },
					);
				}
				// Handle binary data uploads
				else {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					
					// Check if binary data exists - with proper null checking
					if (!items[i].binary || !items[i].binary?.[binaryPropertyName]) {
						throw new Error(`No binary data found in property "${binaryPropertyName}"`);
					}

					// Use non-null assertion since we've checked it exists above
					const binaryData = items[i].binary![binaryPropertyName];
					
					// Get the URL if it exists in binary data (from previous HTTP nodes)
					if (binaryData.url) {
						// Use the existing URL from binary data
						responseData = await blotatoApiRequest.call(
							this,
							'POST',
							'/media',
							{ url: binaryData.url },
						);
					} else {
						// Convert binary data to data URI for upload
						// Note: This approach works for smaller files but may have limitations for larger files
						const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const base64Data = buffer.toString('base64');
						const mimeType = binaryData.mimeType || 'application/octet-stream';
						const dataUrl = `data:${mimeType};base64,${base64Data}`;
						
						// Upload media using the data URI URL
						responseData = await blotatoApiRequest.call(
							this,
							'POST',
							'/media',
							{ url: dataUrl },
						);
					}
				}

				// Prepare the output item
				const newItem: INodeExecutionData = {
					json: {},
				};

				// Set the output field with the media URL
				if (responseData && responseData.url) {
					newItem.json[outputField] = responseData.url;
				}

				// Include the full response data
				newItem.json.mediaUploadResponse = responseData;

				// Include social media account IDs from credentials if requested
				if (includeSocialAccounts) {
					newItem.json.socialAccounts = {
						instagram_id: credentials.instagram_id,
						youtube_id: credentials.youtube_id,
						tiktok_id: credentials.tiktok_id,
						facebook_id: credentials.facebook_id,
						facebook_page_id: credentials.facebook_page_id,
						threads_id: credentials.threads_id,
						twitter_id: credentials.twitter_id,
						linkedin_id: credentials.linkedin_id,
						pinterest_id: credentials.pinterest_id,
						pinterest_board_id: credentials.pinterest_board_id,
						bluesky_id: credentials.bluesky_id,
					};
				}

				returnData.push(newItem);
			} catch (error) {
				// Handle errors
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
