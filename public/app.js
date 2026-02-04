// API base URL
const API_URL = 'http://localhost:3000';

// DOM Elements
const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const messageEl = document.getElementById('message');

// Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const todoForm = document.getElementById('todo-form');
const editForm = document.getElementById('edit-form');

// Modal elements
const editModal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close-btn');
const cancelEditBtn = document.getElementById('cancel-edit');

// Tab buttons
const tabBtns = document.querySelectorAll('.tab-btn');

// Cookie utilities
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Strict';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
}

// Get auth token from cookie
function getAuthToken() {
    return getCookie('authToken');
}

// Get username from cookie
function getUsername() {
    return getCookie('username');
}

// Save auth state to cookies
function saveAuthState(token, username) {
    setCookie('authToken', token, 7); // 7 days
    setCookie('username', username, 7);
}

// Clear auth state from cookies
function clearAuthState() {
    deleteCookie('authToken');
    deleteCookie('username');
}

// Show message
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    messageEl.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(function() {
        messageEl.classList.add('hidden');
    }, 5000);
}

// API call helper
function apiCall(endpoint, options) {
    options = options || {};
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    return fetch(API_URL + endpoint, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function(response) {
        // For 204 No Content, return success without parsing
        if (response.status === 204) {
            return { success: true };
        }

        return response.json().then(function(data) {
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        });
    });
}

// Auth functions
function register(username, password) {
    return apiCall('/register', {
        method: 'POST',
        body: { username: username, password: password }
    }).then(function(data) {
        saveAuthState(data.token, data.username);
        showMessage('Registration successful! Welcome, ' + data.username + '!', 'success');
        updateUI();
        loadTodos();
        return data;
    }).catch(function(error) {
        showMessage('Registration failed: ' + error.message, 'error');
        throw error;
    });
}

function login(username, password) {
    return apiCall('/login', {
        method: 'POST',
        body: { username: username, password: password }
    }).then(function(data) {
        saveAuthState(data.token, data.username);
        showMessage('Login successful! Welcome back, ' + data.username + '!', 'success');
        updateUI();
        loadTodos();
        return data;
    }).catch(function(error) {
        showMessage('Login failed: ' + error.message, 'error');
        throw error;
    });
}

function logout() {
    return apiCall('/logout', {
        method: 'POST'
    }).then(function() {
        clearAuthState();
        showMessage('Logged out successfully.', 'success');
        updateUI();
    }).catch(function(error) {
        // Even if API call fails, clear local state
        clearAuthState();
        showMessage('Logged out.', 'success');
        updateUI();
    });
}

// Todo functions
function loadTodos() {
    return apiCall('/todos').then(function(todos) {
        renderTodos(todos);
        return todos;
    }).catch(function(error) {
        showMessage('Failed to load todos: ' + error.message, 'error');
        throw error;
    });
}

function createTodo(title, description) {
    return apiCall('/todos', {
        method: 'POST',
        body: { title: title, description: description }
    }).then(function(todo) {
        showMessage('Todo created successfully!', 'success');
        loadTodos();
        return todo;
    }).catch(function(error) {
        showMessage('Failed to create todo: ' + error.message, 'error');
        throw error;
    });
}

function updateTodo(id, updates) {
    return apiCall('/todos/' + id, {
        method: 'PUT',
        body: updates
    }).then(function(todo) {
        showMessage('Todo updated successfully!', 'success');
        loadTodos();
        return todo;
    }).catch(function(error) {
        showMessage('Failed to update todo: ' + error.message, 'error');
        throw error;
    });
}

function deleteTodo(id) {
    return apiCall('/todos/' + id, {
        method: 'DELETE'
    }).then(function() {
        showMessage('Todo deleted successfully!', 'success');
        loadTodos();
    }).catch(function(error) {
        showMessage('Failed to delete todo: ' + error.message, 'error');
        throw error;
    });
}

// Render todos
function renderTodos(todos) {
    const todoList = document.getElementById('todo-list');
    const noTodos = document.getElementById('no-todos');

    todoList.innerHTML = '';

    if (!todos || todos.length === 0) {
        noTodos.classList.remove('hidden');
        return;
    }

    noTodos.classList.add('hidden');

    todos.forEach(function(todo) {
        var li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.setAttribute('data-id', todo.id);

        var statusClass = todo.completed ? 'status-complete' : 'status-unstarted';
        var statusText = todo.completed ? 'Complete' : 'Unstarted';

        var createdDate = new Date(todo.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        li.innerHTML =
            '<div class="todo-header">' +
                '<span class="todo-title">' + escapeHtml(todo.title) + '</span>' +
            '</div>' +
            (todo.description ? '<p class="todo-description">' + escapeHtml(todo.description) + '</p>' : '') +
            '<div class="todo-footer">' +
                '<span class="todo-status ' + statusClass + '">' + statusText + '</span>' +
                '<div class="todo-actions">' +
                    '<button type="button" class="btn btn-primary btn-small edit-btn" data-id="' + todo.id + '">Edit</button>' +
                    '<button type="button" class="btn btn-danger btn-small delete-btn" data-id="' + todo.id + '">Delete</button>' +
                '</div>' +
            '</div>' +
            '<span class="todo-date">Created: ' + createdDate + '</span>';

        todoList.appendChild(li);
    });

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            openEditModal(id, todos);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this todo?')) {
                deleteTodo(id);
            }
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open edit modal
function openEditModal(id, todos) {
    var todo = todos.find(function(t) { return t.id === id; });
    if (!todo) return;

    document.getElementById('edit-todo-id').value = todo.id;
    document.getElementById('edit-title').value = todo.title;
    document.getElementById('edit-description').value = todo.description || '';
    document.getElementById('edit-status').value = todo.completed ? 'true' : 'false';

    editModal.classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
    editModal.classList.add('hidden');
    editForm.reset();
}

// Update UI based on auth state
function updateUI() {
    var token = getAuthToken();
    var username = getUsername();

    if (token && username) {
        // User is logged in
        authSection.classList.add('hidden');
        todoSection.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        usernameDisplay.textContent = 'Welcome, ' + username;
    } else {
        // User is not logged in
        authSection.classList.remove('hidden');
        todoSection.classList.add('hidden');
        userInfo.classList.add('hidden');
        document.getElementById('todo-list').innerHTML = '';
    }
}

// Tab switching
tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        var tab = this.getAttribute('data-tab');

        tabBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    });
});

// Form submissions
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value;

    if (username && password) {
        login(username, password).then(function() {
            loginForm.reset();
        });
    }
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var username = document.getElementById('register-username').value.trim();
    var password = document.getElementById('register-password').value;

    if (username && password) {
        register(username, password).then(function() {
            registerForm.reset();
        });
    }
});

todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var title = document.getElementById('todo-title').value.trim();
    var description = document.getElementById('todo-description').value.trim();

    if (title) {
        createTodo(title, description).then(function() {
            todoForm.reset();
        });
    }
});

editForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var id = document.getElementById('edit-todo-id').value;
    var title = document.getElementById('edit-title').value.trim();
    var description = document.getElementById('edit-description').value.trim();
    var completed = document.getElementById('edit-status').value === 'true';

    if (title) {
        updateTodo(id, {
            title: title,
            description: description,
            completed: completed
        }).then(function() {
            closeEditModal();
        });
    }
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', function() {
    logout();
});

// Modal close handlers
closeBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal when clicking outside
editModal.addEventListener('click', function(e) {
    if (e.target === editModal) {
        closeEditModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
        closeEditModal();
    }
});

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUI();

    // If user is logged in, load their todos
    if (getAuthToken()) {
        loadTodos();
    }
});
