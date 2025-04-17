import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { blotatoApiRequest } from './GenericFunctions';
import * as FormData from 'form-data';

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
			// Source type selection - URL or Binary data
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

			// URL Upload parameters
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
				description: 'URL of the media to upload (could be an image or video)',
			},

			// Binary Data Upload parameters
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						uploadMethod: ['binaryData'],
					},
				},
				description: 'Name of the binary property that contains the media file',
			},

			// Output field name
			{
				displayName: 'Output Binary Field',
				name: 'outputBinaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Name of the binary property to which to write the data of the uploaded file',
			},

			// Additional options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Custom File Name',
						name: 'customFileName',
						type: 'string',
						default: '',
						description: 'Custom file name for the uploaded media',
					},
					{
						displayName: 'Optimize Media',
						name: 'optimizeMedia',
						type: 'boolean',
						default: true,
						description: 'Whether to optimize the media for social platforms',
					},
				],
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
				const uploadMethod = this.getNodeParameter('uploadMethod', i) as string;
				const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
				const options = this.getNodeParameter('options', i, {}) as {
					customFileName?: string;
					optimizeMedia?: boolean;
				};

				let responseData;

				// Handle URL uploads
				if (uploadMethod === 'url') {
					const url = this.getNodeParameter('url', i) as string;

					// Prepare request body
					const body: { 
						url: string;
						fileName?: string;
						optimize?: boolean; 
					} = { url };

					// Add optional parameters if provided
					if (options.customFileName) {
						body.fileName = options.customFileName;
					}
					
					if (options.optimizeMedia !== undefined) {
						body.optimize = options.optimizeMedia;
					}

					// Make API request to upload media from URL
					responseData = await blotatoApiRequest.call(
						this,
						'POST',
						'/media',
						body,
					);
				}
				// Handle binary data uploads
				else if (uploadMethod === 'binaryData') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					
					// Check if the binary data property exists
					if (!items[i].binary || !items[i].binary[binaryPropertyName]) {
						throw new Error(`No binary data property "${binaryPropertyName}" found`);
					}

					const binaryData = items[i].binary[binaryPropertyName];
					
					// Create FormData for uploading binary file
					const formData = new FormData();
					
					// Get the buffer containing the binary data
					const binaryBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					
					// Use custom file name if provided, otherwise use the original file name
					const fileName = options.customFileName || binaryData.fileName || 'file';
					
					// Add the file to form data
					formData.append('file', binaryBuffer, {
						filename: fileName,
						contentType: binaryData.mimeType,
					});
					
					// Add optimization parameter if provided
					if (options.optimizeMedia !== undefined) {
						formData.append('optimize', options.optimizeMedia.toString());
					}

					// Make API request to upload binary media
					responseData = await blotatoApiRequest.call(
						this,
						'POST',
						'/media',
						formData,
						{}, // No query parameters
						true, // isFormData = true
					);
				}

				// Prepare the output item with JSON response
				const newItem: INodeExecutionData = {
					json: responseData,
					pairedItem: { item: i },
				};
				
				// Add binary property if a media URL was returned
				if (responseData && responseData.url) {
					// If binary data doesn't exist yet, initialize it
					if (!newItem.binary) {
						newItem.binary = {};
					}
					
					// Create a binary property with the media URL information
					newItem.binary[outputBinaryPropertyName] = {
						data: '', // Will be filled by n8n
						mimeType: 'application/octet-stream', // Default mime type
						fileName: responseData.fileName || 'media-file',
						fileSize: undefined,
						url: responseData.url,
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
