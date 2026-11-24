/* ==========================================================================
   CIS Portal — Submit Contribution & All Contributions Modules
   Captures all official CIS submission fields, 9-category framework cascade,
   Individual/Team 100% credit allocation, Drafts, and Pending/Approved/Rejected
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var contribFilter = { search: '', status: 'All', employeeId: 'ALL' };

  var MEASUREMENT_UNITS = [
    'Hours',
    'Percentage (%)',
    'Cost (USD)',
    'Incidents',
    'Delivery Time (Days)',
    'Projects',
    'Tickets',
    'Defects',
    'Other'
  ];

  function renderSubmitContribution(container, onNavigate, editRecord) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees').filter(function (e) { return e.active !== false; });
    var projects = S.getAll('projects');
    var activities = S.getAll('points_master').filter(function (a) { return a.active !== false; });
    var settings = S.getSettings();
    var multipliers = (settings.multipliers || []).filter(function (m) { return m.active !== false; });
    var savedDrafts = S.getAll('contributions').filter(function (c) { return c.status === 'Draft'; });

    var categories = [];
    activities.forEach(function (a) {
      if (!categories.some(function (c) { return c.id === a.categoryId; })) {
        categories.push({ id: a.categoryId, name: a.categoryName });
      }
    });

    var rec = editRecord || null;
    var defaultEmp = rec
      ? (employees.find(function (e) { return e.id === rec.employeeId; }) || { id: rec.employeeId || '', name: rec.employeeName || '', projectName: rec.projectName || '' })
      : (employees[0] || { id: '', name: '', projectName: '' });

    var initEmpId = rec ? (rec.employeeId || '') : (defaultEmp.id || '');
    var initEmpName = rec ? (rec.employeeName || '') : (defaultEmp.name || '');
    var initProject = rec ? (rec.projectName || '') : (defaultEmp.projectName || '');
    var defaultCatId = rec && categories.some(function (c) { return c.id === rec.categoryId; }) ? rec.categoryId : '';
    var defaultActId = rec ? rec.activityId : '';
    var defaultType = rec ? (rec.contributionType === 'Team' ? 'Team' : 'Individual') : 'Individual';
    var defaultUnit = rec && rec.measurementUnit ? rec.measurementUnit : 'Hours';

    var teamAllocs = rec && Array.isArray(rec.teamAllocations) && rec.teamAllocations.length > 1
      ? rec.teamAllocations.map(function (r) {
          return {
            employeeId: r.employeeId || '',
            employeeName: r.employeeName || '',
            percentage: Number(r.percentage || 0)
          };
        })
      : [{ employeeId: initEmpId, employeeName: initEmpName, percentage: 100 }];

    var wfReviewer = rec && rec.reviewerName ? rec.reviewerName : 'Assigned Manager (Pending Review)';
    var wfStatus = rec && rec.status && rec.status !== 'Draft' ? U.normalizeContributionStatus(rec.status) : 'Pending (On Submission)';
    var wfApprovalDate = rec && rec.approvedDate ? U.formatDate(rec.approvedDate) : '—';
    var wfPointsAwarded = rec && rec.status === 'Approved' ? (Number(rec.finalPoints || 0) + ' pts') : '0 pts (Awarded upon Approval)';

    var draftsBarHtml = savedDrafts.length
      ? '<div class="cis-card card-pad-sm pastel-ivory" style="margin-bottom:16px">' +
          '<div class="flex-between" style="flex-wrap:wrap;gap:8px">' +
            '<div style="font-size:12.5px"><strong>Saved Drafts (' + savedDrafts.length + '):</strong> Resume a draft to continue editing or submit for review.</div>' +
            '<div class="flex-row" style="flex-wrap:wrap;gap:6px">' +
              savedDrafts.map(function (d) {
                var isEditing = rec && rec.id === d.id;
                return '<span class="flex-row" style="gap:4px">' +
                  '<button type="button" class="btn ' + (isEditing ? 'btn-primary' : 'btn-outline') + ' btn-xs" data-load-draft="' + U.escapeHtml(d.id) + '">' +
                    U.icon('edit', 11) + '<span>' + U.escapeHtml(d.title || d.id) + '</span>' +
                  '</button>' +
                  '<button type="button" class="btn btn-danger btn-xs" data-del-draft="' + U.escapeHtml(d.id) + '" title="Delete Draft">' + U.icon('trash', 11) + '</button>' +
                '</span>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>'
      : '';

    container.innerHTML =
      '<div class="cis-card card-pad" style="max-width:960px;margin:0 auto">' +
        '<div class="flex-between" style="margin-bottom:18px">' +
          '<div>' +
            '<h2 style="font-size:18px;font-weight:700">' + (rec ? 'Edit Contribution (' + U.escapeHtml(rec.id) + ')' : 'Submit New Impact Contribution') + '</h2>' +
            '<p class="text-secondary" style="font-size:12.5px;margin-top:2px">Points are automatically populated from the CIS Framework Category &amp; Activity master. Only manager-approved points count toward annual and lifetime totals.</p>' +
          '</div>' +
          '<div id="live-pts-preview" class="kpi-card pastel-champagne" style="padding:10px 16px;min-width:190px;text-align:right">' +
            '<div style="font-size:11px;font-weight:600;color:#6B5022">Projected Impact Points</div>' +
            '<div class="font-mono" id="preview-pts-val" style="font-size:22px;font-weight:800;color:#42534B">0 pts</div>' +
            '<div class="font-mono" id="preview-base-val" style="font-size:11px;color:#6B5022;margin-top:2px">Select category &amp; activity</div>' +
          '</div>' +
        '</div>' +

        draftsBarHtml +

        '<datalist id="sc-emp-id-list">' +
          employees.map(function (e) {
            return '<option value="' + U.escapeHtml(e.id) + '">' + U.escapeHtml(e.name + ' — ' + e.department) + '</option>';
          }).join('') +
        '</datalist>' +
        '<datalist id="sc-emp-name-list">' +
          employees.map(function (e) {
            return '<option value="' + U.escapeHtml(e.name) + '">' + U.escapeHtml(e.id + ' — ' + e.department) + '</option>';
          }).join('') +
        '</datalist>' +
        '<datalist id="sc-project-list">' +
          projects.map(function (p) {
            return '<option value="' + U.escapeHtml(p.name) + '">' + U.escapeHtml(p.id + ' — ' + p.department) + '</option>';
          }).join('') +
        '</datalist>' +

        '<form id="submit-contrib-form" class="stack-md">' +
          // 1. Employee and Project Details
          '<div class="grid-2">' +
            '<div>' +
              '<label class="form-label" for="sc-emp-id">Employee ID *</label>' +
              '<input id="sc-emp-id" type="text" list="sc-emp-id-list" class="cis-input" required placeholder="e.g., EMP-011" value="' + U.escapeHtml(initEmpId) + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-emp-name">Employee Name *</label>' +
              '<input id="sc-emp-name" type="text" list="sc-emp-name-list" class="cis-input" required placeholder="e.g., Aarav Mehta" value="' + U.escapeHtml(initEmpName) + '"/>' +
            '</div>' +
          '</div>' +

          '<div class="grid-2">' +
            '<div>' +
              '<label class="form-label" for="sc-project">Project / Account *</label>' +
              '<input id="sc-project" type="text" list="sc-project-list" class="cis-input" required placeholder="e.g., Project Horizon Cloud Migration" value="' + U.escapeHtml(initProject) + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-date">Contribution Date *</label>' +
              '<input id="sc-date" type="date" class="cis-input" required value="' + U.escapeHtml(rec ? rec.contributionDate : new Date().toISOString().slice(0, 10)) + '"/>' +
            '</div>' +
          '</div>' +

          // CIS Framework Category & Contribution / Activity
          '<div class="grid-3">' +
            '<div>' +
              '<label class="form-label" for="sc-category">CIS Framework Category *</label>' +
              '<select id="sc-category" class="cis-select" required>' +
                '<option value=""' + (!defaultCatId ? ' selected' : '') + '>Select CIS Framework Category</option>' +
                categories.map(function (c, idx) {
                  return '<option value="' + c.id + '"' + (c.id === defaultCatId ? ' selected' : '') + '>' + (idx + 1) + '. ' + U.escapeHtml(c.name) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
            '<div style="grid-column:span 2">' +
              '<label class="form-label" for="sc-activity">Contribution / Activity *</label>' +
              '<select id="sc-activity" class="cis-select" required' + (!defaultCatId ? ' disabled' : '') + '></select>' +
              '<div id="sc-act-hint" class="form-hint"></div>' +
            '</div>' +
          '</div>' +

          // 2 & 3. Deliverable / Asset Name, Version, Problem/Opportunity, Work Performed, Evidence
          '<div class="grid-3">' +
            '<div style="grid-column:span 2">' +
              '<label class="form-label" for="sc-title">Deliverable / Asset Name *</label>' +
              '<input id="sc-title" type="text" class="cis-input" required placeholder="e.g., Automated Multi-Cloud Drift Remediation Utility" value="' + U.escapeHtml(rec ? rec.title : '') + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-version">Version</label>' +
              '<input id="sc-version" type="text" class="cis-input" placeholder="e.g., v1.0, v2.0" value="' + U.escapeHtml(rec && rec.deliverableVersion ? rec.deliverableVersion : 'v1.0') + '"/>' +
            '</div>' +
          '</div>' +

          '<div class="grid-2">' +
            '<div>' +
              '<label class="form-label" for="sc-problem">Short Description of Problem / Opportunity</label>' +
              '<textarea id="sc-problem" rows="2" class="cis-textarea" placeholder="Describe the technical or delivery problem or opportunity addressed...">' + U.escapeHtml(rec ? rec.businessProblem : '') + '</textarea>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-solution">Work Performed *</label>' +
              '<textarea id="sc-solution" rows="2" class="cis-textarea" required placeholder="Describe what was designed, built, standardized, or delivered...">' + U.escapeHtml(rec ? rec.solutionImplemented : '') + '</textarea>' +
            '</div>' +
          '</div>' +

          '<div>' +
            '<label class="form-label" for="sc-evidence">Repository / Evidence Link *</label>' +
            '<input id="sc-evidence" type="text" class="cis-input" required placeholder="https://cis-repo.internal/... or ticket/certificate URL" value="' + U.escapeHtml(rec ? rec.evidence : '') + '"/>' +
          '</div>' +

          // 4. Contributors and Credit Allocation + Requested Impact Multiplier
          '<div class="grid-2">' +
            '<div>' +
              '<label class="form-label" for="sc-type">Contribution Type</label>' +
              '<select id="sc-type" class="cis-select">' +
                '<option value="Individual"' + (defaultType === 'Individual' ? ' selected' : '') + '>Individual Contribution</option>' +
                '<option value="Team"' + (defaultType === 'Team' ? ' selected' : '') + '>Team Contribution</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-mult">Requested Impact Multiplier (Single Highest Only)</label>' +
              '<select id="sc-mult" class="cis-select">' +
                multipliers.map(function (m) {
                  var sel = rec && Number(rec.requestedMultiplier) === Number(m.value) ? ' selected' : '';
                  return '<option value="' + m.value + '"' + sel + '>' + Number(m.value).toFixed(1) + '× — ' + U.escapeHtml(m.label) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +

          '<div id="individual-credit-box" class="cis-card card-pad-sm pastel-mint ' + (defaultType === 'Individual' ? '' : 'hidden') + '">' +
            '<div class="flex-between">' +
              '<span style="font-size:12.5px"><strong>Individual Contributor:</strong> <span id="ind-contrib-label">' + U.escapeHtml((initEmpId || '—') + ' — ' + (initEmpName || 'Enter Employee Details')) + '</span></span>' +
              '<span class="status-badge status-mint">100% Credit Allocated</span>' +
            '</div>' +
          '</div>' +

          '<div id="team-split-box" class="cis-card card-pad-sm pastel-ivory ' + (defaultType === 'Team' ? '' : 'hidden') + '">' +
            '<div class="flex-between" style="margin-bottom:8px;flex-wrap:wrap;gap:8px">' +
              '<div>' +
                '<strong style="font-size:12.5px">Team Contribution Credit Allocation (Must equal exactly 100%)</strong>' +
                '<div id="team-split-total" style="font-size:11.5px;margin-top:2px"></div>' +
              '</div>' +
              '<button type="button" class="btn btn-secondary btn-xs" id="add-split-btn">+ Add Contributor</button>' +
            '</div>' +
            '<div id="team-split-rows" class="stack-sm"></div>' +
          '</div>' +

          '<div style="padding:10px 14px;border-radius:10px;background:#DFEAF3;border:1px solid #C8D9E8;font-size:12px;color:#2E4B63">' +
            '<div style="font-weight:700;margin-bottom:2px">Single-Multiplier Rule (Section 5): Multipliers do NOT stack — select only the single highest qualifying multiplier (1.0×, 1.2×, 1.5×, or 2.0×).</div>' +
            '<div id="sc-mult-guidance" style="color:#42534B"></div>' +
          '</div>' +

          // 5. Expected and Actual Impact
          '<div class="grid-2">' +
            '<div>' +
              '<label class="form-label" for="sc-expected-impact">Expected Impact</label>' +
              '<input id="sc-expected-impact" type="text" class="cis-input" placeholder="e.g., Reduce manual deployment effort by 60% across cloud squads" value="' + U.escapeHtml(rec && rec.expectedImpact ? rec.expectedImpact : '') + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-actual-impact">Actual Impact</label>' +
              '<input id="sc-actual-impact" type="text" class="cis-input" placeholder="e.g., Reduced provisioning from 16 hrs to 1.5 hrs with zero config drift" value="' + U.escapeHtml(rec && rec.actualImpact ? rec.actualImpact : '') + '"/>' +
            '</div>' +
          '</div>' +

          '<div class="grid-3">' +
            '<div>' +
              '<label class="form-label" for="sc-baseline-measure">Baseline Measurement</label>' +
              '<input id="sc-baseline-measure" type="text" class="cis-input" placeholder="e.g., 16" value="' + U.escapeHtml(rec && rec.baselineMeasurement ? rec.baselineMeasurement : (rec && rec.baselineImpact ? rec.baselineImpact : '')) + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-actual-measure">Actual Measurement</label>' +
              '<input id="sc-actual-measure" type="text" class="cis-input" placeholder="e.g., 1.5" value="' + U.escapeHtml(rec && rec.actualMeasurement ? rec.actualMeasurement : '') + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-measure-unit">Measurement Unit</label>' +
              '<select id="sc-measure-unit" class="cis-select">' +
                MEASUREMENT_UNITS.map(function (unit) {
                  return '<option value="' + U.escapeHtml(unit) + '"' + (unit === defaultUnit ? ' selected' : '') + '>' + U.escapeHtml(unit) + '</option>';
                }).join('') +
              '</select>' +
            '</div>' +
          '</div>' +

          '<div class="grid-3">' +
            '<div>' +
              '<label class="form-label" for="sc-impact">Measurable Impact Summary</label>' +
              '<input id="sc-impact" type="text" class="cis-input" placeholder="e.g., Saved 180 hrs/year and reduced P1 incidents" value="' + U.escapeHtml(rec ? rec.measurableImpact : '') + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-time">Estimated Time Saved (Hours)</label>' +
              '<input id="sc-time" type="number" min="0" class="cis-input" value="' + U.escapeHtml(rec ? rec.timeSavedHours : 0) + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-cost">Estimated Cost Saved (USD)</label>' +
              '<input id="sc-cost" type="number" min="0" class="cis-input" value="' + U.escapeHtml(rec ? rec.costSavedUsd : 0) + '"/>' +
            '</div>' +
          '</div>' +

          // 6. Reuse and Adoption Evidence
          '<div>' +
            '<label class="form-label" for="sc-reuse-evidence">Reuse / Adoption Evidence</label>' +
            '<textarea id="sc-reuse-evidence" rows="2" class="cis-textarea" placeholder="Document how other teams or projects adopted/reused this deliverable (tickets, adoption sign-offs, pipeline runs)...">' + U.escapeHtml(rec && rec.reuseAdoptionEvidence ? rec.reuseAdoptionEvidence : '') + '</textarea>' +
          '</div>' +

          '<div class="grid-3">' +
            '<div style="grid-column:span 2">' +
              '<label class="form-label" for="sc-distinct-projects">Distinct Projects Involved</label>' +
              '<input id="sc-distinct-projects" type="text" class="cis-input" placeholder="e.g., PRJ-01 Horizon Cloud, PRJ-02 Core SRE, PRJ-03 Zero-Trust IAM (comma-separated)" value="' + U.escapeHtml(rec && rec.distinctProjectsInvolved ? rec.distinctProjectsInvolved : '') + '"/>' +
            '</div>' +
            '<div>' +
              '<label class="form-label" for="sc-reused">Number of Projects Using the Asset</label>' +
              '<input id="sc-reused" type="number" min="0" class="cis-input" value="' + U.escapeHtml(rec && rec.distinctProjectsReused != null ? rec.distinctProjectsReused : 0) + '"/>' +
            '</div>' +
          '</div>' +

          // 7. Workflow-Controlled Review and Approval Details (Read-Only)
          '<div class="cis-card card-pad-sm pastel-ivory">' +
            '<div style="font-size:12px;font-weight:700;color:#42534B;margin-bottom:8px">Review &amp; Approval Details (Workflow-Controlled — Read Only)</div>' +
            '<div class="grid-kpis-4" style="gap:10px">' +
              '<div><span class="text-muted" style="font-size:11px;display:block">Reviewer</span><strong style="font-size:12.5px">' + U.escapeHtml(wfReviewer) + '</strong></div>' +
              '<div><span class="text-muted" style="font-size:11px;display:block">Approval Status</span><strong style="font-size:12.5px">' + U.escapeHtml(wfStatus) + '</strong></div>' +
              '<div><span class="text-muted" style="font-size:11px;display:block">Approval Date</span><strong class="font-mono" style="font-size:12.5px">' + U.escapeHtml(wfApprovalDate) + '</strong></div>' +
              '<div><span class="text-muted" style="font-size:11px;display:block">Points Awarded</span><strong class="font-mono" style="font-size:12.5px">' + U.escapeHtml(wfPointsAwarded) + '</strong></div>' +
            '</div>' +
          '</div>' +

          '<div class="flex-row" style="justify-content:flex-end;padding-top:10px;border-top:1px solid #E5E9E4">' +
            '<button type="button" class="btn btn-outline" id="sc-cancel">Cancel</button>' +
            '<button type="button" class="btn btn-secondary" id="sc-draft">Save as Draft</button>' +
            '<button type="submit" class="btn btn-primary">' + U.icon('checkCircle', 15) + '<span>Submit for Review</span></button>' +
          '</div>' +
        '</form>' +
      '</div>';

    var empIdInput = document.getElementById('sc-emp-id');
    var empNameInput = document.getElementById('sc-emp-name');
    var projInput = document.getElementById('sc-project');
    var catSel = document.getElementById('sc-category');
    var actSel = document.getElementById('sc-activity');
    var multSel = document.getElementById('sc-mult');
    var typeSel = document.getElementById('sc-type');
    var indBox = document.getElementById('individual-credit-box');
    var indLabel = document.getElementById('ind-contrib-label');
    var splitBox = document.getElementById('team-split-box');
    var splitRowsEl = document.getElementById('team-split-rows');
    var splitTotalEl = document.getElementById('team-split-total');

    function syncIndividualSummary() {
      if (indLabel) {
        var idTxt = (empIdInput.value || '').trim() || '—';
        var nmTxt = (empNameInput.value || '').trim() || 'Enter Employee Details';
        indLabel.textContent = idTxt + ' — ' + nmTxt;
      }
    }

    empIdInput.addEventListener('change', function () {
      var val = this.value.trim();
      var found = employees.find(function (e) { return e.id.toLowerCase() === val.toLowerCase(); });
      if (found) {
        empIdInput.value = found.id;
        empNameInput.value = found.name;
        if (!projInput.value.trim() || !rec) {
          projInput.value = found.projectName || projInput.value;
        }
      }
      syncIndividualSummary();
    });
    empIdInput.addEventListener('input', syncIndividualSummary);

    empNameInput.addEventListener('change', function () {
      var val = this.value.trim();
      var found = employees.find(function (e) { return e.name.toLowerCase() === val.toLowerCase(); });
      if (found) {
        empIdInput.value = found.id;
        empNameInput.value = found.name;
        if (!projInput.value.trim() || !rec) {
          projInput.value = found.projectName || projInput.value;
        }
      }
      syncIndividualSummary();
    });
    empNameInput.addEventListener('input', syncIndividualSummary);

    function populateActivities() {
      var catId = catSel.value;
      if (!catId) {
        actSel.innerHTML = '<option value="">Select a CIS Framework Category first</option>';
        actSel.value = '';
        actSel.disabled = true;
        defaultActId = '';
        updatePreview();
        return;
      }
      var filtered = activities.filter(function (a) { return a.categoryId === catId; });
      actSel.disabled = false;
      var matchedId = '';
      if (defaultActId && filtered.some(function (a) { return a.id === defaultActId; })) {
        matchedId = defaultActId;
      }
      actSel.innerHTML =
        '<option value=""' + (!matchedId ? ' selected' : '') + '>Select Contribution / Activity</option>' +
        filtered.map(function (a) {
          var sel = (a.id === matchedId) ? ' selected' : '';
          return '<option value="' + a.id + '"' + sel + '>' + U.escapeHtml(a.name) + ' — ' + a.defaultPoints + ' pts</option>';
        }).join('');
      actSel.value = matchedId;
      defaultActId = '';
      updatePreview();
    }

    function updatePreview() {
      var act = actSel.value ? activities.find(function (a) { return a.id === actSel.value; }) : null;
      var multVal = Number(multSel.value) || 1.0;
      var multObj = multipliers.find(function (m) { return Number(m.value) === multVal; });
      var base = act ? Number(act.defaultPoints) : 0;
      var projected = act ? Math.round(base * multVal) : 0;
      document.getElementById('preview-pts-val').textContent = projected + ' pts';
      var baseEl = document.getElementById('preview-base-val');
      if (baseEl) {
        baseEl.textContent = act
          ? ('Base: ' + base + ' pts × ' + multVal.toFixed(1) + '×')
          : 'Select category & activity';
      }
      var track = act && act.reviewTrack ? act.reviewTrack : (act && act.approvalRequirement !== 'Manager Only' ? 'Technical Review / CIS Contribution Council' : 'Manager / Asset-Owner Validation');
      document.getElementById('sc-act-hint').textContent = act
        ? ('Base Points: ' + act.defaultPoints + ' pts (auto-populated) • Track: ' + track + ' • Evidence: ' + act.evidenceRequirements)
        : (catSel.value ? 'Choose an activity from this category to populate base points automatically.' : 'Select a CIS Framework Category first to unlock its activities.');
      var guidanceMap = {
        '1.0': '1.0× Standard — Meets baseline acceptance criteria with verified evidence.',
        '1.2': '1.2× High Quality — Strong technical rigor, documentation, and measurable baseline-vs-actual lift.',
        '1.5': '1.5× High Impact — Verified reuse across 2–3+ projects, significant SLA/cost savings, or customer win.',
        '2.0': '2.0× Strategic — Practice-wide adoption (5+ projects), IP/patent, or strategic CIS-wide impact.'
      };
      var gEl = document.getElementById('sc-mult-guidance');
      if (gEl) {
        gEl.textContent = (multObj && multObj.guidance) ? multObj.guidance : (guidanceMap[multVal.toFixed(1)] || '');
      }
    }

    function updateTeamTotalDisplay() {
      if (!splitTotalEl) return;
      var totalPct = teamAllocs.reduce(function (s, r) { return s + Number(r.percentage || 0); }, 0);
      if (totalPct === 100) {
        splitTotalEl.innerHTML = '<span style="color:#2D5346;font-weight:600">Total Allocation: 100% ✓</span>';
      } else {
        splitTotalEl.innerHTML = '<span style="color:#7A3E36;font-weight:700">Total Allocation: ' + totalPct + '% — Must equal exactly 100% (' + (totalPct < 100 ? (100 - totalPct) + '% remaining' : (totalPct - 100) + '% over') + ')</span>';
      }
    }

    function renderSplitRows() {
      splitRowsEl.innerHTML = teamAllocs.map(function (row, idx) {
        return '<div class="flex-row" style="gap:8px;flex-wrap:wrap">' +
          '<input type="text" list="sc-emp-id-list" class="cis-input" style="flex:1;min-width:120px" data-split-id="' + idx + '" placeholder="Employee ID *" value="' + U.escapeHtml(row.employeeId || '') + '"/>' +
          '<input type="text" list="sc-emp-name-list" class="cis-input" style="flex:2;min-width:170px" data-split-name="' + idx + '" placeholder="Contributor Name *" value="' + U.escapeHtml(row.employeeName || '') + '"/>' +
          '<input type="number" min="1" max="100" class="cis-input" style="width:90px" data-split-pct="' + idx + '" value="' + Number(row.percentage || 0) + '"/>' +
          '<span class="text-muted" style="font-size:12px">%</span>' +
          (teamAllocs.length > 1
            ? '<button type="button" class="btn btn-danger btn-xs" data-split-del="' + idx + '" title="Remove Contributor">' + U.icon('trash', 12) + '</button>'
            : '') +
        '</div>';
      }).join('');

      var idInputs = splitRowsEl.querySelectorAll('[data-split-id]');
      for (var i = 0; i < idInputs.length; i++) {
        idInputs[i].addEventListener('input', function () {
          var idx = Number(this.getAttribute('data-split-id'));
          teamAllocs[idx].employeeId = this.value.trim();
        });
        idInputs[i].addEventListener('change', function () {
          var idx = Number(this.getAttribute('data-split-id'));
          var val = this.value.trim();
          teamAllocs[idx].employeeId = val;
          var found = employees.find(function (e) { return e.id.toLowerCase() === val.toLowerCase(); });
          if (found) {
            teamAllocs[idx].employeeId = found.id;
            teamAllocs[idx].employeeName = found.name;
            renderSplitRows();
          }
        });
      }

      var nameInputs = splitRowsEl.querySelectorAll('[data-split-name]');
      for (var n = 0; n < nameInputs.length; n++) {
        nameInputs[n].addEventListener('input', function () {
          var idx = Number(this.getAttribute('data-split-name'));
          teamAllocs[idx].employeeName = this.value;
        });
        nameInputs[n].addEventListener('change', function () {
          var idx = Number(this.getAttribute('data-split-name'));
          var val = this.value.trim();
          teamAllocs[idx].employeeName = val;
          var found = employees.find(function (e) { return e.name.toLowerCase() === val.toLowerCase(); });
          if (found) {
            teamAllocs[idx].employeeId = found.id;
            teamAllocs[idx].employeeName = found.name;
            renderSplitRows();
          }
        });
      }

      var pctInputs = splitRowsEl.querySelectorAll('[data-split-pct]');
      for (var j = 0; j < pctInputs.length; j++) {
        pctInputs[j].addEventListener('input', function () {
          var idx = Number(this.getAttribute('data-split-pct'));
          teamAllocs[idx].percentage = Number(this.value) || 0;
          updateTeamTotalDisplay();
        });
      }

      var delBtns = splitRowsEl.querySelectorAll('[data-split-del]');
      for (var k = 0; k < delBtns.length; k++) {
        delBtns[k].addEventListener('click', function () {
          var idx = Number(this.getAttribute('data-split-del'));
          teamAllocs.splice(idx, 1);
          renderSplitRows();
        });
      }

      updateTeamTotalDisplay();
    }

    // Saved draft buttons
    container.querySelectorAll('[data-load-draft]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var did = this.getAttribute('data-load-draft');
        var found = savedDrafts.find(function (d) { return d.id === did; });
        if (found) renderSubmitContribution(container, onNavigate, found);
      });
    });
    container.querySelectorAll('[data-del-draft]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var did = this.getAttribute('data-del-draft');
        U.confirmDialog('Delete Saved Draft', 'Remove draft ' + did + ' permanently?', 'Delete', async function () {
          await S.remove('contributions', did);
          U.toast('Draft deleted.', 'info');
          renderSubmitContribution(container, onNavigate, null);
        }, true);
      });
    });

    populateActivities();
    renderSplitRows();
    syncIndividualSummary();

    catSel.addEventListener('change', populateActivities);
    actSel.addEventListener('change', updatePreview);
    multSel.addEventListener('change', updatePreview);

    typeSel.addEventListener('change', function () {
      if (this.value === 'Team') {
        indBox.classList.add('hidden');
        splitBox.classList.remove('hidden');
        if (teamAllocs.length < 2) {
          var primaryId = empIdInput.value.trim();
          var primaryName = empNameInput.value.trim();
          var secondEmp = employees.find(function (e) { return e.id !== primaryId; }) || { id: '', name: '' };
          teamAllocs = [
            { employeeId: primaryId, employeeName: primaryName, percentage: 60 },
            { employeeId: secondEmp.id, employeeName: secondEmp.name, percentage: 40 }
          ];
          renderSplitRows();
        }
      } else {
        splitBox.classList.add('hidden');
        indBox.classList.remove('hidden');
        syncIndividualSummary();
      }
    });

    document.getElementById('add-split-btn').addEventListener('click', function () {
      teamAllocs.push({ employeeId: '', employeeName: '', percentage: 0 });
      renderSplitRows();
    });

    document.getElementById('sc-cancel').addEventListener('click', function () {
      onNavigate('all-contributions');
    });

    async function persistContribution(asDraft) {
      var empId = empIdInput.value.trim();
      var empName = empNameInput.value.trim();
      var projectName = projInput.value.trim();
      var matchedEmp = employees.find(function (e) { return e.id.toLowerCase() === empId.toLowerCase(); }) || null;
      var matchedProj = projects.find(function (p) { return p.name.toLowerCase() === projectName.toLowerCase(); }) || null;

      if (!empId || !empName || !projectName) {
        U.toast('Employee ID, Employee Name, and Project / Account are required.', 'error');
        return;
      }

      var act = actSel.value ? activities.find(function (a) { return a.id === actSel.value; }) : null;
      var title = document.getElementById('sc-title').value.trim();
      var solution = document.getElementById('sc-solution').value.trim();
      var evidence = document.getElementById('sc-evidence').value.trim();

      if (!catSel.value || !act) {
        U.toast('Please select a CIS Framework Category and Contribution / Activity.', 'error');
        return;
      }
      if (!title) {
        U.toast('Deliverable / Asset Name is required.', 'error');
        return;
      }
      if (!asDraft && (!solution || !evidence)) {
        U.toast('Please fill in Work Performed and Repository / Evidence Link before submitting.', 'error');
        return;
      }

      var finalAllocs = [{ employeeId: empId, employeeName: empName, percentage: 100 }];
      if (typeSel.value === 'Team') {
        var missingRow = teamAllocs.some(function (r) {
          return !String(r.employeeId || '').trim() || !String(r.employeeName || '').trim();
        });
        if (missingRow) {
          U.toast('Please enter Employee ID and Name for every team contributor.', 'error');
          return;
        }
        var totalPct = teamAllocs.reduce(function (s, r) { return s + Number(r.percentage || 0); }, 0);
        if (totalPct !== 100) {
          U.toast('Team credit allocation must equal exactly 100% (currently ' + totalPct + '%).', 'error');
          return;
        }
        finalAllocs = teamAllocs.map(function (r) {
          return {
            employeeId: String(r.employeeId || '').trim(),
            employeeName: String(r.employeeName || '').trim(),
            percentage: Number(r.percentage)
          };
        });
      }

      if (!asDraft && S.isDuplicateContribution(empId, act.id, title, rec ? rec.id : null)) {
        U.toast('Potential duplicate contribution detected within configured duplicate window.', 'warning');
        return;
      }

      var status = asDraft ? 'Draft' : 'Pending';
      var cid = rec ? rec.id : U.genId('CON');
      var history = rec && Array.isArray(rec.approvalHistory) ? rec.approvalHistory.slice() : [];
      history.push({
        id: U.genId('AH'),
        stage: asDraft ? 'Draft Saved' : 'Submission',
        reviewerId: empId,
        reviewerName: empName,
        decision: asDraft ? 'Save Draft' : 'Submit',
        comments: asDraft ? 'Saved locally as draft.' : 'Submitted for Manager Review (Status: Pending).',
        previousStatus: rec ? rec.status : 'Draft',
        newStatus: status,
        timestamp: new Date().toISOString()
      });

      var baselineMeasure = (document.getElementById('sc-baseline-measure').value || '').trim();
      var actualMeasure = (document.getElementById('sc-actual-measure').value || '').trim();
      var measureUnit = document.getElementById('sc-measure-unit').value || 'Hours';

      var payload = {
        id: cid,
        employeeId: empId,
        employeeName: empName,
        department: matchedEmp ? matchedEmp.department : (rec && rec.department ? rec.department : 'CIS Practice'),
        teamId: matchedEmp ? matchedEmp.teamId : (rec && rec.teamId ? rec.teamId : 'TM-01'),
        teamName: matchedEmp ? matchedEmp.teamName : (rec && rec.teamName ? rec.teamName : 'CIS Delivery'),
        projectId: matchedProj ? matchedProj.id : (matchedEmp ? matchedEmp.projectId : (rec && rec.projectId ? rec.projectId : 'PRJ-CUSTOM')),
        projectName: projectName,
        categoryId: act.categoryId,
        categoryName: act.categoryName,
        activityId: act.id,
        activityName: act.name,
        title: title,
        deliverableVersion: (document.getElementById('sc-version').value || '').trim() || 'v1.0',
        description: solution,
        businessProblem: document.getElementById('sc-problem').value.trim(),
        solutionImplemented: solution,
        expectedImpact: (document.getElementById('sc-expected-impact').value || '').trim(),
        actualImpact: (document.getElementById('sc-actual-impact').value || '').trim(),
        baselineMeasurement: baselineMeasure,
        actualMeasurement: actualMeasure,
        measurementUnit: measureUnit,
        baselineImpact: baselineMeasure ? (baselineMeasure + ' ' + measureUnit) : '',
        reuseAdoptionEvidence: (document.getElementById('sc-reuse-evidence').value || '').trim(),
        distinctProjectsInvolved: (document.getElementById('sc-distinct-projects').value || '').trim(),
        distinctProjectsReused: Number(document.getElementById('sc-reused').value) || 0,
        contributionType: typeSel.value,
        teamAllocations: finalAllocs,
        evidence: evidence,
        measurableImpact: document.getElementById('sc-impact').value.trim(),
        timeSavedHours: Number(document.getElementById('sc-time').value) || 0,
        costSavedUsd: Number(document.getElementById('sc-cost').value) || 0,
        contributionDate: document.getElementById('sc-date').value || new Date().toISOString().slice(0, 10),
        basePoints: act.defaultPoints,
        requestedMultiplier: Number(multSel.value) || 1.0,
        approvedMultiplier: 1.0,
        finalPoints: 0,
        reviewerName: '',
        status: status,
        submissionDate: rec ? rec.submissionDate : new Date().toISOString(),
        approvedDate: null,
        approvalHistory: history
      };

      await S.put('contributions', payload);

      if (asDraft) {
        U.toast('Draft saved locally. You can resume it anytime from Submit Contribution.', 'success');
        renderSubmitContribution(container, onNavigate, payload);
      } else {
        U.toast('Contribution submitted! Status set to Pending for Manager review.', 'success');
        onNavigate('all-contributions');
      }
    }

    document.getElementById('sc-draft').addEventListener('click', function () {
      persistContribution(true);
    });
    document.getElementById('submit-contrib-form').addEventListener('submit', function (e) {
      e.preventDefault();
      persistContribution(false);
    });
  }

  function renderAllContributions(container, onNavigate) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees');

    // Exclude Draft records completely from All Contributions view
    var allSubmitted = S.getAll('contributions')
      .filter(function (c) { return c.status !== 'Draft'; })
      .sort(function (a, b) {
        return String(b.contributionDate || b.submissionDate).localeCompare(String(a.contributionDate || a.submissionDate));
      });

    var filtered = allSubmitted.filter(function (c) {
      var normStatus = U.normalizeContributionStatus(c.status);
      if (contribFilter.employeeId !== 'ALL' && c.employeeId !== contribFilter.employeeId) return false;
      if (contribFilter.status !== 'All' && normStatus !== contribFilter.status) return false;
      if (contribFilter.search) {
        var q = contribFilter.search.toLowerCase();
        var blob = (c.id + ' ' + c.title + ' ' + c.employeeId + ' ' + c.employeeName + ' ' + (c.projectName || '') + ' ' + c.categoryName + ' ' + c.activityName).toLowerCase();
        if (blob.indexOf(q) === -1) return false;
      }
      return true;
    });

    container.innerHTML =
      '<div class="stack-md">' +
        '<div class="cis-card card-pad-sm flex-between">' +
          '<div class="flex-row" style="flex:1">' +
            '<input id="mc-search" type="text" class="cis-input" style="max-width:260px" placeholder="Search deliverable, employee, ID, project..." value="' + U.escapeHtml(contribFilter.search) + '"/>' +
            '<select id="mc-status" class="cis-select-inline">' +
              ['All', 'Pending', 'Approved', 'Rejected'].map(function (st) {
                return '<option value="' + st + '"' + (contribFilter.status === st ? ' selected' : '') + '>' + (st === 'All' ? 'All Statuses' : st) + '</option>';
              }).join('') +
            '</select>' +
            '<select id="mc-emp" class="cis-select-inline">' +
              '<option value="ALL"' + (contribFilter.employeeId === 'ALL' ? ' selected' : '') + '>All Employees</option>' +
              employees.map(function (e) {
                return '<option value="' + e.id + '"' + (contribFilter.employeeId === e.id ? ' selected' : '') + '>' + U.escapeHtml(e.name + ' (' + e.id + ')') + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="flex-row">' +
            '<label class="btn btn-secondary btn-sm" style="cursor:pointer">' +
              U.icon('upload', 14) + '<span>Import Excel/CSV</span>' +
              '<input type="file" id="mc-import-file" accept=".xlsx,.csv" class="hidden"/>' +
            '</label>' +
            '<button type="button" class="btn btn-outline btn-sm" id="mc-export-xlsx">' + U.icon('download', 14) + '<span>Export .xlsx</span></button>' +
            '<button type="button" class="btn btn-primary btn-sm" id="mc-new">' + U.icon('plusCircle', 14) + '<span>Submit New</span></button>' +
          '</div>' +
        '</div>' +

        '<div class="cis-card card-pad">' +
          '<div class="flex-between" style="margin-bottom:10px">' +
            '<h3 style="font-size:14px;font-weight:700">All Contributions (' + filtered.length + ')</h3>' +
            '<span class="text-muted" style="font-size:12px">Stored persistently in IndexedDB</span>' +
          '</div>' +
          (filtered.length
            ? '<div class="table-wrap"><table class="cis-table">' +
                '<thead><tr><th>ID</th><th>Deliverable / Asset</th><th>Employee</th><th>Project / Account</th><th>Category</th><th>Date</th><th>Status</th><th class="text-right">Points</th><th class="text-right">Actions</th></tr></thead>' +
                '<tbody>' +
                  filtered.map(function (c) {
                    var displayStatus = U.normalizeContributionStatus(c.status);
                    return '<tr>' +
                      '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(c.id) + '</td>' +
                      '<td><div style="font-weight:600">' + U.escapeHtml(c.title) + '</div><div class="text-muted" style="font-size:11px">' + U.escapeHtml(c.activityName) + '</div></td>' +
                      '<td><div>' + U.escapeHtml(c.employeeName) + '</div><div class="font-mono text-muted" style="font-size:11px">' + U.escapeHtml(c.employeeId) + '</div></td>' +
                      '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(c.projectName || '—') + '</td>' +
                      '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(c.categoryName) + '</td>' +
                      '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(U.formatDate(c.contributionDate)) + '</td>' +
                      '<td>' + U.statusBadge(displayStatus) + '</td>' +
                      '<td class="text-right font-mono" style="font-weight:700">' + (displayStatus === 'Approved' ? (c.finalPoints + ' pts') : (c.basePoints + ' base')) + '</td>' +
                      '<td class="text-right"><div class="flex-row" style="justify-content:flex-end;gap:5px">' +
                        '<button type="button" class="btn btn-outline btn-xs" data-view-id="' + c.id + '" title="View Details">' + U.icon('eye', 12) + '</button>' +
                        '<button type="button" class="btn btn-danger btn-xs" data-del-id="' + c.id + '" title="Delete">' + U.icon('trash', 12) + '</button>' +
                      '</div></td>' +
                    '</tr>';
                  }).join('') +
                '</tbody>' +
              '</table></div>'
            : '<div class="empty-state">No contributions match your current filters.</div>') +
        '</div>' +
      '</div>';

    document.getElementById('mc-search').addEventListener('input', function () {
      contribFilter.search = this.value;
      renderAllContributions(container, onNavigate);
    });
    document.getElementById('mc-status').addEventListener('change', function () {
      contribFilter.status = this.value;
      renderAllContributions(container, onNavigate);
    });
    document.getElementById('mc-emp').addEventListener('change', function () {
      contribFilter.employeeId = this.value;
      renderAllContributions(container, onNavigate);
    });
    document.getElementById('mc-new').addEventListener('click', function () {
      onNavigate('submit-contribution');
    });
    document.getElementById('mc-export-xlsx').addEventListener('click', function () {
      var rows = filtered.map(function (c) {
        return {
          ID: c.id,
          EmployeeID: c.employeeId,
          EmployeeName: c.employeeName,
          ProjectAccount: c.projectName || '',
          Department: c.department,
          DeliverableName: c.title,
          Version: c.deliverableVersion || 'v1.0',
          Category: c.categoryName,
          Activity: c.activityName,
          SubmissionDate: c.contributionDate,
          ApprovalStatus: U.normalizeContributionStatus(c.status),
          Reviewer: c.reviewerName || '',
          ApprovalDate: c.approvedDate ? U.formatDate(c.approvedDate) : '',
          BasePoints: c.basePoints,
          Multiplier: c.approvedMultiplier || c.requestedMultiplier,
          PointsAwarded: c.status === 'Approved' ? c.finalPoints : 0,
          ExpectedImpact: c.expectedImpact || '',
          ActualImpact: c.actualImpact || '',
          BaselineMeasurement: c.baselineMeasurement || '',
          ActualMeasurement: c.actualMeasurement || '',
          MeasurementUnit: c.measurementUnit || '',
          TimeSavedHours: c.timeSavedHours,
          CostSavedUSD: c.costSavedUsd,
          DistinctProjectsInvolved: c.distinctProjectsInvolved || '',
          ProjectsUsingAsset: c.distinctProjectsReused || 0,
          Evidence: c.evidence
        };
      });
      window.CIS.excel.exportToXlsx(rows, 'CIS_All_Contributions.xlsx', 'AllContributions');
    });
    document.getElementById('mc-import-file').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      try {
        var res = await window.CIS.excel.importRecordsFromFile(file, 'contributions');
        U.toast('Imported contributions: ' + res.added + ' added, ' + res.updated + ' updated (existing records preserved).', 'success');
        renderAllContributions(container, onNavigate);
      } catch (err) {
        U.toast('Import failed: ' + err.message, 'error');
      }
    });

    // View details & timeline modal
    container.querySelectorAll('[data-view-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-view-id');
        var item = allSubmitted.find(function (c) { return c.id === id; });
        if (!item) return;
        var displayStatus = U.normalizeContributionStatus(item.status);
        var allocsHtml = (item.teamAllocations || []).map(function (a) {
          return '<span class="pill-tag pastel-ivory text-secondary">' + U.escapeHtml((a.employeeId || '') + ' — ' + (a.employeeName || '') + ' (' + a.percentage + '%)') + '</span>';
        }).join(' ');

        var histHtml = (item.approvalHistory || []).map(function (h) {
          return '<div style="padding:10px;border-radius:8px;background:#FAF9F5;border:1px solid #E5E9E4">' +
            '<div class="flex-between"><strong style="font-size:12.5px">' + U.escapeHtml(h.stage) + ' — ' + U.escapeHtml(h.decision) + '</strong><span class="font-mono text-muted" style="font-size:11px">' + U.escapeHtml(U.formatDateTime(h.timestamp)) + '</span></div>' +
            '<div style="font-size:12px;color:#68766F;margin-top:3px">By ' + U.escapeHtml(h.reviewerName) + ' &bull; ' + U.escapeHtml(U.normalizeContributionStatus(h.newStatus)) + '</div>' +
            (h.comments ? '<div style="font-size:12px;margin-top:4px">' + U.escapeHtml(h.comments) + '</div>' : '') +
          '</div>';
        }).join('');

        U.openModal(item.title,
          '<div class="stack-sm">' +
            '<div class="flex-between"><span class="font-mono text-muted">' + U.escapeHtml(item.id) + '</span>' + U.statusBadge(displayStatus) + '</div>' +
            '<div class="grid-2" style="font-size:12.5px">' +
              '<div><strong>Employee ID:</strong> <span class="font-mono">' + U.escapeHtml(item.employeeId) + '</span></div>' +
              '<div><strong>Employee Name:</strong> ' + U.escapeHtml(item.employeeName) + '</div>' +
              '<div><strong>Project / Account:</strong> ' + U.escapeHtml(item.projectName || '—') + '</div>' +
              '<div><strong>Version:</strong> <span class="font-mono">' + U.escapeHtml(item.deliverableVersion || 'v1.0') + '</span></div>' +
              '<div><strong>Category:</strong> ' + U.escapeHtml(item.categoryName) + '</div>' +
              '<div><strong>Activity:</strong> ' + U.escapeHtml(item.activityName) + '</div>' +
            '</div>' +
            '<div style="font-size:12px"><strong>Contributors &amp; Credit Split (' + U.escapeHtml(item.contributionType || 'Individual') + '):</strong> <div class="flex-row" style="margin-top:4px;flex-wrap:wrap">' + allocsHtml + '</div></div>' +
            '<div class="divider"></div>' +
            (item.businessProblem ? '<div><strong>Problem / Opportunity:</strong><p class="text-secondary" style="font-size:12.5px;margin-top:3px">' + U.escapeHtml(item.businessProblem) + '</p></div>' : '') +
            '<div><strong>Work Performed:</strong><p class="text-secondary" style="font-size:12.5px;margin-top:3px">' + U.escapeHtml(item.solutionImplemented || item.description) + '</p></div>' +
            '<div class="grid-2" style="font-size:12px">' +
              '<div><strong>Expected Impact:</strong> ' + U.escapeHtml(item.expectedImpact || '—') + '</div>' +
              '<div><strong>Actual Impact:</strong> ' + U.escapeHtml(item.actualImpact || '—') + '</div>' +
              '<div><strong>Baseline Measurement:</strong> ' + U.escapeHtml((item.baselineMeasurement || '—') + (item.baselineMeasurement && item.measurementUnit ? ' ' + item.measurementUnit : '')) + '</div>' +
              '<div><strong>Actual Measurement:</strong> ' + U.escapeHtml((item.actualMeasurement || '—') + (item.actualMeasurement && item.measurementUnit ? ' ' + item.measurementUnit : '')) + '</div>' +
            '</div>' +
            '<div><strong>Measurable Impact Summary:</strong> <span style="font-size:12.5px">' + U.escapeHtml(item.measurableImpact || '—') + '</span></div>' +
            '<div><strong>Repository / Evidence:</strong> <span class="font-mono" style="font-size:12px">' + U.escapeHtml(item.evidence) + '</span></div>' +
            '<div class="grid-2" style="font-size:12px">' +
              '<div><strong>Distinct Projects Involved:</strong> ' + U.escapeHtml(item.distinctProjectsInvolved || '—') + '</div>' +
              '<div><strong>Projects Using Asset:</strong> <span class="font-mono">' + Number(item.distinctProjectsReused || 0) + '</span></div>' +
            '</div>' +
            (item.reuseAdoptionEvidence ? '<div><strong>Reuse / Adoption Evidence:</strong><p class="text-secondary" style="font-size:12px;margin-top:3px">' + U.escapeHtml(item.reuseAdoptionEvidence) + '</p></div>' : '') +
            '<div class="divider"></div>' +
            '<div class="grid-2" style="font-size:12px;padding:10px;border-radius:10px;background:#FAF9F5;border:1px solid #E5E9E4">' +
              '<div><strong>Reviewer:</strong> ' + U.escapeHtml(item.reviewerName || 'Pending Assignment') + '</div>' +
              '<div><strong>Approval Status:</strong> ' + U.escapeHtml(displayStatus) + '</div>' +
              '<div><strong>Approval Date:</strong> <span class="font-mono">' + U.escapeHtml(item.approvedDate ? U.formatDate(item.approvedDate) : '—') + '</span></div>' +
              '<div><strong>Points Awarded:</strong> <span class="font-mono" style="font-weight:700">' + (displayStatus === 'Approved' ? (item.finalPoints + ' pts') : (item.basePoints + ' base × ' + Number(item.requestedMultiplier || 1).toFixed(1) + '× (Pending)')) + '</span></div>' +
            '</div>' +
            '<h4 style="font-size:13px;font-weight:700;margin-top:4px">Approval History</h4>' +
            '<div class="stack-sm">' + (histHtml || '<p class="text-muted">No workflow history yet.</p>') + '</div>' +
          '</div>'
        );
      });
    });

    // Delete contribution
    container.querySelectorAll('[data-del-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-del-id');
        U.confirmDialog('Delete Contribution', 'Remove contribution ' + id + ' permanently from IndexedDB?', 'Delete', async function () {
          await S.remove('contributions', id);
          await S.recalculateAllPointsAndBadges();
          U.toast('Contribution deleted and points recalculated.', 'info');
          renderAllContributions(container, onNavigate);
        }, true);
      });
    });
  }

  window.CIS.contributions = {
    renderSubmitContribution: renderSubmitContribution,
    renderAllContributions: renderAllContributions,
    renderMyContributions: renderAllContributions
  };
})();
