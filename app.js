let tg = window.Telegram.WebApp;
tg.expand();

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [
    {id: 1, name: "iPhone 15 Pro", description: "Флагман от Apple", price: 99990, image_url: "https://via.placeholder.com/300x300/007aff/ffffff?text=iPhone+15"},
    {id: 2, name: "Samsung Galaxy S24", description: "Android смартфон", price: 79990, image_url: "https://via.placeholder.com/300x300/1428a0/ffffff?text=Galaxy+S24"},
    {id: 3, name: "AirPods Pro 2", description: "Беспроводные наушники", price: 24990, image_url: "https://via.placeholder.com/300x300/007aff/ffffff?text=AirPods"},
    {id: 4, name: "MacBook Air M3", description: "Ноутбук для работы", price: 129990, image_url: "https://via.placeholder.com/300x300/007aff/ffffff?text=MacBook"},
    {id: 5, name: "Apple Watch Series 9", description: "Умные часы", price: 44990, image_url: "https://via.placeholder.com/300x300/007aff/ffffff?text=Watch"},
    {id: 6, name: "iPad Pro 12.9", description: "Планшет с M2", price: 109990, image_url: "https://via.placeholder.com/300x300/007aff/ffffff?text=iPad"}
];
let discount = 0;

function loadProducts() {
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-price">${product.price}₽</div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">В корзину</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    tg.showAlert('Товар добавлен в корзину!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal * (1 - discount / 100);
    return Math.round(total);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        document.getElementById('cart-total').innerHTML = '';
        document.getElementById('checkout-btn').style.display = 'none';
        return;
    }
    
    document.getElementById('checkout-btn').style.display = 'block';
    container.innerHTML = '';
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price}₽ × ${item.quantity} = ${item.price * item.quantity}₽</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    const total = calculateTotal();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let totalHTML = `<div>Сумма: ${subtotal}₽</div>`;
    if (discount > 0) {
        totalHTML += `<div style="color: #ff3b30;">Скидка: -${discount}%</div>`;
    }
    totalHTML += `<div style="font-size: 24px; margin-top: 10px;">Итого: ${total}₽</div>`;
    
    document.getElementById('cart-total').innerHTML = totalHTML;
    document.getElementById('final-total').textContent = total;
}

function applyPromocode() {
    const code = document.getElementById('promocode').value.trim().toUpperCase();
    if (!code) return;
    
    const promocodes = {
        'WELCOME10': 10,
        'SALE20': 20,
        'VIP30': 30,
        'MEGA50': 50
    };
    
    if (promocodes[code]) {
        discount = promocodes[code];
        tg.showAlert(`Промокод применен! Скидка ${discount}%`);
        renderCart();
    } else {
        tg.showAlert('Промокод не найден или неактивен');
    }
}

function showProducts() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('products-page').classList.add('active');
}

function showCart() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('cart-page').classList.add('active');
    renderCart();
}

function showCheckout() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста!');
        return;
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('checkout-page').classList.add('active');
    document.getElementById('final-total').textContent = calculateTotal();
}

document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderData = {
        type: 'order',
        full_name: document.getElementById('full_name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        comment: document.getElementById('comment').value,
        promocode: document.getElementById('promocode').value.toUpperCase(),
        payment_method: document.getElementById('payment_method').value,
        delivery_method: document.getElementById('delivery_method').value,
        call_before_delivery: document.getElementById('call_before_delivery').checked,
        username: document.getElementById('username').value || tg.initDataUnsafe?.user?.username,
        total_amount: calculateTotal(),
        items: JSON.stringify(cart)
    };
    
    tg.sendData(JSON.stringify(orderData));
    
    cart = [];
    saveCart();
    updateCartCount();
});

loadProducts();
updateCartCount();
