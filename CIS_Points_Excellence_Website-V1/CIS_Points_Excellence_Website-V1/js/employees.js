/* ==========================================================================
   CIS Portal — Team Management & Employee Directory Module
   Full CRUD + Persistent IndexedDB + Excel (.xlsx / .csv) Import & Export
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var dirFilter = { search: '', department: 'All' };

  function openEmployeeFormModal(existing, onDone) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var teams = S.getAll('teams');
    var projects = S.getAll('projects');
    var e = existing || {};

    var html =
      '<form id="emp-crud-form" class="stack-sm">' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Full Name *</label><input id="ef-name" class="cis-input" required value="' + U.escapeHtml(e.name || '') + '"/></div>' +
          '<div><label class="form-label">Email *</label><input id="ef-email" type="email" class="cis-input" required value="' + U.escapeHtml(e.email || '') + '"/></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Department *</label><input id="ef-dept-in" class="cis-input" required value="' + U.escapeHtml(e.department || 'Cloud Engineering') + '"/></div>' +
          '<div><label class="form-label">Designation</label><input id="ef-designation" class="cis-input" value="' + U.escapeHtml(e.designation || e.role || 'Senior Cloud Engineer') + '" placeholder="e.g., Senior Cloud Engineer"/></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Team</label>' +
            '<select id="ef-team-in" class="cis-select">' +
              teams.map(function (t) {
                return '<option value="' + t.id + '"' + (e.teamId === t.id ? ' selected' : '') + '>' + U.escapeHtml(t.name) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div><label class="form-label">Project</label>' +
            '<select id="ef-proj-in" class="cis-select">' +
              projects.map(function (p) {
                return '<option value="' + p.id + '"' + (e.projectId === p.id ? ' selected' : '') + '>' + U.escapeHtml(p.name) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="flex-row" style="justify-content:flex-end;margin-top:8px">' +
          '<button type="button" class="btn btn-outline btn-sm" id="ef-cancel">Cancel</button>' +
          '<button type="submit" class="btn btn-primary btn-sm">' + (existing ? 'Save Changes' : 'Add Employee') + '</button>' +
        '</div>' +
      '</form>';

    U.openModal(existing ? 'Edit Employee: ' + existing.name : 'Add New Employee', html, {
      onOpen: function () {
        document.getElementById('ef-cancel').addEventListener('click', U.closeModal);
        document.getElementById('emp-crud-form').addEventListener('submit', async function (ev) {
          ev.preventDefault();
          var teamId = document.getElementById('ef-team-in').value;
          var projId = document.getElementById('ef-proj-in').value;
          var team = teams.find(function (t) { return t.id === teamId; }) || teams[0];
          var proj = projects.find(function (p) { return p.id === projId; }) || projects[0];

          var record = existing ? Object.assign({}, existing) : {
            id: U.genId('EMP'),
            active: true,
            lifetimePoints: 0,
            annualPoints: 0,
            currentBadge: 'None',
            badgeHistory: [],
            specialistBadges: []
          };
          record.name = document.getElementById('ef-name').value.trim();
          record.email = document.getElementById('ef-email').value.trim();
          record.department = document.getElementById('ef-dept-in').value.trim();
          record.designation = document.getElementById('ef-designation').value.trim() || 'Cloud Engineer';
          record.teamId = team ? team.id : 'TM-01';
          record.teamName = team ? team.name : 'Cloud Platform Ops';
          record.projectId = proj ? proj.id : 'PRJ-01';
          record.projectName = proj ? proj.name : 'Project Horizon Cloud Migration';
          record.managerId = team ? team.managerId : null;

          await S.put('employees', record);
          U.closeModal();
          U.toast(existing ? 'Employee updated in IndexedDB.' : 'New employee saved to IndexedDB.', 'success');
          if (typeof onDone === 'function') onDone();
        });
      }
    });
  }

  function renderTeamManagement(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var teams = S.getAll('teams');
    var pastels = ['pastel-sage', 'pastel-blue', 'pastel-lavender', 'pastel-champagne', 'pastel-mint'];

    var departments = [];
    employees.forEach(function (e) {
      if (e.department && departments.indexOf(e.department) === -1) departments.push(e.department);
    });

    var filtered = employees.filter(function (e) {
      if (dirFilter.department !== 'All' && e.department !== dirFilter.department) return false;
      if (dirFilter.search) {
        var q = dirFilter.search.toLowerCase();
        var desig = e.designation || e.role || '';
        var blob = (e.id + ' ' + e.name + ' ' + e.email + ' ' + e.department + ' ' + e.teamName + ' ' + desig).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) {
      return Number(b.lifetimePoints || 0) - Number(a.lifetimePoints || 0);
    });

    container.innerHTML =
      '<div class="stack-lg">' +
        // Team Summary Cards
        '<div class="grid-kpis">' +
          teams.map(function (t, idx) {
            var members = employees.filter(function (e) { return e.teamId === t.id; });
            var totalPts = members.reduce(function (s, m) { return s + Number(m.lifetimePoints || 0); }, 0);
            return '<div class="kpi-card ' + pastels[idx % pastels.length] + '">' +
              '<div class="kpi-top"><span class="kpi-label">' + U.escapeHtml(t.name) + '</span><span class="text-sage">' + U.icon('users', 15) + '</span></div>' +
              '<div class="kpi-value">' + totalPts.toLocaleString() + ' <span style="font-size:12px;font-weight:600">pts</span></div>' +
              '<div class="kpi-sub">' + members.length + ' members &bull; ' + U.escapeHtml(t.department) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        // Toolbar with Excel Import/Export & Add Employee
        '<div class="cis-card card-pad-sm flex-between">' +
          '<div class="flex-row" style="flex:1">' +
            '<input id="tm-search" type="text" class="cis-input" style="max-width:260px" placeholder="Search name, email, ID..." value="' + U.escapeHtml(dirFilter.search) + '"/>' +
            '<select id="tm-dept" class="cis-select-inline">' +
              '<option value="All">All Departments</option>' +
              departments.map(function (d) {
                return '<option value="' + U.escapeHtml(d) + '"' + (dirFilter.department === d ? ' selected' : '') + '>' + U.escapeHtml(d) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="flex-row">' +
            '<label class="btn btn-secondary btn-sm" style="cursor:pointer">' +
              U.icon('upload', 14) + '<span>Import Excel/CSV</span>' +
              '<input type="file" id="tm-import" accept=".xlsx,.csv" class="hidden"/>' +
            '</label>' +
            '<button type="button" class="btn btn-outline btn-sm" id="tm-export-xlsx">' + U.icon('download', 14) + '<span>Export .xlsx</span></button>' +
            '<button type="button" class="btn btn-primary btn-sm" id="tm-add-btn">' + U.icon('plusCircle', 14) + '<span>Add Employee</span></button>' +
          '</div>' +
        '</div>' +

        // Employee Directory Table
        '<div class="cis-card card-pad">' +
          '<div class="flex-between" style="margin-bottom:10px">' +
            '<h3 style="font-size:14px;font-weight:700">Employee Directory (' + filtered.length + ')</h3>' +
            '<span class="text-muted" style="font-size:12px">Add, edit, delete, or import employees without losing existing records</span>' +
          '</div>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>ID</th><th>Employee</th><th>Designation</th><th>Department / Team</th><th>Badge</th><th class="text-right">Annual</th><th class="text-right">Lifetime</th><th>Status</th><th class="text-right">Actions</th></tr></thead>' +
            '<tbody>' +
              filtered.map(function (e) {
                return '<tr>' +
                  '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(e.id) + '</td>' +
                  '<td><div style="font-weight:600">' + U.escapeHtml(e.name) + '</div><div class="font-mono text-muted" style="font-size:11px">' + U.escapeHtml(e.email) + '</div></td>' +
                  '<td><span class="pill-tag pastel-blue text-blue">' + U.escapeHtml(e.designation || e.role || 'Engineer') + '</span></td>' +
                  '<td><div style="font-size:12.5px">' + U.escapeHtml(e.department) + '</div><div class="text-muted" style="font-size:11px">' + U.escapeHtml(e.teamName) + '</div></td>' +
                  '<td class="text-sage" style="font-weight:600;font-size:12px">' + U.escapeHtml(e.currentBadge || 'None') + '</td>' +
                  '<td class="text-right font-mono">' + Number(e.annualPoints || 0) + '</td>' +
                  '<td class="text-right font-mono" style="font-weight:700">' + Number(e.lifetimePoints || 0) + '</td>' +
                  '<td>' + U.statusBadge(e.active === false ? 'Inactive' : 'Active') + '</td>' +
                  '<td class="text-right"><div class="flex-row" style="justify-content:flex-end;gap:5px">' +
                    '<button type="button" class="btn btn-outline btn-xs" data-emp-edit="' + e.id + '" title="Edit">' + U.icon('edit', 12) + '</button>' +
                    '<button type="button" class="btn btn-danger btn-xs" data-emp-del="' + e.id + '" title="Delete">' + U.icon('trash', 12) + '</button>' +
                  '</div></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    document.getElementById('tm-search').addEventListener('input', function () {
      dirFilter.search = this.value;
      renderTeamManagement(container);
    });
    document.getElementById('tm-dept').addEventListener('change', function () {
      dirFilter.department = this.value;
      renderTeamManagement(container);
    });
    document.getElementById('tm-add-btn').addEventListener('click', function () {
      openEmployeeFormModal(null, function () { renderTeamManagement(container); });
    });
    document.getElementById('tm-export-xlsx').addEventListener('click', function () {
      var rows = filtered.map(function (e) {
        return {
          ID: e.id,
          Name: e.name,
          Email: e.email,
          Designation: e.designation || e.role || 'Engineer',
          Department: e.department,
          Team: e.teamName,
          Project: e.projectName,
          CurrentBadge: e.currentBadge,
          AnnualPoints: e.annualPoints,
          LifetimePoints: e.lifetimePoints,
          SpecialistBadges: (e.specialistBadges || []).join('; '),
          Status: e.active === false ? 'Inactive' : 'Active'
        };
      });
      window.CIS.excel.exportToXlsx(rows, 'CIS_Employees_Directory.xlsx', 'Employees');
    });
    document.getElementById('tm-import').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      try {
        var res = await window.CIS.excel.importRecordsFromFile(file, 'employees');
        U.toast('Imported employees: ' + res.added + ' added, ' + res.updated + ' updated (existing records preserved).', 'success');
        renderTeamManagement(container);
      } catch (err) {
        U.toast('Import error: ' + err.message, 'error');
      }
    });

    container.querySelectorAll('[data-emp-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-emp-edit');
        var emp = employees.find(function (e) { return e.id === id; });
        if (emp) openEmployeeFormModal(emp, function () { renderTeamManagement(container); });
      });
    });

    container.querySelectorAll('[data-emp-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-emp-del');
        U.confirmDialog('Delete Employee', 'Permanently delete employee ' + id + ' from IndexedDB?', 'Delete', async function () {
          await S.remove('employees', id);
          U.toast('Employee deleted.', 'info');
          renderTeamManagement(container);
        }, true);
      });
    });
  }

  window.CIS.employees = {
    renderTeamManagement: renderTeamManagement,
    openEmployeeFormModal: openEmployeeFormModal
  };
})();
