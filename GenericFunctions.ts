import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeApiResponse,
	NodeApiError,
} from 'n8n-workflow';
import { OptionsWithUri } from 'request';

/**
 * Base URL for the Blotato API
 */
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
	
	// Define the request options
	const options: OptionsWithUri = {
		method,
		uri: `${apiBaseUrl}${endpoint}`,
		qs,
		body,
		json: true,
		headers: {
			'blotato-api-key': credentials.apiKey as string,
		},
	};
	
	try {
		// Make the request using the n8n helper
		const response = await this.helpers.request(options);
		return response;
	} catch (error) {
		// Improve error handling by checking for specific error responses
		if (error.statusCode === 429) {
			throw new NodeApiError(this.getNode(), error, {
				message: 'Rate limit exceeded, please try again later',
				description: 'Blotato API has a rate limit of 30 requests/minute for post creation and 10 requests/minute for media uploads',
			});
		}
		
		throw new NodeApiError(this.getNode(), error);
	}
}

/**
 * Makes an API request to Blotato and returns the full response
 * Useful when you need headers or status code
 */
export async function blotatoApiRequestWithFullResponse(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: object = {},
	qs: object = {},
): Promise<INodeApiResponse> {
	const credentials = await this.getCredentials('blotatoApi');
	
	const options: OptionsWithUri = {
		method,
		uri: `${apiBaseUrl}${endpoint}`,
		qs,
		body,
		json: true,
		headers: {
			'blotato-api-key': credentials.apiKey as string,
		},
		resolveWithFullResponse: true,
	};
	
	try {
		return await this.helpers.requestWithFullResponse(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
