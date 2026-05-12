import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { apiUrl } from '../utils/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setForm({ name: '', email: '', password: '' });
    setError('');
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const handleSubmit = async () => {
    setError('');

    if (isRegister && !form.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!form.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const url = isRegister
        ? apiUrl('/api/auth/register')
        : apiUrl('/api/auth/login');

      const email = form.email.trim().toLowerCase();
      const payload = isRegister
        ? { name: form.name.trim(), email, password: form.password }
        : { email, password: form.password };

      const res = await axios.post(url, payload);
      login(res.data.user, res.data.token);
      setForm({ name: '', email: '', password: '' });
      const next = typeof router.query.next === 'string' ? router.query.next : '/';
      router.push(next);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Prepare<span className="text-blue-500">.ai</span></h1>
          <p className="text-gray-400 mt-2 text-sm">Your smart technical interview prep platform</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              !isRegister ? 'bg-blue-600 text-white' : 'text-gray-400'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isRegister ? 'bg-blue-600 text-white' : 'text-gray-400'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              autoComplete="off"
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            autoComplete="off"
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            autoComplete="new-password"
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}
