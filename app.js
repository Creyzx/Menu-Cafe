/* ==========================================================================
   1. DATA MENU KAFE (SIMULASI DATABASE LOKAL)
   ========================================================================== */

// Array of Objects yang menyimpan seluruh daftar makanan dan minuman
const menuData = [
    {
        id: 1,
        nama: "Kopi Susu Gula Aren",
        kategori: "minuman",
        harga: 18000,
        deskripsi: "Espresso dengan susu segar dan manis manis alami gula aren.",
        gambar: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 2,
        nama: "Matcha Latte",
        kategori: "minuman",
        harga: 22000,
        deskripsi: "Teh hijau jepang berkualitas dipadu dengan susu lembut.",
        gambar: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 3,
        nama: "Roti Bakar Cokelat Keju",
        kategori: "camilan",
        harga: 15000,
        deskripsi: "Roti panggang garing dengan isian cokelat lumer dan parutan keju melimpah.",
        gambar: "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 4,
        nama: "Kentang Goreng Keju",
        kategori: "camilan",
        harga: 14000,
        deskripsi: "Kentang renyah disajikan dengan bumbu keju dan saus cocolan.",
        gambar: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 5,
        nama: "Nasi Goreng Spesial",
        kategori: "makanan",
        harga: 25000,
        deskripsi: "Nasi goreng gurih lengkap dengan telur mata sapi, ayam suwir, dan kerupuk.",
        gambar: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 6,
        nama: "Spaghetti Carbonara",
        kategori: "makanan",
        harga: 28000,
        deskripsi: "Pasta Italia dengan saus krim gurih, potongan daging sapi, dan keju parmesan.",
        gambar: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400&q=80"
    }
];

/* ==========================================================================
   2. STATE APLIKASI & SELEKSI ELEMEN DOM
   ========================================================================== */

// Keranjang belanja, mengambil data lama dari localStorage jika ada
let cart = JSON.parse(localStorage.getItem('cafe_cart')) || [];

// Mengambil elemen HTML berdasarkan ID & Class
const menuGrid = document.getElementById('menuGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.btn-filter');
const cartItemsContainer = document.getElementById('cartItems');
const totalPriceElement = document.getElementById('totalPrice');
const cartCountBadge = document.getElementById('cartCountBadge');
const btnCheckout = document.getElementById('btnCheckout');
const btnClearCart = document.getElementById('btnClearCart');

/* ==========================================================================
   3. FUNGSI UNTUK MENAMPILKAN MENU
   ========================================================================== */

// Fungsi merender daftar menu ke dalam grid HTML
function renderMenu(items) {
    menuGrid.innerHTML = ''; // Bersihkan isi grid terlebih dahulu

    if (items.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">Menu tidak ditemukan.</p>';
        return;
    }

    items.forEach(item => {
        const menuCard = document.createElement('div');
        menuCard.className = 'menu-card';
        menuCard.innerHTML = `
            <img src="${item.gambar}" alt="${item.nama}" class="menu-img" loading="lazy">
            <div class="menu-info">
                <h3 class="menu-title">${item.nama}</h3>
                <p class="menu-desc">${item.deskripsi}</p>
                <div class="menu-bottom">
                    <span class="menu-price">Rp ${item.harga.toLocaleString('id-ID')}</span>
                    <button class="btn-add" onclick="addToCart(${item.id})">+ Tambah</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuCard);
    });
}

/* ==========================================================================
   4. FUNGSI LOGIKA KERANJANG BELANJA
   ========================================================================== */

// Menambahkan item ke keranjang
function addToCart(id) {
    const menuItem = menuData.find(item => item.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...menuItem,
            quantity: 1
        });
    }

    updateCart();
}

// Mengubah jumlah item (tambah/kurang)
function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;

        // Jika jumlah mencapai 0, hapus dari keranjang
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }

    updateCart();
}

// Memperbarui tampilan keranjang, total harga, dan menyimpan ke localStorage
function updateCart() {
    // Simpan status keranjang ke localStorage browser
    localStorage.setItem('cafe_cart', JSON.stringify(cart));

    // Render daftar item di keranjang
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Keranjang belanja masih kosong.</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.nama}</h4>
                    <span>Rp ${item.harga.toLocaleString('id-ID')} x ${item.quantity}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    // Hitung Total harga dan Jumlah Item
    const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    const totalItem = cart.reduce((sum, item) => sum + item.quantity, 0);

    totalPriceElement.textContent = `Rp ${totalHarga.toLocaleString('id-ID')}`;
    cartCountBadge.textContent = totalItem;
}

// Mengosongkan keranjang pesanan
btnClearCart.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
        cart = [];
        updateCart();
    }
});

/* ==========================================================================
   5. FUNGSI PENCARIAN & FILTER KATEGORI
   ========================================================================== */

// Fitur Filter Kategori
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Atur tombol aktif
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const category = button.getAttribute('data-category');
        
        if (category === 'semua') {
            renderMenu(menuData);
        } else {
            const filteredMenu = menuData.filter(item => item.kategori === category);
            renderMenu(filteredMenu);
        }
    });
});

// Fitur Pencarian Real-Time
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const searchedMenu = menuData.filter(item => 
        item.nama.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword)
    );
    renderMenu(searchedMenu);
});

/* ==========================================================================
   6. INTEGRASI PEMESANAN VIA WHATSAPP (TANPA BACKEND)
   ========================================================================== */

btnCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Keranjang belanja Anda masih kosong!');
        return;
    }

    // Nomor WhatsApp Kasir Kafe (Ganti dengan nomor tujuan asli)
    const phoneNumber = "6281234567890";

    // Menyusun format teks pesan WhatsApp
    let message = "Halo Kopi & Santai, saya ingin memesan:\n\n";
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.nama} (${item.quantity}x) = Rp ${(item.harga * item.quantity).toLocaleString('id-ID')}\n`;
    });

    const totalHarga = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    message += `\n*Total Pembayaran: Rp ${totalHarga.toLocaleString('id-ID')}*`;
    message += `\n\nMohon diproses, terima kasih!`;

    // Mengubah teks ke format URL terenkripsi
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Buka aplikasi WhatsApp
    window.open(whatsappUrl, '_blank');
});

/* ==========================================================================
   7. INISIALISASI APLIKASI
   ========================================================================== */

// Jalankan fungsi awal saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderMenu(menuData);
    updateCart();
});
