const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('oKaneDB', 1)

        request.onupgradeneeded = () => {
            const db = request.result

            if(!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'name' });
            }

            if(!db.objectStoreNames.contains('movements')) {
                db.createObjectStore('movements', { autoIncrement: true });
            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = (err) => reject(err);

    });
};

export { openDB };