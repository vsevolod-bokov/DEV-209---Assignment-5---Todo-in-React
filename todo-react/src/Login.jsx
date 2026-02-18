import { useState } from 'react'
import { apiCall } from './api'
import { saveAuthState } from './cookies'

function Login({ onLogin, showMessage }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e) {
        e.preventDefault();
        if (!username.trim() || !password) return;

        apiCall('/login', {
            method: 'POST',
            body: { username: username.trim(), password: password }
        }).then(function(data) {
            saveAuthState(data.token, data.username);
            showMessage('Login successful! Welcome back, ' + data.username + '!', 'success');
            onLogin(data.token, data.username);
        }).catch(function(error) {
            showMessage('Login failed: ' + error.message, 'error');
        });
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="form-group">
                <label htmlFor="login-username">Username</label>
                <input
                    type="text"
                    id="login-username"
                    name="username"
                    value={username}
                    onChange={function(e) { setUsername(e.target.value) }}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={password}
                    onChange={function(e) { setPassword(e.target.value) }}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
        </form>
    )
}

export default Login