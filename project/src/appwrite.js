import { Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT).setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    searchTerm = searchTerm.strip();
    try {
        // Check if the search term already exists
        const existingRecords = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal('searchTerm', searchTerm)
        ]);
    
        if (existingRecords.total > 0) {
        // If it exists, update the count
        const record = existingRecords.documents[0];
        const newCount = record.count + 1;
    
        await database.updateDocument(DATABASE_ID, COLLECTION_ID, record.$id, {
            count: newCount
        });
        } else {
        // If it doesn't exist, create a new record
        await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            searchTerm: searchTerm,
            count: 1, 
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        });
        }
    } catch (error) {
        console.error('Error updating search count:', error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const records = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.orderDesc('count'),
            Query.limit(100)
        ]);
        return records.documents;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}