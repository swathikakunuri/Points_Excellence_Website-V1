/* ==========================================================================
   CIS Portal — Utilities, Inline SVG Icons, Toasts & Dialogs (Vanilla JS)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var ICONS = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    plusCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    checkSquare: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    spreadsheet: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="12" y1="11" x2="12" y2="19"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
  };

  function icon(name, size, className) {
    var s = size || 16;
    var path = ICONS[name] || ICONS.shield;
    var cls = className ? ' class="' + className + '"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + cls + ' style="flex-shrink:0">' + path + '</svg>';
  }

  function escapeHtml(val) {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function genId(prefix) {
    var rand = Math.floor(1000 + Math.random() * 9000);
    return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + rand;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return String(iso).slice(0, 10);
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return String(iso);
    }
  }

  function normalizeContributionStatus(status) {
    var st = String(status || '').trim();
    if (st === 'Approved') return 'Approved';
    if (st === 'Rejected') return 'Rejected';
    if (st === 'Draft') return 'Draft';
    return 'Pending';
  }

  function statusBadge(status) {
    var st = String(status || '');
    var cls = 'status-blue';
    if (st === 'Approved' || st === 'Active' || st === 'Measure Value' || st === 'Adopt' || st === 'Completed') {
      cls = 'status-mint';
    } else if (
      st === 'Pending' ||
      st === 'Pending Review' ||
      st === 'Submitted' ||
      st === 'Manager Review' ||
      st === 'Technical Validation' ||
      st === 'Revision Required' ||
      st === 'Proposed' ||
      st === 'Validate' ||
      st === 'Standardize'
    ) {
      cls = 'status-champagne';
    } else if (st === 'Rejected' || st === 'Inactive') {
      cls = 'status-blush';
    } else if (st === 'Reviewer Endorsed' || st === 'Publish') {
      cls = 'status-lavender';
    } else if (st === 'Create') {
      cls = 'status-blue';
    }
    return '<span class="status-badge ' + cls + '">' + escapeHtml(st) + '</span>';
  }

  function toast(message, type) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.innerHTML = '<span>' + escapeHtml(message) + '</span>' +
      '<button type="button" style="background:none;border:none;padding:2px;line-height:1;opacity:0.7" aria-label="Close">' + icon('x', 14) + '</button>';
    el.querySelector('button').addEventListener('click', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    root.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 4200);
  }

  function openModal(title, bodyHtml, options) {
    var opts = options || {};
    var root = document.getElementById('modal-root');
    if (!root) return;
    var sizeClass = opts.small ? ' modal-panel-sm' : '';
    root.innerHTML =
      '<div class="modal-backdrop" id="active-modal-backdrop">' +
        '<div class="modal-panel' + sizeClass + '" role="dialog" aria-modal="true">' +
          '<div class="flex-between" style="margin-bottom:16px">' +
            '<h3 style="font-size:17px;font-weight:700">' + escapeHtml(title) + '</h3>' +
            '<button type="button" class="btn btn-outline btn-xs" id="modal-close-btn" aria-label="Close">' + icon('x', 14) + '</button>' +
          '</div>' +
          '<div id="modal-body-slot">' + bodyHtml + '</div>' +
        '</div>' +
      '</div>';

    var backdrop = document.getElementById('active-modal-backdrop');
    var closeBtn = document.getElementById('modal-close-btn');
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });
    if (typeof opts.onOpen === 'function') {
      opts.onOpen(document.getElementById('modal-body-slot'));
    }
  }

  function closeModal() {
    var root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
  }

  function confirmDialog(title, message, confirmLabel, onConfirm, danger) {
    var btnCls = danger ? 'btn-danger' : 'btn-primary';
    openModal(
      title,
      '<p class="text-secondary" style="margin-bottom:20px;font-size:13px">' + escapeHtml(message) + '</p>' +
      '<div class="flex-row" style="justify-content:flex-end">' +
        '<button type="button" class="btn btn-outline btn-sm" id="confirm-cancel-btn">Cancel</button>' +
        '<button type="button" class="btn ' + btnCls + ' btn-sm" id="confirm-ok-btn">' + escapeHtml(confirmLabel || 'Confirm') + '</button>' +
      '</div>',
      {
        small: true,
        onOpen: function () {
          document.getElementById('confirm-cancel-btn').addEventListener('click', closeModal);
          document.getElementById('confirm-ok-btn').addEventListener('click', function () {
            closeModal();
            if (typeof onConfirm === 'function') onConfirm();
          });
        }
      }
    );
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function initials(name) {
    var parts = String(name || 'U').trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  window.CIS.utils = {
    icon: icon,
    escapeHtml: escapeHtml,
    genId: genId,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    statusBadge: statusBadge,
    normalizeContributionStatus: normalizeContributionStatus,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    confirmDialog: confirmDialog,
    downloadBlob: downloadBlob,
    initials: initials
  };
})();
