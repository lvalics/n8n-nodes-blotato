import { 
    IExecuteFunctions, 
    IHookFunctions, 
    ILoadOptionsFunctions,
    INodeExecutionData,
    IBinaryKeyData,
} from 'n8n-workflow';
import * as FormData from 'form-data';
import { blotatoApiRequest } from '../GenericFunctions';

/**
 * Service class to handle media-related operations
 */
export class MediaService {
    /**
     * Uploads media to Blotato API from a URL
     * 
     * @param {IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions} context - The execution context
     * @param {string} url - The URL of the media to upload
     * @returns {Promise<{url: string}>} The uploaded media URL
     */
    static async uploadByUrl(
        context: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
        url: string
    ): Promise<{ url: string }> {
        return blotatoApiRequest.call(
            context,
            'POST',
            '/media',
            { url }
        );
    }

    /**
     * Uploads media to Blotato API from binary data
     * 
     * @param {IExecuteFunctions} context - The execution context
     * @param {number} itemIndex - The index of the current item
     * @param {string} binaryPropertyName - The name of the binary property containing the file
     * @returns {Promise<{url: string}>} The uploaded media URL
     */
    static async uploadFromBinary(
        context: IExecuteFunctions,
        itemIndex: number,
        binaryPropertyName: string
    ): Promise<{ url: string }> {
        // Get binary data
        const item = context.getInputData()[itemIndex];
        
        // Check if binary data exists
        if (!item.binary || !item.binary[binaryPropertyName]) {
            throw new Error(`No binary data property "${binaryPropertyName}" found in input`);
        }
        
        const binaryData = item.binary[binaryPropertyName] as IBinaryKeyData;
        const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
        
        // Convert file to data URI
        const base64Data = buffer.toString('base64');
        const mimeType = binaryData.mimeType || 'application/octet-stream';
        const dataUri = `data:${mimeType};base64,${base64Data}`;
        
        // Upload the media
        return blotatoApiRequest.call(
            context,
            'POST',
            '/media',
            { url: dataUri }
        );
    }
}
