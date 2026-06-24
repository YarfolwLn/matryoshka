// Simple state management store
const store = Vue.reactive({
    state: {
        user: null,
        token: null,
        cart: [],
        products: []
    },

    listeners: [],

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
    },

    // Notify all listeners
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    },

    // Set user and token
    setUser(user, token) {
        this.state.user = user;
        this.state.token = token;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.notify();
    },

    // Load user from localStorage
    loadUser() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            this.state.user = JSON.parse(user);
            this.state.token = token;
            this.notify();
        }
    },

    // Add product to cart
    addToCart(product) {
        const existingItem = this.state.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.notify();
    },

    // Remove product from cart
    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.notify();
    },

    // Update product quantity
    updateQuantity(productId, quantity) {
        const item = this.state.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.notify();
            }
        }
    },

    // Clear cart
    clearCart() {
        this.state.cart = [];
        this.saveCart();
        this.notify();
    },

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.state.cart));
    },

    // Load cart from localStorage
    loadCart() {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.state.cart = JSON.parse(cart);
            this.notify();
        }
    },

    // Set products
    setProducts(products) {
        this.state.products = products;
        this.notify();
    },

    // Get cart total
    getCartTotal() {
        return this.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Get cart items count
    getCartCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.state.token;
    },

    // Check if user is client
    isClient() {
        return this.state.user && this.state.user.role === 'client';
    },

    // Initialize store
    init() {
        this.loadUser();
        this.loadCart();
    }
});

store.init();
