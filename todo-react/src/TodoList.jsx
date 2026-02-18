import { useState, useEffect } from 'react'
import { apiCall } from './api'
import EditModal from './EditModal'

function TodoList({ showMessage }) {
    const [todos, setTodos] = useState([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [editingTodo, setEditingTodo] = useState(null)

    function fetchTodos() {
        apiCall('/todos').then(function(data) {
            setTodos(data);
        }).catch(function(error) {
            showMessage('Failed to load todos: ' + error.message, 'error');
        });
    }

    useEffect(function() {
        fetchTodos();
    }, []);

    function handleCreateTodo(e) {
        e.preventDefault();
        if (!title.trim()) return;

        apiCall('/todos', {
            method: 'POST',
            body: { title: title.trim(), description: description.trim() }
        }).then(function() {
            showMessage('Todo created successfully!', 'success');
            setTitle('');
            setDescription('');
            fetchTodos();
        }).catch(function(error) {
            showMessage('Failed to create todo: ' + error.message, 'error');
        });
    }

    function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this todo?')) return;

        apiCall('/todos/' + id, { method: 'DELETE' }).then(function() {
            showMessage('Todo deleted successfully!', 'success');
            fetchTodos();
        }).catch(function(error) {
            showMessage('Failed to delete todo: ' + error.message, 'error');
        });
    }

    return (
        <>
            <form className="todo-form" onSubmit={handleCreateTodo}>
                <h2>Add New Todo</h2>
                <div className="form-group">
                    <label htmlFor="todo-title">Title</label>
                    <input
                        type="text"
                        id="todo-title"
                        name="title"
                        value={title}
                        onChange={function(e) { setTitle(e.target.value) }}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="todo-description">Description</label>
                    <textarea
                        id="todo-description"
                        name="description"
                        rows="3"
                        value={description}
                        onChange={function(e) { setDescription(e.target.value) }}
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Add Todo</button>
            </form>

            <div className="todo-list-container">
                <h2>Your Todos</h2>
                {todos.length === 0 ? (
                    <p id="no-todos">No todos yet. Add one above!</p>
                ) : (
                    <ul id="todo-list">
                        {todos.map(function(todo) {
                            var statusClass = todo.completed ? 'status-complete' : 'status-unstarted';
                            var statusText = todo.completed ? 'Complete' : 'Unstarted';
                            var createdDate = new Date(todo.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            });

                            return (
                                <li key={todo.id} className={'todo-item' + (todo.completed ? ' completed' : '')}>
                                    <div className="todo-header">
                                        <span className="todo-title">{todo.title}</span>
                                    </div>
                                    {todo.description && <p className="todo-description">{todo.description}</p>}
                                    <div className="todo-footer">
                                        <span className={'todo-status ' + statusClass}>{statusText}</span>
                                        <div className="todo-actions">
                                            <button type="button" className="btn btn-primary btn-small" onClick={function() { setEditingTodo(todo) }}>Edit</button>
                                            <button type="button" className="btn btn-danger btn-small" onClick={function() { handleDelete(todo.id) }}>Delete</button>
                                        </div>
                                    </div>
                                    <span className="todo-date">Created: {createdDate}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {editingTodo && (
                <EditModal
                    todo={editingTodo}
                    onClose={function() { setEditingTodo(null) }}
                    onSave={function() { setEditingTodo(null); fetchTodos() }}
                    showMessage={showMessage}
                />
            )}
        </>
    )
}

export default TodoList