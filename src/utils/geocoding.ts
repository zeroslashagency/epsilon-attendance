
// Cache to store resolved names: "lat,lng" -> "City, Country"
const locationCache = new Map<string, string>();

// Queue for rate limiting (Nomintim requires max 1 req/sec)
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;

    isProcessingQueue = true;
    const task = requestQueue.shift();

    if (task) {
        await task();
        // Wait 1.1 seconds before processing next to be safe with rate limits
        setTimeout(() => {
            isProcessingQueue = false;
            processQueue();
        }, 1100);
    } else {
        isProcessingQueue = false;
    }
};

export async function getCityFromCoordinates(lat: number, lon: number): Promise<string | null> {
    const key = `${lat},${lon}`;

    // Check cache first
    if (locationCache.has(key)) {
        return locationCache.get(key)!;
    }

    // Return a promise that resolves when the queued request completes
    return new Promise((resolve) => {
        const task = async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
                    {
                        headers: {
                            'User-Agent': 'EpsilonCallManager/1.0', // Required by OSM
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    // Extract city, town, village, or generic name
                    const address = data.address;
                    const city = address?.city || address?.town || address?.village || address?.county || data.name || 'Unknown Location';

                    locationCache.set(key, city);
                    resolve(city);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                resolve(null);
            }
        };

        requestQueue.push(task);
        processQueue();
    });
}
