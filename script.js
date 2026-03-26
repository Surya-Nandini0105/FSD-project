/**
 * Zentro - Main JavaScript
 * Handles Admin Panel, Shopping Page, Cart, and Payment Simulation
 */

// --- GLOBAL STATE ---
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- UTILITIES ---
function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = cart.length;
  }
}

// --- ADMIN PANEL LOGIC ---
const addProductForm = document.getElementById('add-product-form');
const adminProductList = document.getElementById('admin-product-list');

if (addProductForm) {
  addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newProduct = {
      id: Date.now(),
      name: document.getElementById('p-name').value,
      price: parseFloat(document.getElementById('p-price').value),
      image: document.getElementById('p-img').value,
      category: document.getElementById('p-category').value
    };
    
    products.push(newProduct);
    saveProducts();
    renderAdminProducts();
    addProductForm.reset();
    alert('Product added successfully!');
  });
}

function renderAdminProducts() {
  if (!adminProductList) return;
  
  adminProductList.innerHTML = '';
  
  if (products.length === 0) {
    adminProductList.innerHTML = '<p class="text-muted">No products added yet.</p>';
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      <div class="product-content">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <button class="btn btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="deleteProduct(${product.id})">Delete</button>
      </div>
    `;
    adminProductList.appendChild(card);
  });
}

window.deleteProduct = (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderAdminProducts();
  }
};

// --- SHOPPING PAGE LOGIC ---
const userProductList = document.getElementById('user-product-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

function renderUserProducts(filterText = '', filterCategory = 'All') {
  if (!userProductList) return;
  
  userProductList.innerHTML = '';
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filterText.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  
  if (filteredProducts.length === 0) {
    userProductList.innerHTML = '<p class="text-muted">No products found.</p>';
    return;
  }
  
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      <div class="product-content">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
    userProductList.appendChild(card);
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    renderUserProducts(searchInput.value, categoryFilter.value);
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    renderUserProducts(searchInput.value, categoryFilter.value);
  });
}

window.addToCart = (id) => {
  const product = products.find(p => p.id === id);
  if (product) {
    cart.push({ ...product, cartId: Date.now() });
    saveCart();
    alert(`${product.name} added to cart!`);
  }
};

// --- CART MODAL LOGIC ---
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

if (cartIcon) {
  cartIcon.addEventListener('click', () => {
    renderCart();
    cartModal.style.display = 'flex';
  });
}

if (closeCart) {
  closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
    resetModal();
  });
}

function renderCart() {
  if (!cartItemsContainer) return;
  
  cartItemsContainer.innerHTML = '';
  let total = 0;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    cartTotalEl.textContent = '$0.00';
    checkoutBtn.style.display = 'none';
    return;
  }
  
  checkoutBtn.style.display = 'block';
  
  cart.forEach(item => {
    total += item.price;
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
        <div>
          <p style="font-weight: 700; margin: 0;">${item.name}</p>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">$${item.price.toFixed(2)}</p>
        </div>
      </div>
      <span class="remove-btn" onclick="removeFromCart(${item.cartId})">Remove</span>
    `;
    cartItemsContainer.appendChild(itemEl);
  });
  
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

window.removeFromCart = (cartId) => {
  cart = cart.filter(item => item.cartId !== cartId);
  saveCart();
  renderCart();
};

// --- CHECKOUT & PAYMENT SIMULATION ---
const qrSection = document.getElementById('qr-section');
const qrCodeContainer = document.getElementById('qr-code-container');
const qrTotalEl = document.getElementById('qr-total');
const paidBtn = document.getElementById('paid-btn');
const cancelQrBtn = document.getElementById('cancel-qr-btn');
const feedbackSection = document.getElementById('feedback-section');

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Generate QR Code using QRServer API
    // The data can be anything, here we use a payment string
    const qrData = `Payment_Amount_${total.toFixed(2)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    qrCodeContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" class="qr-img">`;
    qrTotalEl.textContent = `$${total.toFixed(2)}`;
    
    // Hide cart list and checkout button, show QR section
    cartItemsContainer.style.display = 'none';
    checkoutBtn.style.display = 'none';
    qrSection.style.display = 'block';
  });
}

if (cancelQrBtn) {
  cancelQrBtn.addEventListener('click', () => {
    resetModal();
  });
}

if (paidBtn) {
  paidBtn.addEventListener('click', () => {
    qrSection.style.display = 'none';
    feedbackSection.style.display = 'block';
    
    // Clear cart
    cart = [];
    saveCart();
  });
}

function resetModal() {
  if (cartItemsContainer) cartItemsContainer.style.display = 'flex';
  if (checkoutBtn) checkoutBtn.style.display = 'block';
  if (qrSection) qrSection.style.display = 'none';
  if (feedbackSection) feedbackSection.style.display = 'none';
  renderCart();
}

// --- FEEDBACK FORM LOGIC ---
const feedbackForm = document.getElementById('feedback-form');
const ratingStars = document.querySelectorAll('.star');
let selectedRating = 0;

if (ratingStars) {
  ratingStars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      updateStars();
    });
  });
}

function updateStars() {
  ratingStars.forEach(star => {
    const val = parseInt(star.getAttribute('data-value'));
    if (val <= selectedRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('f-name').value || 'Anonymous';
    const comment = document.getElementById('f-comment').value;
    
    alert(`Thank you, ${name}!\nRating: ${selectedRating} Stars\nFeedback: ${comment}\n\nYour feedback has been submitted successfully.`);
    
    cartModal.style.display = 'none';
    resetModal();
    feedbackForm.reset();
    selectedRating = 0;
    updateStars();
  });
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  renderAdminProducts();
  renderUserProducts();
  updateCartCount();
});
