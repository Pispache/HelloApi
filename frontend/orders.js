const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const ordersList = document.getElementById('ordersList');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const alertContainer = document.getElementById('alertContainer');

// Data storage
let allOrders = [];
let filteredOrders = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    statusFilter.addEventListener('change', filterOrders);
    searchInput.addEventListener('input', filterOrders);
    refreshBtn.addEventListener('click', loadOrders);
    
    // Setup modal event listeners
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', saveStatusUpdate);
    }
}

// Load orders from API
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/order`);
        
        if (response.ok) {
            allOrders = await response.json();
            filteredOrders = [...allOrders];
            displayOrders();
        } else {
            ordersList.innerHTML = '<div class="alert alert-warning">Error al cargar órdenes</div>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = '<div class="alert alert-danger">Error de conexión</div>';
    }
}

// Filter orders based on status and search
function filterOrders() {
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();
    
    filteredOrders = allOrders.filter(order => {
        const matchesStatus = !statusValue || order.status === statusValue;
        const matchesSearch = !searchValue || 
            order.person.firstName.toLowerCase().includes(searchValue) ||
            order.person.lastName.toLowerCase().includes(searchValue) ||
            order.person.email.toLowerCase().includes(searchValue);
        
        return matchesStatus && matchesSearch;
    });
    
    displayOrders();
}

// Display orders in the list
function displayOrders() {
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<div class="alert alert-info text-center">No hay órdenes que coincidan con los filtros</div>';
        return;
    }

    const ordersHtml = filteredOrders
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .map(order => `
            <div class="card mb-3 order-card status-${order.status.toLowerCase()}">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                <i class="fas fa-receipt me-2"></i>Orden #${order.id}
                                ${getStatusBadge(order.status)}
                            </h5>
                            <div class="row">
                                <div class="col-md-6">
                                    <p class="card-text mb-1">
                                        <strong>Cliente:</strong> ${escapeHtml(order.person.firstName)} ${escapeHtml(order.person.lastName)}
                                    </p>
                                    <p class="card-text mb-1">
                                        <strong>Email:</strong> ${escapeHtml(order.person.email)}
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <p class="card-text mb-1">
                                        <strong>Fecha:</strong> ${formatDate(order.orderDate)}
                                    </p>
                                    <p class="card-text mb-1">
                                        <strong>Total:</strong> <span class="text-success fw-bold">Q${order.totalAmount.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                            ${order.notes ? `<p class="card-text"><strong>Notas:</strong> ${escapeHtml(order.notes)}</p>` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-outline-primary btn-sm mb-2" onclick="viewOrderDetails(${order.id})">
                                <i class="fas fa-eye me-1"></i>Ver Detalles
                            </button>
                            <br>
                            <button class="btn btn-outline-warning btn-sm me-1" onclick="openUpdateStatusModal(${order.id}, '${order.status}')">
                                <i class="fas fa-edit me-1"></i>Estado
                            </button>
                            ${order.status !== 'Completed' ? `
                                <button class="btn btn-outline-success btn-sm" onclick="quickUpdateStatus(${order.id}, 'Completed')">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            ${order.status !== 'Cancelled' ? `
                                <button class="btn btn-outline-danger btn-sm" onclick="quickUpdateStatus(${order.id}, 'Cancelled')">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    ordersList.innerHTML = ordersHtml;
}

function getStatusBadge(status) {
    const badges = {
        'Pending': '<span class="badge badge-pending">Pendiente</span>',
        'Processing': '<span class="badge badge-processing">Procesando</span>',
        'Completed': '<span class="badge badge-completed">Completada</span>',
        'Cancelled': '<span class="badge badge-cancelled">Cancelada</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

// View order details in modal
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/order/${orderId}`);
        
        if (response.ok) {
            const order = await response.json();
            
            let detailsHtml = `
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6><i class="fas fa-receipt me-2"></i>Orden #${order.id}</h6>
                        <p><strong>Cliente:</strong> ${escapeHtml(order.person.firstName)} ${escapeHtml(order.person.lastName)}</p>
                        <p><strong>Email:</strong> ${escapeHtml(order.person.email)}</p>
                        <p><strong>Teléfono:</strong> ${order.person.phone ? escapeHtml(order.person.phone) : 'N/A'}</p>
                        ${order.person.address ? `<p><strong>Dirección:</strong> ${escapeHtml(order.person.address)}</p>` : ''}
                    </div>
                    <div class="col-md-6">
                        <p><strong>Fecha:</strong> ${formatDate(order.orderDate)}</p>
                        <p><strong>Estado:</strong> ${getStatusBadge(order.status)}</p>
                        <p><strong>Total:</strong> <span class="text-success fw-bold">Q${order.totalAmount.toFixed(2)}</span></p>
                        ${order.notes ? `<p><strong>Notas:</strong> ${escapeHtml(order.notes)}</p>` : ''}
                    </div>
                </div>
                
                <h6><i class="fas fa-box me-2"></i>Productos:</h6>
                <div class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead class="table-dark">
                            <tr>
                                <th>Producto</th>
                                <th>Precio Unit.</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            order.orderDetails.forEach(detail => {
                detailsHtml += `
                    <tr>
                        <td>
                            <strong>${escapeHtml(detail.item.name)}</strong>
                            ${detail.item.description ? `<br><small class="text-muted">${escapeHtml(detail.item.description)}</small>` : ''}
                        </td>
                        <td>Q${detail.unitPrice.toFixed(2)}</td>
                        <td><span class="badge bg-primary">${detail.quantity}</span></td>
                        <td><strong>Q${detail.totalPrice.toFixed(2)}</strong></td>
                    </tr>
                `;
            });
            
            detailsHtml += `
                        </tbody>
                        <tfoot class="table-dark">
                            <tr>
                                <th colspan="3">Total General:</th>
                                <th>Q${order.totalAmount.toFixed(2)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
            
            document.getElementById('orderDetailsContent').innerHTML = detailsHtml;
            new bootstrap.Modal(document.getElementById('orderDetailsModal')).show();
        } else {
            showAlert('Error al cargar detalles de la orden', 'danger');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showAlert('Error de conexión al cargar detalles', 'danger');
    }
}

// Open update status modal
function openUpdateStatusModal(orderId, currentStatus) {
    document.getElementById('updateOrderId').value = orderId;
    document.getElementById('newStatus').value = currentStatus;
    document.getElementById('updateNotes').value = '';
    
    new bootstrap.Modal(document.getElementById('updateStatusModal')).show();
}

// Quick status update
async function quickUpdateStatus(orderId, newStatus) {
    if (confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
        await updateOrderStatus(orderId, newStatus);
    }
}

// Save status update from modal
async function saveStatusUpdate() {
    const orderId = document.getElementById('updateOrderId').value;
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('updateNotes').value.trim();
    
    await updateOrderStatus(orderId, newStatus, notes);
    bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();
}

// Update order status
async function updateOrderStatus(orderId, status, notes = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(status)
        });
        
        if (response.ok) {
            showAlert(`Estado actualizado a: ${status}`, 'success');
            loadOrders(); // Reload orders list
        } else {
            showAlert('Error al actualizar el estado', 'danger');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showAlert('Error de conexión al actualizar estado', 'danger');
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
