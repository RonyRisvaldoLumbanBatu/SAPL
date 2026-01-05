import React, { useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Drumstick, User, Lock } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/api/login', formData);
            if (res.data.success) {
                // Redirect user
                navigate('/dashboard');
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)'
                        }}>
                            <Drumstick size={32} color="white" />
                        </div>
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>SAPL</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sistem Ayam Penyet Lamongan</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                name="username"
                                className="input-field"
                                placeholder="Masukan username"
                                style={{ paddingLeft: '40px' }}
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="password"
                                name="password"
                                className="input-field"
                                placeholder="Masukan password"
                                style={{ paddingLeft: '40px' }}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Memproses...' : 'Masuk Sistem'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
