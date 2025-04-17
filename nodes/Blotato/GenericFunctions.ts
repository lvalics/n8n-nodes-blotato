import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodeApiResponse,
	NodeApiError,
} from 'n8n-workflow';
import { OptionsWithUri } from 'request';
import * as FormData from 'form-data';

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
 * @param {boolean} isFormData - Whether the body is FormData
 * @returns {Promise<any>} The API response
 */
export async function blotatoApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: object | FormData = {},
	qs: object = {},
	isFormData = false,
): Promise<any> {
	const credentials = await this.getCredentials('blotatoApi');
	
	// Define base request options
	const options: OptionsWithUri = {
		method,
		uri: `${apiBaseUrl}${endpoint}`,
		qs,
		headers: {
			'blotato-api-key': credentials.apiKey as string,
		},
	};
	
	// Handle different body types
	if (isFormData && body instanceof FormData) {
		// For FormData (binary uploads), extract headers and body properly
		const formHeaders = body.getHeaders();
		options.headers = { ...options.headers, ...formHeaders };
		options.body = body;
	} else {
		// For regular JSON requests
		options.body = body;
		options.json = true;
	}
	
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
	body: object | FormData = {},
	qs: object = {},
	isFormData = false,
): Promise<INodeApiResponse> {
	const credentials = await this.getCredentials('blotatoApi');
	
	// Define base request options
	const options: OptionsWithUri = {
		method,
		uri: `${apiBaseUrl}${endpoint}`,
		qs,
		headers: {
			'blotato-api-key': credentials.apiKey as string,
		},
		resolveWithFullResponse: true,
	};
	
	// Handle different body types
	if (isFormData && body instanceof FormData) {
		// For FormData (binary uploads), extract headers and body properly
		const formHeaders = body.getHeaders();
		options.headers = { ...options.headers, ...formHeaders };
		options.body = body;
	} else {
		// For regular JSON requests
		options.body = body;
		options.json = true;
	}
	
	try {
		return await this.helpers.requestWithFullResponse(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}
