import { Client, Account, Databases, Query } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
  .setProject('674c72fa28eb0e59bde6'); // Your project ID
  //.setKey(import.meta.env.VITE_APPWRITE_API_KEY);

export const account = new Account(client);
export const databases = new Databases(client);
export { Query };
export { client };