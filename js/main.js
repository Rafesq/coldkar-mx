let allProducts = [];

const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0 // Si no quieres mostrar los centavos .00
});


// 1. Cargar los productos desde el JSON al iniciar
async function loadProducts() {
    try {
        const response = await fetch('json/products.json');
        allProducts = await response.json();
        renderProductCards(allProducts);
    } catch (error) {
        console.error("Error cargando el catálogo de ColdKar:", error);
    }
}

// 2. Generar tarjetas de producto dinámicamente
function renderProductCards(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = products.map((p, i) => {
        const isSpecial = p.categoria === 'Consola Premium';
        const accent = isSpecial ? 'emerald' : 'blue';
        return `
        <div data-aos="fade-up" data-aos-delay="${i * 100}"
            class="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-4 hover:border-${accent}-500/50 transition-all duration-500 flex flex-col">
            <div class="relative overflow-hidden rounded-[2rem] h-60 mb-6 bg-slate-800 cursor-pointer" onclick="openProductModal('${p.id}')">
                <img id="card-img-${p.id}" src="${p.imagenes[0]}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    alt="${(p.alt_text && p.alt_text[0]) || p.nombre}"
                    onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-slate-600 text-4xl\\'>❄️</span>';">
                ${p.imagenes.length > 1 ? `
                <div class="card-dots absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    ${p.imagenes.map((_, idx) => `
                        <button onclick="event.stopPropagation(); changeCardImage('${p.id}', ${idx})"
                            class="card-dot w-2.5 h-2.5 rounded-full border border-white/60 transition-all duration-300 ${idx === 0 ? 'bg-white scale-110' : 'bg-white/30 hover:bg-white/60'}"
                            data-card-id="${p.id}" data-dot-idx="${idx}"></button>
                    `).join('')}
                </div>` : ''}
            </div>
            <div class="px-4 pb-4 flex-grow text-left">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-xl font-bold uppercase tracking-tight">${p.nombre}</h4>
                    <span class="text-[10px] bg-${accent}-500/10 text-${accent}-400 px-2 py-1 rounded-lg font-bold">${p.specs.capacidad}</span>
                </div>
                <p class="text-slate-500 text-xs mb-1">${p.categoria}</p>
                <p class="text-slate-500 text-xs mb-6 line-clamp-2">${p.descripcion || ''}</p>

                <button onclick="openProductModal('${p.id}')"
                    class="w-full mb-6 py-3 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest transition">
                    Ver Ficha Técnica
                </button>

                <div class="flex justify-between items-center mt-auto">
                    <div>
                        <span class="text-2xl font-black text-white">${formatter.format(p.precio)}</span>
                        <p class="text-[9px] text-emerald-400 font-bold uppercase tracking-tighter">
                            🚚 Envío gratis a toda la República
                        </p>
                    </div>
                    <button onclick="addToCart(allProducts.find(x=>x.id==='${p.id}'))"
                        class="cold-glow bg-${accent}-600 text-white p-4 rounded-2xl hover:bg-white hover:text-${accent}-600 shadow-lg shadow-${accent}-500/20 font-bold">
                        🛒 +
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Refrescar animaciones AOS para los nuevos elementos
    if (typeof AOS !== 'undefined') AOS.refresh();
}

// 3. Función para abrir el modal con los datos correctos
function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Llenar textos básicos
    document.getElementById('modal-title').innerText = product.nombre;
    document.getElementById('modal-category').innerText = product.categoria;
    document.getElementById('modal-price').innerText = formatter.format(product.precio);
    document.getElementById('modal-description').innerText = product.descripcion || '';

    // Llenar especificaciones técnicas (iconos)
    document.getElementById('modal-rango').innerText = product.specs.rango || '--';
    document.getElementById('modal-voltaje').innerText = product.specs.voltaje || '--';
    document.getElementById('modal-capacidad').innerText = product.specs.capacidad || '--';
    document.getElementById('modal-dimensiones').innerText = product.specs.dimensiones || '--';

    // Configurar imagen principal y link de Mercado Libre
    const mainImg = document.getElementById('modal-main-img');
    mainImg.src = product.imagenes[0];
    mainImg.alt = (product.alt_text && product.alt_text[0]) || product.nombre;

    // Generar miniaturas de la galería
    const thumbContainer = document.getElementById('modal-thumbnails');
    thumbContainer.innerHTML = '';

    mainImg.classList.add('transition-opacity', 'duration-300');

    product.imagenes.forEach((imgSrc, idx) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.alt = (product.alt_text && product.alt_text[idx]) || product.nombre + ' - imagen ' + (idx + 1);
        thumb.className = "w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all duration-300 opacity-70 hover:opacity-100 "
            + (idx === 0 ? 'border-blue-500 opacity-100' : 'border-transparent');
        thumb.onclick = () => {
            // Fade out
            mainImg.classList.add('opacity-0');
            setTimeout(() => {
                mainImg.src = imgSrc;
                mainImg.alt = (product.alt_text && product.alt_text[idx]) || product.nombre;
                mainImg.classList.remove('opacity-0');
            }, 200);
            // Highlight selected thumb
            thumbContainer.querySelectorAll('img').forEach(t => {
                t.classList.replace('border-blue-500', 'border-transparent');
                t.classList.remove('opacity-100');
            });
            thumb.classList.replace('border-transparent', 'border-blue-500');
            thumb.classList.add('opacity-100');
        };
        thumbContainer.appendChild(thumb);
    });

    // Configurar botón "Añadir al Carrito" del modal
    document.getElementById('modal-add-btn').onclick = () => {
        addToCart(product);
        closeModal();
    };

    // Mostrar el modal
    document.getElementById('product-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 4. Función para cerrar el modal
function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// 5. Cambiar imagen de tarjeta con transición suave
function changeCardImage(productId, imgIndex) {
    var img = document.getElementById('card-img-' + productId);
    var product = allProducts.find(function(p) { return p.id === productId; });
    if (!img || !product || !product.imagenes[imgIndex]) return;

    // Fade out
    img.style.opacity = '0';
    setTimeout(function() {
        img.src = product.imagenes[imgIndex];
        img.alt = (product.alt_text && product.alt_text[imgIndex]) || product.nombre;
        img.style.opacity = '1';
    }, 250);

    // Update dots
    var dots = document.querySelectorAll('button.card-dot[data-card-id="' + productId + '"]');
    dots.forEach(function(dot) {
        var idx = parseInt(dot.getAttribute('data-dot-idx'));
        if (idx === imgIndex) {
            dot.classList.remove('bg-white/30', 'hover:bg-white/60');
            dot.classList.add('bg-white', 'scale-110');
        } else {
            dot.classList.remove('bg-white', 'scale-110');
            dot.classList.add('bg-white/30', 'hover:bg-white/60');
        }
    });
}

// 6. Toast notification
function showToast(message) {
    var toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('translate-y-full', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(function() {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-full', 'opacity-0');
    }, 2500);
}

// 1. Inicializar el carrito recuperando datos guardados o empezando vacío
let cart = JSON.parse(localStorage.getItem('coldkar-cart')) || [];

// 2. Función principal para añadir productos
function addToCart(product) {
    if (!product) return;

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Si ya existe, solo aumentamos la cantidad
        existingItem.quantity += 1;
    } else {
        // Si es nuevo, lo agregamos con cantidad 1
        // (Copiamos el objeto para no afectar el catálogo original)
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagenes[0],
            quantity: 1
        });
    }

    // Guardar cambios en el almacenamiento del navegador
    saveCart();

    // Mostrar feedback visual (usando tu función showToast)
    showToast(`✅ ${product.nombre} añadido al carrito`);
    
    // Actualizar el contador del icono del carrito (si tienes uno)
    updateCartUI();
}

// 3. Función para guardar en LocalStorage
function saveCart() {
    localStorage.setItem('coldkar-cart', JSON.stringify(cart));
}

// 4. Actualizar el contador visual en el Navbar
function updateCartUI() {
    const counter = document.getElementById('cart-count');
    if (counter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = totalItems;
        // Si el carrito está vacío, ocultamos el contador
        counter.classList.toggle('hidden', totalItems === 0);
    }
}

// Abrir y cerrar el carrito
function toggleCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    
    const isOpen = !drawer.classList.contains('translate-x-full');
    
    if (isOpen) {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        document.body.style.overflow = ''; // Habilitar scroll
    } else {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Bloquear scroll
        renderCart(); // Actualizar la lista al abrir
    }
}

// Dibujar los productos dentro del carrito
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-500 text-sm">Tu carrito está vacío ❄️</div>`;
        totalElement.textContent = formatter.format(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="flex gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
            <img src="${item.imagen}" class="w-16 h-16 object-cover rounded-lg bg-slate-900">
            <div class="flex-grow">
                <h5 class="text-white font-bold text-sm">${item.nombre}</h5>
                <p class="text-blue-400 font-black text-sm">${formatter.format(item.precio)}</p>
                <div class="flex items-center gap-3 mt-2">
                    <button onclick="updateQuantity('${item.id}', -1)" class="text-slate-500 hover:text-white"> <i class="fas fa-minus-circle"></i> </button>
                    <span class="text-white text-xs font-bold">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="text-slate-500 hover:text-white"> <i class="fas fa-plus-circle"></i> </button>
                </div>
            </div>
            <button onclick="removeFromCart('${item.id}')" class="text-slate-600 hover:text-red-400 transition">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    totalElement.textContent = formatter.format(total);
}

// Funciones de apoyo
function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) return removeFromCart(id);
        saveCart();
        renderCart();
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    updateCartUI();
}

// El Gran Final: El mensaje de WhatsApp
function checkoutWhatsApp() {
    if (cart.length === 0) return;
    
    let message = "❄️ *NUEVO PEDIDO COLDKAR*%0A%0A";
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.nombre} (${formatter.format(item.precio)})%0A`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    message += `%0A*TOTAL:* ${formatter.format(total)}%0A%0A_¿Me pueden confirmar disponibilidad y costo de envío?_`;
    
    window.open(`https://wa.me/525512580859?text=${message}`, '_blank');
}

// Llamar a updateCartUI al cargar la página para mostrar lo que ya había
document.addEventListener('DOMContentLoaded', updateCartUI);

// Inicializar la carga
loadProducts();