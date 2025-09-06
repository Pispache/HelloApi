const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const itemForm = document.getElementById('itemForm');
const itemsList = document.getElementById('itemsList');
const alertContainer = document.getElementById('alertContainer');

// Pagination variables
let currentPage = 1;
const itemsPerPage = 2;
let allItems = [];

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
            let response;
            let successMessage;
            
            if (isEditing) {
                // Update existing item
                response = await fetch(`${API_BASE_URL}/item/${editingItemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                });
                successMessage = 'Item actualizado exitosamente!';
            } else {
                // Create new item
                response = await fetch(`${API_BASE_URL}/item`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(itemData)
                });
                successMessage = 'Item creado exitosamente!';
            }

            if (response.ok) {
                const result = await response.json();
                showAlert(successMessage, 'success');
                
                // Reset form and editing state
                if (isEditing) {
                    cancelEdit();
                } else {
                    itemForm.reset();
                }
                
                loadItems(); // Reload items list
            } else {
                const error = await response.text();
                const action = isEditing ? 'actualizar' : 'crear';
                showAlert(`Error al ${action} item: ${error}`, 'danger');
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
            allItems = await response.json();
            allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            displayPaginatedItems();
        } else {
            itemsList.innerHTML = '<div class="alert alert-warning">Error al cargar items</div>';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemsList.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

// Display paginated items
function displayPaginatedItems() {
    if (allItems.length === 0) {
        itemsList.innerHTML = '<div class="alert alert-info">No hay items disponibles</div>';
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = allItems.slice(startIndex, endIndex);

    // Generate items HTML
    const itemsHtml = currentItems.map(item => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title mb-1">${escapeHtml(item.name)}</h6>
                        ${item.description ? `<p class="card-text small text-muted mb-1">${escapeHtml(item.description)}</p>` : ''}
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
                    <div class="text-end ms-2">
                        <div class="mb-2">
                            <span class="badge bg-success">Q${item.price.toFixed(2)}</span>
                        </div>
                        <button class="btn btn-outline-primary btn-sm" 
                                onclick="editItem(${item.id})" 
                                title="Editar item">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Always show pagination controls if there are items
    const paginationHtml = `
        <div class="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded">
            <div>
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    Mostrando ${startIndex + 1}-${Math.min(endIndex, allItems.length)} de ${allItems.length} items
                </small>
            </div>
            <div>
                <button class="btn btn-outline-primary btn-sm me-2" 
                        onclick="changePage(${currentPage - 1})" 
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span class="mx-2 badge bg-primary">Página ${currentPage} de ${totalPages}</span>
                <button class="btn btn-outline-primary btn-sm ms-2" 
                        onclick="changePage(${currentPage + 1})" 
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    itemsList.innerHTML = itemsHtml + paginationHtml;
}

// Change page function
function changePage(newPage) {
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayPaginatedItems();
    }
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

// Global variable to track if we're editing
let isEditing = false;
let editingItemId = null;

// Edit item function
async function editItem(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/item/${itemId}`);
        
        if (response.ok) {
            const item = await response.json();
            
            // Fill form with item data
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemStock').value = item.stock;
            
            // Update form state
            isEditing = true;
            editingItemId = itemId;
            
            // Update form button and header
            const submitButton = itemForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Item';
            submitButton.className = 'btn btn-primary me-2';
            
            // Add cancel button
            if (!document.getElementById('cancelEditBtn')) {
                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.id = 'cancelEditBtn';
                cancelButton.className = 'btn btn-secondary';
                cancelButton.innerHTML = '<i class="fas fa-times me-2"></i>Cancelar';
                cancelButton.onclick = cancelEdit;
                submitButton.parentNode.appendChild(cancelButton);
            }
            
            // Update header
            const cardHeader = document.querySelector('.card-header.bg-success');
            cardHeader.innerHTML = '<h5 class="mb-0"><i class="fas fa-edit me-2"></i>Editar Item</h5>';
            cardHeader.className = 'card-header bg-primary text-white';
            
            showAlert('Editando item. Modifica los campos y guarda los cambios.', 'info');
        } else {
            showAlert('Error al cargar los datos del item.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión al cargar el item.', 'danger');
    }
}

// Cancel edit function
function cancelEdit() {
    isEditing = false;
    editingItemId = null;
    
    // Reset form
    itemForm.reset();
    
    // Reset button and header
    const submitButton = itemForm.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Item';
    submitButton.className = 'btn btn-success';
    
    // Remove cancel button
    const cancelButton = document.getElementById('cancelEditBtn');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    // Reset header
    const cardHeader = document.querySelector('.card-header');
    cardHeader.innerHTML = '<h5 class="mb-0"><i class="fas fa-plus me-2"></i>Crear Item</h5>';
    cardHeader.className = 'card-header bg-success text-white';
    
    showAlert('Edición cancelada.', 'info');
}
