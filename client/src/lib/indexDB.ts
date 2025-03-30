import type { Article } from "@shared/schema";

const DB_NAME = "ArticlesDB";
const STORE_NAME = "articles";

// Open or create the database
async function openDB(): Promise<IDBDatabase> {
    try {
        return await new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "_id" });
                }
            };

            request.onsuccess = (event: Event) => resolve((event.target as IDBRequest).result);
            request.onerror = () => reject(new Error("Failed to open database"));
        });
    } catch (error) {
        console.error("Error opening database:", error);
        throw error;
    }
}


// Store multiple articles in IndexedDB
export async function storeArticles(articles: Article[]): Promise<void> {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            // Filter out articles without _id
            const validArticles = articles.filter(article => article._id);

            validArticles.forEach(article => {
                store.put(article);
            });
            console.log("Articles stored successfully:", validArticles);
            transaction.oncomplete = () => {
                console.log(`${validArticles.length} articles stored successfully`);
                resolve();
            };

            transaction.onerror = () => reject(new Error("Failed to store articles"));
        });
    } catch (error) {
        console.error("Error storing articles:", error);
        throw error;
    }
}

// Get all articles from IndexedDB
export async function getAllArticles(): Promise<Article[]> {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error("Error retrieving articles from IndexedDB");
                reject(new Error("Failed to retrieve articles"));
            };
        });
    } catch (error) {
        console.error("Error getting articles:", error);
        throw error;
    }
}

