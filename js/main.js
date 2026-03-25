// 1. Inicialización Protegida
if (typeof window.cart === 'undefined') {
    window.cart = JSON.parse(localStorage.getItem('coldkar-cart')) || [];
}
var cart = window.cart;
let allProducts = [];
const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });

// 2. Carga de Datos
async function loadProducts() {
    try {
        const response = await fetch('json/products.json');
        allProducts = await response.json();
        renderProductCards(allProducts);
    } catch (e) { console.error("Error catálogo:", e); }
}

function renderProductCards(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = products.map((p, i) => {
        const accent = p.categoria === 'Consola Premium' ? 'emerald' : 'blue';
        return `
        <div data-aos="fade-up" data-aos-delay="${i * 100}" class="glass rounded-[2.5rem] p-4 flex flex-col group transition-all duration-500 border border-transparent hover:border-${accent}-500/30 text-left">
            <div class="h-64 mb-6 bg-slate-800 rounded-[2rem] overflow-hidden cursor-pointer" onclick="openProductModal('${p.id}')">
                <img src="${p.imagenes[0]}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="px-4 pb-4 flex-grow">
                <h4 class="text-xl font-bold uppercase text-white mb-2 tracking-tight">${p.nombre}</h4>
                <p class="text-slate-500 text-[10px] mb-4 uppercase tracking-widest font-black">${p.categoria}</p>
                <p class="text-slate-400 text-xs mb-6 line-clamp-2 leading-relaxed font-light">${p.descripcion}</p>
                <button onclick="openProductModal('${p.id}')" class="w-full mb-6 py-3 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest transition text-slate-300">Ver Detalles</button>
                <div class="flex justify-between items-center mt-auto border-t border-white/5 pt-5">
                    <div>
                        <span class="text-2xl font-black text-white">${formatter.format(p.precio)}</span>
                        <p class="text-[9px] text-emerald-400 font-bold uppercase mt-1 tracking-tighter">🚚 Envío Gratis</p>
                        <p class="text-[8px] text-blue-300 font-bold uppercase tracking-tighter">💳 3 msi Banamex</p>
                    </div>
                    <button onclick="addToCartByP('${p.id}')" class="bg-${accent}-600 text-white p-4 rounded-2xl font-bold transition-all active:scale-90 shadow-lg shadow-${accent}-500/20">🛒 +</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// 3. Modales y Galería
function openProductModal(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modal-title').textContent = p.nombre;
    document.getElementById('modal-price').textContent = formatter.format(p.precio);
    document.getElementById('modal-description').textContent = p.descripcion;
    document.getElementById('modal-rango').textContent = p.specs.rango;
    document.getElementById('modal-voltaje').textContent = p.specs.voltaje;
    document.getElementById('modal-capacidad').textContent = p.specs.capacidad;
    document.getElementById('modal-dimensiones').textContent = p.specs.dimensiones;
    const mainImg = document.getElementById('modal-main-img');
    mainImg.src = p.imagenes[0];
    const thumbs = document.getElementById('modal-thumbnails');
    thumbs.innerHTML = p.imagenes.map(img => `<img src="${img}" onclick="document.getElementById('modal-main-img').src='${img}'" class="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-blue-500 opacity-70 hover:opacity-100 transition-all">`).join('');
    document.getElementById('modal-add-btn').onclick = () => { addToCartByP(p.id); closeModal(); };
    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() { document.getElementById('product-modal').classList.remove('active'); document.body.style.overflow = ''; }

// 4. Carrito
function addToCartByP(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({...p, quantity: 1, imagen: p.imagenes[0]});
    saveCart(); updateCartUI(); showToast(`✅ ${p.nombre} añadido`);
}

function saveCart() { localStorage.setItem('coldkar-cart', JSON.stringify(cart)); }

function updateCartUI() {
    const counter = document.getElementById('cart-count');
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    if (counter) { counter.textContent = totalItems; counter.classList.toggle('hidden', totalItems === 0); }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    if (!container || !totalElement) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-64 opacity-40 italic text-slate-500 text-sm">Tu carrito está vacío.</div>`;
        totalElement.textContent = formatter.format(0);
        return;
    }
    container.innerHTML = cart.map(i => `
        <div class="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
            <div><p class="text-white font-bold text-xs uppercase">${i.nombre}</p><p class="text-blue-400 text-xs font-black">${formatter.format(i.precio)}</p><p class="text-[9px] text-slate-500 uppercase mt-1 font-bold">Cant: ${i.quantity}</p></div>
            <button onclick="removeFromCart('${i.id}')" class="text-red-400/50 hover:text-red-400 p-2 text-sm">✕</button>
        </div>`).join('');
    const total = cart.reduce((s, i) => s + (i.precio * i.quantity), 0);
    totalElement.textContent = formatter.format(total);
}

function removeFromCart(id) {
    window.cart = cart.filter(i => i.id !== id); cart = window.cart;
    saveCart(); updateCartUI();
}

function toggleCartDrawer() {
    document.getElementById('cart-drawer').classList.toggle('translate-x-full');
    document.getElementById('cart-overlay').classList.toggle('hidden');
}

// 5. Otros
function toggleFaq(id) {
    const f = document.getElementById(`faq-${id}`);
    const ic = document.getElementById(`icon-${id}`);
    f.classList.toggle('hidden');
    ic.innerText = f.classList.contains('hidden') ? '＋' : '✕';
}

function verPasos() {
    document.getElementById('pasos-basicos').classList.toggle('hidden');
}

function openVehicleModal() { document.getElementById('vehicle-modal').classList.add('active'); }
function closeVehicleModal() { document.getElementById('vehicle-modal').classList.remove('active'); }

function selectVehicle(type, btn) {
    const vehicleRecs = {
        pickup: { title: 'Pickup / 4x4', rec: 'DC-15F', tip: 'Ideal para batea o descansabrazos.' },
        suv: { title: 'SUV', rec: 'BF-8H', tip: 'Elegancia y frío premium.' },
        van: { title: 'Van', rec: 'CR-50X', tip: 'Máximo espacio para rutas largas.' },
        sedan: { title: 'Sedán', rec: 'DC-10F', tip: 'Compacto para tu cajuela.' }
    };
    const v = vehicleRecs[type];
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('vehicle-tip').innerHTML = `<strong>${v.title}:</strong> ${v.tip}`;
    document.getElementById('vehicle-actions').innerHTML = `<button onclick="closeVehicleModal()" class="w-full bg-blue-600 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white">Listo</button>`;
}

function showToast(msg) {
    const t = document.getElementById('toast-notification');
    t.textContent = msg; t.classList.remove('translate-y-full', 'opacity-0');
    setTimeout(() => t.classList.add('translate-y-full', 'opacity-0'), 2500);
}

document.addEventListener('DOMContentLoaded', () => { updateCartUI(); loadProducts(); });