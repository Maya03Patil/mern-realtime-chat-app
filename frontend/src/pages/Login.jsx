import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock, Phone } from 'lucide-react';
import { loginAPI } from '../services/api';

export default function Login({ setCurrentUser }) {
  const [useEmail, setUseEmail] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await loginAPI({ identifier, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">Sign in to continue to ChatSphere</p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
          <button type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${useEmail ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setUseEmail(true)}>Email</button>
          <button type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!useEmail ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setUseEmail(false)}>Phone</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {useEmail ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {useEmail ? <Mail className="h-5 w-5 text-gray-400" /> : <Phone className="h-5 w-5 text-gray-400" />}
              </div>
              <input type={useEmail ? 'email' : 'tel'}
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder={useEmail ? 'you@example.com' : '+1 (555) 000-0000'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input type="password"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">Remember me</label>
            </div>
            <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">Forgot password?</a>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 transform transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
