import { useState, useEffect, useRef } from 'react'
import { getAuthToken, getUsername, saveAuthState, clearAuthState } from './cookies'
import { apiCall } from './api'
import Login from './Login'
import Register from './Register'
import TodoList from './TodoList'
import EditModal from './EditModal'
import './App.css'

function App() {
  const [token, setToken] = useState(getAuthToken())
  const [username, setUsername] = useState(getUsername())
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('login')

  const messageTimer = useRef(null)

  function showMessage(text, type) {
    setMessage({ text, type });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(function() {
        setMessage(null);
    }, 5000);
  }

  function handleLogin(newToken, newUsername) {
    setToken(newToken);
    setUsername(newUsername);
  }

  function handleLogout() {
    apiCall('/logout', { method: 'POST' })
        .then(function() {
            clearAuthState();
            setToken(null);
            setUsername(null);
            showMessage('Logged out successfully.', 'success');
        })
        .catch(function() {
            clearAuthState();
            setToken(null);
            setUsername(null);
            showMessage('Logged out.', 'success');
        });
  }

  return (
    <div className="container">
        <header>
            <h1>Todo List</h1>
            {token && (
                <div id="user-info">
                    <span id="username-display">Welcome, {username}</span>
                    <button id="logout-btn" type="button" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </header>

        {message && (
            <div className={'message ' + message.type}>{message.text}</div>
        )}

        {!token ? (
            <section>
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={'tab-btn' + (activeTab === 'login' ? ' active' : '')}
                        onClick={function() { setActiveTab('login') }}
                    >Login</button>
                    <button
                        type="button"
                        className={'tab-btn' + (activeTab === 'register' ? ' active' : '')}
                        onClick={function() { setActiveTab('register') }}
                    >Register</button>
                </div>

                {activeTab === 'login'
                    ? <Login onLogin={handleLogin} showMessage={showMessage} />
                    : <Register onLogin={handleLogin} showMessage={showMessage} />
                }
            </section>
        ) : (
            <TodoList showMessage={showMessage} />
        )}
    </div>
  )
}

export default App
