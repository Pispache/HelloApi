const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const messageForm = document.getElementById('messageForm');
const messagesList = document.getElementById('messagesList');
const alertContainer = document.getElementById('alertContainer');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadMessages();
    setupFormSubmission();
});

// Setup form submission
function setupFormSubmission() {
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(messageForm);
        const messageData = {
            message: formData.get('message').trim()
        };

        if (!messageData.message) {
            showAlert('Por favor ingresa un mensaje válido.', 'danger');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                const result = await response.json();
                showAlert('Mensaje creado exitosamente!', 'success');
                messageForm.reset();
                loadMessages(); // Reload messages list
            } else {
                const error = await response.text();
                showAlert(`Error al crear mensaje: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión. Verifica que la API esté funcionando.', 'danger');
        }
    });
}

// Load messages from API
async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/message`);
        
        if (response.ok) {
            const messages = await response.json();
            displayMessages(messages);
        } else {
            messagesList.innerHTML = '<div class="alert alert-warning">Error al cargar mensajes</div>';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesList.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

// Display messages in the list
function displayMessages(messages) {
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="alert alert-info">No hay mensajes disponibles</div>';
        return;
    }

    const messagesHtml = messages
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10) // Show only last 10 messages
        .map(message => `
            <div class="card mb-2">
                <div class="card-body">
                    <p class="card-text">${escapeHtml(message.message)}</p>
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        ${formatDate(message.createdAt)}
                    </small>
                </div>
            </div>
        `).join('');

    messagesList.innerHTML = messagesHtml;
}

// Utility functions
function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    alertContainer.innerHTML = alertHtml;
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
