/* ==========================================================================
   CIS Portal — Points Master, Excellence Badges, Specialist Badges & Recognition
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var pmFilter = { search: '', category: 'All' };

  // =========================================================================
  // 1. Points Master (9 Categories / 126 Activities + Multipliers + Worked Example)
  // =========================================================================
  function renderPointsMaster(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var activities = S.getAll('points_master');
    var settings = S.getSettings();
    var multipliers = settings.multipliers || [];

    var categories = [];
    activities.forEach(function (a) {
      if (!categories.some(function (c) { return c.id === a.categoryId; })) {
        categories.push({ id: a.categoryId, name: a.categoryName });
      }
    });

    var filtered = activities.filter(function (a) {
      if (pmFilter.category !== 'All' && a.categoryId !== pmFilter.category) return false;
      if (pmFilter.search) {
        var q = pmFilter.search.toLowerCase();
        var blob = (a.id + ' ' + a.name + ' ' + a.categoryName + ' ' + a.evidenceRequirements).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    var workedMilestones = [
      { label: 'Working utility', points: 25 },
      { label: 'Documented / package-ready accelerator', points: 35 },
      { label: 'Technical validation', points: 15 },
      { label: 'Repository publication', points: 10 },
      { label: 'First reuse by another project', points: 15 },
      { label: 'Reuse by three distinct projects', points: 25 }
    ];
    var workedTotal = workedMilestones.reduce(function (sum, item) { return sum + item.points; }, 0);

    container.innerHTML =
      '<div class="stack-lg">' +
        // Worked Example & Multiplier Governance Cards
        '<div class="grid-2">' +
          '<div class="cis-card card-pad pastel-champagne">' +
            '<div class="pill-tag pastel-ivory text-champagne" style="margin-bottom:8px">Worked Example — Points Calculation</div>' +
            '<h3 style="font-size:15px;font-weight:700">Cloud Migration Automation Utility (' + workedTotal + ' Base Points)</h3>' +
            '<div style="margin-top:10px;background:rgba(255,255,255,0.72);border:1px solid rgba(139,109,59,0.18);border-radius:10px;overflow:hidden">' +
              '<table style="width:100%;border-collapse:collapse;font-size:12px;color:#42534B">' +
                '<thead>' +
                  '<tr style="background:rgba(247,245,239,0.9);border-bottom:1px solid rgba(139,109,59,0.16)">' +
                    '<th style="text-align:left;padding:6px 10px;font-size:11px;font-weight:700;color:#6B5022">Contribution / Milestone</th>' +
                    '<th style="text-align:right;padding:6px 10px;font-size:11px;font-weight:700;color:#6B5022;white-space:nowrap">Base Points</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  workedMilestones.map(function (m) {
                    return '<tr style="border-bottom:1px solid rgba(139,109,59,0.1)">' +
                      '<td style="padding:5px 10px">' + U.escapeHtml(m.label) + '</td>' +
                      '<td class="font-mono" style="text-align:right;padding:5px 10px;font-weight:600">' + m.points + '</td>' +
                    '</tr>';
                  }).join('') +
                  '<tr style="background:rgba(245,235,215,0.65)">' +
                    '<td style="padding:7px 10px;font-weight:700;color:#42534B">Total Base Points: ' + workedTotal + '</td>' +
                    '<td class="font-mono" style="text-align:right;padding:7px 10px;font-weight:800;color:#42534B">' + workedTotal + '</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
            '</div>' +
            '<div style="margin-top:10px;padding:7px 10px;border-radius:8px;background:rgba(255,255,255,0.65);border:1px solid rgba(139,109,59,0.16);font-size:11.5px;color:#42534B">' +
              '<strong style="color:#6B5022">Intended Lifecycle:</strong> Create → Validate → Standardize → Publish → Adopt → Measure Value' +
            '</div>' +
            '<p class="text-secondary" style="font-size:11.5px;margin-top:8px;line-height:1.5;color:#55665E">' +
              'If a specific milestone qualifies for a 1.5× multiplier, apply it only to that milestone, with evidence and approval. Do not repeatedly multiply all milestones for the same benefit.' +
            '</p>' +
          '</div>' +
          '<div class="cis-card card-pad pastel-blue">' +
            '<div class="pill-tag pastel-ivory text-blue" style="margin-bottom:8px">Non-Stacking Impact Multipliers (Section 5)</div>' +
            '<h3 style="font-size:15px;font-weight:700">Single Highest Applicable Multiplier Only</h3>' +
            '<div class="stack-sm" style="margin-top:10px">' +
              multipliers.map(function (m) {
                var val = Number(m.value || 1);
                var fallbackGuidance = val >= 2.0
                  ? 'Practice-wide or enterprise transformation, verified major revenue/cost savings, or 5+ project reuse.'
                  : (val >= 1.5
                    ? 'Multi-project or account-wide reuse (3+ projects), major SLA uplift, or key presales win enablement.'
                    : (val >= 1.2
                      ? 'Measurable team/project efficiency gain, reduced MTTR, or verified 1–2 project reuse.'
                      : 'Standard single-project or individual contribution meeting verified framework evidence criteria.'));
                var gText = m.guidance || fallbackGuidance;
                return '<div style="font-size:12px;padding:7px 10px;background:rgba(255,255,255,0.75);border-radius:8px">' +
                  '<div class="flex-between">' +
                    '<span><strong class="font-mono">' + val.toFixed(1) + 'x</strong> — ' + U.escapeHtml(m.label) + '</span>' +
                    (m.requiresLeadershipApproval ? '<span class="status-badge status-lavender">Leadership Sign-off</span>' : '<span class="status-badge status-mint">Standard</span>') +
                  '</div>' +
                  '<div class="text-secondary" style="font-size:11px;margin-top:3px">' + U.escapeHtml(gText) + '</div>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +

        // Toolbar
        '<div class="cis-card card-pad-sm flex-between">' +
          '<div class="flex-row" style="flex:1">' +
            '<input id="pm-search" type="text" class="cis-input" style="max-width:260px" placeholder="Search activities or evidence..." value="' + U.escapeHtml(pmFilter.search) + '"/>' +
            '<select id="pm-cat" class="cis-select-inline">' +
              '<option value="All">All 9 Categories (' + activities.length + ')</option>' +
              categories.map(function (c) {
                return '<option value="' + c.id + '"' + (pmFilter.category === c.id ? ' selected' : '') + '>' + U.escapeHtml(c.id + ' — ' + c.name) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="flex-row">' +
            '<label class="btn btn-secondary btn-sm" style="cursor:pointer">' +
              U.icon('upload', 14) + '<span>Import Excel/CSV</span>' +
              '<input type="file" id="pm-import" accept=".xlsx,.csv" class="hidden"/>' +
            '</label>' +
            '<button type="button" class="btn btn-outline btn-sm" id="pm-export-xlsx">' + U.icon('download', 14) + '<span>Export .xlsx</span></button>' +
            '<button type="button" class="btn btn-primary btn-sm" id="pm-add-btn">' + U.icon('plusCircle', 14) + '<span>Add Activity</span></button>' +
          '</div>' +
        '</div>' +

        // Table
        '<div class="cis-card card-pad">' +
          '<h3 style="font-size:14px;font-weight:700;margin-bottom:10px">Points Master Catalog (' + filtered.length + ' activities &bull; Base Points 5–50 pts)</h3>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>ID</th><th>Category</th><th>Activity</th><th>Validation Track &amp; Workflow</th><th class="text-right">Base Pts</th><th class="text-right">Actions</th></tr></thead>' +
            '<tbody>' +
              filtered.map(function (a) {
                var track = a.reviewTrack || (a.approvalRequirement === 'Manager Only' ? 'Manager / Asset-Owner Validation' : 'Technical Review / CIS Contribution Council');
                var isCouncil = track.indexOf('Council') !== -1;
                return '<tr>' +
                  '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(a.id) + '</td>' +
                  '<td style="font-size:12px;font-weight:600">' + U.escapeHtml(a.categoryName) + '</td>' +
                  '<td><div style="font-weight:600">' + U.escapeHtml(a.name) + '</div><div class="text-muted" style="font-size:11px">Evidence: ' + U.escapeHtml(a.evidenceRequirements) + '</div></td>' +
                  '<td><div><span class="status-badge ' + (isCouncil ? 'status-lavender' : 'status-sage') + '">' + U.escapeHtml(track) + '</span></div><div style="font-size:11px;color:#68766F;margin-top:3px">' + U.escapeHtml(a.approvalRequirement) + '</div></td>' +
                  '<td class="text-right font-mono" style="font-weight:700">' + a.defaultPoints + '</td>' +
                  '<td class="text-right"><div class="flex-row" style="justify-content:flex-end;gap:5px">' +
                    '<button type="button" class="btn btn-outline btn-xs" data-act-edit="' + a.id + '">' + U.icon('edit', 12) + '</button>' +
                    '<button type="button" class="btn btn-danger btn-xs" data-act-del="' + a.id + '">' + U.icon('trash', 12) + '</button>' +
                  '</div></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    document.getElementById('pm-search').addEventListener('input', function () {
      pmFilter.search = this.value;
      renderPointsMaster(container);
    });
    document.getElementById('pm-cat').addEventListener('change', function () {
      pmFilter.category = this.value;
      renderPointsMaster(container);
    });
    document.getElementById('pm-export-xlsx').addEventListener('click', function () {
      window.CIS.excel.exportToXlsx(filtered.map(function (a) {
        return {
          ID: a.id,
          CategoryID: a.categoryId,
          Category: a.categoryName,
          Activity: a.name,
          DefaultPoints: a.defaultPoints,
          ApprovalRequirement: a.approvalRequirement,
          ReviewTrack: a.reviewTrack || (a.approvalRequirement === 'Manager Only' ? 'Manager / Asset-Owner Validation' : 'Technical Review / CIS Contribution Council'),
          EvidenceRequirements: a.evidenceRequirements
        };
      }), 'CIS_Points_Master.xlsx', 'PointsMaster');
    });
    document.getElementById('pm-import').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      try {
        var res = await window.CIS.excel.importRecordsFromFile(file, 'points_master');
        U.toast('Imported activities: ' + res.added + ' added, ' + res.updated + ' updated.', 'success');
        renderPointsMaster(container);
      } catch (err) {
        U.toast('Import failed: ' + err.message, 'error');
      }
    });

    function openActivityModal(existing) {
      var a = existing || {};
      U.openModal(existing ? 'Edit Activity' : 'Add Points Master Activity',
        '<form id="act-form" class="stack-sm">' +
          '<div class="grid-2">' +
            '<div><label class="form-label">Category</label>' +
              '<select id="af-cat" class="cis-select">' +
                categories.map(function (c) {
                  return '<option value="' + c.id + '"' + (a.categoryId === c.id ? ' selected' : '') + '>' + U.escapeHtml(c.id + ' — ' + c.name) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div><label class="form-label">Base Points (5–50) *</label><input id="af-pts" type="number" min="5" max="50" required class="cis-input" value="' + (a.defaultPoints || 15) + '"/></div>' +
          '</div>' +
          '<div><label class="form-label">Activity Name *</label><input id="af-name" required class="cis-input" value="' + U.escapeHtml(a.name || '') + '"/></div>' +
          '<div><label class="form-label">Approval Requirement</label>' +
            '<select id="af-apr" class="cis-select">' +
              ['Manager Only', 'Manager + Technical', 'Manager + Technical + Leadership'].map(function (opt) {
                return '<option value="' + opt + '"' + (a.approvalRequirement === opt ? ' selected' : '') + '>' + opt + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div><label class="form-label">Evidence Requirements</label><input id="af-ev" class="cis-input" value="' + U.escapeHtml(a.evidenceRequirements || 'Supporting artifact or ticket link') + '"/></div>' +
          '<div class="flex-row" style="justify-content:flex-end"><button type="submit" class="btn btn-primary btn-sm">Save Activity</button></div>' +
        '</form>',
        {
          onOpen: function () {
            document.getElementById('act-form').addEventListener('submit', async function (ev) {
              ev.preventDefault();
              var catId = document.getElementById('af-cat').value;
              var catObj = categories.find(function (c) { return c.id === catId; }) || categories[0];
              var rec = existing ? Object.assign({}, existing) : { id: U.genId('ACT'), active: true };
              rec.categoryId = catObj.id;
              rec.categoryName = catObj.name;
              rec.name = document.getElementById('af-name').value.trim();
              rec.description = 'Activity under ' + catObj.name + ': ' + rec.name;
              rec.defaultPoints = Number(document.getElementById('af-pts').value) || 10;
              rec.approvalRequirement = document.getElementById('af-apr').value;
              rec.reviewTrack = rec.approvalRequirement === 'Manager Only' ? 'Manager / Asset-Owner Validation' : 'Technical Review / CIS Contribution Council';
              rec.evidenceRequirements = document.getElementById('af-ev').value.trim();
              await S.put('points_master', rec);
              U.closeModal();
              U.toast('Activity saved to Points Master.', 'success');
              renderPointsMaster(container);
            });
          }
        }
      );
    }

    document.getElementById('pm-add-btn').addEventListener('click', function () { openActivityModal(null); });
    container.querySelectorAll('[data-act-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var found = activities.find(function (x) { return x.id === this.getAttribute('data-act-edit'); }.bind(this));
        if (found) openActivityModal(found);
      });
    });
    container.querySelectorAll('[data-act-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = this.getAttribute('data-act-del');
        U.confirmDialog('Delete Activity', 'Remove activity ' + id + ' from Points Master?', 'Delete', async function () {
          await S.remove('points_master', id);
          U.toast('Activity removed.', 'info');
          renderPointsMaster(container);
        }, true);
      });
    });
  }

  // =========================================================================
  // 2. Excellence Badges (7 Cumulative Lifetime Tiers + Section 11.3 Indicative Ranges)
  // =========================================================================
  function getFallbackIndicativeReward(minPoints) {
    var pts = Number(minPoints || 0);
    if (pts >= 1000) return '₹1,00,000–₹1,50,000 (Indicative)';
    if (pts >= 750) return '₹40,000–₹60,000 (Indicative)';
    if (pts >= 500) return '₹15,000–₹25,000 (Indicative)';
    if (pts >= 300) return '₹7,500–₹10,000 (Indicative)';
    if (pts >= 150) return '₹3,000–₹5,000 (Indicative)';
    if (pts >= 75) return '₹1,000–₹2,000 (Indicative)';
    return 'Certificate / Non-Cash Recognition';
  }

  function renderExcellenceBadges(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var badges = S.getAll('badges').sort(function (a, b) { return a.minPoints - b.minPoints; });
    var employees = S.getAll('employees').sort(function (a, b) { return Number(b.lifetimePoints || 0) - Number(a.lifetimePoints || 0); });
    var bgs = ['pastel-champagne', 'pastel-blue', 'pastel-champagne', 'pastel-blue', 'pastel-lavender', 'pastel-mint', 'pastel-blush'];

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div style="padding:12px 16px;border-radius:12px;background:#F5EBD7;border:1px solid #E3D0AE;font-size:12.5px;color:#6B5022">' +
          '<strong>Policy Governance Disclaimer (Section 11.3):</strong> Indicative proposals only — subject to HR, Finance, and CIS leadership approval. Cumulative Lifetime Excellence Badges (25 to 1,000+ pts) track sustained impact; indicative reward ranges shown below are draft framework references.' +
        '</div>' +

        '<div class="grid-kpis-4">' +
          badges.map(function (b, idx) {
            var count = employees.filter(function (e) { return e.currentBadge === b.name; }).length;
            var rewardRange = b.indicativeReward || getFallbackIndicativeReward(b.minPoints);
            return '<div class="tier-card ' + bgs[idx % bgs.length] + '">' +
              '<div>' +
                '<div class="flex-between">' +
                  '<span style="color:' + U.escapeHtml(b.color) + '">' + U.icon('award', 22) + '</span>' +
                  '<span class="font-mono" style="font-size:12px;font-weight:700;color:' + U.escapeHtml(b.color) + '">' + b.minPoints + '+ pts</span>' +
                '</div>' +
                '<h3 style="font-size:15px;font-weight:700;margin-top:10px">' + U.escapeHtml(b.name) + '</h3>' +
                '<p class="text-secondary" style="font-size:12px;margin-top:4px">' + U.escapeHtml(b.description) + '</p>' +
                '<div style="margin-top:8px;padding:6px 9px;border-radius:8px;background:rgba(255,255,255,0.68);border:1px solid rgba(66,83,75,0.1);font-size:11px;color:#42534B">' +
                  '<span class="text-muted" style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.03em">Indicative Reward (Sec 11.3)</span>' +
                  '<strong>' + U.escapeHtml(rewardRange) + '</strong>' +
                '</div>' +
              '</div>' +
              '<div class="flex-between" style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(66,83,75,0.1)">' +
                '<span style="font-size:11.5px;font-weight:600">' + count + ' current holder' + (count === 1 ? '' : 's') + '</span>' +
                '<button type="button" class="btn btn-outline btn-xs" data-edit-bdg="' + b.id + '">Edit</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div class="cis-card card-pad">' +
          '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Employee Lifetime Badge Standings</h3>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>Employee</th><th>Department</th><th>Current Badge</th><th class="text-right">Lifetime Points</th><th class="text-right">Annual Points</th><th>Next Milestone</th></tr></thead>' +
            '<tbody>' +
              employees.map(function (e) {
                var next = badges.find(function (b) { return b.minPoints > (e.lifetimePoints || 0); });
                return '<tr>' +
                  '<td style="font-weight:600">' + U.escapeHtml(e.name) + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(e.department) + '</td>' +
                  '<td><span class="status-badge status-champagne">' + U.escapeHtml(e.currentBadge || 'None') + '</span></td>' +
                  '<td class="text-right font-mono" style="font-weight:700">' + Number(e.lifetimePoints || 0) + '</td>' +
                  '<td class="text-right font-mono text-secondary">' + Number(e.annualPoints || 0) + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + (next ? (next.name + ' (' + (next.minPoints - (e.lifetimePoints || 0)) + ' pts away)') : 'Pinnacle Tier Achieved') + '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    container.querySelectorAll('[data-edit-bdg]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var b = badges.find(function (x) { return x.id === this.getAttribute('data-edit-bdg'); }.bind(this));
        if (!b) return;
        var currReward = b.indicativeReward || getFallbackIndicativeReward(b.minPoints);
        U.openModal('Edit Badge Tier: ' + b.name,
          '<form id="bdg-edit-form" class="stack-sm">' +
            '<div><label class="form-label">Badge Name</label><input id="bf-name" class="cis-input" required value="' + U.escapeHtml(b.name) + '"/></div>' +
            '<div><label class="form-label">Minimum Lifetime Points</label><input id="bf-min" type="number" min="1" class="cis-input" required value="' + b.minPoints + '"/></div>' +
            '<div><label class="form-label">Indicative Reward Range (Sec 11.3)</label><input id="bf-reward" class="cis-input" value="' + U.escapeHtml(currReward) + '"/></div>' +
            '<div><label class="form-label">Description</label><textarea id="bf-desc" rows="2" class="cis-textarea">' + U.escapeHtml(b.description) + '</textarea></div>' +
            '<div class="flex-row" style="justify-content:flex-end"><button type="submit" class="btn btn-primary btn-sm">Update Tier</button></div>' +
          '</form>',
          {
            small: true,
            onOpen: function () {
              document.getElementById('bdg-edit-form').addEventListener('submit', async function (ev) {
                ev.preventDefault();
                b.name = document.getElementById('bf-name').value.trim();
                b.minPoints = Number(document.getElementById('bf-min').value) || b.minPoints;
                b.indicativeReward = document.getElementById('bf-reward').value.trim();
                b.description = document.getElementById('bf-desc').value.trim();
                await S.put('badges', b);
                await S.recalculateAllPointsAndBadges();
                U.closeModal();
                U.toast('Badge threshold updated and standings recalculated.', 'success');
                renderExcellenceBadges(container);
              });
            }
          }
        );
      });
    });
  }

  // =========================================================================
  // 3. Specialist Badges (12 Honors — Nominated / Reviewer-Awarded Only)
  // =========================================================================
  function renderSpecialistBadges(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var badges = S.getAll('specialist_badges');
    var nominations = S.getAll('specialist_nominations').sort(function (a, b) {
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    var employees = S.getAll('employees');

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div class="cis-card card-pad-sm flex-between">' +
          '<div>' +
            '<div class="flex-row" style="gap:8px;flex-wrap:wrap">' +
              '<h3 style="font-size:15px;font-weight:700">12 CIS Specialist Honors</h3>' +
              '<span class="status-badge status-lavender">Nominated / Reviewer-Awarded</span>' +
            '</div>' +
            '<p class="text-secondary" style="font-size:12px;margin-top:3px">Specialist Badges are <strong>not auto-unlocked by points</strong>. They require peer/manager nomination, evidence verification, and CIS Reviewer / Council endorsement (Section 7).</p>' +
          '</div>' +
          '<button type="button" class="btn btn-lavender btn-sm" id="sb-nom-btn">' + U.icon('star', 14) + '<span>Nominate Employee</span></button>' +
        '</div>' +

        '<div class="grid-kpis-4">' +
          badges.map(function (b) {
            var holders = employees.filter(function (e) {
              return Array.isArray(e.specialistBadges) && e.specialistBadges.indexOf(b.name) !== -1;
            });
            var awardType = b.awardType || 'Nominated / Reviewer-Awarded';
            return '<div class="tier-card pastel-lavender">' +
              '<div>' +
                '<div class="flex-between">' +
                  '<span class="text-lavender">' + U.icon('star', 18) + '</span>' +
                  '<span class="pill-tag pastel-ivory text-lavender" style="font-size:10px">' + U.escapeHtml(awardType) + '</span>' +
                '</div>' +
                '<h4 style="font-size:14px;font-weight:700;margin-top:8px">' + U.escapeHtml(b.name) + '</h4>' +
                '<p class="text-secondary" style="font-size:12px;margin-top:4px">' + U.escapeHtml(b.description) + '</p>' +
                '<p class="text-muted" style="font-size:11px;margin-top:6px"><strong>Criteria:</strong> ' + U.escapeHtml(b.criteria) + '</p>' +
              '</div>' +
              '<div class="flex-between" style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(109,90,133,0.15);font-size:11.5px;color:#4D3B63;font-weight:600">' +
                '<span>' + holders.length + ' holder' + (holders.length === 1 ? '' : 's') + '</span>' +
                '<span class="font-mono text-muted" style="font-size:10.5px">' + U.escapeHtml(b.id) + '</span>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div class="cis-card card-pad">' +
          '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Specialist Badge Nominations (' + nominations.length + ')</h3>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>Badge</th><th>Nominee</th><th>Nominated By</th><th>Achievements &amp; Evidence</th><th>Status</th><th class="text-right">Review Actions</th></tr></thead>' +
            '<tbody>' +
              nominations.map(function (n) {
                var canEndorse = n.status === 'Pending Review';
                var canApprove = n.status === 'Reviewer Endorsed' || n.status === 'Pending Review';
                return '<tr>' +
                  '<td style="font-weight:600">' + U.escapeHtml(n.badgeName) + '</td>' +
                  '<td>' + U.escapeHtml(n.nomineeName) + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(n.nominatorName) + '</td>' +
                  '<td><div style="font-size:12.5px">' + U.escapeHtml(n.achievements) + '</div><div class="font-mono text-muted" style="font-size:11px">' + U.escapeHtml(n.evidence) + '</div></td>' +
                  '<td>' + U.statusBadge(n.status) + '</td>' +
                  '<td class="text-right"><div class="flex-row" style="justify-content:flex-end;gap:5px">' +
                    (canEndorse ? '<button type="button" class="btn btn-secondary btn-xs" data-nom-act="endorse" data-nid="' + n.id + '">Endorse</button>' : '') +
                    (canApprove ? '<button type="button" class="btn btn-success btn-xs" data-nom-act="approve" data-nid="' + n.id + '">Approve</button>' : '') +
                    ((canEndorse || canApprove) ? '<button type="button" class="btn btn-danger btn-xs" data-nom-act="reject" data-nid="' + n.id + '">Reject</button>' : '') +
                  '</div></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    document.getElementById('sb-nom-btn').addEventListener('click', function () {
      U.openModal('Nominate for Specialist Badge',
        '<form id="nom-form" class="stack-sm">' +
          '<div class="grid-2">' +
            '<div><label class="form-label">Specialist Badge</label>' +
              '<select id="nf-badge" class="cis-select">' +
                badges.map(function (b) { return '<option value="' + b.id + '">' + U.escapeHtml(b.name) + '</option>'; }).join('') +
              '</select>' +
            '</div>' +
            '<div><label class="form-label">Nominee</label>' +
              '<select id="nf-nominee" class="cis-select">' +
                employees.map(function (e) { return '<option value="' + e.id + '">' + U.escapeHtml(e.name) + ' (' + U.escapeHtml(e.department) + ')</option>'; }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div><label class="form-label">Nominated By</label>' +
            '<select id="nf-nominator" class="cis-select">' +
              employees.map(function (e) { return '<option value="' + e.id + '">' + U.escapeHtml(e.name) + ' (' + U.escapeHtml(e.department) + ')</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div><label class="form-label">Key Achievements *</label><textarea id="nf-ach" rows="3" required class="cis-textarea" placeholder="Summarize measurable impact matching badge criteria..."></textarea></div>' +
          '<div><label class="form-label">Evidence Link *</label><input id="nf-ev" required class="cis-input" placeholder="https://cis-repo.internal/..."/></div>' +
          '<div class="flex-row" style="justify-content:flex-end"><button type="submit" class="btn btn-lavender btn-sm">Submit Nomination</button></div>' +
        '</form>',
        {
          onOpen: function () {
            document.getElementById('nom-form').addEventListener('submit', async function (ev) {
              ev.preventDefault();
              var bObj = badges.find(function (b) { return b.id === document.getElementById('nf-badge').value; });
              var emp = employees.find(function (e) { return e.id === document.getElementById('nf-nominee').value; });
              var nomBy = employees.find(function (e) { return e.id === document.getElementById('nf-nominator').value; }) || { id: 'CIS', name: 'CIS Panel' };
              var nom = {
                id: U.genId('NOM'),
                badgeId: bObj.id,
                badgeName: bObj.name,
                nomineeId: emp.id,
                nomineeName: emp.name,
                nominatorId: nomBy.id,
                nominatorName: nomBy.name,
                achievements: document.getElementById('nf-ach').value.trim(),
                evidence: document.getElementById('nf-ev').value.trim(),
                status: 'Pending Review',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              await S.put('specialist_nominations', nom);
              U.closeModal();
              U.toast('Nomination submitted for review!', 'success');
              renderSpecialistBadges(container);
            });
          }
        }
      );
    });

    container.querySelectorAll('[data-nom-act]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var act = this.getAttribute('data-nom-act');
        var nid = this.getAttribute('data-nid');
        var nom = nominations.find(function (n) { return n.id === nid; });
        if (!nom) return;

        if (act === 'endorse') {
          nom.status = 'Reviewer Endorsed';
          nom.reviewerId = 'CIS-PANEL';
          nom.reviewerName = 'CIS Technical Panel';
        } else if (act === 'approve') {
          nom.status = 'Approved';
          nom.leaderId = 'CIS-COUNCIL';
          nom.leaderName = 'CIS Practice Leadership';
          var emp = employees.find(function (e) { return e.id === nom.nomineeId; });
          if (emp) {
            emp.specialistBadges = Array.isArray(emp.specialistBadges) ? emp.specialistBadges : [];
            if (emp.specialistBadges.indexOf(nom.badgeName) === -1) {
              emp.specialistBadges.push(nom.badgeName);
              await S.put('employees', emp);
            }
          }
        } else if (act === 'reject') {
          nom.status = 'Rejected';
        }
        nom.updatedAt = new Date().toISOString();
        await S.put('specialist_nominations', nom);
        U.toast('Nomination updated to ' + nom.status + '.', 'success');
        renderSpecialistBadges(container);
      });
    });
  }

  // =========================================================================
  // 4. Recognition & Rewards (Leaderboards + Non-Monetary + Growth + Financial Proposals)
  // =========================================================================
  function renderRecognition(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var rewards = S.getAll('rewards').sort(function (a, b) { return a.pointsRequirement - b.pointsRequirement; });

    var topLifetime = employees.slice().sort(function (a, b) { return Number(b.lifetimePoints || 0) - Number(a.lifetimePoints || 0); }).slice(0, 6);
    var topAnnual = employees.slice().sort(function (a, b) { return Number(b.annualPoints || 0) - Number(a.annualPoints || 0); }).slice(0, 6);

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div class="grid-2">' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:15px;font-weight:700;margin-bottom:10px">Top Lifetime Excellence Leaders</h3>' +
            '<div class="stack-sm">' +
              topLifetime.map(function (e, i) {
                return '<div class="flex-between" style="padding:10px 12px;border-radius:10px;background:' + (i === 0 ? '#F5EBD7' : '#FAF9F5') + ';border:1px solid #E5E9E4">' +
                  '<div class="flex-row" style="gap:10px">' +
                    '<span class="font-mono" style="font-weight:800;width:22px;color:#8C6D37">#' + (i + 1) + '</span>' +
                    '<div><div style="font-weight:600">' + U.escapeHtml(e.name) + '</div><div class="text-muted" style="font-size:11.5px">' + U.escapeHtml(e.department) + ' &bull; ' + U.escapeHtml(e.currentBadge) + '</div></div>' +
                  '</div>' +
                  '<span class="font-mono" style="font-weight:700">' + Number(e.lifetimePoints || 0) + ' pts</span>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:15px;font-weight:700;margin-bottom:10px">2026 Annual Cycle Champions</h3>' +
            '<div class="stack-sm">' +
              topAnnual.map(function (e, i) {
                return '<div class="flex-between" style="padding:10px 12px;border-radius:10px;background:' + (i === 0 ? '#E4EEE7' : '#FAF9F5') + ';border:1px solid #E5E9E4">' +
                  '<div class="flex-row" style="gap:10px">' +
                    '<span class="font-mono" style="font-weight:800;width:22px;color:#4C7360">#' + (i + 1) + '</span>' +
                    '<div><div style="font-weight:600">' + U.escapeHtml(e.name) + '</div><div class="text-muted" style="font-size:11.5px">' + U.escapeHtml(e.teamName) + '</div></div>' +
                  '</div>' +
                  '<span class="font-mono" style="font-weight:700">' + Number(e.annualPoints || 0) + ' pts</span>' +
                '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +

        // Non-Monetary & Professional Growth
        '<div class="grid-2">' +
          '<div class="cis-card card-pad pastel-lavender">' +
            '<h3 style="font-size:15px;font-weight:700;margin-bottom:8px">Non-Monetary Recognition Pathways</h3>' +
            '<ul style="font-size:12.5px;margin:0 0 0 18px;padding:0;line-height:1.75;color:#42534B">' +
              '<li>Quarterly CIS Townhall Spotlight &amp; Practice Leadership Shoutouts</li>' +
              '<li>Digital Excellence &amp; Specialist Certificates for internal profiles</li>' +
              '<li>Annual CIS Innovation Showcase &amp; Wall of Fame feature</li>' +
              '<li>Client &amp; Delivery Executive Commendation Letters</li>' +
            '</ul>' +
          '</div>' +
          '<div class="cis-card card-pad pastel-mint">' +
            '<h3 style="font-size:15px;font-weight:700;margin-bottom:8px">Professional Growth Opportunities</h3>' +
            '<ul style="font-size:12.5px;margin:0 0 0 18px;padding:0;line-height:1.75;color:#42534B">' +
              '<li>Priority sponsorship for advanced cloud, AI, and security certifications</li>' +
              '<li>Conference speaking slots and external thought-leadership co-authorship</li>' +
              '<li>Invitation to CIS Architecture Review &amp; Accelerator Advisory Panels</li>' +
              '<li>Structured input into annual appraisal &amp; career progression discussions</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +

        // Proposed Financial Rewards Table with Mandatory Disclaimer
        '<div class="cis-card card-pad">' +
          '<div class="flex-between" style="margin-bottom:10px">' +
            '<div>' +
              '<h3 style="font-size:15px;font-weight:700">Proposed Reward Structure (Indicative)</h3>' +
              '<p class="text-secondary" style="font-size:12px;margin-top:2px">All monetary figures below are indicative proposals only and remain subject to formal HR, Finance, and CIS Leadership approval.</p>' +
            '</div>' +
            '<button type="button" class="btn btn-primary btn-sm" id="rwd-add-btn">' + U.icon('plusCircle', 14) + '<span>Add Proposal</span></button>' +
          '</div>' +
          '<div style="padding:10px 14px;border-radius:10px;background:#F5EBD7;border:1px solid #E7D6B5;font-size:12px;color:#6B5022;margin-bottom:14px">' +
            '<strong>Policy Governance Disclaimer:</strong> Financial reward tiers are draft framework proposals for leadership budgeting review and do not constitute an officially approved compensation policy.' +
          '</div>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>Proposal Tier</th><th>Eligibility</th><th class="text-right">Points Req.</th><th>Type</th><th>Approval Authority</th><th>Status</th><th class="text-right">Action</th></tr></thead>' +
            '<tbody>' +
              rewards.map(function (r) {
                return '<tr>' +
                  '<td style="font-weight:600">' + U.escapeHtml(r.name) + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(r.eligibility) + '</td>' +
                  '<td class="text-right font-mono" style="font-weight:700">' + r.pointsRequirement + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(r.rewardType) + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(r.approvalRequirement) + '</td>' +
                  '<td>' + U.statusBadge(r.status) + '</td>' +
                  '<td class="text-right"><button type="button" class="btn btn-danger btn-xs" data-rwd-del="' + r.id + '">' + U.icon('trash', 12) + '</button></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    document.getElementById('rwd-add-btn').addEventListener('click', function () {
      U.openModal('Add Reward Proposal',
        '<form id="rwd-form" class="stack-sm">' +
          '<div><label class="form-label">Proposal Name *</label><input id="rf-name" required class="cis-input" placeholder="e.g., Quarterly Innovation Voucher"/></div>' +
          '<div class="grid-2">' +
            '<div><label class="form-label">Eligibility</label><input id="rf-elig" class="cis-input" value="Gold Excellence (150+ pts)"/></div>' +
            '<div><label class="form-label">Points Requirement</label><input id="rf-pts" type="number" min="0" class="cis-input" value="150"/></div>' +
          '</div>' +
          '<div><label class="form-label">Reward Type</label><input id="rf-type" class="cis-input" value="Indicative Financial Proposal"/></div>' +
          '<div class="flex-row" style="justify-content:flex-end"><button type="submit" class="btn btn-primary btn-sm">Save Proposal</button></div>' +
        '</form>',
        {
          small: true,
          onOpen: function () {
            document.getElementById('rwd-form').addEventListener('submit', async function (ev) {
              ev.preventDefault();
              var r = {
                id: U.genId('RWD'),
                name: document.getElementById('rf-name').value.trim(),
                eligibility: document.getElementById('rf-elig').value.trim(),
                pointsRequirement: Number(document.getElementById('rf-pts').value) || 0,
                rewardType: document.getElementById('rf-type').value.trim(),
                approvalRequirement: 'HR, Finance & CIS Leadership',
                availability: 'Quarterly',
                status: 'Proposed'
              };
              await S.put('rewards', r);
              U.closeModal();
              U.toast('Reward proposal added.', 'success');
              renderRecognition(container);
            });
          }
        }
      );
    });

    container.querySelectorAll('[data-rwd-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-rwd-del');
        U.confirmDialog('Delete Reward Proposal', 'Remove this reward proposal?', 'Delete', async function () {
          await S.remove('rewards', id);
          U.toast('Proposal removed.', 'info');
          renderRecognition(container);
        }, true);
      });
    });
  }

  window.CIS.badges = {
    renderPointsMaster: renderPointsMaster,
    renderExcellenceBadges: renderExcellenceBadges,
    renderSpecialistBadges: renderSpecialistBadges,
    renderRecognition: renderRecognition
  };
})();
