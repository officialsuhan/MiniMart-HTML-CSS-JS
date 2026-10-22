// MiniMart — responsive e-commerce frontend demo.
// Product imagery is created with CSS illustrations; no external product-image files are required.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const products = [
  {id:1,name:'Studio Wireless Headphones',category:'Tech',price:89,oldPrice:109,rating:4.9,reviews:128,badge:'BESTSELLER',color:'art-headphones',bg:'#e6e0d7',halo:'#fff8ed',note:'Matte charcoal',featured:1},
  {id:2,name:'Sculptural Ceramic Vase',category:'Home',price:34,oldPrice:null,rating:4.8,reviews:84,badge:'JUST IN',color:'art-vase',bg:'#e8e1d6',halo:'#f9f1e4',note:'Sandstone',featured:2},
  {id:3,name:'Arc Table Lamp',category:'Home',price:62,oldPrice:75,rating:4.7,reviews:61,badge:'−17%',color:'art-lamp',bg:'#e7e4dd',halo:'#fff6e3',note:'Warm ivory',featured:3},
  {id:4,name:'Pocket Bluetooth Speaker',category:'Tech',price:48,oldPrice:null,rating:4.8,reviews:92,badge:'POPULAR',color:'art-speaker',bg:'#dedfe0',halo:'#f5f7f8',note:'Graphite',featured:4},
  {id:5,name:'Everyday Smart Watch',category:'Tech',price:119,oldPrice:139,rating:4.6,reviews:76,badge:'−14%',color:'art-watch',bg:'#e5ded4',halo:'#fff5e5',note:'Champagne',featured:5},
  {id:6,name:'Hydro Daily Bottle',category:'Lifestyle',price:28,oldPrice:null,rating:4.9,reviews:204,badge:'FAN FAVORITE',color:'art-bottle',bg:'#dce6dd',halo:'#eff9ee',note:'Sage green',featured:6},
  {id:7,name:'Cloud Nine Mug Set',category:'Home',price:26,oldPrice:null,rating:4.7,reviews:53,badge:'SET OF 2',color:'art-mug',bg:'#e6def1',halo:'#f9f2ff',note:'Lilac glaze',featured:7},
  {id:8,name:'Daily Notes Journal',category:'Lifestyle',price:18,oldPrice:null,rating:4.8,reviews:117,badge:'STAFF PICK',color:'art-notebook',bg:'#e3e7d3',halo:'#f7f8e8',note:'Olive linen',featured:8},
  {id:9,name:'Market Day Tote',category:'Accessories',price:22,oldPrice:29,rating:4.5,reviews:67,badge:'−24%',color:'art-tote',bg:'#e9dfd2',halo:'#fbf0df',note:'Natural canvas',featured:9},
  {id:10,name:'Weekend Sunglasses',category:'Accessories',price:31,oldPrice:null,rating:4.6,reviews:88,badge:'SUN READY',color:'art-sunglasses',bg:'#e7e0d5',halo:'#faf2e5',note:'Tortoise',featured:10},
  {id:11,name:'Soft Knit Lounge Socks',category:'Lifestyle',price:16,oldPrice:null,rating:4.8,reviews:145,badge:'COZY PICK',color:'art-socks',bg:'#efdfd8',halo:'#fff0e8',note:'Blush / one size',featured:11},
  {id:12,name:'Little Leaf Desk Plant',category:'Home',price:24,oldPrice:null,rating:4.7,reviews:49,badge:'LOW MAINTENANCE',color:'art-plant',bg:'#dfe5d9',halo:'#f2f7e9',note:'Pot included',featured:12}
];

const state = {
  category:'All', query:'', sort:'featured', cart:loadCart(), drawerOpen:false, toastTimer:null
};
const FREE_SHIPPING = 75;
const STANDARD_SHIPPING = 6.95;
function money(value) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value); }
function getProduct(id) { return products.find(product => product.id === Number(id)); }
function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem('minimart-cart') || '[]');
    return Array.isArray(parsed) ? parsed.filter(item => getProduct(item.id) && Number.isInteger(item.qty) && item.qty > 0).map(item => ({id:item.id,qty:Math.min(item.qty,99)})) : [];
  } catch (error) { return []; }
}
function saveCart() {
  try { localStorage.setItem('minimart-cart', JSON.stringify(state.cart)); } catch (error) {}
}
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}
function artMarkup(product, compact=false) {
  return `<div class="product-art ${product.color}" style="--art-bg:${product.bg};--art-halo:${product.halo}"><span class="product-badge">${escapeHtml(product.badge)}</span><div class="object" aria-hidden="true"></div>${compact ? '' : `<button class="quick-add" data-action="add" data-id="${product.id}">Quick add <span>＋</span></button>`}</div>`;
}
function filteredProducts() {
  let list = products.filter(product => state.category === 'All' || product.category === state.category);
  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter(product => `${product.name} ${product.category} ${product.note} ${product.badge}`.toLowerCase().includes(q));
  }
  if (state.sort === 'price-low') list.sort((a,b) => a.price-b.price);
  else if (state.sort === 'price-high') list.sort((a,b) => b.price-a.price);
  else if (state.sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
  else if (state.sort === 'rating') list.sort((a,b) => b.rating-a.rating || b.reviews-a.reviews);
  else list.sort((a,b) => a.featured-b.featured);
  return list;
}
function renderProducts() {
  const list = filteredProducts();
  $('#productGrid').innerHTML = list.map(product => `
    <article class="product-card">
      ${artMarkup(product)}
      <div class="product-meta">
        <div class="product-category">${escapeHtml(product.category)}</div>
        <div class="product-title-row"><h3 class="product-title">${escapeHtml(product.name)}</h3><span class="rating"><span>★</span>${product.rating.toFixed(1)}</span></div>
        <div class="product-bottom"><div class="price">${money(product.price)}${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div><span class="color-note">${escapeHtml(product.note)}</span></div>
        <button class="quick-add mobile-add" data-action="add" data-id="${product.id}">Add to cart <span>＋</span></button>
      </div>
    </article>`).join('');
  $('#noResults').classList.toggle('hidden', list.length > 0);
  $('#productGrid').classList.toggle('hidden', list.length === 0);
  $('#resultsLabel').textContent = `Showing ${list.length} ${list.length === 1 ? 'product' : 'thoughtfully picked products'}`;
  $('#clearFilters').classList.toggle('visible', !!(state.query || state.category !== 'All' || state.sort !== 'featured'));
  $$('#categoryFilters [data-category]').forEach(button => button.classList.toggle('active', button.dataset.category === state.category));
  const categoryCount = $('#allCount');
  if (categoryCount) categoryCount.textContent = products.length;
}
function cartCount() { return state.cart.reduce((total,item) => total + item.qty,0); }
function cartSubtotal() { return state.cart.reduce((total,item) => total + getProduct(item.id).price * item.qty,0); }
function renderCart() {
  const count = cartCount(), subtotal = cartSubtotal();
  $('#cartCount').textContent = count;
  $('#drawerCount').textContent = `(${count})`;
  $('#emptyCart').classList.toggle('hidden', count > 0);
  $('#cartSummary').classList.toggle('hidden', count === 0);
  $('#cartItems').classList.toggle('hidden', count === 0);
  $('#cartItems').innerHTML = state.cart.map(item => {
    const product = getProduct(item.id);
    return `<div class="cart-item" data-cart-id="${product.id}">
      <div class="cart-thumb" style="background:${product.bg}">${artMarkup(product,true).replace('product-art','product-art')}</div>
      <div class="cart-item-main"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.note)}</small>
        <div class="quantity-control"><button data-action="decrease" data-id="${product.id}" aria-label="Decrease ${escapeHtml(product.name)} quantity">−</button><span>${item.qty}</span><button data-action="increase" data-id="${product.id}" aria-label="Increase ${escapeHtml(product.name)} quantity">＋</button></div>
      </div>
      <div class="cart-item-price">${money(product.price * item.qty)}<br><button class="remove-item" data-action="remove" data-id="${product.id}">Remove</button></div>
    </div>`;
  }).join('');
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;
  $('#subtotalValue').textContent = money(subtotal);
  $('#shippingValue').textContent = shipping === 0 ? 'FREE' : money(shipping);
  $('#totalValue').textContent = money(total);
  const progress = Math.min(100, subtotal / FREE_SHIPPING * 100);
  $('#shippingProgress').style.width = `${progress}%`;
  $('#shippingMessage').innerHTML = subtotal >= FREE_SHIPPING
    ? '<strong>Nice! You unlocked free shipping.</strong>'
    : `You're <strong>${money(FREE_SHIPPING - subtotal)}</strong> away from free shipping.`;
  $('#checkoutTotal').textContent = money(total);
  saveCart();
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function addToCart(id) {
  const product = getProduct(id); if (!product) return;
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) existing.qty = Math.min(99, existing.qty + 1);
  else state.cart.push({id:product.id,qty:1});
  renderCart(); showToast(`${product.name} added to your cart`);
}
function changeQuantity(id, delta) {
  const item = state.cart.find(entry => entry.id === Number(id)); if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(entry => entry.id !== Number(id));
  if (item.qty > 99) item.qty = 99;
  renderCart();
}
function removeFromCart(id) {
  const product = getProduct(id);
  state.cart = state.cart.filter(item => item.id !== Number(id));
  renderCart(); showToast(`${product ? product.name : 'Item'} removed`);
}
function openCart() {
  state.drawerOpen = true;
  $('#cartOverlay').classList.remove('hidden');
  $('#cartDrawer').classList.add('open');
  $('#cartDrawer').setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  $('#cartCloseBtn').focus();
}
function closeCart() {
  state.drawerOpen = false;
  $('#cartOverlay').classList.add('hidden');
  $('#cartDrawer').classList.remove('open');
  $('#cartDrawer').setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
function setCategory(category) {
  state.category = category;
  renderProducts();
}
function clearFilters() {
  state.category = 'All'; state.query = ''; state.sort = 'featured';
  $('#productSearch').value = ''; $('#sortSelect').value = 'featured';
  renderProducts();
}
function openCheckout() {
  if (!state.cart.length) return;
  $('#checkoutMessage').textContent = `Your demo order includes ${cartCount()} ${cartCount() === 1 ? 'item' : 'items'}.`;
  $('#checkoutTotal').textContent = money(cartSubtotal() + (cartSubtotal() >= FREE_SHIPPING ? 0 : STANDARD_SHIPPING));
  $('#checkoutModal').classList.remove('hidden');
}
function closeCheckout() { $('#checkoutModal').classList.add('hidden'); }

$('#productGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-action="add"]');
  if (button) addToCart(button.dataset.id);
});
$('#cartItems').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const {action,id} = button.dataset;
  if (action === 'increase') changeQuantity(id,1);
  if (action === 'decrease') changeQuantity(id,-1);
  if (action === 'remove') removeFromCart(id);
});
$('#categoryFilters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) setCategory(button.dataset.category);
});
$$('[data-jump-category]').forEach(link => link.addEventListener('click', () => setCategory(link.dataset.jumpCategory)));
$('#productSearch').addEventListener('input', event => { state.query = event.target.value.trim(); renderProducts(); });
$('#sortSelect').addEventListener('change', event => { state.sort = event.target.value; renderProducts(); });
$('#clearFilters').addEventListener('click', clearFilters);
$('#resetSearch').addEventListener('click', clearFilters);
$('#searchFocusBtn').addEventListener('click', () => { $('#productSearch').focus(); $('#shop').scrollIntoView({behavior:'smooth'}); });
$('#cartOpenBtn').addEventListener('click', openCart);
$('#cartCloseBtn').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);
$('#continueShopping').addEventListener('click', () => { closeCart(); $('#shop').scrollIntoView({behavior:'smooth'}); });
$('#checkoutBtn').addEventListener('click', openCheckout);
$('#checkoutCloseBtn').addEventListener('click', closeCheckout);
$('#finishCheckoutBtn').addEventListener('click', () => {
  closeCheckout(); closeCart(); showToast('Thanks for trying the MiniMart demo!');
});
$('#checkoutModal').addEventListener('click', event => { if (event.target === $('#checkoutModal')) closeCheckout(); });
$('#newsletterForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#newsletterEmail').value.trim();
  if (!email) return;
  $('#newsletterEmail').value = '';
  showToast('Thanks for joining the MiniMart demo list!');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeCart(); closeCheckout(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); $('#productSearch').focus(); $('#shop').scrollIntoView({behavior:'smooth'});
  }
});

renderProducts();
renderCart();
