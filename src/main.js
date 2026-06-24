const { createApp } = Vue;

console.log('Vue loaded:', Vue);
console.log('Router loaded:', router);
console.log('Store loaded:', store);

const app = createApp({
    template: '<router-view></router-view>'
});

// Make store and api globally available in all components
app.config.globalProperties.$store = store;
app.config.globalProperties.$api = api;

app.use(router);

try {
    app.mount('#app');
    console.log('Vue app mounted successfully');
} catch (error) {
    console.error('Error mounting Vue app:', error);
}
