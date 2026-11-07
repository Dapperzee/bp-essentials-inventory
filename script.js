/**
 * BP essentials — Nail Beauty Inventory Tracker
 * Main Application Logic (Vanilla JavaScript)
 *
 * Designed for BP essentials nail beauty products and salon supplies to monitor stock levels,
 * calculate inventory valuation, and manage restocking.
 */

// =============================================================================
// 1. STORAGE KEYS & INITIAL DEMO DATA
// =============================================================================

const STORAGE_KEYS = {
  PRODUCTS: 'bp_essentials_products_data',
  ACTIVITIES: 'bp_essentials_activities_data'
};

/**
 * Curated nail beauty product inventory for BP essentials.
 * Seeded automatically on initial load if localStorage is empty.
 */
const SAMPLE_PRODUCTS = [
  {
    id: 'prod_gel_velvet_rose',
    name: 'UV/LED Gel Polish — Velvet Rose (15ml)',
    sku: 'GEL-ROS-101',
    category: 'Gel Polish',
    quantity: 48,
    unitCost: 6.50,
    lowStockThreshold: 15,
    dateAdded: '2026-10-12'
  },
  {
    id: 'prod_rubber_base',
    name: 'High-Adhesion Rubber Base Coat (15ml)',
    sku: 'GEL-BAS-102',
    category: 'Gel Polish',
    quantity: 34,
    unitCost: 7.20,
    lowStockThreshold: 12,
    dateAdded: '2026-10-14'
  },
  {
    id: 'prod_nowipe_topcoat',
    name: 'Ultra-Gloss No-Wipe Gel Top Coat (15ml)',
    sku: 'GEL-TOP-103',
    category: 'Gel Polish',
    quantity: 52,
    unitCost: 6.80,
    lowStockThreshold: 15,
    dateAdded: '2026-10-15'
  },
  {
    id: 'prod_acrylic_monomer',
    name: 'Pro Acrylic Liquid Monomer (16oz)',
    sku: 'ACR-MON-201',
    category: 'Acrylic & Dip Powder',
    quantity: 7,
    unitCost: 19.50,
    lowStockThreshold: 10, // Low Stock status
    dateAdded: '2026-10-16'
  },
  {
    id: 'prod_acrylic_powder',
    name: 'Crystal Clear Acrylic Sculpting Powder (8oz)',
    sku: 'ACR-CLR-202',
    category: 'Acrylic & Dip Powder',
    quantity: 18,
    unitCost: 14.00,
    lowStockThreshold: 8,
    dateAdded: '2026-10-18'
  },
  {
    id: 'prod_cuticle_oil_almond',
    name: 'Nourishing Cuticle Oil Dropper — Sweet Almond (30ml)',
    sku: 'OIL-ALM-301',
    category: 'Nail Care & Prep',
    quantity: 65,
    unitCost: 4.25,
    lowStockThreshold: 20,
    dateAdded: '2026-10-20'
  },
  {
    id: 'prod_prep_duo',
    name: 'Fast-Acting Nail Dehydrator & Acid-Free Primer Duo',
    sku: 'PRP-DUO-302',
    category: 'Nail Care & Prep',
    quantity: 5,
    unitCost: 11.00,
    lowStockThreshold: 8, // Low Stock status
    dateAdded: '2026-10-22'
  },
  {
    id: 'prod_uv_lamp_48w',
    name: 'Cordless Pro 48W UV/LED Curing Lamp',
    sku: 'LMP-CRD-401',
    category: 'Lamps & Equipment',
    quantity: 0,
    unitCost: 48.00,
    lowStockThreshold: 4, // Out of Stock status
    dateAdded: '2026-10-24'
  },
  {
    id: 'prod_cuticle_nippers',
    name: 'Precision Surgical Steel Cuticle Nippers (1/2 Jaw)',
    sku: 'TLS-NIP-501',
    category: 'Tools & Implements',
    quantity: 26,
    unitCost: 9.80,
    lowStockThreshold: 10,
    dateAdded: '2026-10-26'
  },
  {
    id: 'prod_buffer_blocks',
    name: 'Pro 100/180 Grit Dual-Side Buffer Blocks (Pack of 20)',
    sku: 'TLS-BUF-502',
    category: 'Tools & Implements',
    quantity: 80,
    unitCost: 3.50,
    lowStockThreshold: 25,
    dateAdded: '2026-10-28'
  },
  {
    id: 'prod_chrome_powder',
    name: 'Holographic Mirror Chrome Powder Kit (6-Pack)',
    sku: 'ART-CHR-601',
    category: 'Nail Art & Chrome',
    quantity: 4,
    unitCost: 13.50,
    lowStockThreshold: 6, // Low Stock status
    dateAdded: '2026-10-30'
  }
];

const SAMPLE_ACTIVITIES = [
  {
    id: 'act_seed_1',
    productId: 'prod_gel_velvet_rose',
    productName: 'UV/LED Gel Polish — Velvet Rose (15ml)',
    type: 'STOCK_IN',
    quantityAdjusted: 24,
    prevQuantity: 24,
    newQuantity: 48,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    details: 'Received seasonal salon gel collection restock'
  },
  {
    id: 'act_seed_2',
    productId: 'prod_uv_lamp_48w',
    productName: 'Cordless Pro 48W UV/LED Curing Lamp',
    type: 'STOCK_OUT',
    quantityAdjusted: 4,
    prevQuantity: 4,
    newQuantity: 0,
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    details: 'Fulfilled salon equipment order (Sold Out)'
  },
  {
    id: 'act_seed_3',
    productId: 'prod_prep_duo',
    productName: 'Fast-Acting Nail Dehydrator & Acid-Free Primer Duo',
    type: 'STOCK_OUT',
    quantityAdjusted: 5,
    prevQuantity: 10,
    newQuantity: 5,
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    details: 'Dispatched pro technician salon orders'
  }
];

// =============================================================================
// 2. APPLICATION STATE
// =============================================================================

let products = [];
let activities = [];

// Filter & Search states
let currentFilters = {
  searchQuery: '',
  category: 'ALL',
  status: 'ALL'
};

// Target product currently selected for delete or detail view
let activeProductId = null;

// =============================================================================
// 3. DOM ELEMENT REFERENCES
// =============================================================================

// Navigation & Views
const tabDashboard = document.getElementById('tabDashboard');
const tabInventory = document.getElementById('tabInventory');
const viewDashboard = document.getElementById('viewDashboard');
const viewInventory = document.getElementById('viewInventory');
const navProductCount = document.getElementById('navProductCount');
const currentDateDisplay = document.getElementById('currentDateDisplay');

// Dashboard KPIs & Elements
const kpiTotalProducts = document.getElementById('kpiTotalProducts');
const kpiTotalUnits = document.getElementById('kpiTotalUnits');
const kpiTotalValue = document.getElementById('kpiTotalValue');
const kpiLowStock = document.getElementById('kpiLowStock');
const restockAlertsList = document.getElementById('restockAlertsList');
const activityLogList = document.getElementById('activityLogList');
const btnViewAllLowStock = document.getElementById('btnViewAllLowStock');
const btnClearActivity = document.getElementById('btnClearActivity');
const btnSeedData = document.getElementById('btnSeedData');

// Inventory Toolbar & Table
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const filterCategory = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');
const btnResetFilters = document.getElementById('btnResetFilters');
const filteredCount = document.getElementById('filteredCount');
const totalCount = document.getElementById('totalCount');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const tableEmptyState = document.getElementById('tableEmptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateDesc = document.getElementById('emptyStateDesc');
const btnEmptyResetFilters = document.getElementById('btnEmptyResetFilters');

// Add/Edit Product Modal & Form
const productModal = document.getElementById('productModal');
const productModalTitle = document.getElementById('productModalTitle');
const productForm = document.getElementById('productForm');
const productIdField = document.getElementById('productIdField');
const productName = document.getElementById('productName');
const productSku = document.getElementById('productSku');
const productCategory = document.getElementById('productCategory');
const productQuantity = document.getElementById('productQuantity');
const productUnitCost = document.getElementById('productUnitCost');
const productThreshold = document.getElementById('productThreshold');
const formGlobalError = document.getElementById('formGlobalError');
const btnOpenAddProduct = document.getElementById('btnOpenAddProduct');
const btnOpenAddProduct2 = document.getElementById('btnOpenAddProduct2');

// Stock Adjustment Modal & Form
const stockModal = document.getElementById('stockModal');
const stockForm = document.getElementById('stockForm');
const stockProductId = document.getElementById('stockProductId');
const stockProductName = document.getElementById('stockProductName');
const stockProductSku = document.getElementById('stockProductSku');
const stockCurrentQty = document.getElementById('stockCurrentQty');
const stockQuantityInput = document.getElementById('stockQuantityInput');
const previewCurrentQty = document.getElementById('previewCurrentQty');
const previewActionLabel = document.getElementById('previewActionLabel');
const previewAdjustQty = document.getElementById('previewAdjustQty');
const previewResultQty = document.getElementById('previewResultQty');
const btnSubmitStock = document.getElementById('btnSubmitStock');

// Product Detail Modal
const detailModal = document.getElementById('detailModal');
const detailProductName = document.getElementById('detailProductName');
const detailProductSku = document.getElementById('detailProductSku');
const detailProductCategory = document.getElementById('detailProductCategory');
const detailStatusBadge = document.getElementById('detailStatusBadge');
const detailQuantity = document.getElementById('detailQuantity');
const detailUnitCost = document.getElementById('detailUnitCost');
const detailTotalValue = document.getElementById('detailTotalValue');
const detailThreshold = document.getElementById('detailThreshold');
const detailId = document.getElementById('detailId');
const detailDateAdded = document.getElementById('detailDateAdded');
const detailHistoryList = document.getElementById('detailHistoryList');
const btnDetailAdjustStock = document.getElementById('btnDetailAdjustStock');

// Delete Confirmation Modal
const deleteModal = document.getElementById('deleteModal');
const deleteProductName = document.getElementById('deleteProductName');
const deleteProductSku = document.getElementById('deleteProductSku');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

// Toast Notification Container
const toastContainer = document.getElementById('toastContainer');

// =============================================================================
// 4. STORAGE ACCESS & INITIALIZATION
// =============================================================================

/**
 * Loads products from browser localStorage. If empty, loads initial demo products.
 */
function loadProducts() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products from localStorage:', err);
  }
  // Fallback to sample data for first-time use
  saveProducts(SAMPLE_PRODUCTS);
  return [...SAMPLE_PRODUCTS];
}

/**
 * Persists products to localStorage.
 */
function saveProducts(productsToSave) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsToSave));
  } catch (err) {
    console.error('Error saving products to localStorage:', err);
    showToast('Failed to save changes to local storage.', 'error');
  }
}

/**
 * Loads recent inventory activities from localStorage.
 */
function loadActivities() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading activities from localStorage:', err);
  }
  saveActivities(SAMPLE_ACTIVITIES);
  return [...SAMPLE_ACTIVITIES];
}

/**
 * Persists activities to localStorage.
 */
function saveActivities(activitiesToSave) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activitiesToSave));
  } catch (err) {
    console.error('Error saving activities to localStorage:', err);
  }
}

/**
 * Helper to record a new activity item.
 */
function recordActivity(activity) {
  const newActivity = {
    id: 'act_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    ...activity
  };
  // Prepend to show latest first
  activities.unshift(newActivity);

  // Keep latest 100 activities to prevent uncontrolled growth
  if (activities.length > 100) {
    activities = activities.slice(0, 100);
  }

  saveActivities(activities);
  renderDashboard();
}

// =============================================================================
// 5. HELPER UTILITY FUNCTIONS
// =============================================================================

/**
 * Formats a number as a standard USD currency string ($X,XXX.XX)
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Formats a number with comma separators (e.g. 1,234)
 */
function formatNumber(number) {
  const num = Number(number) || 0;
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Returns human-readable relative time or formatted date
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Returns full date and time string
 */
function formatDateTime(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Calculates stock status based on current quantity and threshold.
 * Rules:
 *  - Out of Stock: Quantity === 0
 *  - Low Stock: 0 < Quantity <= Low-stock threshold
 *  - In Stock: Quantity > Low-stock threshold
 */
function getStockStatus(quantity, threshold) {
  const qty = Number(quantity);
  const thresh = Number(threshold);

  if (qty === 0) {
    return {
      code: 'OUT_OF_STOCK',
      label: 'Out of Stock',
      cssClass: 'status-out'
    };
  }
  if (qty <= thresh) {
    return {
      code: 'LOW_STOCK',
      label: 'Low Stock',
      cssClass: 'status-low'
    };
  }
  return {
    code: 'IN_STOCK',
    label: 'In Stock',
    cssClass: 'status-in'
  };
}

/**
 * Displays non-intrusive toast messages.
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
    <button type="button" class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  toastContainer.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (toast.isConnected) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 200);
    }
  }, 4000);
}

/**
 * Escapes unsafe HTML characters to prevent XSS.
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// 6. DASHBOARD CALCULATIONS & RENDERING
// =============================================================================

/**
 * Calculates current metrics and refreshes all dashboard figures.
 */
function renderDashboard() {
  const totalProductsCount = products.length;
  let totalUnitsCount = 0;
  let totalInventoryValue = 0;
  let lowStockCount = 0;
  const restockAlertItems = [];

  products.forEach(p => {
    const qty = Number(p.quantity) || 0;
    const cost = Number(p.unitCost) || 0;
    const threshold = Number(p.lowStockThreshold) || 0;

    totalUnitsCount += qty;
    totalInventoryValue += qty * cost;

    // A product needs restock if quantity <= low-stock threshold
    if (qty <= threshold) {
      lowStockCount++;
      restockAlertItems.push(p);
    }
  });

  // Update KPI card figures
  kpiTotalProducts.textContent = formatNumber(totalProductsCount);
  kpiTotalUnits.textContent = formatNumber(totalUnitsCount);
  kpiTotalValue.textContent = formatCurrency(totalInventoryValue);
  kpiLowStock.textContent = formatNumber(lowStockCount);

  // Update navigation badge
  navProductCount.textContent = formatNumber(totalProductsCount);

  // Render Restock Alerts Section
  renderRestockAlerts(restockAlertItems);

  // Render Recent Activity Timeline
  renderActivityTimeline();
}

/**
 * Renders the Restock Alerts list in the dashboard
 */
function renderRestockAlerts(items) {
  if (items.length === 0) {
    restockAlertsList.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem 0;">
        <div class="empty-icon-wrap" style="width: 44px; height: 44px; margin-bottom: 0.5rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h4 class="empty-title" style="font-size: 0.95rem;">Stock Levels Healthy</h4>
        <p class="empty-description" style="font-size: 0.8125rem; margin-bottom: 0;">
          All items are currently above their low-stock thresholds.
        </p>
      </div>
    `;
    return;
  }

  // Sort lowest quantity first (most critical first)
  const sorted = [...items].sort((a, b) => a.quantity - b.quantity);

  restockAlertsList.innerHTML = sorted.map(item => {
    const status = getStockStatus(item.quantity, item.lowStockThreshold);
    return `
      <div class="alert-item-row">
        <div class="alert-item-left">
          <span class="alert-item-name">${escapeHTML(item.name)}</span>
          <div class="alert-item-meta">
            <span>SKU: <code>${escapeHTML(item.sku)}</code></span>
            <span>&bull;</span>
            <span>Min Threshold: ${item.lowStockThreshold} units</span>
          </div>
        </div>
        <div class="alert-item-right">
          <span class="status-badge ${status.cssClass}">${status.label} (${item.quantity})</span>
          <button type="button" class="btn btn-outline btn-xs" onclick="window.app.quickStockIn('${escapeHTML(item.id)}')">
            + Restock
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renders the Recent Activity timeline in the dashboard
 */
function renderActivityTimeline() {
  if (activities.length === 0) {
    activityLogList.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem 0;">
        <p class="empty-description" style="font-size: 0.8125rem; margin-bottom: 0;">
          No inventory activity logged yet. Add products or adjust stock to see updates here.
        </p>
      </div>
    `;
    return;
  }

  activityLogList.innerHTML = activities.slice(0, 15).map(act => {
    let iconSvg = '';
    let badgeClass = '';
    let title = '';

    switch (act.type) {
      case 'STOCK_IN':
        badgeClass = 'activity-badge-in';
        iconSvg = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        `;
        title = `Stock In: +${act.quantityAdjusted} units`;
        break;

      case 'STOCK_OUT':
        badgeClass = 'activity-badge-out';
        iconSvg = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        `;
        title = `Stock Out: -${act.quantityAdjusted} units`;
        break;

      case 'PRODUCT_CREATED':
        badgeClass = 'activity-badge-create';
        iconSvg = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        `;
        title = 'New Product Created';
        break;

      case 'PRODUCT_UPDATED':
        badgeClass = 'activity-badge-edit';
        iconSvg = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        `;
        title = 'Product Details Updated';
        break;

      case 'PRODUCT_DELETED':
        badgeClass = 'activity-badge-delete';
        iconSvg = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          </svg>
        `;
        title = 'Product Removed';
        break;

      default:
        badgeClass = 'activity-badge-edit';
        iconSvg = '';
        title = 'Inventory Event';
    }

    // Detail text
    let description = escapeHTML(act.productName || 'Product');
    if (act.prevQuantity !== undefined && act.newQuantity !== undefined) {
      description += ` (${act.prevQuantity} &rarr; ${act.newQuantity} units)`;
    }
    if (act.details) {
      description += ` &bull; ${escapeHTML(act.details)}`;
    }

    return `
      <div class="activity-item">
        <div class="activity-badge ${badgeClass}">${iconSvg}</div>
        <div class="activity-content">
          <div class="activity-header-line">
            <span class="activity-title">${title}</span>
            <span class="activity-time" title="${formatDateTime(act.timestamp)}">${formatRelativeTime(act.timestamp)}</span>
          </div>
          <div class="activity-desc">${description}</div>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================================================
// 7. INVENTORY TABLE, SEARCH & FILTERING
// =============================================================================

/**
 * Synchronizes the category `<select>` dropdown options with unique categories in stock.
 */
function populateCategoryFilter() {
  const currentSelected = filterCategory.value;
  const categories = new Set();

  products.forEach(p => {
    if (p.category && p.category.trim() !== '') {
      categories.add(p.category.trim());
    }
  });

  const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));

  filterCategory.innerHTML = '<option value="ALL">All Categories</option>';
  sortedCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentSelected) {
      opt.selected = true;
    }
    filterCategory.appendChild(opt);
  });
}

/**
 * Evaluates active search query and dropdown filters to produce filtered product list.
 */
function getFilteredProducts() {
  const query = currentFilters.searchQuery.toLowerCase().trim();
  const categoryFilter = currentFilters.category;
  const statusFilter = currentFilters.status;

  return products.filter(product => {
    // 1. Search Query (Matches Product Name or SKU)
    const matchesSearch = !query || 
      product.name.toLowerCase().includes(query) || 
      product.sku.toLowerCase().includes(query);

    // 2. Category Filter
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;

    // 3. Stock Status Filter
    const status = getStockStatus(product.quantity, product.lowStockThreshold);
    const matchesStatus = statusFilter === 'ALL' || status.code === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

/**
 * Renders the inventory table with filtered product rows.
 */
function renderInventoryTable() {
  const filtered = getFilteredProducts();

  // Update counts
  filteredCount.textContent = formatNumber(filtered.length);
  totalCount.textContent = formatNumber(products.length);

  // Toggle clear search button visibility
  if (currentFilters.searchQuery) {
    btnClearSearch.classList.remove('hidden');
  } else {
    btnClearSearch.classList.add('hidden');
  }

  // Handle Empty States
  if (filtered.length === 0) {
    inventoryTableBody.innerHTML = '';
    tableEmptyState.classList.remove('hidden');

    if (products.length === 0) {
      // Inventory is completely empty
      emptyStateTitle.textContent = 'No Products in Inventory';
      emptyStateDesc.textContent = 'Get started by creating your first product or loading the sample dataset.';
      btnEmptyResetFilters.textContent = '+ Add First Product';
      btnEmptyResetFilters.onclick = () => openAddProductModal();
    } else {
      // Products exist, but none match filters
      emptyStateTitle.textContent = 'No Products Matched';
      emptyStateDesc.textContent = 'No inventory items match your current search terms and filter criteria.';
      btnEmptyResetFilters.textContent = 'Clear Filters';
      btnEmptyResetFilters.onclick = () => resetAllFilters();
    }
    return;
  }

  // Hide empty state
  tableEmptyState.classList.add('hidden');

  // Render rows
  inventoryTableBody.innerHTML = filtered.map(item => {
    const qty = Number(item.quantity) || 0;
    const unitCost = Number(item.unitCost) || 0;
    const totalVal = qty * unitCost;
    const status = getStockStatus(qty, item.lowStockThreshold);

    return `
      <tr data-product-id="${escapeHTML(item.id)}">
        <!-- Product & SKU -->
        <td>
          <span class="product-cell-name">${escapeHTML(item.name)}</span>
          <span class="product-cell-sku">${escapeHTML(item.sku)}</span>
        </td>

        <!-- Category -->
        <td>
          <span class="category-tag">${escapeHTML(item.category)}</span>
        </td>

        <!-- Quantity Available -->
        <td class="text-right">
          <strong>${formatNumber(qty)}</strong>
          <span class="field-hint" style="display:block; margin:0;">Min: ${item.lowStockThreshold}</span>
        </td>

        <!-- Unit Cost -->
        <td class="text-right">
          ${formatCurrency(unitCost)}
        </td>

        <!-- Total Value -->
        <td class="text-right">
          <strong>${formatCurrency(totalVal)}</strong>
        </td>

        <!-- Stock Status -->
        <td class="text-center">
          <span class="status-badge ${status.cssClass}">${status.label}</span>
        </td>

        <!-- Actions -->
        <td>
          <div class="row-actions">
            <!-- Quick Stock In/Out -->
            <button type="button" class="btn-action btn-action-stock" title="Adjust Stock Quantity" onclick="window.app.openStockModal('${escapeHTML(item.id)}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                <path d="M7 10v12"></path>
                <path d="M17 14v-12"></path>
                <path d="m3 14 4-4 4 4"></path>
                <path d="m13 10 4 4 4-4"></path>
              </svg>
            </button>

            <!-- View Details -->
            <button type="button" class="btn-action" title="View Details" onclick="window.app.openDetailModal('${escapeHTML(item.id)}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>

            <!-- Edit Product -->
            <button type="button" class="btn-action btn-action-edit" title="Edit Product" onclick="window.app.openEditProductModal('${escapeHTML(item.id)}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>

            <!-- Delete Product -->
            <button type="button" class="btn-action btn-action-delete" title="Delete Product" onclick="window.app.openDeleteModal('${escapeHTML(item.id)}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Resets search input and dropdown filters back to default.
 */
function resetAllFilters() {
  currentFilters.searchQuery = '';
  currentFilters.category = 'ALL';
  currentFilters.status = 'ALL';

  searchInput.value = '';
  filterCategory.value = 'ALL';
  filterStatus.value = 'ALL';

  renderInventoryTable();
}

// =============================================================================
// 8. PRODUCT MODAL (ADD & EDIT) & VALIDATION
// =============================================================================

/**
 * Resets all validation errors on the product form.
 */
function clearProductFormErrors() {
  formGlobalError.classList.add('hidden');
  formGlobalError.textContent = '';

  const errorIds = ['productNameError', 'productSkuError', 'productCategoryError', 'productQuantityError', 'productUnitCostError', 'productThresholdError'];
  errorIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('active');
    }
  });

  const inputs = productForm.querySelectorAll('.form-control');
  inputs.forEach(input => input.classList.remove('input-error'));
}

/**
 * Sets an error state on a specific form input field.
 */
function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (field) field.classList.add('input-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
  }
}

/**
 * Opens modal configured for adding a new product.
 */
function openAddProductModal() {
  clearProductFormErrors();
  productForm.reset();
  productIdField.value = '';
  productModalTitle.textContent = 'Add New Product';
  productThreshold.value = '5'; // sensible default
  openModal(productModal);
  productName.focus();
}

/**
 * Opens modal pre-populated for editing an existing product.
 */
function openEditProductModal(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  clearProductFormErrors();
  productIdField.value = prod.id;
  productName.value = prod.name;
  productSku.value = prod.sku;
  productCategory.value = prod.category;
  productQuantity.value = prod.quantity;
  productUnitCost.value = prod.unitCost;
  productThreshold.value = prod.lowStockThreshold;

  productModalTitle.textContent = 'Edit Product Information';
  openModal(productModal);
  productName.focus();
}

/**
 * Validates the product form against business rules:
 * - Product name is required.
 * - SKU is required and must be unique.
 * - Category is required.
 * - Quantity must be a non-negative whole number.
 * - Unit cost must be greater than zero.
 * - Low-stock threshold must be a non-negative whole number.
 */
function validateProductData(formData, currentEditId = '') {
  const errors = {};

  // 1. Product Name
  const nameTrimmed = formData.name.trim();
  if (!nameTrimmed) {
    errors.name = 'Product name is required.';
  }

  // 2. SKU (Required & Unique)
  const skuTrimmed = formData.sku.trim().toUpperCase();
  if (!skuTrimmed) {
    errors.sku = 'SKU is required.';
  } else {
    // Check uniqueness across products (ignoring current product in edit mode)
    const duplicate = products.find(p => 
      p.sku.toUpperCase() === skuTrimmed && p.id !== currentEditId
    );
    if (duplicate) {
      errors.sku = `SKU "${skuTrimmed}" is already assigned to "${duplicate.name}".`;
    }
  }

  // 3. Category
  const categoryTrimmed = formData.category.trim();
  if (!categoryTrimmed) {
    errors.category = 'Category is required.';
  }

  // 4. Quantity (Non-negative integer)
  if (formData.quantity === '' || isNaN(formData.quantity)) {
    errors.quantity = 'Quantity is required.';
  } else {
    const qtyNum = Number(formData.quantity);
    if (!Number.isInteger(qtyNum) || qtyNum < 0) {
      errors.quantity = 'Quantity must be a whole number 0 or greater.';
    }
  }

  // 5. Unit Cost (Greater than 0)
  if (formData.unitCost === '' || isNaN(formData.unitCost)) {
    errors.unitCost = 'Unit cost is required.';
  } else {
    const costNum = Number(formData.unitCost);
    if (costNum <= 0) {
      errors.unitCost = 'Unit cost must be greater than 0.';
    }
  }

  // 6. Low-stock Threshold (Non-negative integer)
  if (formData.threshold === '' || isNaN(formData.threshold)) {
    errors.threshold = 'Low-stock threshold is required.';
  } else {
    const threshNum = Number(formData.threshold);
    if (!Number.isInteger(threshNum) || threshNum < 0) {
      errors.threshold = 'Threshold must be a whole number 0 or greater.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: nameTrimmed,
      sku: skuTrimmed,
      category: categoryTrimmed,
      quantity: Number(formData.quantity),
      unitCost: parseFloat(Number(formData.unitCost).toFixed(2)),
      lowStockThreshold: Number(formData.threshold)
    }
  };
}

/**
 * Handles submission of product create / edit form.
 */
function handleProductFormSubmit(e) {
  e.preventDefault();
  clearProductFormErrors();

  const editId = productIdField.value.trim();
  const rawData = {
    name: productName.value,
    sku: productSku.value,
    category: productCategory.value,
    quantity: productQuantity.value,
    unitCost: productUnitCost.value,
    threshold: productThreshold.value
  };

  const validation = validateProductData(rawData, editId);

  if (!validation.isValid) {
    // Surface field errors
    if (validation.errors.name) setFieldError('productName', 'productNameError', validation.errors.name);
    if (validation.errors.sku) setFieldError('productSku', 'productSkuError', validation.errors.sku);
    if (validation.errors.category) setFieldError('productCategory', 'productCategoryError', validation.errors.category);
    if (validation.errors.quantity) setFieldError('productQuantity', 'productQuantityError', validation.errors.quantity);
    if (validation.errors.unitCost) setFieldError('productUnitCost', 'productUnitCostError', validation.errors.unitCost);
    if (validation.errors.threshold) setFieldError('productThreshold', 'productThresholdError', validation.errors.threshold);

    formGlobalError.textContent = 'Please fix the errors indicated below.';
    formGlobalError.classList.remove('hidden');
    return;
  }

  const clean = validation.sanitized;

  if (editId) {
    // ----------------- EDIT EXISTING PRODUCT -----------------
    const index = products.findIndex(p => p.id === editId);
    if (index === -1) {
      showToast('Product not found.', 'error');
      closeModal(productModal);
      return;
    }

    const previousRecord = products[index];
    const updatedProduct = {
      ...previousRecord,
      name: clean.name,
      sku: clean.sku,
      category: clean.category,
      quantity: clean.quantity,
      unitCost: clean.unitCost,
      lowStockThreshold: clean.lowStockThreshold
    };

    products[index] = updatedProduct;
    saveProducts(products);

    // Record activity
    recordActivity({
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      type: 'PRODUCT_UPDATED',
      details: `Updated details (Qty: ${updatedProduct.quantity}, Cost: $${updatedProduct.unitCost.toFixed(2)})`
    });

    showToast(`Updated "${updatedProduct.name}" successfully.`, 'success');
  } else {
    // ----------------- CREATE NEW PRODUCT -----------------
    const newProduct = {
      id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: clean.name,
      sku: clean.sku,
      category: clean.category,
      quantity: clean.quantity,
      unitCost: clean.unitCost,
      lowStockThreshold: clean.lowStockThreshold,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    products.push(newProduct);
    saveProducts(products);

    // Record activity
    recordActivity({
      productId: newProduct.id,
      productName: newProduct.name,
      type: 'PRODUCT_CREATED',
      newQuantity: newProduct.quantity,
      details: `Initial stock: ${newProduct.quantity} units`
    });

    showToast(`Created product "${newProduct.name}" successfully.`, 'success');
  }

  closeModal(productModal);
  populateCategoryFilter();
  renderDashboard();
  renderInventoryTable();
}

// =============================================================================
// 9. STOCK ADJUSTMENT (STOCK IN & STOCK OUT)
// =============================================================================

/**
 * Opens Stock adjustment modal for a given product ID.
 */
function openStockModal(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  stockProductId.value = prod.id;
  stockProductName.textContent = prod.name;
  stockProductSku.textContent = `SKU: ${prod.sku}`;
  stockCurrentQty.textContent = formatNumber(prod.quantity);

  // Reset inputs
  stockQuantityInput.value = '';
  document.getElementById('stockQuantityError').textContent = '';
  document.getElementById('stockQuantityError').classList.remove('active');
  stockQuantityInput.classList.remove('input-error');

  // Default to Stock In
  const inRadio = stockForm.querySelector('input[value="IN"]');
  if (inRadio) inRadio.checked = true;

  updateStockCalculationPreview();
  openModal(stockModal);
  stockQuantityInput.focus();
}

/**
 * Quick helper from dashboard alerts to jump into Stock In.
 */
function quickStockIn(id) {
  openStockModal(id);
}

/**
 * Updates dynamic live calculation preview in the Stock Modal.
 */
function updateStockCalculationPreview() {
  const prodId = stockProductId.value;
  const prod = products.find(p => p.id === prodId);
  if (!prod) return;

  const currentQty = Number(prod.quantity) || 0;
  const actionType = stockForm.querySelector('input[name="stockActionType"]:checked')?.value || 'IN';
  const adjustRaw = stockQuantityInput.value;
  const adjustQty = Number(adjustRaw) || 0;

  previewCurrentQty.textContent = `${currentQty} units`;

  if (actionType === 'IN') {
    previewActionLabel.textContent = 'Stock In:';
    previewAdjustQty.textContent = `+${adjustQty} units`;
    previewAdjustQty.style.color = '#059669';
    const result = currentQty + adjustQty;
    previewResultQty.textContent = `${result} units`;
    btnSubmitStock.disabled = false;
  } else {
    previewActionLabel.textContent = 'Stock Out:';
    previewAdjustQty.textContent = `-${adjustQty} units`;
    previewAdjustQty.style.color = '#dc2626';
    const result = currentQty - adjustQty;
    previewResultQty.textContent = `${result} units`;

    // Disallow negative stock
    if (result < 0) {
      previewResultQty.textContent = `${result} (Insufficient Stock!)`;
      previewResultQty.style.color = '#dc2626';
    } else {
      previewResultQty.style.color = '';
    }
  }
}

/**
 * Handles stock adjustment form submission.
 * Rules:
 *  - Positive whole number.
 *  - Stock out must not reduce inventory below zero.
 */
function handleStockFormSubmit(e) {
  e.preventDefault();

  const prodId = stockProductId.value;
  const prod = products.find(p => p.id === prodId);
  if (!prod) {
    showToast('Product not found.', 'error');
    closeModal(stockModal);
    return;
  }

  const actionType = stockForm.querySelector('input[name="stockActionType"]:checked')?.value;
  const qtyRaw = stockQuantityInput.value.trim();
  const qtyNum = Number(qtyRaw);

  const errorEl = document.getElementById('stockQuantityError');
  stockQuantityInput.classList.remove('input-error');
  errorEl.textContent = '';
  errorEl.classList.remove('active');

  // Validation: Positive whole number
  if (!qtyRaw || isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum <= 0) {
    stockQuantityInput.classList.add('input-error');
    errorEl.textContent = 'Adjustment quantity must be a positive whole number greater than 0.';
    errorEl.classList.add('active');
    return;
  }

  const previousQty = Number(prod.quantity);
  let newQty = previousQty;

  if (actionType === 'IN') {
    newQty = previousQty + qtyNum;
  } else if (actionType === 'OUT') {
    if (qtyNum > previousQty) {
      stockQuantityInput.classList.add('input-error');
      errorEl.textContent = `Cannot stock out ${qtyNum} units. Only ${previousQty} units currently in stock.`;
      errorEl.classList.add('active');
      return;
    }
    newQty = previousQty - qtyNum;
  }

  // Update product state
  prod.quantity = newQty;
  saveProducts(products);

  // Log activity
  recordActivity({
    productId: prod.id,
    productName: prod.name,
    type: actionType === 'IN' ? 'STOCK_IN' : 'STOCK_OUT',
    quantityAdjusted: qtyNum,
    prevQuantity: previousQty,
    newQuantity: newQty,
    details: actionType === 'IN' ? 'Received stock' : 'Stock dispatch / sale'
  });

  showToast(`Stock updated for "${prod.name}": now ${newQty} units.`, 'success');
  closeModal(stockModal);
  renderDashboard();
  renderInventoryTable();
}

// =============================================================================
// 10. PRODUCT DETAIL MODAL
// =============================================================================

/**
 * Opens detailed read-only modal inspection for a product.
 */
function openDetailModal(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  activeProductId = prod.id;
  detailProductName.textContent = prod.name;
  detailProductSku.textContent = `SKU: ${prod.sku}`;
  detailProductCategory.textContent = prod.category;

  const status = getStockStatus(prod.quantity, prod.lowStockThreshold);
  detailStatusBadge.className = `status-badge ${status.cssClass}`;
  detailStatusBadge.textContent = status.label;

  detailQuantity.textContent = formatNumber(prod.quantity);
  detailUnitCost.textContent = formatCurrency(prod.unitCost);
  detailTotalValue.textContent = formatCurrency(prod.quantity * prod.unitCost);
  detailThreshold.textContent = `${prod.lowStockThreshold} units`;
  detailId.textContent = prod.id;
  detailDateAdded.textContent = prod.dateAdded || '--';

  // Render product-specific recent adjustment history
  const itemActivities = activities.filter(a => a.productId === prod.id);
  if (itemActivities.length === 0) {
    detailHistoryList.innerHTML = `
      <p class="field-hint">No stock adjustments logged for this item yet.</p>
    `;
  } else {
    detailHistoryList.innerHTML = itemActivities.slice(0, 10).map(act => {
      const typeLabel = act.type === 'STOCK_IN' 
        ? `<strong style="color:#059669;">+${act.quantityAdjusted} Stock In</strong>`
        : act.type === 'STOCK_OUT'
          ? `<strong style="color:#dc2626;">-${act.quantityAdjusted} Stock Out</strong>`
          : `<span>${act.type}</span>`;

      return `
        <div class="alert-item-row" style="padding: 0.5rem 0.75rem; font-size: 0.8125rem;">
          <div>
            ${typeLabel} (${act.prevQuantity ?? '--'} &rarr; ${act.newQuantity ?? '--'} units)
            <div class="field-hint" style="margin: 0;">${act.details ? escapeHTML(act.details) : ''}</div>
          </div>
          <span class="activity-time">${formatDateTime(act.timestamp)}</span>
        </div>
      `;
    }).join('');
  }

  openModal(detailModal);
}

// =============================================================================
// 11. DELETE PRODUCT CONFIRMATION MODAL
// =============================================================================

/**
 * Opens modal asking for confirmation before permanently deleting a product.
 */
function openDeleteModal(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  activeProductId = prod.id;
  deleteProductName.textContent = prod.name;
  deleteProductSku.textContent = prod.sku;

  openModal(deleteModal);
}

/**
 * Executes deletion upon confirmation.
 */
function confirmDeleteProduct() {
  if (!activeProductId) {
    closeModal(deleteModal);
    return;
  }

  const targetIndex = products.findIndex(p => p.id === activeProductId);
  if (targetIndex === -1) {
    activeProductId = null;
    closeModal(deleteModal);
    return;
  }

  const deletedItem = products[targetIndex];
  products.splice(targetIndex, 1);
  saveProducts(products);

  // Record activity
  recordActivity({
    productId: deletedItem.id,
    productName: deletedItem.name,
    type: 'PRODUCT_DELETED',
    details: `SKU: ${deletedItem.sku} permanently removed`
  });

  showToast(`Product "${deletedItem.name}" deleted.`, 'info');
  activeProductId = null;
  closeModal(deleteModal);
  populateCategoryFilter();
  renderDashboard();
  renderInventoryTable();
}

// =============================================================================
// 12. GENERIC MODAL CONTROLLER
// =============================================================================

function openModal(modalElement) {
  if (!modalElement) return;
  modalElement.removeAttribute('hidden');
  modalElement.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // lock background scrolling
}

function closeModal(modalElement) {
  if (!modalElement) return;
  modalElement.setAttribute('hidden', '');
  modalElement.style.display = 'none';
  document.body.style.overflow = '';
  if (modalElement === deleteModal) {
    activeProductId = null;
  }
}

function setupModalDismissals() {
  // Listen for click on backdrop or elements with [data-close-modal]
  document.addEventListener('click', (e) => {
    if (e.target.matches('.modal-backdrop') || e.target.closest('[data-close-modal]')) {
      const activeBackdrop = e.target.closest('.modal-backdrop');
      if (activeBackdrop) {
        closeModal(activeBackdrop);
      }
    }
  });

  // Also bind all data-close-modal elements directly to guarantee immediate closure
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const activeBackdrop = e.target.closest('.modal-backdrop');
      if (activeBackdrop) {
        closeModal(activeBackdrop);
      }
    });
  });

  // Listen for Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-backdrop');
      openModals.forEach(m => {
        if (!m.hasAttribute('hidden') && m.style.display !== 'none') {
          closeModal(m);
        }
      });
    }
  });
}

// =============================================================================
// 13. NAVIGATION & VIEW SWITCHING
// =============================================================================

function switchView(targetView) {
  if (targetView === 'dashboard') {
    tabDashboard.classList.add('active');
    tabInventory.classList.remove('active');
    viewDashboard.classList.add('active');
    viewInventory.classList.remove('active');
    renderDashboard();
  } else if (targetView === 'inventory') {
    tabDashboard.classList.remove('active');
    tabInventory.classList.add('active');
    viewDashboard.classList.remove('active');
    viewInventory.classList.add('active');
    renderInventoryTable();
  }
}

// =============================================================================
// 14. EVENT LISTENERS SETUP
// =============================================================================

function setupEventListeners() {
  // Navigation Tabs
  tabDashboard.addEventListener('click', () => switchView('dashboard'));
  tabInventory.addEventListener('click', () => switchView('inventory'));

  // Dashboard "View All in Inventory" link
  btnViewAllLowStock.addEventListener('click', () => {
    switchView('inventory');
    filterStatus.value = 'LOW_STOCK';
    currentFilters.status = 'LOW_STOCK';
    renderInventoryTable();
  });

  // Clear Activity Log button
  btnClearActivity.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the recent activity history? This cannot be undone.')) {
      activities = [];
      saveActivities(activities);
      renderDashboard();
      showToast('Activity log cleared.', 'info');
    }
  });

  // Reload Demo Seed Data button
  btnSeedData.addEventListener('click', () => {
    if (confirm('Replace current data with the sample BP essentials nail beauty dataset?')) {
      products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
      activities = JSON.parse(JSON.stringify(SAMPLE_ACTIVITIES));
      saveProducts(products);
      saveActivities(activities);
      populateCategoryFilter();
      renderDashboard();
      renderInventoryTable();
      showToast('Loaded BP essentials nail beauty inventory.', 'success');
    }
  });

  // Add Product Buttons
  btnOpenAddProduct.addEventListener('click', openAddProductModal);
  btnOpenAddProduct2.addEventListener('click', openAddProductModal);

  // Product Form Submit
  productForm.addEventListener('submit', handleProductFormSubmit);

  // Stock Form Listeners
  stockForm.addEventListener('submit', handleStockFormSubmit);
  stockQuantityInput.addEventListener('input', updateStockCalculationPreview);
  stockForm.querySelectorAll('input[name="stockActionType"]').forEach(radio => {
    radio.addEventListener('change', updateStockCalculationPreview);
  });

  // Product Detail Adjust Stock Button
  btnDetailAdjustStock.addEventListener('click', () => {
    closeModal(detailModal);
    if (activeProductId) {
      openStockModal(activeProductId);
    }
  });

  // Delete Confirmation Button
  btnConfirmDelete.addEventListener('click', confirmDeleteProduct);

  // Search & Filter Events
  searchInput.addEventListener('input', (e) => {
    currentFilters.searchQuery = e.target.value;
    renderInventoryTable();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    currentFilters.searchQuery = '';
    renderInventoryTable();
    searchInput.focus();
  });

  filterCategory.addEventListener('change', (e) => {
    currentFilters.category = e.target.value;
    renderInventoryTable();
  });

  filterStatus.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    renderInventoryTable();
  });

  btnResetFilters.addEventListener('click', resetAllFilters);

  // Display today's date in header
  if (currentDateDisplay) {
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Setup generic modal dismissals
  setupModalDismissals();
}

// =============================================================================
// 15. INITIALIZATION ON DOM READY
// =============================================================================

function initApp() {
  // Ensure all modals start explicitly hidden
  const allModals = document.querySelectorAll('.modal-backdrop');
  allModals.forEach(m => closeModal(m));

  // Load data from localStorage (or seed demo data if first run)
  products = loadProducts();
  activities = loadActivities();

  // Populate dynamic category dropdown
  populateCategoryFilter();

  // Render views
  renderDashboard();
  renderInventoryTable();

  // Setup event listeners
  setupEventListeners();

  // Expose necessary functions to window for inline onclick handlers
  window.app = {
    openAddProductModal,
    openEditProductModal,
    openStockModal,
    openDetailModal,
    openDeleteModal,
    quickStockIn
  };
}

// Start application once DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

