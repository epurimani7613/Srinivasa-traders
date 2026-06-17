/* ═══════════════════════════════════════════════════════════════════════════
   MANIKANTA KIRANAM — app.js
   Stage 4: Frontend Logic & Billing Operations
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const API_BASE = 'https://manikanta-billing.onrender.com';

/* ── State ───────────────────────────────────────────────────────────────── */
let products  = [];   // master inventory (synced with backend)
let billItems = [];   // { product, qty }  — live bill rows

/* ══════════════════════════════════════════════════════════════════════════
   DOM REFERENCES
   ══════════════════════════════════════════════════════════════════════════ */
const elCurrentDate    = document.getElementById('current-date');

// Product management
const elNewId          = document.getElementById('new-product-id');
const elNewName        = document.getElementById('new-product-name');
const elNewPrice       = document.getElementById('new-product-price');
const elBtnAddProduct  = document.getElementById('btn-add-product');
const elProductMsg     = document.getElementById('product-msg');
const elInventoryList  = document.getElementById('inventory-list');

// Billing counter
const elBillingEntry   = document.getElementById('billing-entry');
const elBtnAddToBill   = document.getElementById('btn-add-to-bill');
const elBillingMsg     = document.getElementById('billing-msg');

// Bill table
const elBillTbody      = document.getElementById('bill-tbody');
const elBillEmptyState = document.getElementById('bill-empty-state');
const elBtnClearBill   = document.getElementById('btn-clear-bill');

// Summary
const elTotalItems     = document.getElementById('total-items');
const elGrandTotal     = document.getElementById('grand-total');

// Print
const elBtnPrint       = document.getElementById('btn-print-bill');

// Print receipt area
const elReceiptDate    = document.getElementById('receipt-date');
const elReceiptTbody   = document.getElementById('receipt-tbody');
const elReceiptItems   = document.getElementById('receipt-items');
const elReceiptGrand   = document.getElementById('receipt-grand-total');

/* ══════════════════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

/** Format a number as Indian Rupee string */
function formatINR(amount) {
  return '₹ ' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** Show a temporary feedback message inside an element */
function showMsg(el, text, type = 'success', durationMs = 3000) {
  el.textContent  = text;
  el.className    = `inline-msg ${type}`;
  if (durationMs > 0) {
    setTimeout(() => { el.textContent = ''; el.className = 'inline-msg'; }, durationMs);
  }
}

/** Set today's date string in a given element */
function stampDate(el) {
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   1. LOAD PRODUCTS ON PAGE LOAD
   ══════════════════════════════════════════════════════════════════════════ */

async function loadProducts() {
  try {
    const res  = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    products = await res.json();
    renderInventoryList();
  } catch (err) {
    console.error('Failed to load products:', err);
    elInventoryList.innerHTML =
      '<li class="inventory-empty" style="color:#C0392B">⚠ Could not load inventory. Is the server running?</li>';
  }
}

/* ── Render the left-panel inventory list ── */
function renderInventoryList() {
  if (!products.length) {
    elInventoryList.innerHTML = '<li class="inventory-empty">No products yet. Add one above.</li>';
    return;
  }
  elInventoryList.innerHTML = products.map(p => `
    <li class="inventory-item">
      <span class="inv-id">${escHtml(p.id)}</span>
      <span class="inv-name">${escHtml(p.name)}</span>
      <span class="inv-price">${formatINR(p.price)}</span>
    </li>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════════════════
   2. ADD PRODUCT TO INVENTORY (POST /api/products)
   ══════════════════════════════════════════════════════════════════════════ */

async function handleAddProduct() {
  const id    = elNewId.value.trim();
  const name  = elNewName.value.trim();
  const price = parseFloat(elNewPrice.value);

  // Client-side validation
  if (!id)                    { showMsg(elProductMsg, '⚠ Product Number is required.', 'error'); elNewId.focus(); return; }
  if (!name)                  { showMsg(elProductMsg, '⚠ Product Name is required.', 'error'); elNewName.focus(); return; }
  if (isNaN(price) || price < 0) { showMsg(elProductMsg, '⚠ Enter a valid price (≥ 0).', 'error'); elNewPrice.focus(); return; }

  elBtnAddProduct.disabled = true;
  elBtnAddProduct.textContent = 'Saving…';

  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, name, price })
    });

    const data = await res.json();

    if (!res.ok) {
      showMsg(elProductMsg, `⚠ ${data.error || 'Failed to add product.'}`, 'error');
      return;
    }

    // Update local array and re-render
    products.push(data.product);
    renderInventoryList();

    // Clear form
    elNewId.value = elNewName.value = elNewPrice.value = '';
    showMsg(elProductMsg, `✔ "${data.product.name}" added to inventory.`, 'success');
    elNewId.focus();

  } catch (err) {
    console.error('POST /api/products failed:', err);
    showMsg(elProductMsg, '⚠ Network error. Could not reach server.', 'error');
  } finally {
    elBtnAddProduct.disabled = false;
    elBtnAddProduct.innerHTML = '<span class="btn-icon">＋</span> Add Product to Inventory';
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   3. BILLING INPUT LOGIC
   ══════════════════════════════════════════════════════════════════════════ */

function handleBillingEntry() {
  const query = elBillingEntry.value.trim();
  if (!query) return;

  // Find product (case-insensitive ID match)
  const product = products.find(
    p => p.id.toLowerCase() === query.toLowerCase()
  );

  if (!product) {
    showMsg(elBillingMsg, `⚠ Product "${query}" not found in inventory.`, 'error');
    elBillingEntry.select();
    return;
  }

  // Check if already on the bill → increment qty instead of adding new row
  const existing = billItems.find(item => item.product.id === product.id);

  if (existing) {
    existing.qty += 1;
    showMsg(elBillingMsg, `✔ Qty for "${product.name}" increased to ${existing.qty}.`, 'success');
  } else {
    billItems.push({ product, qty: 1 });
    showMsg(elBillingMsg, `✔ "${product.name}" added to bill.`, 'success');
  }

  renderBillTable();
  elBillingEntry.value = '';
  elBillingEntry.focus();
}

/* ══════════════════════════════════════════════════════════════════════════
   4. LIVE BILLING TABLE RENDER + CALCULATIONS
   ══════════════════════════════════════════════════════════════════════════ */

function renderBillTable() {
  if (!billItems.length) {
    elBillTbody.innerHTML    = '';
    elBillEmptyState.style.display = 'flex';
    updateSummary();
    return;
  }

  elBillEmptyState.style.display = 'none';

  elBillTbody.innerHTML = billItems.map((item, index) => {
    const rowTotal = item.product.price * item.qty;
    return `
      <tr data-index="${index}">
        <td class="col-sl">${index + 1}</td>
        <td class="col-pid">${escHtml(item.product.id)}</td>
        <td class="col-name">${escHtml(item.product.name)}</td>
        <td class="col-price">${formatINR(item.product.price)}</td>
        <td class="col-qty">
          <input
            class="qty-input"
            type="number"
            min="1"
            value="${item.qty}"
            data-index="${index}"
            aria-label="Quantity for ${escHtml(item.product.name)}"
          />
        </td>
        <td class="col-total total-cell" id="row-total-${index}">${formatINR(rowTotal)}</td>
        <td class="col-action">
          <button
            class="btn btn-danger"
            data-index="${index}"
            aria-label="Remove ${escHtml(item.product.name)} from bill"
          >✕ Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach qty change listeners
  elBillTbody.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', handleQtyChange);
    input.addEventListener('change', handleQtyChange); // fires on blur too
  });

  // Attach delete button listeners
  elBillTbody.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', handleDeleteRow);
  });

  updateSummary();
}

/** Handle quantity edit — update row total and grand total instantly */
function handleQtyChange(e) {
  const index  = parseInt(e.target.dataset.index, 10);
  let   newQty = parseInt(e.target.value, 10);

  if (isNaN(newQty) || newQty < 1) {
    newQty = 1;
    e.target.value = 1;
  }

  billItems[index].qty = newQty;

  // Update just this row's total cell — no full re-render needed
  const rowTotal      = billItems[index].product.price * newQty;
  const totalCell     = document.getElementById(`row-total-${index}`);
  if (totalCell) totalCell.textContent = formatINR(rowTotal);

  updateSummary();
}

/** Delete a row from the bill */
function handleDeleteRow(e) {
  const index = parseInt(e.target.dataset.index, 10);
  const name  = billItems[index]?.product?.name ?? 'Item';
  billItems.splice(index, 1);
  renderBillTable(); // full re-render to fix serial numbers
  showMsg(elBillingMsg, `✔ "${name}" removed from bill.`, 'success');
}

/** Recompute and display grand total + item count */
function updateSummary() {
  const totalQty    = billItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal  = billItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  elTotalItems.textContent = totalQty;
  elGrandTotal.textContent = formatINR(grandTotal);
}

/* ══════════════════════════════════════════════════════════════════════════
   5. PRINT BILL
   ══════════════════════════════════════════════════════════════════════════ */

function handlePrint() {
  if (!billItems.length) {
    showMsg(elBillingMsg, '⚠ The bill is empty. Add items before printing.', 'error');
    return;
  }

  // Populate receipt area
  stampDate(elReceiptDate);

  elReceiptTbody.innerHTML = billItems.map((item, index) => {
    const rowTotal = item.product.price * item.qty;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escHtml(item.product.id)}</td>
        <td>${escHtml(item.product.name)}</td>
        <td style="text-align:right">${formatINR(item.product.price)}</td>
        <td style="text-align:right">${item.qty}</td>
        <td style="text-align:right">${formatINR(rowTotal)}</td>
      </tr>
    `;
  }).join('');

  const totalQty   = billItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = billItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  elReceiptItems.textContent    = totalQty;
  elReceiptGrand.textContent    = formatINR(grandTotal);

  window.print();
}

/* ══════════════════════════════════════════════════════════════════════════
   CLEAR ENTIRE BILL
   ══════════════════════════════════════════════════════════════════════════ */
function handleClearBill() {
  if (!billItems.length) return;
  if (!confirm('Clear the entire bill? This cannot be undone.')) return;
  billItems = [];
  renderBillTable();
  showMsg(elBillingMsg, '✔ Bill cleared.', 'success');
}

/* ══════════════════════════════════════════════════════════════════════════
   XSS PROTECTION — escape user-supplied strings before injecting into HTML
   ══════════════════════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ══════════════════════════════════════════════════════════════════════════
   EVENT LISTENERS
   ══════════════════════════════════════════════════════════════════════════ */

// Add product button
elBtnAddProduct.addEventListener('click', handleAddProduct);

// Allow Enter key in any product-form input
[elNewId, elNewName, elNewPrice].forEach(el => {
  el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAddProduct(); });
});

// Billing counter — Enter key OR button click
elBillingEntry.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleBillingEntry();
});
elBtnAddToBill.addEventListener('click', handleBillingEntry);

// Clear bill
elBtnClearBill.addEventListener('click', handleClearBill);

// Print bill
elBtnPrint.addEventListener('click', handlePrint);

/* ══════════════════════════════════════════════════════════════════════════
   INITIALISE
   ══════════════════════════════════════════════════════════════════════════ */
(function init() {
  stampDate(elCurrentDate);
  loadProducts();
  renderBillTable();    // renders empty state on first load
})();