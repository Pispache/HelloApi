// API Configuration for remote backend
const API_CONFIG = {
    BASE_URL: 'http://localhost:5001/api',
    ENDPOINTS: {
        MESSAGES: '/message',
        ITEMS: '/item', 
        PERSONS: '/person',
        ORDERS: '/order'
    }
};

// Get full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}
