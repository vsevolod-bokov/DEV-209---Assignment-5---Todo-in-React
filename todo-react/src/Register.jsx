import { useState } from 'react'
import { apiCall } from './api'
import { saveAuthState } from './cookies'

function Register({ onLogin, showMessage }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e) {
        e.preventDefault();
        if (!username.trim() || !password) return;

        apiCall('/register', {
            method: 'POST',
            body: { username: username.trim(), password: password }
        }).then(function(data) {
            saveAuthState(data.token, data.username);
            showMessage('Registration successful! Welcome, ' + data.username + '!', 'success');
            onLogin(data.token, data.username);
        }).catch(function(error) {
            showMessage('Registration failed: ' + error.message, 'error');
        });
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Register</h2>
            <div className="form-group">
                <label htmlFor="register-username">Username</label>
                <input
                    type="text"
                    id="register-username"
                    name="username"
                    value={username}
                    onChange={function(e) { setUsername(e.target.value) }}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={password}
                    onChange={function(e) { setPassword(e.target.value) }}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Register</button>
        </form>
    )
}

export default Register