import type {
    ListToolsRequest,
    ResourceLink,
} from '@modelcontextprotocol/sdk/types';
import {
    Client,
} from '@modelcontextprotocol/sdk/client';

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';
import { MyOAuthProvider } from './auth';

// Global client and transport for interactive commands
let client: Client | null = null;
let transport: StreamableHTTPClientTransport | null = null;
let serverUrl = 'http://localhost:3000/mcp';
let sessionId: string | undefined;

export async function connect(url?: string): Promise<void> {
    if (client) {
        console.log('Already connected. Disconnect first.');
        return;
    }

    if (url) {
        serverUrl = url;
    }

    console.log(`Connecting to ${serverUrl}...`);

    try {
        // Create a new client with form elicitation capability
        client = new Client(
            {
                name: 'tickup-client',
                version: '1.0.0',
            },
            {
                capabilities: {
                    elicitation: {
                        form: {},
                    },
                    tasks: {
                        requests: {
                            elicitation: {
                                create: {},
                            },
                        },
                    },
                },
            },
        );
        client.onerror = (error) => {
            console.error('\u001B[31mClient error:', error, '\u001B[0m');
            throw Error(error.message);
        };

        // TODO Set up elicitation request handler with proper validation and task support
        // client.setRequestHandler('elicitation/create', async (request, extra) => {
        //     if (request.params.mode !== 'form') {
        //         throw new ProtocolError(ProtocolErrorCode.InvalidParams, `Unsupported elicitation mode: ${request.params.mode}`);
        //     }
        //     console.log('\n🔔 Elicitation (form) Request Received:');
        //     console.log(`Message: ${request.params.message}`);
        //     console.log(`Related Task: ${request.params._meta?.[RELATED_TASK_META_KEY]?.taskId}`);
        //     console.log(`Task Creation Requested: ${request.params.task ? 'yes' : 'no'}`);
        //     console.log('Requested Schema:');
        //     console.log(JSON.stringify(request.params.requestedSchema, null, 2));

        //     // Helper to return result, optionally creating a task if requested
        //     const returnResult = async (result: {
        //         action: 'accept' | 'decline' | 'cancel';
        //         content?: Record<string, string | number | boolean | string[]>;
        //     }) => {
        //         if (request.params.task && extra.task?.store) {
        //             // Create a task and store the result
        //             const task = await extra.task.store.createTask({ ttl: extra.task.requestedTtl });
        //             await extra.task.store.storeTaskResult(task.taskId, 'completed', result);
        //             console.log(`📋 Created client-side task: ${task.taskId}`);
        //             return { task };
        //         }
        //         return result;
        //     };

        //     const schema = request.params.requestedSchema;
        //     const properties = schema.properties;
        //     const required = schema.required || [];

        //     // Set up AJV validator for the requested schema
        //     const ajv = new Ajv();
        //     const validate = ajv.compile(schema);

        //     let attempts = 0;
        //     const maxAttempts = 3;

        //     while (attempts < maxAttempts) {
        //         attempts++;
        //         console.log(`\nPlease provide the following information (attempt ${attempts}/${maxAttempts}):`);

        //         const content: Record<string, string | number | boolean | string[]> = {};
        //         let inputCancelled = false;

        //         // Collect input for each field
        //         for (const [fieldName, fieldSchema] of Object.entries(properties)) {
        //             const field = fieldSchema as {
        //                 type?: string;
        //                 title?: string;
        //                 description?: string;
        //                 default?: unknown;
        //                 enum?: string[];
        //                 minimum?: number;
        //                 maximum?: number;
        //                 minLength?: number;
        //                 maxLength?: number;
        //                 format?: string;
        //             };

        //             const isRequired = required.includes(fieldName);
        //             let prompt = `${field.title || fieldName}`;

        //             // Add helpful information to the prompt
        //             if (field.description) {
        //                 prompt += ` (${field.description})`;
        //             }
        //             if (field.enum) {
        //                 prompt += ` [options: ${field.enum.join(', ')}]`;
        //             }
        //             if (field.type === 'number' || field.type === 'integer') {
        //                 if (field.minimum !== undefined && field.maximum !== undefined) {
        //                     prompt += ` [${field.minimum}-${field.maximum}]`;
        //                 }
        //                 else if (field.minimum !== undefined) {
        //                     prompt += ` [min: ${field.minimum}]`;
        //                 }
        //                 else if (field.maximum !== undefined) {
        //                     prompt += ` [max: ${field.maximum}]`;
        //                 }
        //             }
        //             if (field.type === 'string' && field.format) {
        //                 prompt += ` [format: ${field.format}]`;
        //             }
        //             if (isRequired) {
        //                 prompt += ' *required*';
        //             }
        //             if (field.default !== undefined) {
        //                 prompt += ` [default: ${field.default}]`;
        //             }

        //             prompt += ': ';

        //             const answer = await new Promise<string>((resolve) => {
        //                 readline.question(prompt, (input) => {
        //                     resolve(input.trim());
        //                 });
        //             });

        //             // Check for cancellation
        //             if (answer.toLowerCase() === 'cancel' || answer.toLowerCase() === 'c') {
        //                 inputCancelled = true;
        //                 break;
        //             }

        //             // Parse and validate the input
        //             try {
        //                 if (answer === '' && field.default !== undefined) {
        //                     content[fieldName] = field.default as string | number | boolean | string[];
        //                 }
        //                 else if (answer === '' && !isRequired) {
        //                     // Skip optional empty fields
        //                     continue;
        //                 }
        //                 else if (answer === '') {
        //                     throw new Error(`${fieldName} is required`);
        //                 }
        //                 else {
        //                     // Parse the value based on type
        //                     let parsedValue: unknown;

        //                     switch (field.type) {
        //                         case 'boolean': {
        //                             parsedValue = answer.toLowerCase() === 'true' || answer.toLowerCase() === 'yes' || answer === '1';

        //                             break;
        //                         }
        //                         case 'number': {
        //                             parsedValue = Number.parseFloat(answer);
        //                             if (Number.isNaN(parsedValue as number)) {
        //                                 throw new TypeError(`${fieldName} must be a valid number`);
        //                             }

        //                             break;
        //                         }
        //                         case 'integer': {
        //                             parsedValue = Number.parseInt(answer, 10);
        //                             if (Number.isNaN(parsedValue as number)) {
        //                                 throw new TypeError(`${fieldName} must be a valid integer`);
        //                             }

        //                             break;
        //                         }
        //                         default: {
        //                             if (field.enum) {
        //                                 if (!field.enum.includes(answer)) {
        //                                     throw new Error(`${fieldName} must be one of: ${field.enum.join(', ')}`);
        //                                 }
        //                                 parsedValue = answer;
        //                             }
        //                             else {
        //                                 parsedValue = answer;
        //                             }
        //                         }
        //                     }

        //                     content[fieldName] = parsedValue as string | number | boolean | string[];
        //                 }
        //             }
        //             catch (error) {
        //                 console.log(`❌ Error: ${error}`);
        //                 // Continue to next attempt
        //                 break;
        //             }
        //         }

        //         if (inputCancelled) {
        //             return returnResult({ action: 'cancel' });
        //         }

        //         // If we didn't complete all fields due to an error, try again
        //         if (
        //             Object.keys(content).length
        //             !== Object.keys(properties).filter(name => required.includes(name) || content[name] !== undefined).length
        //         ) {
        //             if (attempts < maxAttempts) {
        //                 console.log('Please try again...');
        //                 continue;
        //             }
        //             else {
        //                 console.log('Maximum attempts reached. Declining request.');
        //                 return returnResult({ action: 'decline' });
        //             }
        //         }

        //         // Validate the complete object against the schema
        //         const isValid = validate(content);

        //         if (!isValid) {
        //             console.log('❌ Validation errors:');
        //             if (validate.errors)
        //                 for (const error of validate.errors) {
        //                     console.log(`  - ${error.instancePath || 'root'}: ${error.message}`);
        //                 }

        //             if (attempts < maxAttempts) {
        //                 console.log('Please correct the errors and try again...');
        //                 continue;
        //             }
        //             else {
        //                 console.log('Maximum attempts reached. Declining request.');
        //                 return returnResult({ action: 'decline' });
        //             }
        //         }

        //         // Show the collected data and ask for confirmation
        //         console.log('\n✅ Collected data:');
        //         console.log(JSON.stringify(content, null, 2));

        //         const confirmAnswer = await new Promise<string>((resolve) => {
        //             readline.question('\nSubmit this information? (yes/no/cancel): ', (input) => {
        //                 resolve(input.trim().toLowerCase());
        //             });
        //         });

        //         switch (confirmAnswer) {
        //             case 'yes':
        //             case 'y': {
        //                 return returnResult({
        //                     action: 'accept',
        //                     content,
        //                 });
        //             }
        //             case 'cancel':
        //             case 'c': {
        //                 return returnResult({ action: 'cancel' });
        //             }
        //             case 'no':
        //             case 'n': {
        //                 if (attempts < maxAttempts) {
        //                     console.log('Please re-enter the information...');
        //                     continue;
        //                 }
        //                 else {
        //                     return returnResult({ action: 'decline' });
        //                 }

        //                 break;
        //             }
        //             // No default
        //         }
        //     }

        //     console.log('Maximum attempts reached. Declining request.');
        //     return returnResult({ action: 'decline' });
        // });

        transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
            sessionId: sessionId,
            authProvider: new MyOAuthProvider(),
        });

        // Set up notification handlers
        // client.setNotificationHandler('notifications/message', (notification) => {
        //     notificationCount++;
        //     console.log(`\nNotification #${notificationCount}: ${notification.params.level} - ${notification.params.data}`);
        //     // Re-display the prompt
        //     process.stdout.write('> ');
        // });

        // client.setNotificationHandler('notifications/resources/list_changed', async (_) => {
        //     console.log(`\nResource list changed notification received!`);
        //     try {
        //         if (!client) {
        //             console.log('Client disconnected, cannot fetch resources');
        //             return;
        //         }
        //         const resourcesResult = await client.request({
        //             method: 'resources/list',
        //             params: {},
        //         });
        //         console.log('Available resources count:', resourcesResult.resources.length);
        //     }
        //     catch {
        //         console.log('Failed to list resources after change notification');
        //     }
        //     // Re-display the prompt
        //     process.stdout.write('> ');
        // });

        // Connect the client
        await client.connect(transport);
        sessionId = transport.sessionId;
        console.log('Transport created with session ID:', sessionId);
        console.log('Connected to MCP server');
    }
    catch (error) {
        console.error('Failed to connect:', error);
        client = null;
        transport = null;
    }
}

// TODO
// async function disconnect(): Promise<void> {
//     if (!client || !transport) {
//         console.log('Not connected.');
//         return;
//     }

//     try {
//         await transport.close();
//         console.log('Disconnected from MCP server');
//         client = null;
//         transport = null;
//     }
//     catch (error) {
//         console.error('Error disconnecting:', error);
//     }
// }
// async function listTools(): Promise<void> {
//     if (!client) {
//         console.log('Not connected to server.');
//         return;
//     }

//     try {
//         const toolsRequest: ListToolsRequest = {
//             method: 'tools/list',
//             params: {},
//         };

//         // @ts-expect-error TODO will fix later
//         const toolsResult = await client.request(toolsRequest);

//         console.log('Available tools:');
//         if (toolsResult.tools.length === 0) {
//             console.log('  No tools available');
//         }
//         else {
//             // for (const tool of toolsResult.tools) {
//             //     console.log(`  - id: ${tool.name}, name: ${getDisplayName(tool)}, description: ${tool.description}`);
//             // }
//         }
//     }
//     catch (error) {
//         console.log(`Tools not supported by this server (${error})`);
//     }
// }

// async function callTool(name: string, args: Record<string, unknown>): Promise<void> {
//     if (!client) {
//         console.log('Not connected to server.');
//         return;
//     }

//     try {
//         console.log(`Calling tool '${name}' with args:`, args);
//         const result = await client.callTool({ name, arguments: args });

//         console.log('Tool result:');
//         const resourceLinks: ResourceLink[] = [];

//         for (const item of result.content) {
//             switch (item.type) {
//                 case 'text': {
//                     console.log(`  ${item.text}`);

//                     break;
//                 }
//                 case 'resource_link': {
//                     const resourceLink = item as ResourceLink;
//                     resourceLinks.push(resourceLink);
//                     console.log(`  📁 Resource Link: ${resourceLink.name}`);
//                     console.log(`     URI: ${resourceLink.uri}`);
//                     if (resourceLink.mimeType) {
//                         console.log(`     Type: ${resourceLink.mimeType}`);
//                     }
//                     if (resourceLink.description) {
//                         console.log(`     Description: ${resourceLink.description}`);
//                     }

//                     break;
//                 }
//                 case 'resource': {
//                     console.log(`  [Embedded Resource: ${item.resource.uri}]`);

//                     break;
//                 }
//                 case 'image': {
//                     console.log(`  [Image: ${item.mimeType}]`);

//                     break;
//                 }
//                 case 'audio': {
//                     console.log(`  [Audio: ${item.mimeType}]`);

//                     break;
//                 }
//                 default: {
//                     console.log(`  [Unknown content type]:`, item);
//                 }
//             }
//         }

//         // Offer to read resource links
//         if (resourceLinks.length > 0) {
//             console.log(`\nFound ${resourceLinks.length} resource link(s). Use 'read-resource <uri>' to read their content.`);
//         }
//     }
//     catch (error) {
//         console.log(`Error calling tool ${name}: ${error}`);
//     }
// }
