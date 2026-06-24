const routes = [
    { path: '/', component: Catalog },
    { path: '/register', component: Register },
    { path: '/login', component: Login },
    { path: '/cart', component: Cart },
    { path: '/orders', component: Orders }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
    const publicRoutes = ['/', '/register', '/login'];
    const protectedRoutes = ['/cart', '/orders'];

    // Use global store directly
    if (protectedRoutes.includes(to.path) && !store.isAuthenticated()) {
        next('/login');
    } else if ((to.path === '/register' || to.path === '/login') && store.isAuthenticated()) {
        next('/');
    } else {
        next();
    }
});
