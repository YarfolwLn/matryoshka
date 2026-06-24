const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database
const db = {
    users: [],
    products: [],
    orders: []
};

// Initialize seed data
function initializeData() {
    // Seed products
    db.products = [
        {
            id: 1,
            name: 'Матрешка классическая',
            description: 'Традиционная русская матрешка ручной росписи',
            price: 2500,
            image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400'
        },
        {
            id: 2,
            name: 'Матрешка "Зимняя сказка"',
            description: 'Матрешка с зимним узором и снежинками',
            price: 3200,
            image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400'
        },
        {
            id: 3,
            name: 'Матрешка "Цветочная"',
            description: 'Матрешка с ярким цветочным орнаментом',
            price: 2800,
            image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400'
        },
        {
            id: 4,
            name: 'Матрешка "Гжель"',
            description: 'Матрешка в стиле гжельской росписи',
            price: 3500,
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        },
        {
            id: 5,
            name: 'Матрешка "Хохлома"',
            description: 'Матрешка с хохломской росписью',
            price: 3800,
            image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400'
        },
        {
            id: 6,
            name: 'Матрешка мини',
            description: 'Комплект из 5 маленьких матрешек',
            price: 1500,
            image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400'
        }
    ];

    // Seed admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.users.push({
        id: 1,
        email: 'admin@matryoshka.ru',
        password: hashedPassword,
        role: 'admin',
        name: 'Администратор'
    });

    console.log('Database initialized with seed data');
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Невалидный токен' });
        }
        req.user = user;
        next();
    });
}

// Routes

// GET /products - Get all products
app.get('/products', (req, res) => {
    try {
        res.json(db.products);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении товаров' });
    }
});

// POST /register - Register new user
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Некорректный email' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
        }

        // Check if user already exists
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Create new user
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            id: db.users.length + 1,
            email,
            password: hashedPassword,
            role: 'client',
            name
        };

        db.users.push(newUser);

        res.status(201).json({ 
            message: 'Регистрация успешна',
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Ошибка при регистрации' });
    }
});

// POST /login - Login user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email и пароль обязательны' });
        }

        // Find user
        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Verify password
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Generate token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Ошибка при входе в систему' });
    }
});

// POST /logout - Logout user
app.post('/logout', authenticateToken, (req, res) => {
    try {
        // In a real application, you might want to invalidate the token
        // For now, we just return success
        res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при выходе из системы' });
    }
});

// GET /orders - Get user orders
app.get('/orders', authenticateToken, (req, res) => {
    try {
        const userOrders = db.orders.filter(order => order.userId === req.user.id);
        res.json(userOrders);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении заказов' });
    }
});

// POST /orders - Create order
app.post('/orders', authenticateToken, (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Корзина пуста' });
        }

        // Calculate total
        let total = 0;
        const orderItems = items.map(item => {
            const product = db.products.find(p => p.id === item.productId);
            if (!product) {
                throw new Error(`Товар с id ${item.productId} не найден`);
            }
            total += product.price * item.quantity;
            return {
                productId: item.productId,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            };
        });

        // Create order
        const newOrder = {
            id: db.orders.length + 1,
            userId: req.user.id,
            items: orderItems,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        db.orders.push(newOrder);

        res.status(201).json({
            message: 'Заказ успешно оформлен',
            order: newOrder
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message || 'Ошибка при оформлении заказа' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
initializeData();
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Products: http://localhost:${PORT}/products`);
});
