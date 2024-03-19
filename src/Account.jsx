import './css/Account.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    setLoading(true);
    const { user } = session;
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn(error.message);
    } else if (data) {
      setUsername(data.username);
      setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  }

  async function updateProfile(event) {
    event.preventDefault();
    setLoading(true);
    const { user } = session;
    const updates = {
      id: user.id,
      username,
      avatar_url,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    setLoading(false);

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div className="account-container">
      <form onSubmit={updateProfile} className="form-widget">
        {/* Rest of the form remains the same */}
        <div className="account-links">
          <a href="#" onClick={() => navigate('/sign-up')} className="link">
            Don't have an account? Sign up here
          </a>
          <a href="#" onClick={() => navigate('/login')} className="link">
            Already have an account? Login here
          </a>
        </div>
      </form>
    </div>
  );
}

