const Orders = {
    template: `
        <div class="animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="mb-0">
                    <i class="fas fa-receipt me-2"></i>Мои заказы
                </h1>
                <router-link to="/" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Назад в каталог
                </router-link>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </div>

            <!-- Empty orders -->
            <div v-else-if="orders.length === 0" class="text-center py-5">
                <i class="fas fa-inbox fa-4x text-muted mb-3"></i>
                <p class="text-muted h4">У вас пока нет заказов</p>
                <router-link to="/" class="btn btn-custom mt-3">
                    Перейти в каталог
                </router-link>
            </div>

            <!-- Orders list -->
            <div v-else class="row g-4">
                <div v-for="order in orders" :key="order.id" class="col-12">
                    <div class="card shadow">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 class="card-title mb-1">Заказ #{{ order.id }}</h5>
                                    <p class="text-muted mb-0">
                                        <i class="fas fa-calendar me-2"></i>{{ formatDate(order.createdAt) }}
                                    </p>
                                </div>
                                <div class="text-end">
                                    <span class="badge" 
                                          :class="getStatusClass(order.status)">
                                        {{ getStatusText(order.status) }}
                                    </span>
                                    <p class="mb-0 fw-bold text-primary h4 mt-2">
                                        {{ formatPrice(order.total) }} ₽
                                    </p>
                                </div>
                            </div>

                            <hr>

                            <div class="table-responsive">
                                <table class="table table-sm mb-0">
                                    <thead>
                                        <tr>
                                            <th>Товар</th>
                                            <th class="text-center">Количество</th>
                                            <th class="text-end">Цена</th>
                                            <th class="text-end">Сумма</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in order.items" :key="item.productId">
                                            <td>{{ item.name || 'Товар #' + item.productId }}</td>
                                            <td class="text-center">{{ item.quantity }}</td>
                                            <td class="text-end">{{ formatPrice(item.price) }} ₽</td>
                                            <td class="text-end">{{ formatPrice(item.price * item.quantity) }} ₽</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="text-end fw-bold">Итого:</td>
                                            <td class="text-end fw-bold text-primary">{{ formatPrice(order.total) }} ₽</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            loading: true,
            orders: []
        };
    },

    created() {
        this.loadOrders();
    },

    methods: {
        async loadOrders() {
            if (!this.$store.isAuthenticated()) {
                this.$router.push('/login');
                return;
            }

            try {
                this.loading = true;
                this.orders = await this.$api.getOrders(this.$store.state.token);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Не удалось загрузить заказы',
                    confirmButtonColor: '#667eea'
                });
            } finally {
                this.loading = false;
            }
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        getStatusClass(status) {
            const classes = {
                'pending': 'bg-warning',
                'processing': 'bg-info',
                'completed': 'bg-success',
                'cancelled': 'bg-danger'
            };
            return classes[status] || 'bg-secondary';
        },

        getStatusText(status) {
            const texts = {
                'pending': 'Ожидает обработки',
                'processing': 'В обработке',
                'completed': 'Выполнен',
                'cancelled': 'Отменен'
            };
            return texts[status] || status;
        },

        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price);
        }
    }
};
