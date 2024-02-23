import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleToggleMode = () => {
    setIsLogin(!isLogin)
    setEmail('')
    setUsername('')
    setPassword('')
  }

  const handleAuth = async (event) => {
    event.preventDefault()

    setLoading(true)
    if (isLogin) {
      const { error } = await supabase.auth.signIn({ email: username, password })

      if (error) {
        alert(error.message)
      } else {
        alert('Logged in successfully!')
        history.push('/Dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })

      if (error) {
        alert(error.message)
      } else {
        alert('Signed up successfully!')
        history.push('/Dashboard');
      }
    }
    setLoading(false)
  }

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + React</h1>
        {isLogin ? (
          <>
            <p className="description">Sign in with your username and password below</p>
            <form className="form-widget" onSubmit={handleAuth}>
              <div>
                <input
                  className="inputField"
                  type="text"
                  placeholder="Username"
                  value={username}
                  required={true}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input
                  className="inputField"
                  type="password"
                  placeholder="Password"
                  value={password}
                  required={true}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <button className={'button block'} disabled={loading}>
                  {loading ? <span>Loading</span> : <span>Login</span>}
                </button>
              </div>
            </form>
            <p className="toggle-mode" onClick={handleToggleMode}>Don't have an account? Sign up here</p>
          </>
        ) : (
          <>
            <p className="description">Sign up with your email, username, and password below</p>
            <form className="form-widget" onSubmit={handleAuth}>
              <div>
                <input
                  className="inputField"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  required={true}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  className="inputField"
                  type="text"
                  placeholder="Username"
                  value={username}
                  required={true}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input
                  className="inputField"
                  type="password"
                  placeholder="Password"
                  value={password}
                  required={true}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <button className={'button block'} disabled={loading}>
                  {loading ? <span>Loading</span> : <span>Sign Up</span>}
                </button>
              </div>
            </form>
            <p className="toggle-mode" onClick={handleToggleMode}>Already have an account? Login here</p>
          </>
        )}
      </div>
    </div>
  )
}
