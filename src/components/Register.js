const Register = {
    template: `
        <div class="animate__animated animate__fadeIn">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card shadow">
                        <div class="card-body p-4">
                            <h2 class="text-center mb-4">
                                <i class="fas fa-user-plus me-2"></i>Регистрация
                            </h2>
                            
                            <form @submit.prevent="register">
                                <div class="mb-3">
                                    <label for="name" class="form-label">Имя</label>
                                    <input type="text" 
                                           class="form-control" 
                                           :class="{ 'is-invalid': errors.name }"
                                           id="name" 
                                           v-model="form.name"
                                           placeholder="Введите ваше имя">
                                    <div v-if="errors.name" class="invalid-feedback">
                                        {{ errors.name }}
                                    </div>
                                </div>

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

                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Подтверждение пароля</label>
                                    <input type="password" 
                                           class="form-control" 
                                           :class="{ 'is-invalid': errors.confirmPassword }"
                                           id="confirmPassword" 
                                           v-model="form.confirmPassword"
                                           placeholder="Подтвердите пароль">
                                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                                        {{ errors.confirmPassword }}
                                    </div>
                                </div>

                                <div class="d-grid gap-2">
                                    <button type="submit" 
                                            class="btn btn-custom" 
                                            :disabled="loading">
                                        <span v-if="loading" class="loading-spinner me-2"></span>
                                        Зарегистрироваться
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
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            },
            errors: {}
        };
    },

    methods: {
        validateForm() {
            this.errors = {};

            if (!this.form.name.trim()) {
                this.errors.name = 'Имя обязательно';
            }

            if (!this.form.email.trim()) {
                this.errors.email = 'Email обязателен';
            } else if (!this.isValidEmail(this.form.email)) {
                this.errors.email = 'Некорректный email';
            }

            if (!this.form.password) {
                this.errors.password = 'Пароль обязателен';
            } else if (this.form.password.length < 6) {
                this.errors.password = 'Пароль должен быть не менее 6 символов';
            }

            if (!this.form.confirmPassword) {
                this.errors.confirmPassword = 'Подтверждение пароля обязательно';
            } else if (this.form.password !== this.form.confirmPassword) {
                this.errors.confirmPassword = 'Пароли не совпадают';
            }

            return Object.keys(this.errors).length === 0;
        },

        isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        async register() {
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
                const { confirmPassword, ...userData } = this.form;
                await this.$api.register(userData);

                Swal.fire({
                    icon: 'success',
                    title: 'Регистрация успешна!',
                    text: 'Теперь вы можете войти в систему',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    this.$router.push('/login');
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка регистрации',
                    text: error.message || 'Не удалось зарегистрироваться',
                    confirmButtonColor: '#667eea'
                });
            } finally {
                this.loading = false;
            }
        }
    }
};
