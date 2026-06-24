const Login = {
    template: `
        <div class="animate__animated animate__fadeIn">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card shadow">
                        <div class="card-body p-4">
                            <h2 class="text-center mb-4">
                                <i class="fas fa-sign-in-alt me-2"></i>Вход в систему
                            </h2>
                            
                            <form @submit.prevent="login">
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" 
                                           class="form-control" 
                                           :class="{ 'is-invalid': errors.email }"
                                           id="email" 
                                           v-model="form.email"
                                           placeholder="Введите email">
                                    <div v-if="errors.email" class="invalid-feedback">
                                        {{ errors.email }}
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="password" class="form-label">Пароль</label>
                                    <input type="password" 
                                           class="form-control" 
                                           :class="{ 'is-invalid': errors.password }"
                                           id="password" 
                                           v-model="form.password"
                                           placeholder="Введите пароль">
                                    <div v-if="errors.password" class="invalid-feedback">
                                        {{ errors.password }}
                                    </div>
                                </div>

                                <div class="d-grid gap-2">
                                    <button type="submit" 
                                            class="btn btn-custom" 
                                            :disabled="loading">
                                        <span v-if="loading" class="loading-spinner me-2"></span>
                                        Войти
                                    </button>
                                    <router-link to="/" class="btn btn-outline-secondary">
                                        <i class="fas fa-arrow-left me-2"></i>Назад
                                    </router-link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            loading: false,
            form: {
                email: '',
                password: ''
            },
            errors: {}
        };
    },

    methods: {
        validateForm() {
            this.errors = {};

            if (!this.form.email.trim()) {
                this.errors.email = 'Email обязателен';
            } else if (!this.isValidEmail(this.form.email)) {
                this.errors.email = 'Некорректный email';
            }

            if (!this.form.password) {
                this.errors.password = 'Пароль обязателен';
            }

            return Object.keys(this.errors).length === 0;
        },

        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        async login() {
            if (!this.validateForm()) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка валидации',
                    text: 'Пожалуйста, исправьте ошибки в форме',
                    confirmButtonColor: '#667eea'
                });
                return;
            }

            try {
                this.loading = true;
                const response = await this.$api.login(this.form);

                this.$store.setUser(response.user, response.token);

                Swal.fire({
                    icon: 'success',
                    title: 'Добро пожаловать!',
                    text: `Вы успешно вошли как ${response.user.name}`,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    this.$router.push('/');
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка входа',
                    text: error.message || 'Неверный email или пароль',
                    confirmButtonColor: '#667eea'
                });
            } finally {
                this.loading = false;
            }
        }
    }
};
