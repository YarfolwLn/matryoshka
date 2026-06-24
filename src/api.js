// API Service for Souvenir Shop
const API_BASE = 'http://localhost:3000';
//http://xxxxxx-m2.wsr.m1/api-souvenir
const api = {
    // Get all products
    async getProducts() {
        try {
            const response = await fetch(`${API_BASE}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    // Login user
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    // Get user orders
    async getOrders(token) {
        try {
            const response = await fetch(`${API_BASE}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Create order
    async createOrder(orderData, token) {
        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }
            return data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Logout
    async logout(token) {
        try {
            const response = await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }
};
