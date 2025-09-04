const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const personForm = document.getElementById('personForm');
const personsList = document.getElementById('personsList');
const alertContainer = document.getElementById('alertContainer');

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
            const response = await fetch(`${API_BASE_URL}/person`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personData)
            });

            if (response.ok) {
                const result = await response.json();
                showAlert('Persona creada exitosamente!', 'success');
                personForm.reset();
                loadPersons(); // Reload persons list
            } else {
                const error = await response.text();
                showAlert(`Error al crear persona: ${error}`, 'danger');
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
            const persons = await response.json();
            displayPersons(persons);
        } else {
            personsList.innerHTML = '<div class="alert alert-warning">Error al cargar personas</div>';
        }
    } catch (error) {
        console.error('Error loading persons:', error);
        personsList.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

// Display persons in the list
function displayPersons(persons) {
    if (persons.length === 0) {
        personsList.innerHTML = '<div class="alert alert-info">No hay personas registradas</div>';
        return;
    }

    const personsHtml = persons
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(person => `
            <div class="card mb-2">
                <div class="card-body">
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
            </div>
        `).join('');

    personsList.innerHTML = personsHtml;
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
