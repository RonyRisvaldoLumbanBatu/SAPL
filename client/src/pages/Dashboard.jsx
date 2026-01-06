import React, { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Utensils, Coffee, CreditCard, LogOut, X, Wallet, Banknote, Grid } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumericFormat } from 'react-number-format';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await axios.get('/api/check-session');
                if (res.data.loggedIn) {
                    setUser(res.data.user);
                } else {
                    navigate('/');
                }
            } catch (error) {
                navigate('/');
            }
        };
        checkSession();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            navigate('/');
        } catch (error) {
            console.error('Logout failed');
        }
    };

    if (!user) {
        return (
            <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
                <h1>Sedang Memuat...</h1>
                <p>Mengecek sesi login...</p>
            </div>
        );
    }

    if (user.role === 'admin') {
        return <AdminView user={user} handleLogout={handleLogout} />;
    } else {
        return <CashierView user={user} handleLogout={handleLogout} />;
    }
};

const AdminView = ({ user, handleLogout }) => (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 className="text-gradient">SAPL Owner</h2>
                <span style={{ background: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>SUPER ADMIN</span>
            </div>
            <nav>
                <ul style={{ listStyle: 'none' }}>
                    <li className="nav-item active">📊 Laporan Penjualan</li>
                    <li className="nav-item">🍗 Menu Terlaris</li>
                    <li className="nav-item">👥 Manajemen Staff</li>
                    <li className="nav-item">⚙️ Pengaturan</li>
                </ul>
            </nav>
        </aside>
        <main className="main-content">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Halo Bos, {user.name}!</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Ini ringkasan omset toko hari ini.</p>
                </div>
                <button onClick={handleLogout} className="btn" style={{ background: '#333', color: 'white' }}>
                    <LogOut size={16} style={{ marginRight: '8px' }} /> Keluar
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="stat-card">
                    <h3>Total Omset Hari Ini</h3>
                    <p className="stat-value text-success">Rp 1.250.000</p>
                    <small>Naik 12% dari kemarin</small>
                </div>
                <div className="stat-card">
                    <h3>Menu Paling Laris</h3>
                    <p className="stat-value text-secondary">Ayam Penyet Paha</p>
                    <small>54 Porsi terjual</small>
                </div>
            </div>
        </main>
    </div>
);

const CashierView = ({ user, handleLogout }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'qris'
    const [cashReceived, setCashReceived] = useState('');
    const [changeAmount, setChangeAmount] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            if (res.data.success) {
                setProducts(res.data.data || []);
            }
        } catch (error) {
            console.error('Gagal ambil menu', error);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1, note: '' }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const updateItemNote = (productId, note) => {
        setCart(cart.map(item =>
            item.id === productId ? { ...item, note: note } : item
        ));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // --- Payment Logic ---

    const handleCheckoutButton = () => {
        if (cart.length === 0) return;
        setShowPaymentModal(true);
        setCashReceived('');
        setChangeAmount(0);
        setPaymentMethod('cash');
    };

    const handleCashInput = (values) => {
        const { floatValue } = values;
        const received = floatValue || 0;
        setCashReceived(received);
        setChangeAmount(received - totalAmount);
    };

    const processPayment = async () => {
        if (paymentMethod === 'cash' && (parseInt(cashReceived) < totalAmount || !cashReceived)) {
            alert('Uang diterima kurang!');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/transactions', {
                items: cart,
                totalAmount: totalAmount,
                customerName: 'Pelanggan Umum',
                paymentMethod: paymentMethod
            });

            if (res.data.success) {
                generateReceipt(res.data.orderId, cart, totalAmount, user.name, parseInt(cashReceived) || totalAmount, changeAmount);
                setShowPaymentModal(false);
                setCart([]);
                alert('Transaksi Berhasil! ✅');
            }
        } catch (error) {
            alert('Gagal memproses transaksi ❌');
        } finally {
            setLoading(false);
        }
    };



    // Filter Logic
    const filtered = Array.isArray(products) ? products.filter(product => {
        const name = product.name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) : [];

    const foods = filtered.filter(p => p.category === 'Makanan');
    const drinks = filtered.filter(p => p.category === 'Minuman');
    const extras = filtered.filter(p => p.category === 'Extra');

    return (
        <div className="dashboard-layout">
            <aside className="sidebar" style={{ width: '80px', padding: '1rem 0.5rem', textAlign: 'center' }}>
                <nav className="mini-nav">
                    <button
                        className={`nav-icon ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                        title="Semua Menu"
                    >
                        <Grid size={24} />
                    </button>
                    <button
                        className={`nav-icon ${selectedCategory === 'Makanan' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Makanan')}
                        title="Makanan"
                    >
                        <Utensils size={24} />
                    </button>
                    <button
                        className={`nav-icon ${selectedCategory === 'Minuman' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Minuman')}
                        title="Minuman"
                    >
                        <Coffee size={24} />
                    </button>
                    <button
                        className={`nav-icon ${selectedCategory === 'Extra' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Extra')}
                        title="Extra"
                    >
                        <Plus size={24} />
                    </button>

                    <button className="nav-icon" onClick={handleLogout} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
                        <LogOut size={24} />
                    </button>
                </nav>
            </aside>

            <main className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', padding: '0', position: 'relative' }}>

                {/* LEFT: Product Grid */}
                <div style={{ padding: '2rem', overflowY: 'auto', height: '100vh' }}>
                    <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>Halo, {user?.name || 'Kasir'}! 👋</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Siap melayani pelanggan?</p>
                        </div>

                        {/* Search Bar */}
                        <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
                            <input
                                type="text"
                                placeholder="Cari menu (cth: Ayam)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--dark-surface)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </header>

                    {/* Render Categories */}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                            <p>Menu tidak ditemukan.</p>
                        </div>
                    )}

                    {foods.length > 0 && (
                        <>
                            <SectionTitle title="Makanan Berat" icon={<Utensils size={18} />} />
                            <div className="product-grid">
                                {foods.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        quantity={cart.find(i => i.id === product.id)?.quantity || 0}
                                        onClick={() => addToCart(product)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {drinks.length > 0 && (
                        <>
                            <SectionTitle title="Minuman Segar" icon={<Coffee size={18} />} style={{ marginTop: '2rem' }} />
                            <div className="product-grid">
                                {drinks.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        quantity={cart.find(i => i.id === product.id)?.quantity || 0}
                                        onClick={() => addToCart(product)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {extras.length > 0 && (
                        <>
                            <SectionTitle title="Tambahan (Extra)" icon={<Plus size={18} />} style={{ marginTop: '2rem' }} />
                            <div className="product-grid">
                                {extras.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        quantity={cart.find(i => i.id === product.id)?.quantity || 0}
                                        onClick={() => addToCart(product)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT: Cart / Transactions */}
                <div className="cart-panel">
                    <div className="cart-header">
                        <h2>Pesanan Baru</h2>
                        <span className="badge">{cart.length} Item</span>
                    </div>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <ShoppingCart size={48} color="#444" />
                                <p>Keranjang masih kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <p>Rp {item.price.toLocaleString()}</p>
                                        <input
                                            type="text"
                                            className="item-note-input"
                                            placeholder="Catatan (pedas, dll)..."
                                            value={item.note || ''}
                                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                                        />
                                    </div>
                                    <div className="item-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                    </div>
                                    <button className="btn-delete" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>Rp {totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Bayar</span>
                            <span>Rp {totalAmount.toLocaleString()}</span>
                        </div>
                        <button
                            className="btn btn-primary btn-checkout"
                            disabled={cart.length === 0 || loading}
                            onClick={handleCheckoutButton}
                        >
                            <CreditCard size={18} style={{ marginRight: '8px' }} />
                            {loading ? 'Memproses...' : 'Bayar Sekarang'}
                        </button>
                    </div>
                </div>

                {/* PAYMENT MODAL */}
                {showPaymentModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Pembayaran</h2>
                                <button onClick={() => setShowPaymentModal(false)}><X size={24} /></button>
                            </div>

                            <div className="payment-summary">
                                <h3>Total Tagihan</h3>
                                <div className="big-price">Rp {totalAmount.toLocaleString()}</div>
                            </div>

                            <div className="payment-methods">
                                <label className={`method-card ${paymentMethod === 'cash' ? 'active' : ''}`}>
                                    <input type="radio" name="method" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                    <Banknote size={24} />
                                    <span>Tunai (Cash)</span>
                                </label>
                                <label className={`method-card ${paymentMethod === 'qris' ? 'active' : ''}`}>
                                    <input type="radio" name="method" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} />
                                    <Wallet size={24} />
                                    <span>QRIS</span>
                                </label>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="input-group" style={{ marginTop: '1.5rem' }}>
                                    <label>Uang Diterima</label>
                                    <NumericFormat
                                        value={cashReceived}
                                        onValueChange={handleCashInput}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="Rp "
                                        className="input-field big-input"
                                        placeholder="Rp 0"
                                        allowNegative={false}
                                        autoFocus
                                    />

                                    {/* QUICK CASH BUTTONS */}
                                    <div className="quick-cash-options">
                                        <button className="btn-quick-cash" onClick={() => handleCashInput({ floatValue: totalAmount })}>
                                            Uang Pas (Rp {totalAmount.toLocaleString()})
                                        </button>
                                        {[20000, 50000, 100000].map(amount => (
                                            amount >= totalAmount && (
                                                <button key={amount} className="btn-quick-cash" onClick={() => handleCashInput({ floatValue: amount })}>
                                                    Rp {amount.toLocaleString()}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <div className={`change-display ${changeAmount < 0 ? 'minus' : ''}`}>
                                        <small>Kembalian</small>
                                        <div>Rp {changeAmount.toLocaleString()}</div>
                                    </div>
                                </div>
                            )}

                            <button className="btn btn-primary full-width" style={{ marginTop: '2rem' }} onClick={processPayment} disabled={loading}>
                                {loading ? 'Memproses...' : 'Selesaikan Transaksi & Cetak'}
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

// ... (ProductCard is already defined below)

// ... (SectionTitle is already defined below)

const generateReceipt = (orderId, items, total, cashierName, paid, change) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Increase height to accommodate notes if needed
    });

    // Header
    doc.setFontSize(14);
    doc.text('AYAM PENYET LAMONGAN', 40, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Jl. Rasa Sayange No. 1', 40, 15, { align: 'center' });
    doc.text('--------------------------------', 40, 20, { align: 'center' });

    // Info
    doc.setFontSize(9);
    doc.text(`No Order: #${orderId}`, 5, 25);
    doc.text(`Tgl: ${new Date().toLocaleDateString()}`, 5, 30);
    doc.text(`Kasir: ${cashierName}`, 5, 35);
    doc.text('--------------------------------', 40, 38, { align: 'center' });

    // Items
    let yPos = 45;
    items.forEach(item => {
        const name = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
        doc.text(name, 5, yPos);
        doc.text(`${item.quantity} x ${item.price.toLocaleString()}`, 5, yPos + 4);
        const subtotal = (item.quantity * item.price).toLocaleString();
        doc.text(subtotal, 75, yPos + 4, { align: 'right' });

        // Print Note if exists
        if (item.note) {
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.text(`* ${item.note}`, 5, yPos + 8);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            yPos += 12; // Extra space for note
        } else {
            yPos += 10;
        }
    });

    doc.text('--------------------------------', 40, yPos, { align: 'center' });

    // Totals
    yPos += 5;
    doc.setFontSize(10);
    doc.text('TOTAL', 5, yPos);
    doc.text(`Rp ${total.toLocaleString()}`, 75, yPos, { align: 'right' });

    yPos += 5;
    doc.text('BAYAR', 5, yPos);
    doc.text(`Rp ${paid.toLocaleString()}`, 75, yPos, { align: 'right' });

    yPos += 5;
    doc.text('KEMBALI', 5, yPos);
    doc.text(`Rp ${change.toLocaleString()}`, 75, yPos, { align: 'right' });

    // Footer
    yPos += 10;
    doc.setFontSize(9);
    doc.text('Terima Kasih!', 40, yPos, { align: 'center' });
    doc.text('Selamat Menikmati', 40, yPos + 5, { align: 'center' });

    doc.save(`Struk-SAPL-${orderId}.pdf`);
};

const ProductCard = ({ product, onClick, quantity }) => (
    <div className="product-card" onClick={onClick}>
        {quantity > 0 && (
            <div className="product-qty-badge">{quantity}</div>
        )}
        <div className="product-image-placeholder">
            {product.category === 'Minuman' ? '🥤' : '🍗'}
        </div>
        <div className="product-details">
            <h4>{product.name}</h4>
            <p className="price">Rp {parseInt(product.price).toLocaleString()}</p>
        </div>
    </div>
);

const SectionTitle = ({ title, icon, style }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', ...style }}>
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
        <h3 style={{ margin: 0 }}>{title}</h3>
    </div>
);

export default Dashboard;
