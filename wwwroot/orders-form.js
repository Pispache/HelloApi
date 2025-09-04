const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const orderForm = document.getElementById('orderForm');
const personSelect = document.getElementById('personSelect');
const orderItems = document.getElementById('orderItems');
const addItemBtn = document.getElementById('addItemBtn');
const totalAmount = document.getElementById('totalAmount');
const alertContainer = document.getElementById('alertContainer');

// Data storage
let availableItems = [];
let availablePersons = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadPersons();
    loadItems();
    setupEventListeners();
    addOrderItem(); // Add first item by default
});

// Setup event listeners
function setupEventListeners() {
    addItemBtn.addEventListener('click', addOrderItem);
    orderForm.addEventListener('submit', handleFormSubmission);
}

// Load persons for dropdown
async function loadPersons() {
    try {
        const response = await fetch(`${API_BASE_URL}/person`);
        if (response.ok) {
            availablePersons = await response.json();
            populatePersonSelect();
        }
    } catch (error) {
        console.error('Error loading persons:', error);
        showAlert('Error al cargar personas', 'warning');
    }
}

// Load items for dropdowns
async function loadItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/item`);
        if (response.ok) {
            availableItems = await response.json();
            updateAllItemSelects();
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showAlert('Error al cargar items', 'warning');
    }
}

// Populate person select dropdown
function populatePersonSelect() {
    personSelect.innerHTML = '<option value="">Selecciona un cliente...</option>';
    availablePersons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = `${person.firstName} ${person.lastName} (${person.email})`;
        personSelect.appendChild(option);
    });
}

// Add new order item
function addOrderItem() {
    const template = document.getElementById('orderItemTemplate');
    const clone = template.content.cloneNode(true);
    
    // Setup event listeners for the new item
    const itemSelect = clone.querySelector('.item-select');
    const quantityInput = clone.querySelector('.quantity-input');
    const removeBtn = clone.querySelector('.remove-item-btn');
    
    itemSelect.addEventListener('change', updateItemPrice);
    quantityInput.addEventListener('input', updateItemSubtotal);
    removeBtn.addEventListener('click', removeOrderItem);
    
    orderItems.appendChild(clone);
    updateAllItemSelects();
    updateTotal();
}

// Remove order item
function removeOrderItem(e) {
    const orderItem = e.target.closest('.order-item');
    orderItem.remove();
    updateTotal();
}

// Update all item select dropdowns
function updateAllItemSelects() {
    const itemSelects = document.querySelectorAll('.item-select');
    itemSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecciona un item...</option>';
        
        availableItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} - Q${item.price.toFixed(2)} (Stock: ${item.stock})`;
            option.dataset.price = item.price;
            option.dataset.stock = item.stock;
            select.appendChild(option);
        });
        
        // Restore previous selection
        if (currentValue) {
            select.value = currentValue;
            updateItemPrice({ target: select });
        }
    });
}

// Update item price display when item is selected
function updateItemPrice(e) {
    const select = e.target;
    const orderItem = select.closest('.order-item');
    const priceSpan = orderItem.querySelector('.item-price');
    const quantityInput = orderItem.querySelector('.quantity-input');
    
    if (select.value) {
        const selectedOption = select.options[select.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        const stock = parseInt(selectedOption.dataset.stock);
        
        priceSpan.textContent = `Q${price.toFixed(2)}`;
        quantityInput.max = stock;
        
        // Reset quantity if it exceeds stock
        if (parseInt(quantityInput.value) > stock) {
            quantityInput.value = Math.min(stock, 1);
        }
    } else {
        priceSpan.textContent = 'Q0.00';
        quantityInput.max = '';
    }
    
    updateItemSubtotal({ target: quantityInput });
}

// Update item subtotal when quantity changes
function updateItemSubtotal(e) {
    const quantityInput = e.target;
    const orderItem = quantityInput.closest('.order-item');
    const itemSelect = orderItem.querySelector('.item-select');
    const subtotalSpan = orderItem.querySelector('.item-subtotal');
    
    if (itemSelect.value && quantityInput.value) {
        const selectedOption = itemSelect.options[itemSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        const quantity = parseInt(quantityInput.value);
        const subtotal = price * quantity;
        
        subtotalSpan.textContent = `Q${subtotal.toFixed(2)}`;
    } else {
        subtotalSpan.textContent = 'Q0.00';
    }
    
    updateTotal();
}

// Update total amount
function updateTotal() {
    const subtotals = document.querySelectorAll('.item-subtotal');
    let total = 0;
    
    subtotals.forEach(subtotalSpan => {
        const subtotalText = subtotalSpan.textContent.replace('Q', '');
        const subtotal = parseFloat(subtotalText) || 0;
        total += subtotal;
    });
    
    totalAmount.textContent = `Q${total.toFixed(2)}`;
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(orderForm);
    const personId = parseInt(formData.get('personId'));
    const notes = formData.get('notes')?.trim() || null;
    
    // Validate person selection
    if (!personId) {
        showAlert('Por favor selecciona un cliente.', 'danger');
        return;
    }
    
    // Collect order items
    const orderDetails = [];
    const orderItemElements = document.querySelectorAll('.order-item');
    
    for (let i = 0; i < orderItemElements.length; i++) {
        const item = orderItemElements[i];
        const itemSelect = item.querySelector('.item-select');
        const quantityInput = item.querySelector('.quantity-input');
        
        if (!itemSelect.value || !quantityInput.value) {
            showAlert('Todos los items deben tener un producto y cantidad seleccionados.', 'danger');
            return;
        }
        
        const itemId = parseInt(itemSelect.value);
        const quantity = parseInt(quantityInput.value);
        
        if (quantity <= 0) {
            showAlert('La cantidad debe ser mayor a 0.', 'danger');
            return;
        }
        
        orderDetails.push({
            itemId: itemId,
            quantity: quantity
        });
    }
    
    if (orderDetails.length === 0) {
        showAlert('Debe agregar al menos un item a la orden.', 'danger');
        return;
    }
    
    const orderData = {
        personId: personId,
        notes: notes,
        orderDetails: orderDetails
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Orden creada exitosamente!', 'success');
            
            // Redirect to orders list after 2 seconds
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 2000);
        } else {
            const error = await response.text();
            showAlert(`Error al crear orden: ${error}`, 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión. Verifica que la API esté funcionando.', 'danger');
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
