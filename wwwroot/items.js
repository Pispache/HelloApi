const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const itemForm = document.getElementById('itemForm');
const itemsList = document.getElementById('itemsList');
const alertContainer = document.getElementById('alertContainer');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    setupFormSubmission();
});

// Setup form submission
function setupFormSubmission() {
    itemForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(itemForm);
        const itemData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock'))
        };

        // Validation
        if (!itemData.name || itemData.name.length > 100) {
            showAlert('El nombre es requerido y debe tener máximo 100 caracteres.', 'danger');
            return;
        }

        if (itemData.description.length > 500) {
            showAlert('La descripción debe tener máximo 500 caracteres.', 'danger');
            return;
        }

        if (isNaN(itemData.price) || itemData.price <= 0) {
            showAlert('El precio debe ser mayor a 0.', 'danger');
            return;
        }

        if (isNaN(itemData.stock) || itemData.stock < 0) {
            showAlert('El stock no puede ser negativo.', 'danger');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                const result = await response.json();
                showAlert('Item creado exitosamente!', 'success');
                itemForm.reset();
                loadItems(); // Reload items list
            } else {
                const error = await response.text();
                showAlert(`Error al crear item: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión. Verifica que la API esté funcionando.', 'danger');
        }
    });
}

// Load items from API
async function loadItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/item`);
        
        if (response.ok) {
            const items = await response.json();
            displayItems(items);
        } else {
            itemsList.innerHTML = '<div class="alert alert-warning">Error al cargar items</div>';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemsList.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

// Display items in the list
function displayItems(items) {
    if (items.length === 0) {
        itemsList.innerHTML = '<div class="alert alert-info">No hay items disponibles</div>';
        return;
    }

    const itemsHtml = items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(item => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title mb-1">${escapeHtml(item.name)}</h6>
                            ${item.description ? `<p class="card-text small text-muted mb-1">${escapeHtml(item.description)}</p>` : ''}
                        </div>
                        <div class="text-end">
                            <span class="badge bg-success">Q${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small class="text-muted">
                            <i class="fas fa-boxes me-1"></i>Stock: ${item.stock}
                        </small>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            ${formatDate(item.createdAt)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');

    itemsList.innerHTML = itemsHtml;
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
