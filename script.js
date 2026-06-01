const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxgE5KF70PfusNL5ZKtnNNVVkmoGlsFHyRKvO7XijudEo_I4zQ8zVPOSlkLFXaiEx7R/exec";

// --- State Management ---
const state = {
    schools: [],
    classes: [],
    selectedSchool: null,
    selectedClass: null,
    isAdminLoggedIn: false,
};

// --- DOM Elements ---
const pages = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.nav-links a');
const menuToggle = document.querySelector('.menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

// Home Page Elements
const schoolsGrid = document.getElementById('schools-grid');
const classesGrid = document.getElementById('classes-grid');
const schoolLoader = document.getElementById('school-loader');
const classLoader = document.getElementById('class-loader');
const stepSchools = document.getElementById('school-selection');
const stepClasses = document.getElementById('class-selection');
const stepInvoice = document.getElementById('invoice-entry');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initInvoiceForm();
    initTabs();
    initAdmin();
    
    // Load initial data for Home Page
    loadSchools();
});

// --- Navigation & Routing ---
function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show page
            pages.forEach(page => page.classList.add('hidden'));
            document.getElementById(`page-${pageId}`).classList.remove('hidden');
            
            // Close mobile menu
            navLinksContainer.classList.remove('show');
            
            // Page specific logic
            if(pageId === 'entries') {
                loadEntries('pending');
            } else if (pageId === 'admin') {
                if(state.isAdminLoggedIn) {
                    loadDashboard();
                }
            } else if (pageId === 'home') {
                resetHomeSteps();
                loadSchools();
            }
        });
    });

    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
    });
}

function resetHomeSteps() {
    stepSchools.classList.remove('hidden');
    stepClasses.classList.add('hidden');
    stepInvoice.classList.add('hidden');
    document.getElementById('invoice-form').reset();
    document.getElementById('books-container').innerHTML = '';
    document.getElementById('notebooks-container').innerHTML = '';
    document.getElementById('others-container').innerHTML = '';
}

// --- Home Page Logic ---

async function loadSchools() {
    schoolLoader.classList.remove('hidden');
    schoolsGrid.innerHTML = '';
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getSchools`);
        const data = await response.json();
        state.schools = data.schools;
        
        data.schools.forEach(school => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-icon"><i class="fa-solid fa-school"></i></div>
                <h3>${school.name}</h3>
            `;
            card.addEventListener('click', () => selectSchool(school));
            schoolsGrid.appendChild(card);
        });
    } catch (error) {
        showError('Failed to load schools');
    } finally {
        schoolLoader.classList.add('hidden');
    }
}

function selectSchool(school) {
    state.selectedSchool = school;
    document.getElementById('selected-school-name').textContent = school.name;
    stepSchools.classList.add('hidden');
    stepClasses.classList.remove('hidden');
    loadClasses(school.index);
}

document.getElementById('back-to-schools').addEventListener('click', () => {
    stepClasses.classList.add('hidden');
    stepSchools.classList.remove('hidden');
});

async function loadClasses(schoolIndex) {
    classLoader.classList.remove('hidden');
    classesGrid.innerHTML = '';
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getClasses&schoolIndex=${schoolIndex}`);
        const data = await response.json();
        
        data.classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
                <h3>${cls.name}</h3>
            `;
            card.addEventListener('click', () => selectClass(cls));
            classesGrid.appendChild(card);
        });
    } catch (error) {
        showError('Failed to load classes');
    } finally {
        classLoader.classList.add('hidden');
    }
}

function selectClass(cls) {
    state.selectedClass = cls;
    document.getElementById('selected-class-name').textContent = `${state.selectedSchool.name} - ${cls.name}`;
    stepClasses.classList.add('hidden');
    stepInvoice.classList.remove('hidden');
    
    // Auto fill date and time
    const now = new Date();
    document.getElementById('auto-date').value = now.toLocaleDateString();
    document.getElementById('auto-time').value = now.toLocaleTimeString();
    
    // Add default row to each
    if(document.getElementById('books-container').children.length === 0) addItemRow('books');
    if(document.getElementById('notebooks-container').children.length === 0) addItemRow('notebooks');
    if(document.getElementById('others-container').children.length === 0) addItemRow('others');
}

document.getElementById('back-to-classes').addEventListener('click', () => {
    stepInvoice.classList.add('hidden');
    stepClasses.classList.remove('hidden');
});

// --- Invoice Form Logic ---
function initInvoiceForm() {
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.closest('.add-item-btn').getAttribute('data-type');
            addItemRow(type);
        });
    });

    document.getElementById('invoice-form').addEventListener('submit', handleInvoiceSubmit);
}

function addItemRow(type) {
    const container = document.getElementById(`${type}-container`);
    const template = document.getElementById('item-row-template').content.cloneNode(true);
    
    const row = template.querySelector('.item-row');
    row.querySelector('.remove-item-btn').addEventListener('click', () => {
        row.remove();
    });
    
    container.appendChild(template);
}

async function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    const mobile = document.getElementById('customer-mobile').value;
    if(mobile.length < 10) {
        alert("Please enter a valid mobile number.");
        return;
    }
    
    const submitBtn = document.getElementById('submit-invoice-btn');
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    const invoiceData = {
        schoolName: state.selectedSchool.name,
        className: state.selectedClass.name,
        customerMobile: mobile,
        date: document.getElementById('auto-date').value,
        time: document.getElementById('auto-time').value,
        message: document.getElementById('customer-message').value,
        books: getCategoryData('books'),
        notebooks: getCategoryData('notebooks'),
        others: getCategoryData('others')
    };

    try {
        const response = await fetch(`${WEB_APP_URL}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'saveInvoice', data: invoiceData })
        });
        const result = await response.json();
        
        if(result.success) {
            showSuccessModal(`Invoice Generated! ID: ${result.invoiceNumber}`);
            resetHomeSteps();
            loadSchools();
        } else {
            alert('Failed to save invoice.');
        }
    } catch (error) {
        alert('Error saving invoice. Please try again.');
    } finally {
        submitBtn.innerHTML = '<i class="fa-solid fa-file-invoice"></i> Generate Invoice';
        submitBtn.disabled = false;
    }
}

function getCategoryData(type) {
    const rows = document.querySelectorAll(`#${type}-container .item-row`);
    const data = [];
    rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        if(name.trim() === '') return;
        
        data.push({
            name: name,
            amount: parseFloat(row.querySelector('.item-amount').value) || 0,
            quantity: parseInt(row.querySelector('.item-quantity').value) || 1,
            identifyNumber: row.querySelector('.item-id-num').value,
            note: row.querySelector('.item-note').value,
            status: 0 // 0 = Pending
        });
    });
    return data;
}

// --- Entries Page Logic ---
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            loadEntries(tabId);
        });
    });
}

async function loadEntries(status) {
    const list = document.getElementById(`${status}-entries-list`);
    const loader = document.getElementById(`${status}-loader`);
    
    list.innerHTML = '';
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getEntries&status=${status}`);
        const data = await response.json();
        
        if(data.entries.length === 0) {
            list.innerHTML = `<p style="text-align:center; padding: 2rem; color: #6b7280;">No ${status} entries found.</p>`;
            return;
        }
        
        data.entries.forEach(entry => {
            const card = buildInvoiceCard(entry, status);
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = `<p class="error-msg">Failed to load entries.</p>`;
    } finally {
        loader.classList.add('hidden');
    }
}

function buildInvoiceCard(entry, viewStatus) {
    const div = document.createElement('div');
    div.className = 'invoice-card';
    
    const booksJSON = JSON.parse(entry.Books || "[]");
    const notebooksJSON = JSON.parse(entry.Notebooks || "[]");
    const othersJSON = JSON.parse(entry.Others || "[]");
    
    // Filter items based on tab view (0 = pending, 1 = delivered)
    const statusFilter = viewStatus === 'pending' ? 0 : 1;
    
    const filterItems = (arr) => arr.filter(item => item.status === statusFilter);
    const pBooks = filterItems(booksJSON);
    const pNotebooks = filterItems(notebooksJSON);
    const pOthers = filterItems(othersJSON);
    
    // If no items match this view for this invoice, return empty fragment
    if(pBooks.length === 0 && pNotebooks.length === 0 && pOthers.length === 0 && viewStatus === 'pending') {
         div.style.display = 'none';
         return div;
    }

    div.innerHTML = `
        <div class="invoice-header">
            <div>
                <h3 style="margin-bottom:0.25rem;">Invoice #${entry.InvoiceNum}</h3>
                <p style="font-size:0.85rem; color:#6B7280;">${entry.School} - ${entry.Class} | ${entry.Mobile}</p>
            </div>
            <div class="invoice-meta">
                <span style="font-size:0.85rem; color:#6B7280;">${entry.Date} ${entry.Time}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
        </div>
        <div class="invoice-details hidden">
            ${entry.Message ? `<p style="margin-bottom:1rem; padding:0.75rem; background:#FFFBEB; border-left:4px solid #F59E0B;"><b>Message:</b> ${entry.Message}</p>` : ''}
            
            <div class="delivery-sections">
                ${buildItemsTable('Books', pBooks, entry.InvoiceNum, viewStatus)}
                ${buildItemsTable('Notebooks', pNotebooks, entry.InvoiceNum, viewStatus)}
                ${buildItemsTable('Other Items', pOthers, entry.InvoiceNum, viewStatus)}
            </div>
            
            ${viewStatus === 'pending' ? `<div style="text-align:right; margin-top:1rem;"><button class="primary-btn mark-delivered-btn" data-invoice="${entry.InvoiceNum}"><i class="fa-solid fa-truck-fast"></i> Move Selected to Delivered</button></div>` : ''}
        </div>
    `;

    // Toggle details
    const header = div.querySelector('.invoice-header');
    header.addEventListener('click', () => {
        const details = div.querySelector('.invoice-details');
        const icon = header.querySelector('.fa-chevron-down');
        details.classList.toggle('hidden');
        icon.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // Handle delivery button
    if(viewStatus === 'pending') {
        div.querySelector('.mark-delivered-btn').addEventListener('click', (e) => handleMarkDelivered(e, entry.InvoiceNum));
    }

    return div;
}

function buildItemsTable(title, items, invoiceNum, viewStatus) {
    if(items.length === 0) return '';
    
    let rows = items.map(item => `
        <tr>
            ${viewStatus === 'pending' ? `<td><input type="checkbox" class="custom-checkbox item-check" data-category="${title}" data-name="${item.name}" data-id="${item.identifyNumber}"></td>` : ''}
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.amount}</td>
            <td>${item.identifyNumber || '-'}</td>
            <td>${item.note || '-'}</td>
        </tr>
    `).join('');

    return `
        <h4 style="margin-top:1rem; margin-bottom:0.5rem; color:var(--primary);">${title}</h4>
        <table class="delivery-items-table">
            <thead>
                <tr>
                    ${viewStatus === 'pending' ? `<th style="width: 40px;"></th>` : ''}
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Amt</th>
                    <th>ID No.</th>
                    <th>Note</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

async function handleMarkDelivered(e, invoiceNum) {
    const btn = e.target.closest('button');
    const container = btn.closest('.invoice-details');
    const checkboxes = container.querySelectorAll('.item-check:checked');
    
    if(checkboxes.length === 0) {
        alert("Please select at least one item to mark as delivered.");
        return;
    }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    const itemsToUpdate = Array.from(checkboxes).map(cb => ({
        category: cb.getAttribute('data-category'),
        name: cb.getAttribute('data-name'),
        id: cb.getAttribute('data-id')
    }));

    try {
        const response = await fetch(`${WEB_APP_URL}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateDelivery',
                invoiceNum: invoiceNum,
                items: itemsToUpdate
            })
        });
        
        const result = await response.json();
        if(result.success) {
            loadEntries('pending'); // reload view
        } else {
            alert("Failed to update delivery status.");
        }
    } catch (error) {
        alert("Error updating status.");
    }
}


// --- Admin Page Logic ---
function initAdmin() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', () => {
        state.isAdminLoggedIn = false;
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('admin-login').classList.remove('hidden');
        document.getElementById('login-form').reset();
    });
    
    document.querySelector('.add-school-btn').addEventListener('click', () => {
        showInputModal('Add New School', [
            { id: 'new-school-name', label: 'School Name', type: 'text' }
        ], async (data) => {
            await adminCRUD('addSchool', { name: data['new-school-name'] });
            loadDashboard();
        });
    });

    document.querySelector('.add-class-btn').addEventListener('click', () => {
        if (state.schools.length === 0) {
            alert("Please add an active school first.");
            return;
        }
        
        const schoolOptions = state.schools.map(s => ({ value: s.index, text: s.name }));
        
        showInputModal('Add New Class', [
            { id: 'class-school-idx', label: 'Select School', type: 'select', options: schoolOptions },
            { id: 'new-class-name', label: 'Class Name', type: 'text' }
        ], async (data) => {
            await adminCRUD('addClass', { 
                schoolIndex: data['class-school-idx'], 
                className: data['new-class-name']
            });
            loadDashboard();
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-username').value;
    const pass = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');
    const btn = e.target.querySelector('button');
    
    errorMsg.classList.add('hidden');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch(`${WEB_APP_URL}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', user, pass })
        });
        const result = await response.json();
        
        if(result.success) {
            state.isAdminLoggedIn = true;
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            loadDashboard();
        } else {
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.textContent = "Connection error. Try again.";
        errorMsg.classList.remove('hidden');
    } finally {
        btn.innerHTML = 'Login';
    }
}

async function loadDashboard() {
    const loader = document.getElementById('admin-loader');
    const content = document.getElementById('dashboard-content-wrap');
    
    loader.classList.remove('hidden');
    content.classList.add('hidden');
    
    try {
        const response = await fetch(`${WEB_APP_URL}?action=getDashboardStats`);
        const data = await response.json();
        
        document.getElementById('stat-total-invoices').textContent = data.stats.totalInvoices;
        document.getElementById('stat-pending-items').textContent = data.stats.pendingItems;
        document.getElementById('stat-delivered-items').textContent = data.stats.deliveredItems;
        document.getElementById('stat-revenue').textContent = `₹${data.stats.revenue}`;
        
        // Cache schools in local state for dropdowns
        state.schools = data.schools;
        
        // Render Schools and Nested Classes
        const schoolList = document.getElementById('admin-schools-list');
        schoolList.innerHTML = '';
        data.schools.forEach(s => {
            const li = document.createElement('li');
            
            // Get classes for this school
            const schoolClasses = data.classes.filter(c => String(c.schoolIndex) === String(s.index));
            
            let classesHtml = '';
            if (schoolClasses.length > 0) {
                classesHtml = '<ul class="school-classes-sublist">';
                schoolClasses.forEach(c => {
                    classesHtml += `
                        <li>
                            <span>[C:${c.classIndex}] ${c.className}</span>
                            <div class="mgmt-actions">
                                <button class="outline-btn edit-btn" onclick="editClassPrompt(${c.schoolIndex}, ${c.classIndex}, '${c.className.replace(/'/g, "\\'")}')"><i class="fa-solid fa-pen"></i></button>
                                <button class="outline-btn del-btn" onclick="deleteClass(${c.schoolIndex}, ${c.classIndex})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </li>
                    `;
                });
                classesHtml += '</ul>';
            } else {
                classesHtml = '<ul class="school-classes-sublist"><li><span style="color:#6B7280; font-size:0.9em; font-style:italic;">No classes added</span></li></ul>';
            }

            li.innerHTML = `
                <div class="school-row">
                    <span><strong>[${s.index}] ${s.name}</strong></span>
                    <div class="mgmt-actions">
                        <button class="outline-btn del-btn" onclick="deleteSchool(${s.index})"><i class="fa-solid fa-trash"></i> Delete School</button>
                    </div>
                </div>
                ${classesHtml}
            `;
            schoolList.appendChild(li);
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        loader.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

window.deleteSchool = async function(index) {
    if(confirm(`Are you sure you want to delete school with index ${index}?`)) {
        await adminCRUD('deleteSchool', { index });
        loadDashboard();
    }
}

window.deleteClass = async function(schoolIndex, classIndex) {
    if(confirm(`Are you sure you want to delete this class?`)) {
        await adminCRUD('deleteClass', { schoolIndex, classIndex });
        loadDashboard();
    }
}

window.editClassPrompt = function(schoolIndex, classIndex, currentName) {
    showInputModal('Edit Class Name', [
        { id: 'edit-class-name', label: 'Class Name', type: 'text', value: currentName }
    ], async (data) => {
        await adminCRUD('editClass', { schoolIndex: schoolIndex, classIndex: classIndex, className: data['edit-class-name'] });
        loadDashboard();
    });
};

async function adminCRUD(action, data) {
    try {
        const response = await fetch(`${WEB_APP_URL}`, {
            method: 'POST',
            body: JSON.stringify({ action: action, ...data })
        });
        const res = await response.json();
        if(!res.success) alert("Operation failed");
    } catch(err) {
        alert("Network error");
    }
}

// --- Utils ---
function showSuccessModal(msg) {
    const modal = document.getElementById('success-modal');
    document.getElementById('success-msg').textContent = msg;
    modal.classList.remove('hidden');
    
    modal.querySelector('.modal-close-btn').onclick = () => {
        modal.classList.add('hidden');
    };
}

function showError(msg) {
    alert(msg);
}

function showInputModal(title, fields, onSubmitCallback) {
    const modal = document.getElementById('input-modal');
    document.getElementById('input-modal-title').textContent = title;
    
    const fieldsContainer = document.getElementById('input-modal-fields');
    fieldsContainer.innerHTML = '';
    
    fields.forEach(f => {
        let inputHTML = '';
        if (f.type === 'select') {
            const optionsHTML = f.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('');
            inputHTML = `<select id="${f.id}" class="modal-select" required>${optionsHTML}</select>`;
        } else {
            inputHTML = `<input type="${f.type}" id="${f.id}" value="${f.value || ''}" required>`;
        }
        
        fieldsContainer.innerHTML += `
            <div class="input-group" style="margin-bottom: 1rem; text-align: left;">
                <label for="${f.id}">${f.label}</label>
                ${inputHTML}
            </div>
        `;
    });
    
    modal.classList.remove('hidden');
    
    modal.querySelector('.modal-cancel-btn').onclick = () => {
        modal.classList.add('hidden');
    };
    
    const form = document.getElementById('input-modal-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const data = {};
        fields.forEach(f => {
            data[f.id] = document.getElementById(f.id).value;
        });
        modal.classList.add('hidden');
        onSubmitCallback(data);
    };
}
