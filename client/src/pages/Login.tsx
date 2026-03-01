import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-10 h-10 rounded-xl border border-[#262626] bg-[#141414] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-xl font-bold text-white text-center mb-1">Welcome back</h1>
                <p className="text-sm text-[#737373] text-center mb-8">Sign in to your account</p>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg border border-[#262626] bg-[#141414] text-sm text-[#b3b3b3]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-medium text-[#737373] uppercase tracking-wider">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoFocus
                            className="bw-input"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-medium text-[#737373] uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="bw-input"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="bw-btn-primary mt-1 w-full py-3">
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-xs text-[#525252] mt-6">
                    Don&apos;t have an account?{' '}
                    <a href="/register" className="text-[#b3b3b3] hover:text-white transition-colors">
                        Create account
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
