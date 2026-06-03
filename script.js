// =================================================================
// SHYAM BOOK DEPOT — POS Frontend Application
// =================================================================

// ---- MOCK PRODUCT CATALOGS ----
const booksCatalog = [
  { itemId: 'BK-1001', name: 'English Textbook', mrp: 250, sellingPrice: 230 },
  { itemId: 'BK-1002', name: 'Mathematics Vol 1', mrp: 300, sellingPrice: 275 },
  { itemId: 'BK-1003', name: 'Science Workbook', mrp: 220, sellingPrice: 200 },
  { itemId: 'BK-1004', name: 'Hindi Vyakaran', mrp: 180, sellingPrice: 160 },
  { itemId: 'BK-1005', name: 'Social Studies', mrp: 260, sellingPrice: 240 },
  { itemId: 'BK-1006', name: 'Computer Science', mrp: 320, sellingPrice: 290 },
  { itemId: 'BK-1007', name: 'Sanskrit Reader', mrp: 190, sellingPrice: 170 },
  { itemId: 'BK-1008', name: 'Art & Craft', mrp: 150, sellingPrice: 135 },
  { itemId: 'BK-1009', name: 'General Knowledge', mrp: 130, sellingPrice: 115 },
  { itemId: 'BK-1010', name: 'Moral Science', mrp: 140, sellingPrice: 125 },
];

const notebooksCatalog = [
  { itemId: 'NB-2001', name: 'Single Line (100pg)', mrp: 50, sellingPrice: 42 },
  { itemId: 'NB-2002', name: 'Four Line (100pg)', mrp: 45, sellingPrice: 38 },
  { itemId: 'NB-2003', name: 'Square Box (100pg)', mrp: 50, sellingPrice: 42 },
  { itemId: 'NB-2004', name: 'Double Line (100pg)', mrp: 45, sellingPrice: 38 },
  { itemId: 'NB-2005', name: 'Single Line (200pg)', mrp: 80, sellingPrice: 68 },
  { itemId: 'NB-2006', name: 'Plain Drawing (100pg)', mrp: 55, sellingPrice: 48 },
  { itemId: 'NB-2007', name: 'Practical File', mrp: 70, sellingPrice: 60 },
  { itemId: 'NB-2008', name: 'Interleaf (200pg)', mrp: 90, sellingPrice: 78 },
  { itemId: 'NB-2009', name: 'Graph Notebook', mrp: 60, sellingPrice: 52 },
  { itemId: 'NB-2010', name: 'Lab Manual', mrp: 75, sellingPrice: 65 },
];

// ---- SCHOOL & CLASS MOCK DATA ----
const schools = [
  { id: 1, name: 'Greenwood High', icon: 'ph-buildings' },
  { id: 2, name: "St. Xavier's", icon: 'ph-student' },
  { id: 3, name: 'Delhi Public School', icon: 'ph-books' },
  { id: 4, name: 'National Academy', icon: 'ph-backpack' },
];

const classes = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Class ${i + 1}`,
}));

// ---- SEEDED DUMMY ENTRIES (pre-existing) ----
const seededEntries = [
  { id: 'ENT-1001', school: 'Greenwood High', class: 'Class 5', mobile: '+91 9876543210', status: 'completed', date: '2023-10-25', time: '10:30' },
  { id: 'ENT-1002', school: "St. Xavier's", class: 'Class 8', mobile: '+91 9123456780', status: 'pending', date: '2023-10-26', time: '14:15' },
  { id: 'ENT-1003', school: 'Delhi Public School', class: 'Class 12', mobile: '+91 9988776655', status: 'partial', date: '2023-10-26', time: '16:45' },
  { id: 'ENT-1004', school: 'National Academy', class: 'Class 1', mobile: '+91 9876500000', status: 'return', date: '2023-10-27', time: '09:00' },
];

// ---- ENTRIES STORAGE (combines seeded + localStorage) ----
function loadEntries() {
  const stored = localStorage.getItem('sbd_entries');
  const userEntries = stored ? JSON.parse(stored) : [];
  return [...seededEntries, ...userEntries];
}

function saveEntry(entry) {
  const stored = localStorage.getItem('sbd_entries');
  const userEntries = stored ? JSON.parse(stored) : [];
  userEntries.push(entry);
  localStorage.setItem('sbd_entries', JSON.stringify(userEntries));
}

function generateEntryId() {
  const entries = loadEntries();
  return `ENT-${1001 + entries.length}`;
}

// ---- HELPERS ----
function createEmptyStudent(index) {
  return {
    label: `Student ${index}`,
    books: [],
    notebooks: [],
    other: [],
  };
}

let _uid = 0;
function uid() { return ++_uid; }

// ---- APP STATE ----
let state = {
  view: 'home',
  homeStep: 'school',
  selectedSchool: null,
  selectedClass: null,

  // Invoice state
  students: [createEmptyStudent(1)],
  activeStudentIdx: 0,

  // Entries tab
  entriesTab: 'all',
  entriesSearch: '',
};

// ---- DOM ----
const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-link');

// ---- INIT ----
function init() {
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.getAttribute('data-view');
      navLinks.forEach(l => l.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.view = view;
      if (view === 'home') {
        state.homeStep = 'school';
        resetInvoice();
      }
      render();
    });
  });
  render();
}

function resetInvoice() {
  state.students = [createEmptyStudent(1)];
  state.activeStudentIdx = 0;
  state.selectedSchool = null;
  state.selectedClass = null;
}

function render() {
  mainContent.innerHTML = '';
  if (state.view === 'home') renderHome();
  else if (state.view === 'entries') renderEntries();
  else if (state.view === 'admin') renderAdmin();
}

// ---- TOAST ----
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="ph ph-check-circle"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutDown 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}

// =================================================================
// HOME MODULE
// =================================================================
function renderHome() {
  const c = document.createElement('div');
  c.className = 'view-section active';

  switch (state.homeStep) {
    case 'school': renderSchoolSelection(c); break;
    case 'class': renderClassSelection(c); break;
    case 'invoice': renderInvoice(c); break;
    case 'details': renderDetails(c); break;
  }
  mainContent.appendChild(c);
}

// ---- School Selection ----
function renderSchoolSelection(c) {
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Select School</h1>
      <p class="page-subtitle">Choose a school to begin the transaction</p>
    </div>
    <div class="grid-cards" id="school-grid"></div>
  `;
  setTimeout(() => {
    const grid = document.getElementById('school-grid');
    schools.forEach(school => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-icon"><i class="ph ${school.icon}"></i></div>
        <div class="card-title">${school.name}</div>
      `;
      card.addEventListener('click', () => {
        state.selectedSchool = school;
        state.homeStep = 'class';
        render();
      });
      grid.appendChild(card);
    });
  }, 0);
}

// ---- Class Selection ----
function renderClassSelection(c) {
  c.innerHTML = `
    <div class="page-header">
      <button class="btn btn-secondary" id="btn-back-school" style="margin-bottom:1rem;">
        <i class="ph ph-arrow-left"></i> Back to Schools
      </button>
      <h1 class="page-title">Select Class</h1>
      <p class="page-subtitle">For ${state.selectedSchool.name}</p>
    </div>
    <div class="grid-cards" id="class-grid"></div>
  `;
  setTimeout(() => {
    document.getElementById('btn-back-school').addEventListener('click', () => {
      state.homeStep = 'school';
      render();
    });
    const grid = document.getElementById('class-grid');
    classes.forEach(cls => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.alignItems = 'center';
      card.style.textAlign = 'center';
      card.innerHTML = `<div class="card-title" style="font-size:1.5rem;margin-top:1rem;">${cls.name}</div>`;
      card.addEventListener('click', () => {
        state.selectedClass = cls;
        state.homeStep = 'invoice';
        render();
      });
      grid.appendChild(card);
    });
  }, 0);
}

// =================================================================
// INVOICE VIEW — The core feature
// =================================================================
function renderInvoice(c) {
  const student = state.students[state.activeStudentIdx];

  // Student tabs
  let studentTabsHtml = state.students.map((s, i) => `
    <button class="student-tab ${i === state.activeStudentIdx ? 'active' : ''}" data-stidx="${i}">
      <span class="student-tab-label"><i class="ph ph-user"></i> ${s.label}</span>
    </button>
  `).join('');

  c.innerHTML = `
    <div class="page-header">
      <button class="btn btn-secondary" id="btn-back-class" style="margin-bottom:1rem;">
        <i class="ph ph-arrow-left"></i> Back to Classes
      </button>
      <h1 class="page-title">Invoice — ${state.selectedSchool.name}</h1>
      <p class="page-subtitle">${state.selectedClass.name} &bull; ${state.students.length} student(s)</p>
    </div>

    <div class="student-tabs" id="student-tabs">
      ${studentTabsHtml}
    </div>

    <div class="invoice-columns" id="invoice-columns">
      <div class="invoice-section" id="section-books">
        <div class="invoice-section-header">
          <div class="invoice-section-title"><i class="ph ph-book-open-text"></i> Books</div>
          <button class="btn-icon" id="add-book" title="Add Book"><i class="ph ph-plus"></i></button>
        </div>
        <div class="product-list" id="list-books"></div>
      </div>
      <div class="invoice-section" id="section-notebooks">
        <div class="invoice-section-header">
          <div class="invoice-section-title"><i class="ph ph-notebook"></i> Notebooks</div>
          <button class="btn-icon" id="add-notebook" title="Add Notebook"><i class="ph ph-plus"></i></button>
        </div>
        <div class="product-list" id="list-notebooks"></div>
      </div>
      <div class="invoice-section" id="section-other">
        <div class="invoice-section-header">
          <div class="invoice-section-title"><i class="ph ph-package"></i> Other</div>
          <button class="btn-icon" id="add-other" title="Add Item"><i class="ph ph-plus"></i></button>
        </div>
        <div class="product-list" id="list-other"></div>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn btn-primary" id="btn-continue"><i class="ph ph-arrow-right"></i> Continue</button>
      <button class="btn btn-warning" id="btn-duplicate"><i class="ph ph-copy"></i> Duplicate</button>
      <button class="btn btn-success" id="btn-new-student"><i class="ph ph-user-plus"></i> New Student</button>
    </div>
  `;

  setTimeout(() => bindInvoiceEvents(student), 0);
}

function bindInvoiceEvents(student) {
  // Back button
  document.getElementById('btn-back-class').addEventListener('click', () => {
    state.homeStep = 'class';
    render();
  });

  // Student tab switching
  document.querySelectorAll('.student-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeStudentIdx = parseInt(tab.dataset.stidx);
      render();
    });
  });

  // Render existing items
  renderItemList('books', student.books);
  renderItemList('notebooks', student.notebooks);
  renderItemList('other', student.other);

  // Add buttons
  document.getElementById('add-book').addEventListener('click', () => {
    student.books.push({ _uid: uid(), catalogIdx: '', name: '', itemId: '', mrp: '', sellingPrice: '', notes: '' });
    renderItemList('books', student.books);
  });

  document.getElementById('add-notebook').addEventListener('click', () => {
    student.notebooks.push({ _uid: uid(), catalogIdx: '', name: '', itemId: '', mrp: '', sellingPrice: '', notes: '' });
    renderItemList('notebooks', student.notebooks);
  });

  document.getElementById('add-other').addEventListener('click', () => {
    student.other.push({ _uid: uid(), name: '', itemId: '', mrp: '', sellingPrice: '', notes: '' });
    renderItemList('other', student.other);
  });

  // Action buttons
  document.getElementById('btn-continue').addEventListener('click', () => {
    state.homeStep = 'details';
    render();
  });

  document.getElementById('btn-duplicate').addEventListener('click', handleDuplicate);
  document.getElementById('btn-new-student').addEventListener('click', handleNewStudent);
}

// ---- Render Item List ----
function renderItemList(type, items) {
  const list = document.getElementById(`list-${type}`);
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = `<div class="product-list-empty"><i class="ph ph-plus-circle"></i>Click + to add items</div>`;
    return;
  }

  list.innerHTML = '';
  items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    if (type === 'books' || type === 'notebooks') {
      const catalog = type === 'books' ? booksCatalog : notebooksCatalog;
      const options = catalog.map((c, ci) =>
        `<option value="${ci}" ${item.catalogIdx === ci.toString() ? 'selected' : ''}>${c.name}</option>`
      ).join('');

      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-num">Item #${idx + 1}</span>
          <button class="delete-item-btn" data-type="${type}" data-idx="${idx}" title="Remove"><i class="ph ph-trash"></i></button>
        </div>
        <select class="item-select" data-type="${type}" data-idx="${idx}">
          <option value="">— Select ${type === 'books' ? 'Book' : 'Notebook'} —</option>
          ${options}
        </select>
        <div class="item-row-fields">
          <div><span class="item-field-label">Item ID</span><input value="${item.itemId}" readonly></div>
          <div><span class="item-field-label">MRP</span><input value="${item.mrp ? '₹' + item.mrp : ''}" readonly></div>
          <div><span class="item-field-label">Selling Price</span><input value="${item.sellingPrice ? '₹' + item.sellingPrice : ''}" readonly></div>
          <div class="notes-field"><span class="item-field-label">Notes</span><input class="item-notes" data-type="${type}" data-idx="${idx}" value="${item.notes || ''}" placeholder="Add notes…"></div>
        </div>
      `;
    } else {
      // Other — fully manual
      row.innerHTML = `
        <div class="item-row-header">
          <span class="item-row-num">Item #${idx + 1}</span>
          <button class="delete-item-btn" data-type="${type}" data-idx="${idx}" title="Remove"><i class="ph ph-trash"></i></button>
        </div>
        <div class="item-row-fields">
          <div style="grid-column:1/-1"><span class="item-field-label">Item Name</span><input class="manual-field" data-type="${type}" data-idx="${idx}" data-field="name" value="${item.name}" placeholder="Enter item name"></div>
          <div><span class="item-field-label">Identity No.</span><input class="manual-field" data-type="${type}" data-idx="${idx}" data-field="itemId" value="${item.itemId}" placeholder="e.g. OT-3001"></div>
          <div><span class="item-field-label">MRP</span><input class="manual-field" data-type="${type}" data-idx="${idx}" data-field="mrp" value="${item.mrp}" placeholder="₹" type="number"></div>
          <div><span class="item-field-label">Selling Price</span><input class="manual-field" data-type="${type}" data-idx="${idx}" data-field="sellingPrice" value="${item.sellingPrice}" placeholder="₹" type="number"></div>
          <div class="notes-field"><span class="item-field-label">Notes</span><input class="item-notes" data-type="${type}" data-idx="${idx}" value="${item.notes || ''}" placeholder="Add notes…"></div>
        </div>
      `;
    }

    list.appendChild(row);
  });

  // Bind events for this list
  bindItemListEvents(type, items, list);
}

function bindItemListEvents(type, items, list) {
  // Dropdown select (Books / Notebooks)
  list.querySelectorAll('.item-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const catalog = type === 'books' ? booksCatalog : notebooksCatalog;
      const val = e.target.value;
      if (val === '') {
        items[idx] = { ...items[idx], catalogIdx: '', name: '', itemId: '', mrp: '', sellingPrice: '' };
      } else {
        const ci = parseInt(val);
        const product = catalog[ci];
        items[idx] = { ...items[idx], catalogIdx: val, name: product.name, itemId: product.itemId, mrp: product.mrp, sellingPrice: product.sellingPrice };
      }
      renderItemList(type, items);
    });
  });

  // Notes
  list.querySelectorAll('.item-notes').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      items[idx].notes = e.target.value;
    });
  });

  // Manual fields (Other section)
  list.querySelectorAll('.manual-field').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      items[idx][field] = e.target.value;
    });
  });

  // Delete
  list.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      const t = e.currentTarget.dataset.type;
      const student = state.students[state.activeStudentIdx];
      student[t].splice(idx, 1);
      renderItemList(t, student[t]);
    });
  });
}

// ---- Duplicate ----
function handleDuplicate() {
  const currentStudent = state.students[state.activeStudentIdx];
  const clone = {
    label: `Student ${state.students.length + 1}`,
    books: currentStudent.books.map(b => ({ ...b, _uid: uid() })),
    notebooks: currentStudent.notebooks.map(n => ({ ...n, _uid: uid() })),
    other: currentStudent.other.map(o => ({ ...o, _uid: uid() })),
  };
  state.students.push(clone);
  state.activeStudentIdx = state.students.length - 1;
  showToast(`Duplicated as ${clone.label}`);
  render();
}

// ---- New Student ----
function handleNewStudent() {
  const nextIdx = state.students.length + 1;
  state.students.push(createEmptyStudent(nextIdx));
  state.activeStudentIdx = state.students.length - 1;
  showToast(`Started ${state.students[state.activeStudentIdx].label}`);
  render();
}

// =================================================================
// DETAILS / CUSTOMER VIEW
// =================================================================
function renderDetails(c) {
  const now = new Date();
  const dateVal = now.toISOString().split('T')[0];
  const timeVal = now.toTimeString().slice(0, 5);

  // Build summary
  let totalItems = 0;
  state.students.forEach(s => {
    totalItems += s.books.length + s.notebooks.length + s.other.length;
  });

  let summaryHtml = state.students.map(s => {
    const cnt = s.books.length + s.notebooks.length + s.other.length;
    return `<div class="invoice-summary-item"><span>${s.label}</span><span>${cnt} item(s)</span></div>`;
  }).join('');

  c.innerHTML = `
    <div class="page-header">
      <button class="btn btn-secondary" id="btn-back-invoice" style="margin-bottom:1rem;">
        <i class="ph ph-arrow-left"></i> Back to Invoice
      </button>
      <h1 class="page-title">Customer Details</h1>
      <p class="page-subtitle">${state.selectedSchool.name} — ${state.selectedClass.name}</p>
    </div>

    <div class="card details-card">
      <div class="invoice-summary">
        <h4><i class="ph ph-list-checks"></i> Invoice Summary</h4>
        <div class="invoice-summary-item" style="font-weight:600;border-bottom:1px solid var(--color-border);padding-bottom:0.5rem;margin-bottom:0.25rem;">
          <span>${state.students.length} Student(s)</span>
          <span>${totalItems} Total Items</span>
        </div>
        ${summaryHtml}
      </div>

      <div class="form-group">
        <label class="form-label">Mobile Number</label>
        <input type="tel" class="form-control" id="inp-mobile" placeholder="+91 00000 00000">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group">
          <label class="form-label">Date</label>
          <input type="date" class="form-control" id="inp-date" value="${dateVal}">
        </div>
        <div class="form-group">
          <label class="form-label">Time</label>
          <input type="time" class="form-control" id="inp-time" value="${timeVal}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Message / Notes</label>
        <textarea class="form-control" id="inp-message" rows="3" placeholder="Any special instructions…"></textarea>
      </div>
      <button class="btn btn-primary" id="btn-complete" style="width:100%;">
        Complete Transaction <i class="ph ph-check-circle"></i>
      </button>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('btn-back-invoice').addEventListener('click', () => {
      state.homeStep = 'invoice';
      render();
    });

    document.getElementById('btn-complete').addEventListener('click', handleCompleteTransaction);
  }, 0);
}

function handleCompleteTransaction() {
  const mobile = document.getElementById('inp-mobile').value.trim() || '+91 0000000000';
  const date = document.getElementById('inp-date').value;
  const time = document.getElementById('inp-time').value;
  const message = document.getElementById('inp-message').value;

  const entry = {
    id: generateEntryId(),
    school: state.selectedSchool.name,
    class: state.selectedClass.name,
    mobile: mobile,
    status: 'pending',
    date: date,
    time: time,
    message: message,
    students: JSON.parse(JSON.stringify(state.students)),
  };

  saveEntry(entry);
  showToast(`Transaction ${entry.id} saved to Pending!`);

  // Reset and go home
  resetInvoice();
  state.homeStep = 'school';
  render();
}

// =================================================================
// ENTRIES MODULE
// =================================================================
function renderEntries() {
  const allEntries = loadEntries();
  const tabs = ['all', 'pending', 'partial', 'completed', 'return'];
  const tabLabels = { all: 'All Entries', pending: 'Pending', partial: 'Partial', completed: 'Completed', return: 'Return' };

  // Filter by tab
  let filtered = state.entriesTab === 'all'
    ? allEntries
    : allEntries.filter(e => e.status === state.entriesTab);

  // Filter by search
  const search = state.entriesSearch.toLowerCase();
  if (search) {
    filtered = filtered.filter(e =>
      e.id.toLowerCase().includes(search) ||
      e.mobile.toLowerCase().includes(search) ||
      e.school.toLowerCase().includes(search)
    );
  }

  // Tab counts
  const counts = {};
  tabs.forEach(t => {
    counts[t] = t === 'all' ? allEntries.length : allEntries.filter(e => e.status === t).length;
  });

  const c = document.createElement('div');
  c.className = 'view-section active';

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Entries Management</h1>
      <p class="page-subtitle">View and manage previous invoices</p>
    </div>

    <div class="filter-bar">
      <input type="text" class="form-control search-input" id="entries-search" placeholder="Search by Entry ID, Mobile, or School…" value="${state.entriesSearch}">
      <button class="btn btn-secondary"><i class="ph ph-funnel"></i> Filter</button>
    </div>

    <div class="tabs-container" id="entries-tabs">
      ${tabs.map(t => `
        <div class="tab ${t === state.entriesTab ? 'active' : ''}" data-tab="${t}">
          ${tabLabels[t]}<span class="tab-count">${counts[t]}</span>
        </div>
      `).join('')}
    </div>

    <div class="entries-table-wrapper">
      <table class="entries-table">
        <thead>
          <tr>
            <th>Entry ID</th>
            <th>School Name</th>
            <th>Class</th>
            <th>Mobile</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="entries-tbody">
          ${filtered.length === 0
            ? `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--color-text-muted);">No entries found</td></tr>`
            : filtered.map(entry => `
            <tr>
              <td><strong>${entry.id}</strong></td>
              <td>${entry.school}</td>
              <td>${entry.class}</td>
              <td>${entry.mobile}</td>
              <td>${entry.date}</td>
              <td><span class="status-badge status-${entry.status}">${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</span></td>
              <td>
                <button class="btn-icon" style="background:transparent;color:var(--color-primary);" title="View Details"><i class="ph ph-eye"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  mainContent.appendChild(c);

  // Events
  setTimeout(() => {
    document.querySelectorAll('#entries-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.entriesTab = tab.dataset.tab;
        render();
      });
    });

    document.getElementById('entries-search').addEventListener('input', (e) => {
      state.entriesSearch = e.target.value;
      render();
    });
  }, 0);
}

// =================================================================
// ADMIN MODULE
// =================================================================
function renderAdmin() {
  const c = document.createElement('div');
  c.className = 'view-section active admin-login-wrapper';

  c.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <i class="ph ph-user-circle login-icon"></i>
        <h2 class="page-title">Admin Access</h2>
        <p class="page-subtitle">Login to manage store settings</p>
      </div>

      <div class="form-group">
        <label class="form-label">Username</label>
        <div style="position:relative;">
          <i class="ph ph-user" style="position:absolute;left:1rem;top:1rem;color:var(--color-text-muted);"></i>
          <input type="text" class="form-control" placeholder="Enter admin username" style="padding-left:2.5rem;">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Password</label>
        <div style="position:relative;">
          <i class="ph ph-lock" style="position:absolute;left:1rem;top:1rem;color:var(--color-text-muted);"></i>
          <input type="password" class="form-control" placeholder="Enter password" style="padding-left:2.5rem;">
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;color:var(--color-text-muted);cursor:pointer;">
          <input type="checkbox"> Remember me
        </label>
        <a href="#" style="font-size:0.875rem;color:var(--color-primary);text-decoration:none;font-weight:500;">Forgot Password?</a>
      </div>

      <button class="btn btn-primary" style="width:100%;margin-bottom:1.5rem;">Login <i class="ph ph-sign-in"></i></button>

      <div style="border-top:1px dashed var(--color-border);padding-top:1.5rem;font-size:0.875rem;color:var(--color-text-muted);text-align:center;">
        <strong>Future Scope:</strong>
        <p style="margin-top:0.5rem;">School, Class, Product & User Management, Reports & Analytics.</p>
      </div>
    </div>
  `;
  mainContent.appendChild(c);
}

// ---- Start ----
init();
