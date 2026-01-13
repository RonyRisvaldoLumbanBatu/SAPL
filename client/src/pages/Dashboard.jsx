import React, { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Utensils, Coffee, CreditCard, LogOut, X, Wallet, Banknote, Grid, History, Clock, DollarSign, Receipt, TrendingUp, Calendar, LayoutDashboard, UtensilsCrossed, Users, Search, Edit, CheckCircle, XCircle, Image as ImageIcon, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumericFormat } from 'react-number-format';
import Swal from 'sweetalert2';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';






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

const AdminView = ({ user, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [adminStats, setAdminStats] = useState({
        summary: { total_omset: 0, total_transaksi: 0, rerata_pesanan: 0 },
        topProduct: { name: '-', total_sold: 0 },
        trend: [],
        topList: [],
        recent: []
    });
    const [availableImages, setAvailableImages] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/stats');
            if (res.data.success) {
                setAdminStats(res.data.data);
                setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
        } catch (error) {
            console.error('Gagal ambil stats admin', error);
            Swal.fire('Error', 'Gagal memuat statistik admin', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTransactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/transactions');
            if (res.data.success) {
                setAllTransactions(res.data.data);
            }
        } catch (error) {
            console.error('Gagal ambil semua transaksi', error);
            Swal.fire('Error', 'Gagal memuat data laporan', 'error');
        } finally {
            setLoading(false);
        }
    };


    // --- STAFF MANAGEMENT STATE ---
    const [staffList, setStaffList] = useState([]);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffFormData, setStaffFormData] = useState({ name: '', username: '', password: '', role: 'kasir' });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/users');
            if (res.data.success) {
                setStaffList(res.data.data);
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal memuat data staff', 'error');
        } finally {
            setLoading(false);
        }
    };



    const handleSaveStaff = async (e) => {
        e.preventDefault();
        // Ensure role is set to 'kasir' if empty, though state initializes it.
        const dataToSend = { ...staffFormData, role: staffFormData.role || 'kasir' };

        if (!dataToSend.name || !dataToSend.username || (!editingStaff && !dataToSend.password)) {
            return Swal.fire('Error', 'Mohon lengkapi data', 'error');
        }

        try {
            if (editingStaff) {
                await axios.put(`/api/users/${editingStaff.id}`, dataToSend);
                Swal.fire('Sukses', 'Data staff diperbarui', 'success');
            } else {
                await axios.post('/api/users', staffFormData);
                Swal.fire('Sukses', 'Staff baru berhasil ditambahkan', 'success');
            }
            setShowStaffModal(false);
            setEditingStaff(null);
            fetchStaff();
            setStaffFormData({ name: '', username: '', password: '', role: 'kasir' });
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
        }
    };

    const handleDeleteStaff = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Staff?',
            text: "Akun ini tidak akan bisa login lagi!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/users/${id}`);
                Swal.fire('Terhapus!', 'Akun staff telah dihapus.', 'success');
                fetchStaff();
            } catch (error) {
                Swal.fire('Gagal', error.response?.data?.message || 'Gagal menghapus staff', 'error');
            }
        }
    };

    const openAddStaffModal = () => {
        setEditingStaff(null);
        setStaffFormData({ name: '', username: '', password: '', role: 'kasir' });
        setShowStaffModal(true);
    };

    const openEditStaffModal = (staff) => {
        setEditingStaff(staff);
        setStaffFormData({ 
            name: staff.name, 
            username: staff.username, 
            password: '', 
            role: staff.role || 'kasir' 
        });
        setShowStaffModal(true);
    };

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'makanan',
        image: '',
        is_available: 1
    });

    useEffect(() => {
        if (activeTab === 'menu') {
            fetchProducts();
        } else if (activeTab === 'dashboard') {
            fetchAdminStats();
        } else if (activeTab === 'reports') {
            fetchAllTransactions();
        } else if (activeTab === 'staff') {
            fetchStaff();
        }
    }, [activeTab]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/products?all=true');
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal membua data menu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.category) return;

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('is_available', formData.is_available);
        
        if (formData.file) {
            data.append('image', formData.file);
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id}`, data, config);
                Swal.fire('Sukses', 'Menu berhasil diupdate', 'success');
            } else {
                await axios.post('/api/products', data, config);
                Swal.fire('Sukses', 'Menu baru berhasil ditambahkan', 'success');
            }
            setShowModal(false);
            setEditingProduct(null);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal menyimpan menu', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Menu?',
            text: "Menu akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/products/${id}`);
                Swal.fire('Terhapus!', 'Menu telah dihapus.', 'success');
                fetchProducts();
            } catch (error) {
                Swal.fire('Gagal', 'Menu tidak bisa dihapus.', 'error');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', category: 'Makanan', image: '', file: null, is_available: 1 });
    };

    const fetchImages = async () => {
        try {
            const res = await axios.get('/api/products/images');
            setAvailableImages(res.data || []);
        } catch (error) {
            console.error('Gagal ambil gambar', error);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        resetForm();
        fetchImages(); // Load images when opening modal
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image || '',
            is_available: product.is_available
        });
        fetchImages();
        setShowModal(true);
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Clock State
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="dashboard-layout" style={{ background: 'var(--dark-bg)', display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <aside style={{ width: '280px', background: 'var(--dark-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>SAPL Owner</h2>
                    <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600', border: '1px solid rgba(249, 115, 22, 0.3)' }}>SUPER ADMIN</span>
                </div>
                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
                            { id: 'reports', label: 'Laporan Penjualan', icon: History },
                            { id: 'menu', label: 'Manajemen Menu', icon: UtensilsCrossed },
                            { id: 'staff', label: 'Manajemen Staff', icon: Users }
                        ].map(item => (
                            <li
                                key={item.id}
                                onClick={() => !item.disabled && setActiveTab(item.id)}
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: activeTab === item.id ? '#fff' : '#888',
                                    background: activeTab === item.id ? 'linear-gradient(90deg, #f97316, #ea580c)' : 'transparent',
                                    transition: 'all 0.3s',
                                    opacity: item.disabled ? 0.5 : 1,
                                    fontWeight: activeTab === item.id ? '600' : '400',
                                    boxShadow: activeTab === item.id ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </nav>
                <button onClick={handleLogout} className="btn" style={{ background: '#2a2a2a', color: '#ccc', border: '1px solid #444', justifyContent: 'center', marginTop: 'auto' }}>
                    <LogOut size={18} style={{ marginRight: '8px' }} /> Keluar
                </button>
            </aside>

            <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', background: 'var(--dark-bg)' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Halo, Rony! 👋</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            {activeTab === 'dashboard' ? 'Pantau performa bisnis Anda hari ini.' : 
                             activeTab === 'menu' ? 'Kelola daftar menu restoran Anda.' : 
                             activeTab === 'staff' ? 'Kelola akun kasir restoran.' : 'Laporan penjualan lengkap.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            background: 'var(--dark-surface)',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--text-main)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}>
                            <Clock size={18} color="var(--primary)" />
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        {/* 4 Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'linear-gradient(135deg, #FF4500 0%, #ff8c00 100%)', padding: '1.5rem', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(255, 69, 0, 0.3)' }}>
                                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.2 }}><DollarSign size={80} /></div>
                                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem', letterSpacing: '1px' }}>Total Omset</h3>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>Rp {(parseFloat(adminStats.summary.total_omset) || 0).toLocaleString('id-ID')}</p>
                                <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', display: 'inline-block' }}>Pendapatan kotor hari ini</div>
                            </div>

                            <div style={{ background: 'var(--dark-surface)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}><Receipt size={24} /></div>
                                    <TrendingUp size={16} color="var(--success)" />
                                </div>
                                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Transaksi</h3>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{adminStats.summary.total_transaksi}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '5px' }}>Pesanan masuk hari ini</p>
                            </div>

                            <div style={{ background: 'var(--dark-surface)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: '#10b981' }}><Wallet size={24} /></div>
                                    <TrendingUp size={16} color="var(--success)" />
                                </div>
                                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rerata Pesanan</h3>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Rp {Math.round(adminStats.summary.rerata_pesanan || 0).toLocaleString()}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>Per transaksi hari ini</p>
                            </div>

                            <div style={{ background: 'var(--dark-surface)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '10px', borderRadius: '12px', color: '#eab308' }}><Utensils size={24} /></div>
                                    <CheckCircle size={16} color="#eab308" />
                                </div>
                                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Menu Terpopuler</h3>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{adminStats.topProduct.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>Terjual {adminStats.topProduct.total_sold} porsi</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            {/* Sales Chart */}
                            <div style={{ background: 'var(--dark-surface)', padding: '2rem', borderRadius: '30px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <TrendingUp size={20} color="var(--primary)" /> Tren Penjualan Hari Ini
                                    </h3>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Realtime Update</div>
                                </div>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={adminStats.trend.length > 0 ? adminStats.trend.map(t => ({ ...t, time: `${t.hour}:00` })) : [{ time: '08:00', sales: 0 }, { time: '12:00', sales: 0 }, { time: '18:00', sales: 0 }]}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="time" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                                itemStyle={{ color: 'var(--primary)' }}
                                                formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Penjualan']}
                                            />
                                            <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Selling Items List */}
                            <div style={{ background: 'var(--dark-surface)', padding: '2rem', borderRadius: '30px', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CheckCircle size={20} color="#eab308" /> Menu Terlaris
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {adminStats.topList.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Belum ada data hari ini</p>
                                    ) : adminStats.topList.map((item, id) => (
                                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>{id + 1}</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '0.9rem', color: 'white', margin: 0 }}>{item.name}</h4>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{item.sales} Terjual</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Rp {item.price.toLocaleString()}</p>
                                                <TrendingUp size={12} color="var(--success)" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setActiveTab('menu')} className="btn" style={{ width: '100%', marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>Kelola Daftar Menu</button>
                            </div>
                        </div>

                        {/* Recent Transactions Table in Admin */}
                        <div style={{ marginTop: '2.5rem', background: 'var(--dark-surface)', borderRadius: '30px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                            <div style={{ padding: '1.8rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <History size={20} color="var(--primary)" />
                                    Transaksi Terbaru
                                </h3>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    style={{
                                        background: 'rgba(249, 115, 22, 0.1)',
                                        border: '1px solid rgba(249, 115, 22, 0.2)',
                                        color: 'var(--primary)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s',
                                        fontWeight: '600'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'}
                                >
                                    Lihat Semua <TrendingUp size={14} />
                                </button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1.2rem 2.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Waktu</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>ID Order</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Metode</th>
                                        <th style={{ padding: '1.2rem 2.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Total Pembayaran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminStats.recent.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1rem' }}>
                                                <div style={{ opacity: 0.5, marginBottom: '10px' }}><History size={40} /></div>
                                                Belum ada transaksi hari ini.
                                            </td>
                                        </tr>
                                    ) : adminStats.recent.map((trx, idx) => (
                                        <tr
                                            key={trx.id}
                                            className="table-row-hover"
                                            style={{
                                                borderBottom: idx === adminStats.recent.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                                                transition: 'all 0.2s',
                                                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                                            }}
                                        >
                                            <td style={{ padding: '1.2rem 2.5rem', color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>
                                                {new Date(trx.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '1.2rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                                <span style={{ color: 'var(--primary)', opacity: 0.7 }}>#</span>{trx.id}
                                            </td>
                                            <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 14px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    background: trx.payment_method === 'qris' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: trx.payment_method === 'qris' ? '#60a5fa' : '#34d399',
                                                    border: `1px solid ${trx.payment_method === 'qris' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`
                                                }}>
                                                    {trx.payment_method === 'qris' ? <Smartphone size={12} /> : <Banknote size={12} />}
                                                    {trx.payment_method.toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 2.5rem', textAlign: 'right', fontWeight: '800', color: 'white', fontSize: '1.05rem', fontFamily: 'monospace' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px', fontWeight: '400' }}>Rp</span>
                                                {parseFloat(trx.total_amount).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'reports' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ background: 'var(--dark-surface)', borderRadius: '30px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Laporan Penjualan Lengkap</h3>
                                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Data riwayat transaksi dari awal hingga sekarang</p>
                                </div>
                                <button onClick={fetchAllTransactions} className="btn" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>Muat Ulang</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tanggal & Waktu</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Kasir</th>
                                        <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Metode</th>
                                        <th style={{ padding: '1.5rem 2.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data transaksi yang tersimpan.</td>
                                        </tr>
                                    ) : allTransactions.map((trx, idx) => (
                                        <tr key={trx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                            <td style={{ padding: '1.2rem 2.5rem', color: '#fff' }}>
                                                {new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} -
                                                <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>{new Date(trx.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td style={{ padding: '1.2rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{trx.id}</td>
                                            <td style={{ padding: '1.2rem', color: 'white' }}>{trx.cashier_name || 'System'}</td>
                                            <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    background: trx.payment_method === 'qris' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: trx.payment_method === 'qris' ? '#60a5fa' : '#34d399',
                                                    border: `1px solid ${trx.payment_method === 'qris' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`
                                                }}>
                                                    {trx.payment_method.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 2.5rem', textAlign: 'right', fontWeight: 'bold', color: 'white', fontFamily: 'monospace' }}>
                                                Rp {parseFloat(trx.total_amount).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative', width: '350px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                <input
                                    type="text"
                                    placeholder="Cari menu makanan..."
                                    className="input-field"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '45px', background: 'var(--dark-surface)', border: '1px solid var(--border)', height: '50px', borderRadius: '12px', width: '100%', color: 'white' }}
                                />
                            </div>
                            <button onClick={openAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f97316', color: 'white', border: 'none', padding: '0 25px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)', cursor: 'pointer', fontSize: '1rem' }}>
                                <Plus size={20} /> Tambah Menu
                            </button>
                        </div>

                        <div style={{ background: '#1e1e1e', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#252525', borderBottom: '1px solid #333' }}>
                                    <tr>
                                        <th style={{ padding: '20px', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Menu Item</th>
                                        <th style={{ padding: '20px', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Kategori</th>
                                        <th style={{ padding: '20px', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Harga</th>
                                        <th style={{ padding: '20px', textAlign: 'center', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Status</th>
                                        <th style={{ padding: '20px', textAlign: 'right', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Memuat data menu...</td></tr>
                                    ) : filteredProducts.map((product, idx) => (
                                        <tr key={product.id} className="table-row-hover" style={{ borderBottom: '1px solid #2a2a2a', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '60px', height: '60px', background: '#2a2a2a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
                                                    {product.image ? <img src={`/images/${product.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} style={{ margin: '18px', color: '#444' }} />}
                                                </div>
                                                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#e0e0e0' }}>{product.name}</span>
                                            </td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{ padding: '6px 14px', borderRadius: '20px', background: '#333', color: '#ccc', fontSize: '0.85rem', textTransform: 'capitalize' }}>{product.category}</span>
                                            </td>
                                            <td style={{ padding: '15px 20px', color: '#f97316', fontWeight: 'bold' }}>Rp {product.price.toLocaleString()}</td>
                                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                {product.is_available ?
                                                    <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Tersedia</span> :
                                                    <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Habis</span>
                                                }
                                            </td>
                                            <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                <button onClick={() => openEditModal(product)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', border: 'none', color: '#3b82f6', marginRight: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Edit"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(product.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Hapus"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'staff' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ color: 'white', margin: 0 }}>Kelola Staff</h2>
                                <p style={{ color: '#888', margin: '5px 0 0 0' }}>Tambah atau edit akun untuk kasir dan admin.</p>
                            </div>
                            <button onClick={openAddStaffModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f97316', color: 'white', border: 'none', padding: '0 25px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)', cursor: 'pointer', fontSize: '1rem' }}>
                                <Plus size={20} /> Tambah Staff
                            </button>
                        </div>

                        <div style={{ background: '#1e1e1e', borderRadius: '20px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#252525', borderBottom: '1px solid #333' }}>
                                    <tr>
                                        <th style={{ padding: '20px', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Nama</th>
                                        <th style={{ padding: '20px', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Username</th>
                                        <th style={{ padding: '20px', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Role</th>
                                        <th style={{ padding: '20px', textAlign: 'right', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map((staff, idx) => (
                                        <tr key={staff.id} className="table-row-hover" style={{ borderBottom: '1px solid #2a2a2a', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: staff.role === 'admin' ? '#f97316' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                                    {staff.name ? staff.name.charAt(0).toUpperCase() : (staff.username ? staff.username.charAt(0).toUpperCase() : '?')}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#e0e0e0', fontSize: '0.95rem' }}>{staff.name || 'Tanpa Nama'}</div>
                                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>ID: {staff.id}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px 20px', color: '#ccc', fontFamily: 'monospace' }}>@{staff.username}</td>
                                            <td style={{ padding: '15px 20px' }}>
                                                <span style={{ 
                                                    padding: '6px 14px', 
                                                    borderRadius: '20px', 
                                                    background: (staff.role || 'kasir') === 'admin' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                                                    color: (staff.role || 'kasir') === 'admin' ? '#f97316' : '#3b82f6', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    border: `1px solid ${(staff.role || 'kasir') === 'admin' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {staff.role || 'KASIR'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                <button onClick={() => openEditStaffModal(staff)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', border: 'none', color: '#3b82f6', marginRight: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Edit"><Edit size={18} /></button>
                                                {user.id !== staff.id && (
                                                    <button onClick={() => handleDeleteStaff(staff.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Hapus"><Trash2 size={18} /></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modular Add/Edit Product Modal */}
                {
                    showModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '500px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #27272a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                <style>
                                    {`
                                        input[type=number]::-webkit-inner-spin-button, 
                                        input[type=number]::-webkit-outer-spin-button { 
                                            -webkit-appearance: none; 
                                            margin: 0; 
                                        }
                                    `}
                                </style>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, letterSpacing: '-0.5px' }}>
                                        {editingProduct ? <div style={{padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px'}}><Edit size={20} color="#3b82f6" /></div> : <div style={{padding: '8px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px'}}><Plus size={20} color="#f97316" /></div>}
                                        {editingProduct ? 'Edit Menu' : 'Tambah Menu Baru'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '5px', borderRadius: '50%', transition: 'all 0.2s', display: 'flex' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#71717a'}><X size={22} /></button>
                                </div>

                                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Name Input */}
                                    <div>
                                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Nama Menu</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Nasi Goreng Spesial" 
                                            className="input-field" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                            required 
                                            style={{ width: '100%', padding: '14px 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }} 
                                            onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                        />
                                    </div>
                                    
                                    {/* Price & Category */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Harga</label>
                                            <div 
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    background: '#27272a', 
                                                    border: '1px solid #3f3f46', 
                                                    borderRadius: '12px', 
                                                    padding: '0 16px', 
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = '#f97316'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = '#3f3f46'}
                                                tabIndex={-1} 
                                            >
                                                <span style={{ color: '#a1a1aa', marginRight: '8px', fontWeight: '500' }}>Rp</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                    required
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '14px 0', 
                                                        background: 'transparent', 
                                                        border: 'none', 
                                                        color: 'white', 
                                                        outline: 'none', 
                                                        fontSize: '0.95rem' 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Kategori</label>
                                            <div style={{ position: 'relative' }}>
                                                <select 
                                                    value={formData.category} 
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '14px 16px', 
                                                        paddingRight: '40px', // Space for arrow
                                                        background: '#27272a', 
                                                        border: '1px solid #3f3f46', 
                                                        borderRadius: '12px', 
                                                        color: 'white', 
                                                        outline: 'none', 
                                                        cursor: 'pointer', 
                                                        fontSize: '0.95rem', 
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                        MozAppearance: 'none'
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                                    onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                                >
                                                    <option value="makanan">Makanan</option>
                                                    <option value="minuman">Minuman</option>
                                                    <option value="extra">Extra</option>
                                                </select>
                                                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                                    <ChevronDown size={20} color="#a1a1aa" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Foto Menu</label>
                                        
                                        <div 
                                            style={{ 
                                                border: '2px dashed #52525b', 
                                                borderRadius: '16px', 
                                                padding: '24px', 
                                                background: 'rgba(39, 39, 42, 0.5)', 
                                                textAlign: 'center', 
                                                position: 'relative',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = '#f97316';
                                                e.currentTarget.style.background = 'rgba(249, 115, 22, 0.05)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = '#52525b';
                                                e.currentTarget.style.background = 'rgba(39, 39, 42, 0.5)';
                                            }}
                                        >
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                id="imageUpload" 
                                                style={{ display: 'none' }} 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFormData({ ...formData, file: file });
                                                    }
                                                }}
                                            />
                                            
                                            {/* Preview Logic */}
                                            {(formData.file || formData.image) ? (
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ 
                                                        height: '160px', 
                                                        width: '100%', 
                                                        background: '#1f1f22', 
                                                        borderRadius: '12px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                        border: '1px solid #3f3f46'
                                                    }}>
                                                        <img 
                                                            src={formData.file ? URL.createObjectURL(formData.file) : `/images/${formData.image}`} 
                                                            alt="Preview" 
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                                        />
                                                    </div>
                                                    <label 
                                                        htmlFor="imageUpload" 
                                                        style={{ 
                                                            display: 'inline-block', 
                                                            marginTop: '12px', 
                                                            color: '#f97316', 
                                                            cursor: 'pointer', 
                                                            fontWeight: '600', 
                                                            fontSize: '0.85rem',
                                                            padding: '6px 16px',
                                                            borderRadius: '20px',
                                                            background: 'rgba(249, 115, 22, 0.1)',
                                                            border: '1px solid rgba(249, 115, 22, 0.2)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.background = 'rgba(249, 115, 22, 0.2)'}
                                                        onMouseOut={(e) => e.target.style.background = 'rgba(249, 115, 22, 0.1)'}
                                                    >
                                                        Ganti Foto
                                                    </label>
                                                </div>
                                            ) : (
                                                <label htmlFor="imageUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '10px' }}>
                                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                                                        <Plus size={28} color="#f97316" />
                                                    </div>
                                                    <div style={{textAlign: 'center'}}>
                                                        <span style={{ color: '#e4e4e7', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Klik untuk upload foto</span>
                                                        <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>Format: JPG, PNG, WEBP (Max 2MB)</span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Switch & Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <div 
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                            onClick={() => setFormData(prev => ({ ...prev, is_available: prev.is_available === 1 ? 0 : 1 }))}
                                        >
                                            <div style={{
                                                width: '48px',
                                                height: '26px',
                                                background: formData.is_available === 1 ? '#10b981' : '#3f3f46',
                                                borderRadius: '50px',
                                                position: 'relative',
                                                transition: 'background 0.3s ease'
                                            }}>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '3px',
                                                    left: formData.is_available === 1 ? '25px' : '3px',
                                                    transition: 'left 0.3s ease',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }} />
                                            </div>
                                            <label style={{ color: '#e4e4e7', cursor: 'pointer', userSelect: 'none', fontWeight: '500', fontSize: '0.9rem' }}>
                                                {formData.is_available === 1 ? 'Tersedia' : 'Habis'}
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, padding: '14px', background: '#3f3f46', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#52525b'} onMouseOut={(e) => e.target.style.background = '#3f3f46'}>Batal</button>
                                        <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', background: editingProduct ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', boxShadow: editingProduct ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 20px rgba(249, 115, 22, 0.4)', transition: 'transform 0.1s' }} onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'}>
                                            {editingProduct ? 'Simpan Perubahan' : 'Tambah Menu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Staff Modal */}
                {
                    showStaffModal && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div style={{ background: '#18181b', padding: '35px', borderRadius: '24px', width: '450px', border: '1px solid #27272a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, letterSpacing: '-0.5px' }}>
                                        {editingStaff ? <div style={{padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px'}}><Edit size={20} color="#3b82f6" /></div> : <div style={{padding: '8px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px'}}><Plus size={20} color="#f97316" /></div>}
                                        {editingStaff ? 'Edit Staff' : 'Tambah Staff Baru'}
                                    </h2>
                                    <button onClick={() => setShowStaffModal(false)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '5px', borderRadius: '50%', transition: 'all 0.2s', display: 'flex' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#71717a'}><X size={22} /></button>
                                </div>

                                <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Nama Lengkap</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nama Staff" 
                                            className="input-field" 
                                            value={staffFormData.name} 
                                            onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })} 
                                            required 
                                            style={{ width: '100%', padding: '14px 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }} 
                                            onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>Username Login</label>
                                        <input 
                                            type="text" 
                                            placeholder="Username" 
                                            className="input-field" 
                                            value={staffFormData.username} 
                                            onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })} 
                                            required 
                                            style={{ width: '100%', padding: '14px 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }} 
                                            onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '500' }}>{editingStaff ? 'Password Baru (Opsional)' : 'Password'}</label>
                                        <input 
                                            type="password" 
                                            placeholder={editingStaff ? "Biarkan kosong jika tidak diubah" : "Password"}
                                            className="input-field" 
                                            value={staffFormData.password} 
                                            onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })} 
                                            required={!editingStaff}
                                            style={{ width: '100%', padding: '14px 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }} 
                                            onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                                        />
                                    </div>
                                    {/* Role Selection Removed - Default to Kasir */}
                                    <input type="hidden" value={staffFormData.role} />

                                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                        <button type="button" onClick={() => setShowStaffModal(false)} className="btn-secondary" style={{ flex: 1, padding: '14px', background: '#3f3f46', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#52525b'} onMouseOut={(e) => e.target.style.background = '#3f3f46'}>Batal</button>
                                        <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', background: editingStaff ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', boxShadow: editingStaff ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 20px rgba(249, 115, 22, 0.4)', transition: 'transform 0.1s' }} onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'}>
                                            {editingStaff ? 'Simpan Perubahan' : 'Tambah Staff'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
};

const CashierView = ({ user, handleLogout }) => {
    // History & Clock State
    const [showHistory, setShowHistory] = useState(false);
    const [dailyTransactions, setDailyTransactions] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [viewMode, setViewMode] = useState('pos'); // 'pos' | 'history'

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await axios.get('/api/transactions/today');
            if (res.data.success) {
                setDailyTransactions(res.data.data);
                setViewMode('history');
            }
        } catch (error) {
            Swal.fire('Gagal!', 'Tidak bisa memuat riwayat.', 'error');
        } finally {
            setLoadingHistory(false);
        }
    };

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Order State
    const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' | 'take-away'

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

    const clearCart = () => {
        Swal.fire({
            title: 'Hapus Pesanan?',
            text: "Keranjang akan dikosongkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#222', // Dark mode background
            color: '#fff'       // Dark mode text
        }).then((result) => {
            if (result.isConfirmed) {
                setCart([]);
                Swal.fire({
                    title: 'Terhapus!',
                    text: 'Keranjang sudah bersih.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#222',
                    color: '#fff'
                });
            }
        });
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
            Swal.fire({
                icon: 'error',
                title: 'Uang Kurang!',
                text: 'Mohon cek kembali nominal pembayaran.',
                background: '#222',
                color: '#fff'
            });
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/transactions', {
                items: cart,
                totalAmount: totalAmount,
                customerName: 'Pelanggan Umum',
                paymentMethod: paymentMethod,
                orderType: orderType
            });

            if (res.data.success) {
                generateReceipt(res.data.orderId, cart, totalAmount, user.name, parseInt(cashReceived) || totalAmount, changeAmount, orderType);

                setShowPaymentModal(false);
                setCart([]);
                setOrderType('dine-in');

                Swal.fire({
                    title: 'Transaksi Berhasil! 🎉',
                    text: 'Struk sedang dicetak...',
                    icon: 'success',
                    background: '#222',
                    color: '#fff',
                    confirmButtonColor: '#00C851'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Terjadi kesalahan saat memproses transaksi.',
                background: '#222',
                color: '#fff'
            });
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
                        className={`nav-icon ${viewMode === 'pos' && selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => { setViewMode('pos'); setSelectedCategory('all'); }}
                        title="Semua Menu"
                    >
                        <Grid size={24} />
                    </button>
                    <button
                        className={`nav-icon ${viewMode === 'pos' && selectedCategory === 'Makanan' ? 'active' : ''}`}
                        onClick={() => { setViewMode('pos'); setSelectedCategory('Makanan'); }}
                        title="Makanan"
                    >
                        <Utensils size={24} />
                    </button>
                    <button
                        className={`nav-icon ${viewMode === 'pos' && selectedCategory === 'Minuman' ? 'active' : ''}`}
                        onClick={() => { setViewMode('pos'); setSelectedCategory('Minuman'); }}
                        title="Minuman"
                    >
                        <Coffee size={24} />
                    </button>
                    <button
                        className={`nav-icon ${viewMode === 'pos' && selectedCategory === 'Extra' ? 'active' : ''}`}
                        onClick={() => { setViewMode('pos'); setSelectedCategory('Extra'); }}
                        title="Extra"
                    >
                        <Plus size={24} />
                    </button>

                    {/* Buttons Bottom */}
                    <button
                        className={`nav-icon ${viewMode === 'history' ? 'active' : ''}`}
                        onClick={fetchHistory}
                        title="Laporan & Riwayat"
                        style={{ marginTop: 'auto', opacity: loadingHistory ? 0.5 : 1, cursor: loadingHistory ? 'wait' : 'pointer' }}
                        disabled={loadingHistory}
                    >
                        <History size={24} />
                    </button>
                    <button className="nav-icon" onClick={handleLogout} style={{ marginTop: '1rem', color: 'var(--danger)' }}>
                        <LogOut size={24} />
                    </button>
                </nav>
            </aside>

            <main className="main-content" style={{ padding: '0', position: 'relative', overflow: 'hidden' }}>

                {viewMode === 'pos' && (
                    <div className="pos-layout">

                        {/* LEFT: Product Grid */}
                        <div className="pos-content">
                            <header className="pos-header">
                                <div className="pos-welcome">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <h1>Halo, {user?.name || 'Kasir'}! 👋</h1>
                                        <div style={{
                                            background: 'var(--surface)',
                                            padding: '5px 15px',
                                            borderRadius: '20px',
                                            fontFamily: 'monospace',
                                            fontSize: '1.2rem',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <Clock size={16} />
                                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)' }}>Siap melayani pelanggan?</p>
                                </div>

                                {/* Search Bar */}
                                <div className="pos-search">
                                    <input
                                        type="text"
                                        placeholder="Cari menu (cth: Ayam)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input-field"
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
                                    <div className="product-grid-container">
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
                                    <div className="product-grid-container">
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
                                    <div className="product-grid-container">
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
                            <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2>Pesanan Baru</h2>
                                    <span className="badge">{cart.length} Item</span>
                                </div>
                                {cart.length > 0 && (
                                    <button className="btn-clear-cart" onClick={clearCart} title="Hapus Semua">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Order Type Toggle */}
                            <div className="order-type-toggle">
                                <div
                                    className={`toggle-option ${orderType === 'dine-in' ? 'active' : ''}`}
                                    onClick={() => setOrderType('dine-in')}
                                >
                                    🍽️ Makan Sini
                                </div>
                                <div
                                    className={`toggle-option ${orderType === 'take-away' ? 'active' : ''}`}
                                    onClick={() => setOrderType('take-away')}
                                >
                                    🥡 Bungkus
                                </div>
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
                    </div>
                )}

                {/* PAYMENT MODAL */}
                {showPaymentModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Pembayaran</h2>
                                <button onClick={() => setShowPaymentModal(false)}><X size={24} /></button>
                            </div>

                            <div className="modal-body">
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

                                <button className="btn btn-primary full-width" style={{ marginTop: '2rem', width: '100%', padding: '14px', fontSize: '1.1rem' }} onClick={processPayment} disabled={loading}>
                                    {loading ? 'Memproses...' : 'Selesaikan Transaksi & Cetak'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}



                {viewMode === 'history' && (
                    <div style={{ padding: '2rem', height: '100vh', overflowY: 'auto', background: 'var(--background)' }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <button
                                    onClick={() => setViewMode('pos')}
                                    style={{
                                        marginRight: '1.5rem',
                                        background: 'linear-gradient(145deg, #2a2a2a, #333)',
                                        border: '1px solid #444',
                                        color: '#fff',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                                    }}
                                    title="Kembali ke Kasir"
                                >
                                    <Grid size={24} color="#f97316" />
                                </button>
                                <div>
                                    <h1 style={{ fontSize: '2.2rem', margin: 0, background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Laporan Penjualan</h1>
                                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Ringkasan performa toko hari ini</span>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            {/* Inject Hover Style */}
                            <style>
                                {`
                                    .table-row-hover:hover { background-color: rgba(255, 255, 255, 0.05) !important; }
                                    .stat-card-hover { transition: transform 0.2s; }
                                    .stat-card-hover:hover { transform: translateY(-3px); }
                                `}
                            </style>

                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                {/* Total Omset */}
                                <div className="stat-card-hover" style={{
                                    background: 'linear-gradient(145deg, #1e1e1e, #252525)',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #333',
                                    borderLeft: '4px solid #10b981', // Emerald border
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Omset</h3>
                                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#10b981' }}>
                                            <DollarSign size={20} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                        Rp {dailyTransactions.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0).toLocaleString('id-ID')}
                                    </p>
                                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>* Pendapatan kotor hari ini</small>
                                </div>

                                {/* Total Transaksi */}
                                <div className="stat-card-hover" style={{
                                    background: 'linear-gradient(145deg, #1e1e1e, #252525)',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #333',
                                    borderLeft: '4px solid #f97316', // Orange border
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Transaksi</h3>
                                        <div style={{ padding: '8px', background: 'rgba(249, 115, 22, 0.15)', borderRadius: '8px', color: '#f97316' }}>
                                            <Receipt size={20} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                        {dailyTransactions.length} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#888' }}>Struk</span>
                                    </p>
                                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>* Jumlah pesanan selesai</small>
                                </div>

                                {/* Rata-rata */}
                                <div className="stat-card-hover" style={{
                                    background: 'linear-gradient(145deg, #1e1e1e, #252525)',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #333',
                                    borderLeft: '4px solid #3b82f6', // Blue border
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rata-rata / Struk</h3>
                                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', color: '#3b82f6' }}>
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                        Rp {(dailyTransactions.length > 0 ? dailyTransactions.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0) / dailyTransactions.length : 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </p>
                                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>* Nilai tengah per pesanan</small>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div style={{ marginBottom: '2.5rem', background: '#1e1e1e', borderRadius: '16px', border: '1px solid #333', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Tren Penjualan</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }}></span>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Omset Real-time</span>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={[...dailyTransactions].reverse().map(t => ({
                                            time: t.created_at ? new Date(t.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-',
                                            amount: parseFloat(t.total_amount) || 0
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                stroke="#666"
                                                tick={{ fill: '#888', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#666"
                                                tick={{ fill: '#888', fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `Rp ${value / 1000}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ color: '#aaa', marginBottom: '0.5rem' }}
                                                formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#f97316"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorAmount)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Detailed Table */}
                            <div style={{ background: '#1e1e1e', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#252525' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <History size={20} color="#f97316" />
                                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>Rincian Transaksi</h3>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#666', background: '#1a1a1a', padding: '5px 12px', borderRadius: '20px' }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333', background: '#1a1a1a' }}>
                                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Waktu</th>
                                            <th style={{ padding: '1.2rem', textAlign: 'left', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>ID Order</th>
                                            <th style={{ padding: '1.2rem', textAlign: 'center', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Metode</th>
                                            <th style={{ padding: '1.2rem', textAlign: 'right', color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Total (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#555' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                        <Clock size={40} strokeWidth={1} />
                                                        <span>Belum ada transaksi hari ini.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            dailyTransactions.map((trx, index) => {
                                                const safeAmount = parseFloat(trx.total_amount) || 0;
                                                const safeDate = trx.created_at ? new Date(trx.created_at) : new Date();
                                                const isEven = index % 2 === 0;
                                                return (
                                                    <tr key={trx.id} className="table-row-hover" style={{ borderBottom: '1px solid #2a2a2a', background: isEven ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                                                        <td style={{ padding: '1.2rem', color: '#e0e0e0', fontSize: '0.95rem' }}>
                                                            {safeDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td style={{ padding: '1.2rem', fontFamily: 'monospace', color: '#888', fontSize: '0.9rem' }}>#{trx.id}</td>
                                                        <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: trx.payment_method === 'qris' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                                color: trx.payment_method === 'qris' ? '#60a5fa' : '#34d399',
                                                                border: trx.payment_method === 'qris' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                                                            }}>
                                                                {trx.payment_method === 'qris' ? 'QRIS' : 'TUNAI'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.2rem', textAlign: 'right', fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                                                            {safeAmount.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// ... (ProductCard is already defined below)

// ... (SectionTitle is already defined below)

const generateReceipt = (orderId, items, total, cashierName, paid, change, orderType) => {
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
    doc.text(`Type: ${orderType === 'take-away' ? 'BUNGKUS' : 'MAKAN DITEMPAT'}`, 5, 30);
    doc.text(`Tgl: ${new Date().toLocaleDateString()}`, 5, 35);
    doc.text(`Kasir: ${cashierName}`, 5, 40);
    doc.text('--------------------------------', 40, 43, { align: 'center' });

    // Items
    let yPos = 50;
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
    <div className="product-card" onClick={onClick} style={{ overflow: 'hidden' }}>
        {quantity > 0 && (
            <div className="product-qty-badge">{quantity}</div>
        )}
        <div className="product-image-container" style={{ width: '100%', height: '120px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {product.image ? (
                <img src={`/images/${product.image}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <span style={{ fontSize: '3rem' }}>{product.category === 'Minuman' ? '🥤' : '🍗'}</span>
            )}
        </div>
        <div className="product-details" style={{ padding: '12px' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>{product.name}</h4>
            <p className="price" style={{ margin: 0, color: 'var(--primary)', fontWeight: 'bold' }}>Rp {parseInt(product.price).toLocaleString()}</p>
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
