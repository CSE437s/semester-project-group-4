import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './index.css';
import './css/auth.css';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    let error;

    if (isLogin) {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    } else {
      ({ error } = await supabase.auth.signUp({ email, password }));
    }

    if (error) {
      alert(error.message);
    } else {
      console.log(isLogin ? 'Logged in successfully!' : 'Signed up successfully! Verify your email before logging in.');
      if (!isLogin) {
        alert('Signed up successfully! Verify your email before logging in.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    const email = prompt('Please enter your email address for password reset:');
    if (email) {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);
      if (error) {
        alert(error.message);
      } else {
        alert('Password reset email sent! Check your inbox for instructions.');
      }
    }
  };

  return (
    <div className="font-sans text-gray-800 max-w-7xl mx-auto h-screen">
      <div className="grid md:grid-cols-2 items-center gap-8 h-full">
        <form className="max-w-lg mx-auto w-full p-6 bg-white bg-opacity-90 rounded" onSubmit={handleAuth}>
          <div className="mb-10">
            <h3 className="text-4xl font-extrabold">groove</h3>
          </div>
          <div>
            <label className="text-sm mb-3 block">Email</label>
            <div className="relative flex items-center">
              <input
                name="email"
                type="email"
                required
                className="w-full text-sm bg-gray-100 px-4 py-4 rounded-md outline-none focus:ring-blue-500"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="text-sm mb-3 block">Password</label>
            <div className="relative flex items-center">
              <input
                name="password"
                type="password"
                required
                className="w-full text-sm bg-gray-100 px-4 py-4 rounded-md outline-none focus:ring-blue-500"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-10">
            <button
              type="submit"
              className="w-full shadow-lg py-3 px-4 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
              disabled={loading}>
              {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Log in' : 'Register')}
            </button>
          </div>
          <div className="text-center mt-6">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={handlePasswordReset}
              disabled={loading}>
              Forgot password?
            </button>
          </div>
          {isLogin ? (
            <p className="text-sm mt-10 text-center">
              Don't have an account? <a className="text-blue-600 font-semibold hover:underline" onClick={() => setIsLogin(false)}>Register here</a>
            </p>
          ) : (
            <p className="text-sm mt-10 text-center">
              Already have an account? <a className="text-blue-600 font-semibold hover:underline" onClick={() => setIsLogin(true)}>Log in</a>
            </p>
          )}
        </form>
        <div className="flex justify-center items-center md:py-6 h-full relative">
          <img src="/login-background.jpg" alt="Login Background" className="max-w-full h-auto object-cover" />
        </div>
      </div>
    </div>
  );
}