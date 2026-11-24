/* ==========================================================================
   CIS Portal — Reports & Analytics (12 Live Reports + Excel/CSV Import & Export)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var selectedReportId = 'employee-summary';

  var REPORT_DEFS = [
    { id: 'employee-summary', label: '1. Employee Lifetime & Annual Summary' },
    { id: 'department-summary', label: '2. Department Performance Comparison' },
    { id: 'team-summary', label: '3. Team Points & Participation' },
    { id: 'category-summary', label: '4. Category-Wise Points Breakdown' },
    { id: 'approved-contributions', label: '5. Approved Contributions Register' },
    { id: 'pending-approvals', label: '6. Pending Approvals Queue' },
    { id: 'badge-distribution', label: '7. Excellence Badge Distribution' },
    { id: 'specialist-roster', label: '8. Specialist Badge Holders & Nominations' },
    { id: 'asset-value', label: '9. Reusable Asset Adoption & Value' },
    { id: 'monthly-trend', label: '10. Monthly Submissions & Approvals Trend' },
    { id: 'reward-proposals', label: '11. Proposed Reward Structure (Indicative)' },
    { id: 'approval-decisions', label: '12. Approval Decision History' }
  ];

  function buildReportRows(reportId) {
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var contributions = S.getAll('contributions');
    var badges = S.getAll('badges').sort(function (a, b) { return a.minPoints - b.minPoints; });
    var nominations = S.getAll('specialist_nominations');
    var assets = S.getAll('assets');
    var rewards = S.getAll('rewards');
    var approvals = S.getAll('approvals');

    if (reportId === 'employee-summary') {
      return employees.map(function (e) {
        return {
          EmployeeID: e.id, Name: e.name, Designation: e.designation || e.role || 'Engineer', Department: e.department, Team: e.teamName,
          AnnualPoints: e.annualPoints || 0, LifetimePoints: e.lifetimePoints || 0,
          CurrentBadge: e.currentBadge || 'None', SpecialistBadges: (e.specialistBadges || []).join('; ')
        };
      }).sort(function (a, b) { return b.LifetimePoints - a.LifetimePoints; });
    }
    if (reportId === 'department-summary') {
      var dMap = {};
      employees.forEach(function (e) {
        if (!dMap[e.department]) dMap[e.department] = { Department: e.department, Employees: 0, Submissions: 0, Approved: 0, ApprovedPoints: 0 };
        dMap[e.department].Employees += 1;
      });
      contributions.forEach(function (c) {
        if (!dMap[c.department]) dMap[c.department] = { Department: c.department, Employees: 0, Submissions: 0, Approved: 0, ApprovedPoints: 0 };
        dMap[c.department].Submissions += 1;
        if (c.status === 'Approved') {
          dMap[c.department].Approved += 1;
          dMap[c.department].ApprovedPoints += Number(c.finalPoints || 0);
        }
      });
      return Object.keys(dMap).map(function (k) { return dMap[k]; });
    }
    if (reportId === 'team-summary') {
      var tMap = {};
      S.getAll('teams').forEach(function (t) {
        var mems = employees.filter(function (e) { return e.teamId === t.id; });
        var tContribs = contributions.filter(function (c) { return c.teamId === t.id; });
        var appPts = tContribs.filter(function (c) { return c.status === 'Approved'; }).reduce(function (s, c) { return s + Number(c.finalPoints || 0); }, 0);
        tMap[t.id] = { TeamID: t.id, TeamName: t.name, Department: t.department, Members: mems.length, TotalSubmissions: tContribs.length, ApprovedPoints: appPts };
      });
      return Object.keys(tMap).map(function (k) { return tMap[k]; });
    }
    if (reportId === 'category-summary') {
      var cMap = {};
      contributions.forEach(function (c) {
        if (!cMap[c.categoryName]) cMap[c.categoryName] = { Category: c.categoryName, Submissions: 0, ApprovedCount: 0, ApprovedPoints: 0, EstTimeSavedHrs: 0, EstCostSavedUSD: 0 };
        cMap[c.categoryName].Submissions += 1;
        if (c.status === 'Approved') {
          cMap[c.categoryName].ApprovedCount += 1;
          cMap[c.categoryName].ApprovedPoints += Number(c.finalPoints || 0);
          cMap[c.categoryName].EstTimeSavedHrs += Number(c.timeSavedHours || 0);
          cMap[c.categoryName].EstCostSavedUSD += Number(c.costSavedUsd || 0);
        }
      });
      return Object.keys(cMap).map(function (k) { return cMap[k]; });
    }
    if (reportId === 'approved-contributions') {
      return contributions.filter(function (c) { return c.status === 'Approved'; }).map(function (c) {
        return {
          ID: c.id, Date: c.contributionDate, Employee: c.employeeName, Department: c.department,
          Category: c.categoryName, Title: c.title, BasePoints: c.basePoints,
          Multiplier: c.approvedMultiplier, FinalPoints: c.finalPoints, CostSavedUSD: c.costSavedUsd || 0
        };
      });
    }
    if (reportId === 'pending-approvals') {
      return contributions.filter(function (c) { return c.status !== 'Approved' && c.status !== 'Rejected' && c.status !== 'Draft'; }).map(function (c) {
        return {
          ID: c.id, Status: 'Pending', Employee: c.employeeName, Department: c.department,
          Title: c.title, Category: c.categoryName, BasePoints: c.basePoints,
          RequestedMultiplier: c.requestedMultiplier, SubmittedDate: String(c.submissionDate || '').slice(0, 10)
        };
      });
    }
    if (reportId === 'badge-distribution') {
      return badges.map(function (b) {
        var holders = employees.filter(function (e) { return e.currentBadge === b.name; });
        return {
          BadgeTier: b.name, MinLifetimePoints: b.minPoints, CurrentHoldersCount: holders.length,
          Holders: holders.map(function (h) { return h.name; }).join('; ')
        };
      });
    }
    if (reportId === 'specialist-roster') {
      return nominations.map(function (n) {
        return {
          NominationID: n.id, Badge: n.badgeName, Nominee: n.nomineeName, Nominator: n.nominatorName,
          Status: n.status, Reviewer: n.reviewerName || '—', Leader: n.leaderName || '—', Updated: String(n.updatedAt || '').slice(0, 10)
        };
      });
    }
    if (reportId === 'asset-value') {
      return assets.map(function (a) {
        return {
          AssetID: a.id, Name: a.name, Category: a.category, Creator: a.creatorName, Team: a.teamName,
          Stage: a.currentStage, Adoptions: a.adoptionCount, Reuses: a.reuseCount,
          EstTimeSavedHrs: a.estimatedTimeSavedHours || 0, EstCostSavedUSD: a.estimatedCostSavedUsd || 0
        };
      });
    }
    if (reportId === 'monthly-trend') {
      var mMap = {};
      contributions.forEach(function (c) {
        var m = String(c.contributionDate || '').slice(0, 7) || '2026-01';
        if (!mMap[m]) mMap[m] = { Month: m, Submitted: 0, Approved: 0, ApprovedPoints: 0 };
        mMap[m].Submitted += 1;
        if (c.status === 'Approved') {
          mMap[m].Approved += 1;
          mMap[m].ApprovedPoints += Number(c.finalPoints || 0);
        }
      });
      return Object.keys(mMap).sort().map(function (k) { return mMap[k]; });
    }
    if (reportId === 'reward-proposals') {
      return rewards.map(function (r) {
        return {
          ID: r.id, Proposal: r.name, Eligibility: r.eligibility, PointsRequired: r.pointsRequirement,
          Type: r.rewardType, ApprovalRequired: r.approvalRequirement, Status: r.status
        };
      });
    }
    if (reportId === 'approval-decisions') {
      return approvals.map(function (a) {
        return {
          ID: a.id, Contribution: a.contributionTitle || a.contributionId, Employee: a.employeeName,
          Stage: a.stage, Reviewer: a.reviewerName, Decision: a.decision, NewStatus: a.newStatus,
          Date: String(a.timestamp || '').slice(0, 10)
        };
      });
    }
    return [];
  }

  function computeSection13Metrics() {
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var contributions = S.getAll('contributions');
    var assets = S.getAll('assets');

    var activeEmps = employees.filter(function (e) { return e.status !== 'Inactive'; });
    var contributorSet = {};
    contributions.forEach(function (c) {
      if (c.status !== 'Draft' && c.employeeId) contributorSet[c.employeeId] = true;
    });
    var activeContributors = Object.keys(contributorSet).length;
    var activeContributorPct = activeEmps.length ? Math.round((activeContributors / activeEmps.length) * 100) : 0;

    var publishedStages = { 'Publish': true, 'Adopt': true, 'Measure Value': true };
    var publishedAssets = assets.filter(function (a) { return publishedStages[a.currentStage]; }).length;
    var distinctProjectAdoptions = assets.reduce(function (s, a) { return s + Number(a.adoptionCount || 0); }, 0);

    var approvedContribs = contributions.filter(function (c) { return c.status === 'Approved'; });
    var contribHoursSaved = approvedContribs.reduce(function (s, c) { return s + Number(c.timeSavedHours || 0); }, 0);
    var assetHoursSaved = assets.reduce(function (s, a) { return s + Number(a.estimatedTimeSavedHours || 0); }, 0);
    var verifiedHoursSaved = contribHoursSaved + assetHoursSaved;

    var presalesWinsEnabled = approvedContribs.filter(function (c) {
      var blob = ((c.categoryName || '') + ' ' + (c.activityName || '') + ' ' + (c.title || '')).toLowerCase();
      return c.categoryId === 'CAT-04' || c.categoryId === 'CAT-07' || /presales|rfp|deal|customer win|poc|proposal|client/i.test(blob);
    }).length;

    var trainedEmpSet = {};
    approvedContribs.forEach(function (c) {
      var blob = ((c.categoryName || '') + ' ' + (c.activityName || '') + ' ' + (c.title || '')).toLowerCase();
      if (c.categoryId === 'CAT-05' || c.categoryId === 'CAT-09' || /train|certif|bootcamp|workshop|mentor|enablement|academy/i.test(blob)) {
        if (c.employeeId) trainedEmpSet[c.employeeId] = true;
      }
    });
    var employeesTrainedCertified = Object.keys(trainedEmpSet).length;

    return {
      activeContributorPct: activeContributorPct,
      activeContributors: activeContributors,
      totalActiveEmps: activeEmps.length,
      publishedAssets: publishedAssets,
      distinctProjectAdoptions: distinctProjectAdoptions,
      verifiedHoursSaved: verifiedHoursSaved,
      presalesWinsEnabled: presalesWinsEnabled,
      employeesTrainedCertified: employeesTrainedCertified
    };
  }

  function renderReports(container) {
    var U = window.CIS.utils;
    var rows = buildReportRows(selectedReportId);
    var headers = rows.length ? Object.keys(rows[0]) : [];
    var currentDef = REPORT_DEFS.find(function (r) { return r.id === selectedReportId; }) || REPORT_DEFS[0];
    var m13 = computeSection13Metrics();

    container.innerHTML =
      '<div class="stack-lg">' +
        // Section 13 Program Impact Summary Metrics
        '<div class="cis-card card-pad">' +
          '<div class="flex-between" style="margin-bottom:12px">' +
            '<div>' +
              '<h3 style="font-size:15px;font-weight:700">CIS Program Impact Metrics (Section 13)</h3>' +
              '<p class="text-secondary" style="font-size:12px">Live leadership KPIs computed across active employees, approved contributions, and published reusable assets.</p>' +
            '</div>' +
            '<span class="pill-tag pastel-sage text-sage">Live Framework KPIs</span>' +
          '</div>' +
          '<div class="grid-kpis-5">' +
            '<div class="kpi-card pastel-sage">' +
              '<div class="kpi-top"><span class="kpi-label">Active Contributor %</span><span class="text-sage">' + U.icon('users', 16) + '</span></div>' +
              '<div class="kpi-value">' + m13.activeContributorPct + '%</div>' +
              '<div class="kpi-sub">' + m13.activeContributors + ' of ' + m13.totalActiveEmps + ' active employees</div>' +
            '</div>' +
            '<div class="kpi-card pastel-blue">' +
              '<div class="kpi-top"><span class="kpi-label">Published Assets &amp; Adoptions</span><span class="text-blue">' + U.icon('layers', 16) + '</span></div>' +
              '<div class="kpi-value">' + m13.publishedAssets + ' / ' + m13.distinctProjectAdoptions + '</div>' +
              '<div class="kpi-sub">' + m13.publishedAssets + ' published &bull; ' + m13.distinctProjectAdoptions + ' project adoptions</div>' +
            '</div>' +
            '<div class="kpi-card pastel-mint">' +
              '<div class="kpi-top"><span class="kpi-label">Verified Hours Saved</span><span class="text-mint">' + U.icon('clock', 16) + '</span></div>' +
              '<div class="kpi-value">' + m13.verifiedHoursSaved.toLocaleString() + '</div>' +
              '<div class="kpi-sub">Approved claims + asset reuse hours</div>' +
            '</div>' +
            '<div class="kpi-card pastel-champagne">' +
              '<div class="kpi-top"><span class="kpi-label">Presales / Customer Wins</span><span class="text-champagne">' + U.icon('trophy', 16) + '</span></div>' +
              '<div class="kpi-value">' + m13.presalesWinsEnabled + '</div>' +
              '<div class="kpi-sub">Verified client &amp; deal enablers</div>' +
            '</div>' +
            '<div class="kpi-card pastel-lavender">' +
              '<div class="kpi-top"><span class="kpi-label">Employees Trained / Certified</span><span class="text-lavender">' + U.icon('award', 16) + '</span></div>' +
              '<div class="kpi-value">' + m13.employeesTrainedCertified + '</div>' +
              '<div class="kpi-sub">Unique certified / enabled engineers</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Report Selector & Export Toolbar
        '<div class="cis-card card-pad-sm flex-between">' +
          '<div class="flex-row" style="flex:1">' +
            '<label class="text-muted" style="font-size:12px;font-weight:600">Select Report:</label>' +
            '<select id="rep-select" class="cis-select" style="max-width:360px">' +
              REPORT_DEFS.map(function (r) {
                return '<option value="' + r.id + '"' + (r.id === selectedReportId ? ' selected' : '') + '>' + U.escapeHtml(r.label) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="flex-row">' +
            '<button type="button" class="btn btn-primary btn-sm" id="rep-xlsx">' + U.icon('download', 14) + '<span>Download Excel (.xlsx)</span></button>' +
            '<button type="button" class="btn btn-secondary btn-sm" id="rep-csv">' + U.icon('spreadsheet', 14) + '<span>Download CSV (.csv)</span></button>' +
          '</div>' +
        '</div>' +

        // Excel / CSV Record-Preserving Import Hub
        '<div class="cis-card card-pad pastel-ivory">' +
          '<div class="flex-between" style="margin-bottom:8px">' +
            '<div>' +
              '<h3 style="font-size:14px;font-weight:700">Offline Excel (.xlsx / .csv) Import Hub</h3>' +
              '<p class="text-secondary" style="font-size:12px">Import spreadsheets directly into IndexedDB without any server. Existing records are strictly preserved (matching IDs update; new rows append).</p>' +
            '</div>' +
          '</div>' +
          '<div class="flex-row">' +
            '<select id="imp-entity" class="cis-select-inline">' +
              '<option value="employees">Employees Directory</option>' +
              '<option value="contributions">Contributions</option>' +
              '<option value="points_master">Points Master Activities</option>' +
              '<option value="assets">Reusable Assets</option>' +
            '</select>' +
            '<label class="btn btn-primary btn-sm" style="cursor:pointer">' +
              U.icon('upload', 14) + '<span>Choose .xlsx or .csv to Import</span>' +
              '<input type="file" id="imp-file" accept=".xlsx,.csv" class="hidden"/>' +
            '</label>' +
          '</div>' +
        '</div>' +

        // Report Data Table
        '<div class="cis-card card-pad">' +
          '<div class="flex-between" style="margin-bottom:12px">' +
            '<h3 style="font-size:15px;font-weight:700">' + U.escapeHtml(currentDef.label) + '</h3>' +
            '<span class="font-mono text-muted" style="font-size:12px">' + rows.length + ' rows</span>' +
          '</div>' +
          (rows.length
            ? '<div class="table-wrap"><table class="cis-table">' +
                '<thead><tr>' + headers.map(function (h) { return '<th>' + U.escapeHtml(h) + '</th>'; }).join('') + '</tr></thead>' +
                '<tbody>' +
                  rows.map(function (r) {
                    return '<tr>' + headers.map(function (h) {
                      var val = r[h];
                      var isNum = typeof val === 'number';
                      return '<td class="' + (isNum ? 'font-mono text-right' : '') + '">' + U.escapeHtml(val) + '</td>';
                    }).join('') + '</tr>';
                  }).join('') +
                '</tbody>' +
              '</table></div>'
            : '<div class="empty-state">No records available for this report.</div>') +
        '</div>' +
      '</div>';

    document.getElementById('rep-select').addEventListener('change', function () {
      selectedReportId = this.value;
      renderReports(container);
    });
    document.getElementById('rep-xlsx').addEventListener('click', function () {
      window.CIS.excel.exportToXlsx(rows, 'CIS_' + selectedReportId + '.xlsx', selectedReportId);
    });
    document.getElementById('rep-csv').addEventListener('click', function () {
      window.CIS.excel.exportToCsv(rows, 'CIS_' + selectedReportId + '.csv');
    });
    document.getElementById('imp-file').addEventListener('change', async function () {
      var file = this.files[0];
      if (!file) return;
      var entity = document.getElementById('imp-entity').value;
      try {
        var res = await window.CIS.excel.importRecordsFromFile(file, entity);
        U.toast('Imported ' + entity + ': ' + res.added + ' added, ' + res.updated + ' updated (all existing records preserved).', 'success');
        renderReports(container);
      } catch (err) {
        U.toast('Import error: ' + err.message, 'error');
      }
    });
  }

  window.CIS.reports = {
    renderReports: renderReports
  };
})();
