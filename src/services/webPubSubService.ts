import { WebPubSubServiceClient } from "@azure/web-pubsub";

const connectionString = 'Endpoint=https://kth-service.webpubsub.azure.com;AccessKey=mFT6FVV3N+cHOWfYy6azQbRMLj8IjgB1uTwDoUw3rp8=;Version=1.0;'

export const hubName = 'KTH';
export const serviceClient = new WebPubSubServiceClient(connectionString, hubName);