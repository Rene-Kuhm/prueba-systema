import { Client, Account, Databases, Query } from 'appwrite';

const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your API Endpoint
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID
  //.setKey(import.meta.env.VITE_APPWRITE_API_KEY);

export const account = new Account(client);
export const databases = new Databases(client);
export { Query };
export { client };