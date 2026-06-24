const Catalog = {
    template: `
        <div class="animate__animated animate__fadeIn">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="mb-0">
                    <i class="fas fa-gift me-2"></i>Каталог сувениров
                </h1>
                <div class="d-flex gap-3 align-items-center">
                    <router-link v-if="!isAuthenticated" to="/register" class="nav-link">
                        Регистрация
                    </router-link>
                    <router-link v-if="!isAuthenticated" to="/login" class="nav-link">
                        Вход
                    </router-link>
                    <a v-if="isAuthenticated" href="#" @click.prevent="logout" class="nav-link">
                        Выход
                    </a>
                    <router-link v-if="isClient" to="/cart" class="btn btn-custom position-relative">
                        <i class="fas fa-shopping-cart"></i>
                        Корзина
                        <span v-if="cartCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {{ cartCount }}
                        </span>
                    </router-link>
                    <router-link v-if="isClient" to="/orders" class="nav-link">
                        Мои заказы
                    </router-link>
                </div>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>

            <!-- Products grid -->
            <div v-else class="row g-4">
                <div v-for="product in products" :key="product.id" class="col-md-4 col-lg-3">
                    <div class="card product-card h-100">
                        <img :src="product.image || 'https://via.placeholder.com/300x200?text=Сувенир'" 
                             class="card-img-top product-image" 
                             :alt="product.name">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">{{ product.name }}</h5>
                            <p class="card-text text-muted small">{{ product.description || 'Описание товара' }}</p>
                            <div class="mt-auto">
                                <p class="card-text fw-bold text-primary h4 mb-3">
                                    {{ formatPrice(product.price) }} ₽
                                </p>
                                <button v-if="isClient"
                                        @click="addToCart(product)"
                                        class="btn btn-custom w-100">
                                    <i class="fas fa-cart-plus me-2"></i>В корзину
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div v-if="!loading && products.length === 0" class="text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <p class="text-muted">Каталог пуст</p>
            </div>
        </div>
    `,

    data() {
        return {
            loading: true,
            products: []
        };
    },

    computed: {
        isAuthenticated() {
            return this.$store ? this.$store.isAuthenticated() : false;
        },
        isClient() {
            return this.$store ? this.$store.isClient() : false;
        },
        cartCount() {
            return this.$store ? this.$store.getCartCount() : 0;
        },
        cart() {
            return this.$store ? this.$store.state.cart : [];
        }
    },

    created() {
        this.loadProducts();
    },

    methods: {
        async loadProducts() {
            try {
                this.loading = true;
                const products = await this.$api.getProducts();
                this.products = products;
                this.$store.setProducts(products);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Не удалось загрузить каталог товаров',
                    confirmButtonColor: '#667eea'
                });
            } finally {
                this.loading = false;
            }
        },

        addToCart(product) {
            this.$store.addToCart(product);
            Swal.fire({
                icon: 'success',
                title: 'Добавлено!',
                text: `${product.name} добавлен в корзину`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },

        async logout() {
            try {
                if (this.$store.state.token) {
                    await this.$api.logout(this.$store.state.token);
                }
                this.$store.setUser(null, null);
                Swal.fire({
                    icon: 'success',
                    title: 'Вы вышли из системы',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                this.$store.setUser(null, null);
            }
        },

        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price);
        }
    }
};
