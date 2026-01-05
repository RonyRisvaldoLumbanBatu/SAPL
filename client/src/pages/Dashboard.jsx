import React, { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    if (!user) return null;

    // --- COMPONENT: ADMIN VIEW ---
    const AdminView = () => (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 className="text-gradient">SAPL Owner</h2>
                    <span style={{ background: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>SUPER ADMIN</span>
                </div>
                <nav>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ padding: '10px', background: 'var(--dark-bg)', borderRadius: '8px', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>📊 Laporan Penjualan</li>
                        <li style={{ padding: '10px', color: 'var(--text-muted)' }}>🍗 Menu Terlaris</li>
                        <li style={{ padding: '10px', color: 'var(--text-muted)' }}>👥 Manajemen Staff</li>
                        <li style={{ padding: '10px', color: 'var(--text-muted)' }}>⚙️ Pengaturan</li>
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
                        Keluar
                    </button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="stat-card" style={{ background: 'var(--dark-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Omset Hari Ini</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>Rp 1.250.000</p>
                        <small style={{ color: 'var(--text-muted)' }}>Naik 12% dari kemarin</small>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--dark-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Menu Paling Laris</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>Ayam Penyet Paha</p>
                        <small style={{ color: 'var(--text-muted)' }}>54 Porsi terjual</small>
                    </div>
                </div>
            </main>
        </div>
    );

    // --- COMPONENT: CASHIER VIEW ---
    const CashierView = () => (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 className="text-gradient">SAPL Kasir</h2>
                    <span style={{ background: 'var(--secondary)', color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>KASIR</span>
                </div>
                <nav>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ padding: '10px', background: 'var(--dark-bg)', borderRadius: '8px', marginBottom: '0.5rem', color: 'var(--secondary)', fontWeight: 'bold' }}>🛒 Transaksi Baru</li>
                        <li style={{ padding: '10px', color: 'var(--text-muted)' }}>📜 Riwayat Transaksi</li>
                        <li style={{ padding: '10px', color: 'var(--text-muted)' }}>📦 Cek Stok</li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1>Semangat, {user.name}!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Siap melayani pelanggan yang lapar?</p>
                    </div>
                    <button onClick={handleLogout} className="btn" style={{ background: '#333', color: 'white' }}>
                        Tutup Kasir (Logout)
                    </button>
                </header>

                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #444', borderRadius: '1rem' }}>
                    <h2 style={{ color: 'var(--text-muted)' }}>Area Kasir Belum Dibuat</h2>
                    <p>Nanti di sini akan muncul daftar menu Ayam, Lele, dll beserta keranjang belanja.</p>
                </div>
            </main>
        </div>
    );

    // Render based on Role
    if (user.role === 'admin') {
        return <AdminView />;
    } else {
        return <CashierView />;
    }
};

export default Dashboard;
