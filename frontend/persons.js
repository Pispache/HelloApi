const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const personForm = document.getElementById('personForm');
const personsList = document.getElementById('personsList');
const alertContainer = document.getElementById('alertContainer');

// Pagination variables
let currentPage = 1;
const personsPerPage = 2;
let allPersons = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadPersons();
    setupFormSubmission();
});

// Setup form submission
function setupFormSubmission() {
    personForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(personForm);
        const personData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone')?.trim() || null,
            address: formData.get('address')?.trim() || null
        };

        // Validation
        if (!personData.firstName || personData.firstName.length > 100) {
            showAlert('El nombre es requerido y debe tener máximo 100 caracteres.', 'danger');
            return;
        }

        if (!personData.lastName || personData.lastName.length > 100) {
            showAlert('El apellido es requerido y debe tener máximo 100 caracteres.', 'danger');
            return;
        }

        if (!personData.email || !isValidEmail(personData.email) || personData.email.length > 255) {
            showAlert('El email es requerido y debe ser válido (máximo 255 caracteres).', 'danger');
            return;
        }

        if (personData.phone && personData.phone.length > 20) {
            showAlert('El teléfono debe tener máximo 20 caracteres.', 'danger');
            return;
        }

        if (personData.address && personData.address.length > 500) {
            showAlert('La dirección debe tener máximo 500 caracteres.', 'danger');
            return;
        }

        try {
            let response;
            let successMessage;
            
            if (isEditing) {
                // Update existing person
                response = await fetch(`${API_BASE_URL}/person/${editingPersonId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(personData)
                });
                successMessage = 'Persona actualizada exitosamente!';
            } else {
                // Create new person
                response = await fetch(`${API_BASE_URL}/person`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(personData)
                });
                successMessage = 'Persona creada exitosamente!';
            }

            if (response.ok) {
                const result = await response.json();
                showAlert(successMessage, 'success');
                
                // Reset form and editing state
                if (isEditing) {
                    cancelEdit();
                } else {
                    personForm.reset();
                }
                
                loadPersons(); // Reload persons list
            } else {
                personForm.reset();
                const error = await response.text();
                const action = isEditing ? 'actualizar' : 'crear';
                showAlert(`Error al ${action} persona: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error de conexión. Verifica que la API esté funcionando.', 'danger');
        }
    });
}

// Load persons from API
async function loadPersons() {
    try {
        const response = await fetch(`${API_BASE_URL}/person`);
        
        if (response.ok) {
            allPersons = await response.json();
            allPersons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            displayPaginatedPersons();
        } else {
            personsList.innerHTML = '<div class="alert alert-warning">Error al cargar personas</div>';
        }
    } catch (error) {
        console.error('Error loading persons:', error);
        personsList.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

// Display paginated persons
function displayPaginatedPersons() {
    if (allPersons.length === 0) {
        personsList.innerHTML = '<div class="alert alert-info">No hay personas registradas</div>';
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(allPersons.length / personsPerPage);
    const startIndex = (currentPage - 1) * personsPerPage;
    const endIndex = startIndex + personsPerPage;
    const currentPersons = allPersons.slice(startIndex, endIndex);

    // Generate persons HTML
    const personsHtml = currentPersons.map(person => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title mb-1">
                            <i class="fas fa-user me-2"></i>
                            ${escapeHtml(person.firstName)} ${escapeHtml(person.lastName)}
                        </h6>
                        <p class="card-text mb-1">
                            <i class="fas fa-envelope me-2"></i>
                            <a href="mailto:${person.email}" class="text-decoration-none">
                                ${escapeHtml(person.email)}
                            </a>
                        </p>
                        ${person.phone ? `
                            <p class="card-text mb-1">
                                <i class="fas fa-phone me-2"></i>
                                <a href="tel:${person.phone}" class="text-decoration-none">
                                    ${escapeHtml(person.phone)}
                                </a>
                            </p>
                        ` : ''}
                        ${person.address ? `
                            <p class="card-text mb-1">
                                <i class="fas fa-map-marker-alt me-2"></i>
                                ${escapeHtml(person.address)}
                            </p>
                        ` : ''}
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>
                            Registrado: ${formatDate(person.createdAt)}
                        </small>
                    </div>
                    <div class="btn-group-vertical ms-2">
                        <button class="btn btn-outline-primary btn-sm" 
                                onclick="editPerson(${person.id})" 
                                title="Editar persona">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Always show pagination controls if there are persons
    const paginationHtml = `
        <div class="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded">
            <div>
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    Mostrando ${startIndex + 1}-${Math.min(endIndex, allPersons.length)} de ${allPersons.length} personas
                </small>
            </div>
            <div>
                <button class="btn btn-outline-primary btn-sm me-2" 
                        onclick="changePersonPage(${currentPage - 1})" 
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span class="mx-2 badge bg-primary">Página ${currentPage} de ${totalPages}</span>
                <button class="btn btn-outline-primary btn-sm ms-2" 
                        onclick="changePersonPage(${currentPage + 1})" 
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;

    personsList.innerHTML = personsHtml + paginationHtml;
}

// Change page function for persons
function changePersonPage(newPage) {
    const totalPages = Math.ceil(allPersons.length / personsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayPaginatedPersons();
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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Global variable to track if we're editing
let isEditing = false;
let editingPersonId = null;

// Edit person function
async function editPerson(personId) {
    try {
        const response = await fetch(`${API_BASE_URL}/person/${personId}`);
        
        if (response.ok) {
            const person = await response.json();
            
            // Fill form with person data
            document.getElementById('firstName').value = person.firstName;
            document.getElementById('lastName').value = person.lastName;
            document.getElementById('email').value = person.email;
            document.getElementById('phone').value = person.phone || '';
            document.getElementById('address').value = person.address || '';
            
            // Update form state
            isEditing = true;
            editingPersonId = personId;
            
            // Update form button and header
            const submitButton = personForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Actualizar Persona';
            submitButton.className = 'btn btn-success me-2';
            
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
            const cardHeader = document.querySelector('.card-header.bg-warning');
            cardHeader.innerHTML = '<h5 class="mb-0"><i class="fas fa-user-edit me-2"></i>Editar Persona</h5>';
            cardHeader.className = 'card-header bg-success text-white';
            
            showAlert('Editando persona. Modifica los campos y guarda los cambios.', 'info');
        } else {
            showAlert('Error al cargar los datos de la persona.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión al cargar la persona.', 'danger');
    }
}

// Cancel edit function
function cancelEdit() {
    isEditing = false;
    editingPersonId = null;
    
    // Reset form
    personForm.reset();
    
    // Reset button and header
    const submitButton = personForm.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Persona';
    submitButton.className = 'btn btn-warning';
    
    // Remove cancel button
    const cancelButton = document.getElementById('cancelEditBtn');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    // Reset header
    const cardHeader = document.querySelector('.card-header');
    cardHeader.innerHTML = '<h5 class="mb-0"><i class="fas fa-user-plus me-2"></i>Crear Persona</h5>';
    cardHeader.className = 'card-header bg-warning text-dark';
    
    showAlert('Edición cancelada.', 'info');
}

// Note: Delete functionality removed to protect customers with existing orders
