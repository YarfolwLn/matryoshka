const Cart = {
    template: `
        <div class="animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="mb-0">
                    <i class="fas fa-shopping-cart me-2"></i>Корзина
                </h1>
                <router-link to="/" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Назад в каталог
                </router-link>
            </div>

            <!-- Empty cart -->
            <div v-if="cart.length === 0" class="text-center py-5">
                <i class="fas fa-shopping-basket fa-4x text-muted mb-3"></i>
                <p class="text-muted h4">Корзина пуста</p>
                <router-link to="/" class="btn btn-custom mt-3">
                    Перейти в каталог
                </router-link>
            </div>

            <!-- Cart items -->
            <div v-else>
                <div class="list-group mb-4">
                    <transition-group name="slide">
                        <div v-for="item in cart" :key="item.id" class="list-group-item cart-item d-flex align-items-center">
                            <img :src="item.image || 'https://via.placeholder.com/80x80?text=Товар'" 
                                 class="rounded me-3" 
                                 style="width: 80px; height: 80px; object-fit: cover;"
                                 :alt="item.name">
                            
                            <div class="flex-grow-1">
                                <h5 class="mb-1">{{ item.name }}</h5>
                                <p class="mb-0 text-muted">{{ formatPrice(item.price) }} ₽</p>
                            </div>

                            <div class="d-flex align-items-center gap-2">
                                <button @click="decreaseQuantity(item.id)" class="quantity-btn">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="fw-bold mx-2" style="min-width: 30px; text-align: center;">
                                    {{ item.quantity }}
                                </span>
                                <button @click="increaseQuantity(item.id)" class="quantity-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>

                            <div class="ms-4 text-end">
                                <p class="mb-0 fw-bold text-primary h5">
                                    {{ formatPrice(item.price * item.quantity) }} ₽
                                </p>
                            </div>

                            <button @click="removeFromCart(item.id)" class="btn btn-outline-danger ms-3">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </transition-group>
                </div>

                <!-- Cart summary -->
                <div class="card shadow">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="mb-0">Итого:</h4>
                                <p class="text-muted mb-0">{{ cart.length }} товаров на сумму {{ formatPrice(total) }} ₽</p>
                            </div>
                            <button @click="checkout" class="btn btn-custom btn-lg" :disabled="loading">
                                <span v-if="loading" class="loading-spinner me-2"></span>
                                <i class="fas fa-credit-card me-2"></i>Оформить заказ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            loading: false
        };
    },

    computed: {
        cart() {
            return this.$store ? this.$store.state.cart : [];
        },
        total() {
            return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
    },

    methods: {
        increaseQuantity(productId) {
            this.$store.updateQuantity(productId, this.cart.find(i => i.id === productId).quantity + 1);
        },

        decreaseQuantity(productId) {
            const item = this.cart.find(i => i.id === productId);
            if (item.quantity > 1) {
                this.$store.updateQuantity(productId, item.quantity - 1);
            } else {
                this.removeFromCart(productId);
            }
        },

        removeFromCart(productId) {
            Swal.fire({
                title: 'Удалить товар?',
                text: 'Товар будет удален из корзины',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Да, удалить',
                cancelButtonText: 'Отмена'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$store.removeFromCart(productId);
                    Swal.fire({
                        icon: 'success',
                        title: 'Удалено!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        },

        async checkout() {
            if (!this.$store.isAuthenticated()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Необходима авторизация',
                    text: 'Для оформления заказа войдите в систему',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    this.$router.push('/login');
                });
                return;
            }

            try {
                this.loading = true;
                const orderData = {
                    items: this.cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total: this.total
                };

                await this.$api.createOrder(orderData, this.$store.state.token);

                this.$store.clearCart();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Заказ оформлен!',
                    text: 'Ваш заказ успешно создан',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    this.$router.push('/orders');
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: error.message || 'Не удалось оформить заказ',
                    confirmButtonColor: '#667eea'
                });
            } finally {
                this.loading = false;
            }
        },

        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price);
        }
    }
};
