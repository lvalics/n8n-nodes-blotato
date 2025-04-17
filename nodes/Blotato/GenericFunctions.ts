import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	NodeApiError,
	IRequestOptions,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';

// Base URL for the Blotato API
export const apiBaseUrl = 'https://backend.blotato.com/v2';

/**
 * Makes an API request to Blotato
 * 
 * @param {IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions} this - The current context
 * @param {string} method - HTTP method (GET, POST, etc)
 * @param {string} endpoint - API endpoint to call
 * @param {object} body - Request body data
 * @param {object} qs - Query string parameters
 * @returns {Promise<any>} The API response
 */
export async function blotatoApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: object = {},
	qs: object = {},
): Promise<any> {
	const credentials = await this.getCredentials('blotatoApi');
	
	// Define request options
	const options: IRequestOptions = {
		method: method as IHttpRequestMethods,
		url: `${apiBaseUrl}${endpoint}`,
		qs: qs as IDataObject,
		body,
		json: true,
		headers: {
			'blotato-api-key': credentials.apiKey as string,
		},
	};
	
	try {
		// Make the request using the n8n helper
		return await this.helpers.request(options);
	} catch (error) {
		// Handle common API errors with helpful messages
		if (error.statusCode === 429) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'Rate limit exceeded for media uploads (10/minute)',
				description: 'Please wait before trying again',
			});
		} else if (error.statusCode === 400) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'Invalid request parameters',
				description: error.message || 'Check your media URL or file format',
			});
		} else if (error.statusCode === 401) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'Authentication failed',
				description: 'Please check your Blotato API key',
			});
		} else if (error.statusCode === 413) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'File too large',
				description: 'The media file exceeds the maximum size limit',
			});
		}
		
		// For all other errors
		throw new NodeApiError(this.getNode(), error);
	}
}
