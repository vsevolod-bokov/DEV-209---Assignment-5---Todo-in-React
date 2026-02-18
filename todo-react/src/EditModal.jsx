import { useState, useEffect } from 'react'
import { apiCall } from './api'

function EditModal({ todo, onClose, onSave, showMessage }) {
    const [title, setTitle] = useState(todo.title)
    const [description, setDescription] = useState(todo.description || '')
    const [completed, setCompleted] = useState(todo.completed ? 'true' : 'false')

    useEffect(function() {
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return function() {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;

        apiCall('/todos/' + todo.id, {
            method: 'PUT',
            body: {
                title: title.trim(),
                description: description.trim(),
                completed: completed === 'true'
            }
        }).then(function() {
            showMessage('Todo updated successfully!', 'success');
            onSave();
        }).catch(function(error) {
            showMessage('Failed to update todo: ' + error.message, 'error');
        });
    }

    return (
        <div className="modal" onClick={function(e) { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal-content">
                <span className="close-btn" onClick={onClose}>{'\u00D7'}</span>
                <form onSubmit={handleSubmit}>
                    <h2>Edit Todo</h2>
                    <div className="form-group">
                        <label htmlFor="edit-title">Title</label>
                        <input
                            type="text"
                            id="edit-title"
                            name="title"
                            value={title}
                            onChange={function(e) { setTitle(e.target.value) }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-description">Description</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            rows="3"
                            value={description}
                            onChange={function(e) { setDescription(e.target.value) }}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-status">Status</label>
                        <select
                            id="edit-status"
                            name="status"
                            value={completed}
                            onChange={function(e) { setCompleted(e.target.value) }}
                        >
                            <option value="false">Unstarted</option>
                            <option value="true">Complete</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditModal