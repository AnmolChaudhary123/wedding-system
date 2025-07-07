// Wedding Planning System JavaScript

// Global variables for data storage
let weddingData = {
    details: {
        brideGroom: '',
        weddingDate: '',
        venue: ''
    },
    guests: [],
    budget: {
        total: 0,
        expenses: []
    },
    vendors: [],
    tasks: []
};

// Chart instance for budget visualization
let budgetChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadWeddingData();
    updateCountdown();
    updateStats();
    setupCountdownTimer();
    renderAllData();
    
    // Smooth scrolling for navigation
    setupSmoothScrolling();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('open');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    hamburger.classList.remove('open');
                    navLinks.classList.remove('active');
                }
            });
        });
    }
}

// Smooth scrolling setup
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Data persistence functions
function saveWeddingData() {
    localStorage.setItem('weddingPlanningData', JSON.stringify(weddingData));
}

function loadWeddingData() {
    const saved = localStorage.getItem('weddingPlanningData');
    if (saved) {
        weddingData = { ...weddingData, ...JSON.parse(saved) };
        
        // Populate wedding details form
        if (weddingData.details.brideGroom) {
            document.getElementById('brideGroom').value = weddingData.details.brideGroom;
        }
        if (weddingData.details.weddingDate) {
            document.getElementById('weddingDate').value = weddingData.details.weddingDate;
        }
        if (weddingData.details.venue) {
            document.getElementById('venue').value = weddingData.details.venue;
        }
        if (weddingData.budget.total) {
            document.getElementById('totalBudgetInput').value = weddingData.budget.total;
        }
    }
}

// Wedding details management
function saveWeddingDetails() {
    const brideGroom = document.getElementById('brideGroom').value;
    const weddingDate = document.getElementById('weddingDate').value;
    const venue = document.getElementById('venue').value;

    weddingData.details = {
        brideGroom,
        weddingDate,
        venue
    };

    saveWeddingData();
    updateCountdown();
    
    // Show success message
    showNotification('Wedding details saved successfully!', 'success');
}

// Countdown timer functionality
function setupCountdownTimer() {
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const weddingDate = weddingData.details.weddingDate;
    if (!weddingDate) return;

    const wedding = new Date(weddingDate).getTime();
    const now = new Date().getTime();
    const distance = wedding - now;

    if (distance < 0) {
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Guest management functions
function toggleGuestForm() {
    const form = document.getElementById('guestForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        clearGuestForm();
    }
}

function clearGuestForm() {
    document.getElementById('guestName').value = '';
    document.getElementById('guestEmail').value = '';
    document.getElementById('guestPhone').value = '';
    document.getElementById('guestCategory').value = 'family';
    document.getElementById('rsvpStatus').value = 'pending';
}

function addGuest() {
    const name = document.getElementById('guestName').value;
    const email = document.getElementById('guestEmail').value;
    const phone = document.getElementById('guestPhone').value;
    const category = document.getElementById('guestCategory').value;
    const rsvpStatus = document.getElementById('rsvpStatus').value;

    if (!name.trim()) {
        showNotification('Please enter guest name', 'error');
        return;
    }

    const guest = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category,
        rsvpStatus,
        addedDate: new Date().toLocaleDateString()
    };

    weddingData.guests.push(guest);
    saveWeddingData();
    renderGuestTable();
    updateStats();
    clearGuestForm();
    toggleGuestForm();
    
    showNotification('Guest added successfully!', 'success');
}

function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest?')) {
        weddingData.guests = weddingData.guests.filter(guest => guest.id !== id);
        saveWeddingData();
        renderGuestTable();
        updateStats();
        showNotification('Guest deleted successfully!', 'success');
    }
}

function updateGuestStatus(id, status) {
    const guest = weddingData.guests.find(g => g.id === id);
    if (guest) {
        guest.rsvpStatus = status;
        saveWeddingData();
        renderGuestTable();
        updateStats();
        showNotification('RSVP status updated!', 'success');
    }
}

function renderGuestTable() {
    const table = document.getElementById('guestTable');
    
    if (weddingData.guests.length === 0) {
        table.innerHTML = '<div class="no-data">No guests added yet. Click "Add Guest" to get started!</div>';
        return;
    }

    let html = `
        <div class="table-header">
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Category</div>
            <div>RSVP Status</div>
            <div>Actions</div>
        </div>
    `;

    const filteredGuests = filterGuestData();
    
    filteredGuests.forEach(guest => {
        html += `
            <div class="table-row">
                <div>${guest.name}</div>
                <div>${guest.email || 'N/A'}</div>
                <div>${guest.phone || 'N/A'}</div>
                <div>${guest.category}</div>
                <div>
                    <select onchange="updateGuestStatus(${guest.id}, this.value)">
                        <option value="pending" ${guest.rsvpStatus === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${guest.rsvpStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="declined" ${guest.rsvpStatus === 'declined' ? 'selected' : ''}>Declined</option>
                    </select>
                </div>
                <div>
                    <button onclick="deleteGuest(${guest.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    table.innerHTML = html;
}

function filterGuests() {
    renderGuestTable();
}

function filterGuestData() {
    const searchTerm = document.getElementById('guestSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const rsvpFilter = document.getElementById('rsvpFilter').value;

    return weddingData.guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm) ||
                            (guest.email && guest.email.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || guest.category === categoryFilter;
        const matchesRSVP = !rsvpFilter || guest.rsvpStatus === rsvpFilter;
        
        return matchesSearch && matchesCategory && matchesRSVP;
    });
}

// Budget management functions
function updateTotalBudget() {
    const total = parseFloat(document.getElementById('totalBudgetInput').value) || 0;
    weddingData.budget.total = total;
    saveWeddingData();
    updateBudgetDisplay();
    renderBudgetChart();
    updateStats();
}

function toggleBudgetForm() {
    const form = document.getElementById('budgetForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        clearBudgetForm();
    }
}

function clearBudgetForm() {
    document.getElementById('expenseCategory').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDate').value = '';
}

function addExpense() {
    const category = document.getElementById('expenseCategory').value;
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;

    if (!category.trim() || !amount || amount <= 0) {
        showNotification('Please enter valid category and amount', 'error');
        return;
    }

    const expense = {
        id: Date.now(),
        category: category.trim(),
        description: description.trim(),
        amount,
        date: date || new Date().toISOString().split('T')[0],
        addedDate: new Date().toLocaleDateString()
    };

    weddingData.budget.expenses.push(expense);
    saveWeddingData();
    renderExpenseTable();
    updateBudgetDisplay();
    renderBudgetChart();
    updateStats();
    clearBudgetForm();
    toggleBudgetForm();
    
    showNotification('Expense added successfully!', 'success');
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        weddingData.budget.expenses = weddingData.budget.expenses.filter(expense => expense.id !== id);
        saveWeddingData();
        renderExpenseTable();
        updateBudgetDisplay();
        renderBudgetChart();
        updateStats();
        showNotification('Expense deleted successfully!', 'success');
    }
}

function updateBudgetDisplay() {
    const totalSpent = weddingData.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = weddingData.budget.total - totalSpent;

    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('remainingBudget').textContent = `$${remaining.toFixed(2)}`;
    document.getElementById('remainingBudget').style.color = remaining < 0 ? 'var(--danger-color)' : 'var(--primary-color)';
}

function renderExpenseTable() {
    const table = document.getElementById('expenseTable');
    
    if (weddingData.budget.expenses.length === 0) {
        table.innerHTML = '<div class="no-data">No expenses added yet. Click "Add Expense" to track your wedding budget!</div>';
        return;
    }

    let html = `
        <div class="table-header">
            <div>Category</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Actions</div>
        </div>
    `;

    weddingData.budget.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    weddingData.budget.expenses.forEach(expense => {
        html += `
            <div class="table-row">
                <div>${expense.category}</div>
                <div>${expense.description || 'N/A'}</div>
                <div>$${expense.amount.toFixed(2)}</div>
                <div>${expense.date}</div>
                <div>
                    <button onclick="deleteExpense(${expense.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    table.innerHTML = html;
}

function renderBudgetChart() {
    const ctx = document.getElementById('budgetPieChart');
    if (!ctx) return;

    if (budgetChart) {
        budgetChart.destroy();
    }

    // Group expenses by category
    const categoryTotals = {};
    weddingData.budget.expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
        '#ff6b9d', '#c44569', '#f8b500', '#28a745', '#ffc107', 
        '#dc3545', '#6c5ce7', '#00cec9', '#e84393', '#fd79a8'
    ];

    if (labels.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    budgetChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Vendor management functions
function toggleVendorForm() {
    const form = document.getElementById('vendorForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        clearVendorForm();
    }
}

function clearVendorForm() {
    document.getElementById('vendorName').value = '';
    document.getElementById('vendorCategory').value = 'venue';
    document.getElementById('vendorContact').value = '';
    document.getElementById('vendorEmail').value = '';
    document.getElementById('vendorCost').value = '';
    document.getElementById('vendorStatus').value = 'contacted';
    document.getElementById('vendorNotes').value = '';
}

function addVendor() {
    const name = document.getElementById('vendorName').value;
    const category = document.getElementById('vendorCategory').value;
    const contact = document.getElementById('vendorContact').value;
    const email = document.getElementById('vendorEmail').value;
    const cost = parseFloat(document.getElementById('vendorCost').value) || 0;
    const status = document.getElementById('vendorStatus').value;
    const notes = document.getElementById('vendorNotes').value;

    if (!name.trim()) {
        showNotification('Please enter vendor name', 'error');
        return;
    }

    const vendor = {
        id: Date.now(),
        name: name.trim(),
        category,
        contact: contact.trim(),
        email: email.trim(),
        cost,
        status,
        notes: notes.trim(),
        addedDate: new Date().toLocaleDateString()
    };

    weddingData.vendors.push(vendor);
    saveWeddingData();
    renderVendorTable();
    clearVendorForm();
    toggleVendorForm();
    
    showNotification('Vendor added successfully!', 'success');
}

function deleteVendor(id) {
    if (confirm('Are you sure you want to delete this vendor?')) {
        weddingData.vendors = weddingData.vendors.filter(vendor => vendor.id !== id);
        saveWeddingData();
        renderVendorTable();
        showNotification('Vendor deleted successfully!', 'success');
    }
}

function updateVendorStatus(id, status) {
    const vendor = weddingData.vendors.find(v => v.id === id);
    if (vendor) {
        vendor.status = status;
        saveWeddingData();
        renderVendorTable();
        showNotification('Vendor status updated!', 'success');
    }
}

function renderVendorTable() {
    const table = document.getElementById('vendorTable');
    
    if (weddingData.vendors.length === 0) {
        table.innerHTML = '<div class="no-data">No vendors added yet. Click "Add Vendor" to manage your wedding vendors!</div>';
        return;
    }

    let html = `
        <div class="table-header">
            <div>Name</div>
            <div>Category</div>
            <div>Contact</div>
            <div>Cost</div>
            <div>Status</div>
            <div>Actions</div>
        </div>
    `;

    weddingData.vendors.forEach(vendor => {
        html += `
            <div class="table-row">
                <div>${vendor.name}</div>
                <div>${vendor.category}</div>
                <div>${vendor.contact || vendor.email || 'N/A'}</div>
                <div>$${vendor.cost.toFixed(2)}</div>
                <div>
                    <select onchange="updateVendorStatus(${vendor.id}, this.value)">
                        <option value="contacted" ${vendor.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="quoted" ${vendor.status === 'quoted' ? 'selected' : ''}>Quoted</option>
                        <option value="booked" ${vendor.status === 'booked' ? 'selected' : ''}>Booked</option>
                        <option value="paid" ${vendor.status === 'paid' ? 'selected' : ''}>Paid</option>
                    </select>
                </div>
                <div>
                    <button onclick="deleteVendor(${vendor.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    table.innerHTML = html;
}

// Task management functions
function toggleTaskForm() {
    const form = document.getElementById('taskForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        clearTaskForm();
    }
}

function clearTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskPriority').value = 'low';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskCategory').value = 'venue';
    document.getElementById('taskDescription').value = '';
}

function addTask() {
    const title = document.getElementById('taskTitle').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const category = document.getElementById('taskCategory').value;
    const description = document.getElementById('taskDescription').value;

    if (!title.trim()) {
        showNotification('Please enter task title', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        title: title.trim(),
        priority,
        dueDate,
        category,
        description: description.trim(),
        status: 'pending',
        addedDate: new Date().toLocaleDateString()
    };

    weddingData.tasks.push(task);
    saveWeddingData();
    renderTaskBoard();
    updateStats();
    clearTaskForm();
    toggleTaskForm();
    
    showNotification('Task added successfully!', 'success');
}

function toggleTaskStatus(id) {
    const task = weddingData.tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        saveWeddingData();
        renderTaskBoard();
        updateStats();
        showNotification('Task status updated!', 'success');
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        weddingData.tasks = weddingData.tasks.filter(task => task.id !== id);
        saveWeddingData();
        renderTaskBoard();
        updateStats();
        showNotification('Task deleted successfully!', 'success');
    }
}

function renderTaskBoard() {
    const pendingTasks = document.getElementById('pendingTasks');
    const completedTasks = document.getElementById('completedTasks');
    
    const filteredTasks = filterTaskData();
    const pending = filteredTasks.filter(task => task.status === 'pending');
    const completed = filteredTasks.filter(task => task.status === 'completed');

    pendingTasks.innerHTML = pending.length === 0 ? 
        '<div class="no-data">No pending tasks</div>' : 
        pending.map(task => renderTaskItem(task)).join('');

    completedTasks.innerHTML = completed.length === 0 ? 
        '<div class="no-data">No completed tasks</div>' : 
        completed.map(task => renderTaskItem(task)).join('');
}

function renderTaskItem(task) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
    const overdueClass = isOverdue ? 'overdue' : '';
    
    return `
        <div class="task-item ${task.priority}-priority ${overdueClass}">
            <h4>${task.title}</h4>
            <p>${task.description || 'No description'}</p>
            <div class="task-meta">
                <span><i class="fas fa-tag"></i> ${task.category}</span>
                <span><i class="fas fa-calendar"></i> ${task.dueDate || 'No due date'}</span>
            </div>
            <div class="task-actions">
                <button onclick="toggleTaskStatus(${task.id})" class="complete-btn">
                    <i class="fas fa-${task.status === 'pending' ? 'check' : 'undo'}"></i>
                    ${task.status === 'pending' ? 'Complete' : 'Undo'}
                </button>
                <button onclick="deleteTask(${task.id})" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

function filterTasks() {
    renderTaskBoard();
}

function filterTaskData() {
    const statusFilter = document.getElementById('taskStatusFilter').value;
    const priorityFilter = document.getElementById('taskPriorityFilter').value;

    return weddingData.tasks.filter(task => {
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        
        return matchesStatus && matchesPriority;
    });
}

// Statistics update function
function updateStats() {
    const totalGuests = weddingData.guests.length;
    const confirmedRsvp = weddingData.guests.filter(guest => guest.rsvpStatus === 'confirmed').length;
    const totalBudget = weddingData.budget.total;
    const completedTasksCount = weddingData.tasks.filter(task => task.status === 'completed').length;

    document.getElementById('totalGuests').textContent = totalGuests;
    document.getElementById('confirmedRsvp').textContent = confirmedRsvp;
    document.getElementById('totalBudget').textContent = `$${totalBudget.toFixed(0)}`;
    document.getElementById('completedTasks').textContent = completedTasksCount;
}

// Data export function
function exportData() {
    const dataToExport = {
        ...weddingData,
        exportDate: new Date().toISOString(),
        totalGuests: weddingData.guests.length,
        confirmedGuests: weddingData.guests.filter(g => g.rsvpStatus === 'confirmed').length,
        totalSpent: weddingData.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0),
        completedTasks: weddingData.tasks.filter(t => t.status === 'completed').length
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `wedding-planning-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Wedding data exported successfully!', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;

    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Render all data on page load
function renderAllData() {
    renderGuestTable();
    renderExpenseTable();
    renderVendorTable();
    renderTaskBoard();
    updateBudgetDisplay();
    renderBudgetChart();
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    .no-data {
        text-align: center;
        padding: 3rem;
        color: #666;
        font-style: italic;
    }
    
    .overdue {
        border-left-color: var(--danger-color) !important;
        background-color: #ffe6e6 !important;
    }
`;
document.head.appendChild(style);
       