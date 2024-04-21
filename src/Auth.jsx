import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './index.css'
import './css/auth.css'

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
        setIsLogin(!isLogin)
      }
    }
    setLoading(false);
  };

  //used a component from https://readymadeui.com/tailwind/block/tailwind-css-login-page-design
  return (
    <div className="font-[sans-serif] text-[#333] max-w-7xl mx-auto h-screen">
      <div className="grid md:grid-cols-2 items-center gap-8 h-full">
        <form className="max-w-lg max-md:mx-auto w-full p-6 bg-white bg-opacity-90 rounded" onSubmit={handleAuth}>
          <div className="mb-10">
            <h3 className="text-4xl font-extrabold">groove</h3>
          </div>
          <div>
            <label className="text-[15px] mb-3 block">Email</label>
            <div className="relative flex items-center">
              <input
                name="email"
                type="text"
                required
                className="w-full text-sm bg-gray-100 px-4 py-4 rounded-md outline-blue-600"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="text-[15px] mb-3 block">Password</label>
            <div className="relative flex items-center">
              <input
                name="password"
                type="password"
                required
                className="w-full text-sm bg-gray-100 px-4 py-4 rounded-md outline-blue-600"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-10">
            <button
              id="bigButton"
              type="submit"
              className="w-full shadow-xl py-3 px-4 text-sm font-semibold rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              disabled={loading}>
              {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Log in' : 'Register')}
            </button>
          </div>
          {isLogin ? (
            <p className="linkText text-sm mt-10 text-center">
              Don't have an account? <a id="link1" href="#login" className="text-blue-600 font-semibold hover:underline ml-1" onClick={() => setIsLogin(!isLogin)}>Register here</a>
            </p>
          ) : (
            <p className="linkText text-sm mt-10 text-center">
              Already have an account? <a id="link2" href="#register" className="text-blue-600 font-semibold hover:underline ml-1" onClick={() => setIsLogin(!isLogin)}>Log in</a>
            </p>
          )}
        </form>
        <div id="logo" className="flex justify-center items-center md:py-6 h-full relative" style={{ maxWidth: '50vw' }}>
          <div style={{ width: '50vw', height: '50vw', maxWidth: '500px', maxHeight: '500px' }}>
            <img src="/login-background.jpg" alt="Login Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </div>
  );
}