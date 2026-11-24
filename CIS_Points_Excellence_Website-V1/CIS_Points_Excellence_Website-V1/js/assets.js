/* ==========================================================================
   CIS Portal — Reusable Asset Lifecycle Module (6 Stages + Value Tracking)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var STAGES = ['Create', 'Validate', 'Standardize', 'Publish', 'Adopt', 'Measure Value'];
  var stageFilter = 'All';

  function openAssetModal(existing, onDone) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var a = existing || {};
    var defaultCreatorId = a.creatorId || (employees[0] ? employees[0].id : '');

    U.openModal(existing ? 'Edit Reusable Asset' : 'Register New Reusable Asset',
      '<form id="asset-form" class="stack-sm">' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Asset Name *</label><input id="as-name" required class="cis-input" value="' + U.escapeHtml(a.name || '') + '"/></div>' +
          '<div><label class="form-label">Category *</label><input id="as-cat" required class="cis-input" value="' + U.escapeHtml(a.category || 'Infrastructure as Code') + '"/></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Creator</label>' +
            '<select id="as-creator" class="cis-select">' +
              employees.map(function (e) {
                return '<option value="' + e.id + '"' + (defaultCreatorId === e.id ? ' selected' : '') + '>' + U.escapeHtml(e.name) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div><label class="form-label">Lifecycle Stage</label>' +
            '<select id="as-stage" class="cis-select">' +
              STAGES.map(function (st) {
                return '<option value="' + st + '"' + ((a.currentStage || 'Create') === st ? ' selected' : '') + '>' + st + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Technology Stack</label><input id="as-tech" class="cis-input" value="' + U.escapeHtml(a.technology || '') + '" placeholder="e.g., Terraform, Python, AWS"/></div>' +
          '<div><label class="form-label">Repository Link</label><input id="as-repo" class="cis-input" value="' + U.escapeHtml(a.repositoryLink || '') + '" placeholder="https://cis-git.internal/..."/></div>' +
        '</div>' +
        '<div><label class="form-label">Description &amp; Measurable Value</label><textarea id="as-val" rows="2" class="cis-textarea">' + U.escapeHtml(a.measurableValue || a.description || '') + '</textarea></div>' +
        '<div class="grid-3">' +
          '<div><label class="form-label">Adopting Teams</label><input id="as-adopt" type="number" min="0" class="cis-input" value="' + (a.adoptionCount || 0) + '"/></div>' +
          '<div><label class="form-label">Reuse Count</label><input id="as-reuse" type="number" min="0" class="cis-input" value="' + (a.reuseCount || 0) + '"/></div>' +
          '<div><label class="form-label">Est. Cost Saved (USD)</label><input id="as-cost" type="number" min="0" class="cis-input" value="' + (a.estimatedCostSavedUsd || 0) + '"/></div>' +
        '</div>' +
        '<div class="flex-row" style="justify-content:flex-end;margin-top:8px">' +
          '<button type="submit" class="btn btn-primary btn-sm">' + (existing ? 'Update Asset' : 'Save Asset') + '</button>' +
        '</div>' +
      '</form>',
      {
        onOpen: function () {
          document.getElementById('asset-form').addEventListener('submit', async function (ev) {
            ev.preventDefault();
            var creator = employees.find(function (e) { return e.id === document.getElementById('as-creator').value; }) || employees[0] || { id: 'EMP-001', name: 'CIS Engineer', teamId: 'TM-01', teamName: 'Cloud Platform Ops', projectId: 'PRJ-01', projectName: 'Project Horizon Cloud Migration' };
            var rec = existing ? Object.assign({}, existing) : {
              id: U.genId('AST'),
              creationDate: new Date().toISOString().slice(0, 10),
              adoptionTeams: [],
              estimatedTimeSavedHours: 80,
              approvalStatus: 'Pending'
            };
            rec.name = document.getElementById('as-name').value.trim();
            rec.category = document.getElementById('as-cat').value.trim();
            rec.creatorId = creator.id;
            rec.creatorName = creator.name;
            rec.teamId = creator.teamId;
            rec.teamName = creator.teamName;
            rec.projectId = creator.projectId;
            rec.projectName = creator.projectName;
            rec.currentStage = document.getElementById('as-stage').value;
            rec.technology = document.getElementById('as-tech').value.trim();
            rec.repositoryLink = document.getElementById('as-repo').value.trim();
            rec.measurableValue = document.getElementById('as-val').value.trim();
            rec.description = rec.measurableValue;
            rec.adoptionCount = Number(document.getElementById('as-adopt').value) || 0;
            rec.reuseCount = Number(document.getElementById('as-reuse').value) || 0;
            rec.estimatedCostSavedUsd = Number(document.getElementById('as-cost').value) || 0;
            if (STAGES.indexOf(rec.currentStage) >= 2) rec.approvalStatus = 'Approved';

            await S.put('assets', rec);
            U.closeModal();
            U.toast('Asset saved to IndexedDB.', 'success');
            if (typeof onDone === 'function') onDone();
          });
        }
      }
    );
  }

  var STEP_LABELS = ['Created', 'Validated', 'Standardized', 'Published', 'Adopted', 'Value Measured'];

  function renderLifecycleStepper(asset) {
    var U = window.CIS.utils;
    var stIdx = STAGES.indexOf(asset.currentStage);
    if (stIdx < 0) stIdx = 0;
    var adoptCount = Number(asset.adoptionCount || 0);
    var adoptTier = adoptCount >= 5 ? '5+ projects' : (adoptCount >= 3 ? '3+ projects' : (adoptCount >= 1 ? adoptCount + ' project' + (adoptCount === 1 ? '' : 's') : '1/3/5+ projects'));

    return '<div class="lifecycle-stepper">' +
      STEP_LABELS.map(function (label, idx) {
        var cls = idx < stIdx ? 'done' : (idx === stIdx ? 'current' : '');
        var text = idx === 4 ? (label + ' [' + adoptTier + ']') : label;
        return '<span class="lifecycle-step ' + cls + '">' + (idx < stIdx ? '✓ ' : '') + U.escapeHtml(text) + '</span>' +
          (idx < STEP_LABELS.length - 1 ? '<span class="lifecycle-arrow">→</span>' : '');
      }).join('') +
    '</div>';
  }

  function openLogReuseModal(asset, onDone) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var projects = S.getAll('projects');
    var teams = S.getAll('teams');

    U.openModal('Log Reuse on My Project — ' + asset.name,
      '<form id="log-reuse-form" class="stack-sm">' +
        '<div style="padding:10px 12px;border-radius:10px;background:#E5F2ED;border:1px solid #C6E2D7;font-size:12px;color:#2D5346">' +
          'Recording project adoption tracks distinct project reuse (1 / 3 / 5+ projects milestone) and updates verified hours saved.' +
        '</div>' +
        '<div><label class="form-label">Adopting Project *</label>' +
          '<input id="lr-proj" list="lr-proj-list" required class="cis-input" placeholder="Select or type project name..."/>' +
          '<datalist id="lr-proj-list">' +
            projects.map(function (p) { return '<option value="' + U.escapeHtml(p.name) + '"></option>'; }).join('') +
          '</datalist>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div><label class="form-label">Adopting Team / Account *</label>' +
            '<input id="lr-team" list="lr-team-list" required class="cis-input" placeholder="e.g., Cloud Security Operations"/>' +
            '<datalist id="lr-team-list">' +
              teams.map(function (t) { return '<option value="' + U.escapeHtml(t.name) + '"></option>'; }).join('') +
            '</datalist>' +
          '</div>' +
          '<div><label class="form-label">Est. Hours Saved (This Adoption)</label><input id="lr-hrs" type="number" min="0" class="cis-input" value="24"/></div>' +
        '</div>' +
        '<div><label class="form-label">Adoption Notes / Evidence Link</label><input id="lr-notes" class="cis-input" placeholder="e.g., Deployed in prod pipeline; ticket/repo link"/></div>' +
        '<div class="flex-row" style="justify-content:flex-end;margin-top:8px">' +
          '<button type="submit" class="btn btn-primary btn-sm">' + U.icon('checkCircle', 14) + '<span>Confirm Project Reuse</span></button>' +
        '</div>' +
      '</form>',
      {
        small: true,
        onOpen: function () {
          document.getElementById('log-reuse-form').addEventListener('submit', async function (ev) {
            ev.preventDefault();
            var projName = document.getElementById('lr-proj').value.trim();
            var teamName = document.getElementById('lr-team').value.trim();
            var hrs = Number(document.getElementById('lr-hrs').value) || 0;
            if (!projName || !teamName) return;

            asset.reuseCount = Number(asset.reuseCount || 0) + 1;
            asset.estimatedTimeSavedHours = Number(asset.estimatedTimeSavedHours || 0) + hrs;
            asset.adoptionTeams = Array.isArray(asset.adoptionTeams) ? asset.adoptionTeams : [];
            asset.adoptionProjects = Array.isArray(asset.adoptionProjects) ? asset.adoptionProjects : [];

            var isNewProject = asset.adoptionProjects.indexOf(projName) === -1;
            if (isNewProject) {
              asset.adoptionProjects.push(projName);
              asset.adoptionCount = Math.max(Number(asset.adoptionCount || 0) + 1, asset.adoptionProjects.length);
            }
            if (asset.adoptionTeams.indexOf(teamName) === -1) {
              asset.adoptionTeams.push(teamName);
            }
            if (asset.currentStage === 'Publish') {
              asset.currentStage = 'Adopt';
            }

            await S.put('assets', asset);
            U.closeModal();
            U.toast('Logged reuse on "' + projName + '" (' + asset.adoptionCount + ' adopting project' + (asset.adoptionCount === 1 ? '' : 's') + ', ' + asset.reuseCount + ' total reuses).', 'success');
            if (typeof onDone === 'function') onDone();
          });
        }
      }
    );
  }

  function renderAssetLifecycle(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var assets = S.getAll('assets');
    var filtered = assets.filter(function (a) {
      return stageFilter === 'All' || a.currentStage === stageFilter;
    });

    var adoptedCount = assets.filter(function (a) { return Number(a.adoptionCount || 0) > 0; }).length;
    var totalReuse = assets.reduce(function (s, a) { return s + Number(a.reuseCount || 0); }, 0);
    var totalSavings = assets.reduce(function (s, a) { return s + Number(a.estimatedCostSavedUsd || 0); }, 0);

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div class="grid-kpis-4">' +
          '<div class="kpi-card pastel-mint"><div class="kpi-top"><span class="kpi-label">Total Reusable Assets</span><span class="text-mint">' + U.icon('layers', 16) + '</span></div><div class="kpi-value">' + assets.length + '</div></div>' +
          '<div class="kpi-card pastel-sage"><div class="kpi-top"><span class="kpi-label">Adopted Across Teams</span><span class="text-sage">' + U.icon('share', 16) + '</span></div><div class="kpi-value">' + adoptedCount + '</div></div>' +
          '<div class="kpi-card pastel-blue"><div class="kpi-top"><span class="kpi-label">Verified Reuse Count</span><span class="text-blue">' + U.icon('sparkles', 16) + '</span></div><div class="kpi-value">' + totalReuse + '</div></div>' +
          '<div class="kpi-card pastel-champagne"><div class="kpi-top"><span class="kpi-label">Est. Value Delivered</span><span class="text-champagne">' + U.icon('trophy', 16) + '</span></div><div class="kpi-value">$' + totalSavings.toLocaleString() + '</div></div>' +
        '</div>' +

        '<div class="cis-card card-pad-sm flex-between">' +
          '<div class="flex-row">' +
            '<label class="text-muted" style="font-size:12px">Lifecycle Stage:</label>' +
            '<select id="ast-stage-sel" class="cis-select-inline">' +
              '<option value="All">All 6 Stages</option>' +
              STAGES.map(function (st) {
                return '<option value="' + st + '"' + (stageFilter === st ? ' selected' : '') + '>' + st + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="flex-row">' +
            '<label class="btn btn-secondary btn-sm" style="cursor:pointer">' +
              U.icon('upload', 14) + '<span>Import Excel/CSV</span>' +
              '<input type="file" id="ast-import" accept=".xlsx,.csv" class="hidden"/>' +
            '</label>' +
            '<button type="button" class="btn btn-outline btn-sm" id="ast-export">' + U.icon('download', 14) + '<span>Export .xlsx</span></button>' +
            '<button type="button" class="btn btn-primary btn-sm" id="ast-add">' + U.icon('plusCircle', 14) + '<span>Register Asset</span></button>' +
          '</div>' +
        '</div>' +

        '<div class="cis-card card-pad">' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>Asset &amp; 6-Step Lifecycle</th><th>Creator / Team</th><th class="text-right">Adoptions</th><th class="text-right">Reuses</th><th class="text-right">Est. Savings</th><th class="text-right">Actions</th></tr></thead>' +
            '<tbody>' +
              filtered.map(function (a) {
                var stIdx = STAGES.indexOf(a.currentStage);
                var canAdvance = stIdx >= 0 && stIdx < STAGES.length - 1;
                return '<tr>' +
                  '<td>' +
                    '<div style="font-weight:600">' + U.escapeHtml(a.name) + ' ' + U.statusBadge(a.currentStage) + '</div>' +
                    '<div class="text-muted" style="font-size:11.5px;margin-top:2px">' + U.escapeHtml(a.category) + (a.technology ? ' &bull; ' + U.escapeHtml(a.technology) : '') + '</div>' +
                    renderLifecycleStepper(a) +
                  '</td>' +
                  '<td><div>' + U.escapeHtml(a.creatorName) + '</div><div class="text-muted" style="font-size:11px">' + U.escapeHtml(a.teamName) + '</div></td>' +
                  '<td class="text-right font-mono">' + Number(a.adoptionCount || 0) + '</td>' +
                  '<td class="text-right font-mono" style="font-weight:700">' + Number(a.reuseCount || 0) + '</td>' +
                  '<td class="text-right font-mono">$' + Number(a.estimatedCostSavedUsd || 0).toLocaleString() + '</td>' +
                  '<td class="text-right"><div class="flex-row" style="justify-content:flex-end;gap:5px;flex-wrap:wrap">' +
                    '<button type="button" class="btn btn-secondary btn-xs" data-ast-log-reuse="' + a.id + '">' + U.icon('share', 12) + '<span>Log Reuse on My Project</span></button>' +
                    (canAdvance ? '<button type="button" class="btn btn-success btn-xs" data-ast-adv="' + a.id + '">Advance →</button>' : '') +
                    '<button type="button" class="btn btn-outline btn-xs" data-ast-edit="' + a.id + '">' + U.icon('edit', 12) + '</button>' +
                    '<button type="button" class="btn btn-danger btn-xs" data-ast-del="' + a.id + '">' + U.icon('trash', 12) + '</button>' +
                  '</div></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    document.getElementById('ast-stage-sel').addEventListener('change', function () {
      stageFilter = this.value;
      renderAssetLifecycle(container);
    });
    document.getElementById('ast-add').addEventListener('click', function () {
      openAssetModal(null, function () { renderAssetLifecycle(container); });
    });
    document.getElementById('ast-export').addEventListener('click', function () {
      window.CIS.excel.exportToXlsx(filtered.map(function (a) {
        return {
          ID: a.id,
          Name: a.name,
          Category: a.category,
          Creator: a.creatorName,
          Team: a.teamName,
          Technology: a.technology,
          Stage: a.currentStage,
          AdoptionCount: a.adoptionCount,
          ReuseCount: a.reuseCount,
          TimeSavedHours: a.estimatedTimeSavedHours,
          CostSavedUSD: a.estimatedCostSavedUsd,
          MeasurableValue: a.measurableValue
        };
      }), 'CIS_Reusable_Assets.xlsx', 'Assets');
    });
    document.getElementById('ast-import').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      try {
        var res = await window.CIS.excel.importRecordsFromFile(file, 'assets');
        U.toast('Imported assets: ' + res.added + ' added, ' + res.updated + ' updated.', 'success');
        renderAssetLifecycle(container);
      } catch (err) {
        U.toast('Import error: ' + err.message, 'error');
      }
    });

    container.querySelectorAll('[data-ast-adv]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var a = assets.find(function (x) { return x.id === this.getAttribute('data-ast-adv'); }.bind(this));
        if (!a) return;
        var next = STAGES[STAGES.indexOf(a.currentStage) + 1];
        if (!next) return;
        a.currentStage = next;
        if (next === 'Standardize' || next === 'Publish' || next === 'Adopt' || next === 'Measure Value') a.approvalStatus = 'Approved';
        await S.put('assets', a);
        U.toast('Advanced "' + a.name + '" to ' + next + '.', 'success');
        renderAssetLifecycle(container);
      });
    });

    container.querySelectorAll('[data-ast-log-reuse]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = assets.find(function (x) { return x.id === this.getAttribute('data-ast-log-reuse'); }.bind(this));
        if (a) openLogReuseModal(a, function () { renderAssetLifecycle(container); });
      });
    });

    container.querySelectorAll('[data-ast-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = assets.find(function (x) { return x.id === this.getAttribute('data-ast-edit'); }.bind(this));
        if (a) openAssetModal(a, function () { renderAssetLifecycle(container); });
      });
    });

    container.querySelectorAll('[data-ast-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-ast-del');
        U.confirmDialog('Delete Asset', 'Remove asset ' + id + ' from IndexedDB?', 'Delete', async function () {
          await S.remove('assets', id);
          U.toast('Asset removed.', 'info');
          renderAssetLifecycle(container);
        }, true);
      });
    });
  }

  window.CIS.assets = {
    renderAssetLifecycle: renderAssetLifecycle
  };
})();
