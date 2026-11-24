/* ==========================================================================
   CIS Portal — Home Page, Executive Dashboard & Employee Dashboard
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var execFilters = {
    year: 'All',
    month: 'All',
    department: 'All',
    team: 'All',
    project: 'All'
  };

  var selectedEmployeeId = null;

  function computeExecutiveMetrics(filters) {
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var allContribs = S.getAll('contributions');
    var assets = S.getAll('assets');
    var badges = S.getAll('badges').sort(function (a, b) { return a.minPoints - b.minPoints; });
    var teams = S.getAll('teams');
    var projects = S.getAll('projects');
    var settings = S.getSettings();
    var currentYear = Number(settings.currentCycleYear) || 2026;

    var contribs = allContribs.filter(function (c) {
      var dStr = String(c.contributionDate || c.submissionDate || '');
      if (filters.year !== 'All' && dStr.slice(0, 4) !== filters.year) return false;
      if (filters.month !== 'All' && dStr.slice(5, 7) !== filters.month) return false;
      if (filters.department !== 'All' && c.department !== filters.department) return false;
      if (filters.team !== 'All' && c.teamId !== filters.team) return false;
      if (filters.project !== 'All' && c.projectId !== filters.project) return false;
      return true;
    });

    var filteredEmps = employees.filter(function (e) {
      if (filters.department !== 'All' && e.department !== filters.department) return false;
      if (filters.team !== 'All' && e.teamId !== filters.team) return false;
      if (filters.project !== 'All' && e.projectId !== filters.project) return false;
      return true;
    });

    var filteredAssets = assets.filter(function (a) {
      if (filters.team !== 'All' && a.teamId !== filters.team) return false;
      if (filters.project !== 'All' && a.projectId !== filters.project) return false;
      return true;
    });

    var approved = contribs.filter(function (c) { return c.status === 'Approved'; });
    var pendingApprovals = contribs.filter(function (c) { return c.status !== 'Approved' && c.status !== 'Rejected' && c.status !== 'Draft'; }).length;
    var totalPointsEarned = approved.reduce(function (sum, c) { return sum + Number(c.finalPoints || 0); }, 0);
    var totalAnnualPoints = approved
      .filter(function (c) { return new Date(c.contributionDate || c.submissionDate).getFullYear() === currentYear; })
      .reduce(function (sum, c) { return sum + Number(c.finalPoints || 0); }, 0);

    var activeSubmitters = {};
    contribs.forEach(function (c) { activeSubmitters[c.employeeId] = true; });
    var participationPct = filteredEmps.length > 0
      ? Math.min(100, Math.round((Object.keys(activeSubmitters).length / filteredEmps.length) * 100))
      : 0;

    var employeesRecognized = filteredEmps.filter(function (e) { return e.currentBadge && e.currentBadge !== 'None'; }).length;
    var specialistBadgesAwarded = filteredEmps.reduce(function (sum, e) {
      return sum + (Array.isArray(e.specialistBadges) ? e.specialistBadges.length : 0);
    }, 0);

    // Monthly Trend
    var monthMap = {};
    contribs.forEach(function (c) {
      var m = String(c.contributionDate || c.submissionDate || '').slice(0, 7) || '2026-01';
      if (!monthMap[m]) monthMap[m] = { label: m, submitted: 0, approved: 0, points: 0 };
      monthMap[m].submitted += 1;
      if (c.status === 'Approved') {
        monthMap[m].approved += 1;
        monthMap[m].points += Number(c.finalPoints || 0);
      }
    });
    var monthlyTrend = Object.keys(monthMap).sort().slice(-10).map(function (k) { return monthMap[k]; });

    // Annual Trend
    var yearMap = {};
    approved.forEach(function (c) {
      var yr = String(c.contributionDate || c.submissionDate || '').slice(0, 4) || String(currentYear);
      yearMap[yr] = (yearMap[yr] || 0) + Number(c.finalPoints || 0);
    });
    var annualTrend = Object.keys(yearMap).sort().map(function (yr) { return { label: yr, value: yearMap[yr] }; });

    // Points by Category
    var catMap = {};
    approved.forEach(function (c) {
      catMap[c.categoryName] = (catMap[c.categoryName] || 0) + Number(c.finalPoints || 0);
    });
    var pointsByCategory = Object.keys(catMap).map(function (k) {
      return { label: k, value: catMap[k] };
    }).sort(function (a, b) { return b.value - a.value; });

    // Department Comparison
    var deptMap = {};
    contribs.forEach(function (c) {
      if (!deptMap[c.department]) deptMap[c.department] = { label: c.department, points: 0, contributions: 0 };
      deptMap[c.department].contributions += 1;
      if (c.status === 'Approved') deptMap[c.department].points += Number(c.finalPoints || 0);
    });
    var departmentComparison = Object.keys(deptMap).map(function (k) { return deptMap[k]; });

    // Team Comparison
    var teamMap = {};
    approved.forEach(function (c) {
      teamMap[c.teamName] = (teamMap[c.teamName] || 0) + Number(c.finalPoints || 0);
    });
    var teamComparison = Object.keys(teamMap).map(function (k) { return { label: k, value: teamMap[k] }; });

    // Badge Distribution
    var badgeDistribution = badges.map(function (b) {
      var cnt = filteredEmps.filter(function (e) { return e.currentBadge === b.name; }).length;
      return { label: b.name.split(' ')[0], value: cnt, color: b.color };
    });

    // Status Breakdown
    var statusMap = {};
    contribs.forEach(function (c) { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
    var statusBreakdown = Object.keys(statusMap).map(function (k) { return { label: k, value: statusMap[k] }; });

    // Asset Lifecycle Distribution
    var stages = ['Create', 'Validate', 'Standardize', 'Publish', 'Adopt', 'Measure Value'];
    var assetLifecycleDist = stages.map(function (st) {
      return {
        label: st,
        value: filteredAssets.filter(function (a) { return a.currentStage === st; }).length
      };
    });

    var topEmployees = filteredEmps.slice().sort(function (a, b) {
      return Number(b.lifetimePoints || 0) - Number(a.lifetimePoints || 0);
    }).slice(0, 10);

    var recentActivity = contribs.slice().sort(function (a, b) {
      return String(b.contributionDate || b.submissionDate).localeCompare(String(a.contributionDate || a.submissionDate));
    }).slice(0, 10);

    var departments = [];
    employees.forEach(function (e) {
      if (e.department && departments.indexOf(e.department) === -1) departments.push(e.department);
    });

    return {
      kpis: {
        totalEmployees: filteredEmps.length,
        totalContributions: contribs.length,
        totalApproved: approved.length,
        totalPointsEarned: totalPointsEarned,
        totalAnnualPoints: totalAnnualPoints,
        totalAssetsCreated: filteredAssets.length,
        totalAssetsAdopted: filteredAssets.filter(function (a) { return Number(a.adoptionCount || 0) > 0; }).length,
        pendingApprovals: pendingApprovals,
        employeesRecognized: employeesRecognized,
        specialistBadgesAwarded: specialistBadgesAwarded,
        participationPct: participationPct,
        currentYear: currentYear
      },
      charts: {
        monthlyTrend: monthlyTrend,
        annualTrend: annualTrend,
        pointsByCategory: pointsByCategory,
        departmentComparison: departmentComparison,
        teamComparison: teamComparison,
        badgeDistribution: badgeDistribution,
        statusBreakdown: statusBreakdown,
        assetLifecycleDist: assetLifecycleDist
      },
      topEmployees: topEmployees,
      recentActivity: recentActivity,
      filterOptions: { departments: departments, teams: teams, projects: projects }
    };
  }

  function renderExecutiveDashboard(container) {
    var U = window.CIS.utils;
    var C = window.CIS.charts;
    var data = computeExecutiveMetrics(execFilters);
    var k = data.kpis;

    var kpiCards = [
      { label: 'Total Employees', value: k.totalEmployees, bg: 'pastel-sage', ic: 'text-sage', icon: 'users' },
      { label: 'Contributions Submitted', value: k.totalContributions, bg: 'pastel-blue', ic: 'text-blue', icon: 'fileText' },
      { label: 'Approved Contributions', value: k.totalApproved, bg: 'pastel-mint', ic: 'text-mint', icon: 'checkCircle' },
      { label: 'Total Points Earned', value: k.totalPointsEarned.toLocaleString(), bg: 'pastel-blue', ic: 'text-blue', icon: 'sparkles' },
      { label: 'Annual Points (' + k.currentYear + ')', value: k.totalAnnualPoints.toLocaleString(), bg: 'pastel-champagne', ic: 'text-champagne', icon: 'calendar' },
      { label: 'Assets Created', value: k.totalAssetsCreated, bg: 'pastel-mint', ic: 'text-mint', icon: 'layers' },
      { label: 'Assets Adopted', value: k.totalAssetsAdopted, bg: 'pastel-sage', ic: 'text-sage', icon: 'share' },
      { label: 'Pending Approvals', value: k.pendingApprovals, bg: 'pastel-blush', ic: 'text-blush', icon: 'clock' },
      { label: 'Employees Recognized', value: k.employeesRecognized, bg: 'pastel-champagne', ic: 'text-champagne', icon: 'award' },
      { label: 'Specialist Badges', value: k.specialistBadgesAwarded, bg: 'pastel-lavender', ic: 'text-lavender', icon: 'star' }
    ];

    container.innerHTML =
      '<div class="stack-lg">' +
        // Filter bar
        '<div class="cis-card card-pad-sm flex-row">' +
          '<select id="ef-year" class="cis-select-inline">' +
            '<option value="All">All Years</option>' +
            '<option value="2026"' + (execFilters.year === '2026' ? ' selected' : '') + '>2026</option>' +
            '<option value="2025"' + (execFilters.year === '2025' ? ' selected' : '') + '>2025</option>' +
          '</select>' +
          '<select id="ef-month" class="cis-select-inline">' +
            '<option value="All">All Months</option>' +
            ['01','02','03','04','05','06','07','08','09','10','11','12'].map(function (m) {
              return '<option value="' + m + '"' + (execFilters.month === m ? ' selected' : '') + '>Month ' + m + '</option>';
            }).join('') +
          '</select>' +
          '<select id="ef-dept" class="cis-select-inline">' +
            '<option value="All">All Departments</option>' +
            data.filterOptions.departments.map(function (d) {
              return '<option value="' + U.escapeHtml(d) + '"' + (execFilters.department === d ? ' selected' : '') + '>' + U.escapeHtml(d) + '</option>';
            }).join('') +
          '</select>' +
          '<select id="ef-team" class="cis-select-inline">' +
            '<option value="All">All Teams</option>' +
            data.filterOptions.teams.map(function (t) {
              return '<option value="' + t.id + '"' + (execFilters.team === t.id ? ' selected' : '') + '>' + U.escapeHtml(t.name) + '</option>';
            }).join('') +
          '</select>' +
          '<select id="ef-project" class="cis-select-inline">' +
            '<option value="All">All Projects</option>' +
            data.filterOptions.projects.map(function (p) {
              return '<option value="' + p.id + '"' + (execFilters.project === p.id ? ' selected' : '') + '>' + U.escapeHtml(p.name) + '</option>';
            }).join('') +
          '</select>' +
          '<button type="button" class="btn btn-secondary btn-sm" id="ef-reset" style="margin-left:auto">Reset Filters</button>' +
        '</div>' +

        // 10 Pastel KPI Cards
        '<div class="grid-kpis">' +
          kpiCards.map(function (kc) {
            return '<div class="kpi-card ' + kc.bg + '">' +
              '<div class="kpi-top">' +
                '<span class="kpi-label">' + U.escapeHtml(kc.label) + '</span>' +
                '<span class="' + kc.ic + '">' + U.icon(kc.icon, 16) + '</span>' +
              '</div>' +
              '<div class="kpi-value">' + U.escapeHtml(kc.value) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        // Monthly Trend + Participation
        '<div class="grid-2-1">' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Monthly Contribution &amp; Approval Trend</h3>' +
            '<div id="chart-monthly"></div>' +
          '</div>' +
          '<div class="cis-card card-pad" style="display:flex;flex-direction:column;justify-content:space-between">' +
            '<div>' +
              '<h3 style="font-size:14px;font-weight:700">Employee Participation Rate</h3>' +
              '<div style="display:flex;align-items:baseline;gap:8px;margin-top:12px">' +
                '<span class="font-mono" style="font-size:34px;font-weight:800">' + k.participationPct + '%</span>' +
                '<span class="text-secondary" style="font-size:12px">active contributors</span>' +
              '</div>' +
              '<div class="progress-track" style="margin-top:10px"><div class="progress-fill" style="width:' + k.participationPct + '%"></div></div>' +
            '</div>' +
            '<div class="divider"></div>' +
            '<div>' +
              '<h4 style="font-size:12px;font-weight:700;margin-bottom:8px">Annual Points Trend</h4>' +
              '<div id="chart-annual"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Category & Department Charts
        '<div class="grid-2">' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Points Earned by Category</h3>' +
            '<div id="chart-category"></div>' +
          '</div>' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Department-Wise Contribution Comparison</h3>' +
            '<div id="chart-department"></div>' +
          '</div>' +
        '</div>' +

        // Team, Badges, Status
        '<div class="grid-3">' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Team-Wise Points</h3>' +
            '<div id="chart-team"></div>' +
          '</div>' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Excellence Badge Distribution</h3>' +
            '<div id="chart-badges"></div>' +
          '</div>' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Submission Status Breakdown</h3>' +
            '<div id="chart-status"></div>' +
          '</div>' +
        '</div>' +

        // Asset Lifecycle & Top 10 Employees
        '<div class="grid-2">' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Asset Lifecycle Stage Distribution</h3>' +
            '<div id="chart-assets"></div>' +
          '</div>' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Top 10 Employees by Approved Lifetime Points</h3>' +
            '<div class="table-wrap"><table class="cis-table">' +
              '<thead><tr><th>Employee</th><th>Department</th><th>Badge</th><th class="text-right">Annual</th><th class="text-right">Lifetime</th></tr></thead>' +
              '<tbody>' +
                data.topEmployees.map(function (emp) {
                  return '<tr>' +
                    '<td style="font-weight:600">' + U.escapeHtml(emp.name) + '</td>' +
                    '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(emp.department) + '</td>' +
                    '<td class="text-sage" style="font-size:12px;font-weight:600">' + U.escapeHtml(emp.currentBadge || 'None') + '</td>' +
                    '<td class="text-right font-mono text-secondary">' + Number(emp.annualPoints || 0) + '</td>' +
                    '<td class="text-right font-mono" style="font-weight:700">' + Number(emp.lifetimePoints || 0) + '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table></div>' +
          '</div>' +
        '</div>' +

        // Recent Organizational Activity
        '<div class="cis-card card-pad">' +
          '<div class="flex-between" style="margin-bottom:12px">' +
            '<h3 style="font-size:14px;font-weight:700">Recent Contribution Activity</h3>' +
            '<span class="text-muted" style="font-size:12px">Latest submissions &amp; approvals</span>' +
          '</div>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>ID</th><th>Contribution</th><th>Employee</th><th>Department</th><th>Status</th><th class="text-right">Date</th><th class="text-right">Points</th></tr></thead>' +
            '<tbody>' +
              data.recentActivity.map(function (item) {
                return '<tr>' +
                  '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(item.id) + '</td>' +
                  '<td style="font-weight:600">' + U.escapeHtml(item.title) + '</td>' +
                  '<td>' + U.escapeHtml(item.employeeName) + '</td>' +
                  '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(item.department) + '</td>' +
                  '<td>' + U.statusBadge(U.normalizeContributionStatus(item.status)) + '</td>' +
                  '<td class="text-right font-mono text-muted" style="font-size:12px">' + U.escapeHtml(U.formatDate(item.contributionDate)) + '</td>' +
                  '<td class="text-right font-mono" style="font-weight:700">' +
                    (item.status === 'Approved' ? (item.finalPoints + ' pts') : (item.basePoints + ' base')) +
                  '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    // Render SVG Charts
    C.renderLineChart(document.getElementById('chart-monthly'), data.charts.monthlyTrend, [
      { key: 'submitted', label: 'Submitted', color: '#7BA2C4' },
      { key: 'approved', label: 'Approved', color: '#6FA895' }
    ]);
    C.renderBarChart(document.getElementById('chart-annual'), data.charts.annualTrend, '#7BA2C4', 150);
    C.renderHorizontalBarChart(document.getElementById('chart-category'), data.charts.pointsByCategory, '#7CA38F');
    C.renderGroupedBarChart(document.getElementById('chart-department'), data.charts.departmentComparison, [
      { key: 'points', label: 'Approved Points', color: '#7BA2C4' },
      { key: 'contributions', label: 'Submissions', color: '#C8A86B' }
    ]);
    C.renderBarChart(document.getElementById('chart-team'), data.charts.teamComparison, '#6FA895', 200);
    C.renderBarChart(document.getElementById('chart-badges'), data.charts.badgeDistribution, '#C8A86B', 200);
    C.renderPieChart(document.getElementById('chart-status'), data.charts.statusBreakdown);
    C.renderBarChart(document.getElementById('chart-assets'), data.charts.assetLifecycleDist, '#9E8BB8', 210);

    // Bind filter events
    function bindFilter(id, key) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function () {
        execFilters[key] = this.value;
        renderExecutiveDashboard(container);
      });
    }
    bindFilter('ef-year', 'year');
    bindFilter('ef-month', 'month');
    bindFilter('ef-dept', 'department');
    bindFilter('ef-team', 'team');
    bindFilter('ef-project', 'project');

    var resetBtn = document.getElementById('ef-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        execFilters = { year: 'All', month: 'All', department: 'All', team: 'All', project: 'All' };
        renderExecutiveDashboard(container);
      });
    }
  }

  function buildSpotlightAndQuarterlyHtml() {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    var approved = S.getAll('contributions').filter(function (c) { return c.status === 'Approved'; });

    // Determine latest month with approved contributions for Monthly Spotlight
    var latestMonth = '';
    approved.forEach(function (c) {
      var m = String(c.contributionDate || c.submissionDate || '').slice(0, 7);
      if (m > latestMonth) latestMonth = m;
    });

    var monthlyScores = {};
    approved.forEach(function (c) {
      var m = String(c.contributionDate || c.submissionDate || '').slice(0, 7);
      if (latestMonth && m === latestMonth) {
        monthlyScores[c.employeeId] = (monthlyScores[c.employeeId] || 0) + Number(c.finalPoints || 0);
      }
    });

    var sortedMonthly = Object.keys(monthlyScores).map(function (eid) {
      var emp = employees.find(function (e) { return e.id === eid; });
      return { emp: emp, pts: monthlyScores[eid] };
    }).filter(function (x) { return Boolean(x.emp); }).sort(function (a, b) { return b.pts - a.pts; });

    var spotlightEmp = sortedMonthly[0]
      ? sortedMonthly[0].emp
      : employees.slice().sort(function (a, b) { return Number(b.annualPoints || 0) - Number(a.annualPoints || 0); })[0];
    var spotlightPts = sortedMonthly[0] ? sortedMonthly[0].pts : (spotlightEmp ? Number(spotlightEmp.annualPoints || 0) : 0);
    var spotlightPeriod = latestMonth || 'Current Cycle';

    // Compute Quarterly Award Winners across key CIS pillars
    function pickCategoryWinner(catIds, fallbackIdx) {
      var scoreMap = {};
      approved.forEach(function (c) {
        if (catIds.indexOf(c.categoryId) !== -1) {
          scoreMap[c.employeeId] = (scoreMap[c.employeeId] || 0) + Number(c.finalPoints || 0);
        }
      });
      var topId = Object.keys(scoreMap).sort(function (a, b) { return scoreMap[b] - scoreMap[a]; })[0];
      var found = topId ? employees.find(function (e) { return e.id === topId; }) : null;
      if (found) return { name: found.name, dept: found.department, pts: scoreMap[topId] };
      var fb = employees[fallbackIdx] || employees[0];
      return fb ? { name: fb.name, dept: fb.department, pts: Number(fb.annualPoints || 0) } : { name: 'Pending Selection', dept: 'CIS', pts: 0 };
    }

    var qAwards = [
      { title: 'Quarterly Innovation & Automation Star', winner: pickCategoryWinner(['CAT-01', 'CAT-02'], 10), bg: 'pastel-blue', accent: 'text-blue' },
      { title: 'Quarterly Reuse & Accelerator Builder', winner: pickCategoryWinner(['CAT-08', 'CAT-03'], 6), bg: 'pastel-mint', accent: 'text-mint' },
      { title: 'Quarterly Customer & Delivery Champion', winner: pickCategoryWinner(['CAT-04', 'CAT-07'], 14), bg: 'pastel-champagne', accent: 'text-champagne' }
    ];

    return '<div class="grid-2">' +
      '<div class="cis-card card-pad pastel-champagne">' +
        '<div class="flex-between" style="margin-bottom:8px">' +
          '<span class="pill-tag pastel-ivory text-champagne">' + U.icon('star', 12) + '&nbsp;Monthly CIS Contributor Spotlight</span>' +
          '<span class="font-mono text-muted" style="font-size:11.5px">' + U.escapeHtml(spotlightPeriod) + '</span>' +
        '</div>' +
        (spotlightEmp
          ? '<div style="margin-top:8px">' +
              '<div style="font-size:18px;font-weight:800;color:#42534B">' + U.escapeHtml(spotlightEmp.name) + '</div>' +
              '<div class="text-secondary" style="font-size:12.5px;margin-top:2px">' + U.escapeHtml(spotlightEmp.designation || spotlightEmp.role || 'CIS Contributor') + ' &bull; ' + U.escapeHtml(spotlightEmp.department) + '</div>' +
              '<div class="flex-row" style="margin-top:12px;gap:8px">' +
                '<span class="status-badge status-champagne">' + spotlightPts + ' pts spotlight impact</span>' +
                '<span class="status-badge status-sage">' + U.escapeHtml(spotlightEmp.currentBadge || 'Bronze Contributor') + '</span>' +
              '</div>' +
            '</div>'
          : '<p class="text-muted" style="font-size:12.5px">Spotlight updates automatically as contributions are approved.</p>') +
      '</div>' +

      '<div class="cis-card card-pad">' +
        '<div class="flex-between" style="margin-bottom:10px">' +
          '<h3 style="font-size:14.5px;font-weight:700">' + U.icon('trophy', 15) + '&nbsp;Quarterly CIS Awards</h3>' +
          '<span class="text-muted" style="font-size:11.5px">Live Cycle Standings</span>' +
        '</div>' +
        '<div class="stack-sm">' +
          qAwards.map(function (qa) {
            return '<div class="flex-between" style="padding:8px 10px;border-radius:10px;background:#FAF9F5;border:1px solid #E5E9E4">' +
              '<div>' +
                '<div style="font-size:11.5px;font-weight:700" class="' + qa.accent + '">' + U.escapeHtml(qa.title) + '</div>' +
                '<div style="font-size:13px;font-weight:600;margin-top:2px">' + U.escapeHtml(qa.winner.name) + ' <span class="text-muted" style="font-size:11.5px;font-weight:400">&bull; ' + U.escapeHtml(qa.winner.dept) + '</span></div>' +
              '</div>' +
              '<span class="font-mono" style="font-size:12px;font-weight:700">' + qa.winner.pts + ' pts</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderHomePage(container, onNavigate) {
    var U = window.CIS.utils;
    var modules = window.CIS.navigation.ALL_MODULES;

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div class="welcome-banner flex-between">' +
          '<div>' +
            '<div class="pill-tag pastel-sage text-sage" style="margin-bottom:8px">Tech Mahindra &bull; Cloud &amp; Infrastructure Services</div>' +
            '<h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em">CIS Impact Points &amp; Excellence Portal</h1>' +
            '<p class="text-secondary" style="font-size:13.5px;margin-top:6px;max-width:680px">' +
              'Select any of the ' + modules.length + ' enterprise portal modules below to navigate directly to its workspace.' +
            '</p>' +
          '</div>' +
          '<div class="flex-row">' +
            '<button type="button" class="btn btn-primary" data-home-go="submit-contribution">' + U.icon('plusCircle', 15) + '<span>Submit Contribution</span></button>' +
            '<button type="button" class="btn btn-warning" data-home-go="approvals">' + U.icon('checkSquare', 15) + '<span>Review Approvals</span></button>' +
          '</div>' +
        '</div>' +

        // Quick-access clickable module cards
        '<div>' +
          '<div class="flex-between" style="margin-bottom:12px">' +
            '<h2 style="font-size:16px;font-weight:700">Portal Modules</h2>' +
            '<span class="text-muted" style="font-size:12px">Click any card to open its workspace</span>' +
          '</div>' +
          '<div class="grid-modules">' +
            modules.map(function (m) {
              return '<button type="button" class="module-card" data-home-go="' + m.id + '">' +
                '<div class="module-icon-box ' + m.pastelBg + ' ' + m.iconColor + '">' + U.icon(m.icon, 18) + '</div>' +
                '<div class="module-title">' + U.escapeHtml(m.label) + '</div>' +
                '<div class="module-desc">' + U.escapeHtml(m.description) + '</div>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>' +

        // Monthly CIS Contributor Spotlight & Quarterly Awards
        buildSpotlightAndQuarterlyHtml() +
      '</div>';

    var goBtns = container.querySelectorAll('[data-home-go]');
    for (var i = 0; i < goBtns.length; i++) {
      goBtns[i].addEventListener('click', function () {
        onNavigate(this.getAttribute('data-home-go'));
      });
    }
  }

  function renderEmployeeDashboard(container, onNavigate) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var employees = S.getAll('employees');
    if (!selectedEmployeeId || !employees.some(function (e) { return e.id === selectedEmployeeId; })) {
      selectedEmployeeId = employees[0] ? employees[0].id : null;
    }
    var emp = employees.find(function (e) { return e.id === selectedEmployeeId; }) || employees[0];
    if (!emp) {
      container.innerHTML = '<div class="empty-state">No employee records found.</div>';
      return;
    }

    var badges = S.getAll('badges').sort(function (a, b) { return a.minPoints - b.minPoints; });
    var nextBadge = badges.find(function (b) { return b.minPoints > (emp.lifetimePoints || 0); });
    var progressPct = nextBadge
      ? Math.min(100, Math.round(((emp.lifetimePoints || 0) / nextBadge.minPoints) * 100))
      : 100;

    var contribs = S.getAll('contributions').filter(function (c) {
      return c.employeeId === emp.id || (c.teamAllocations || []).some(function (a) { return a.employeeId === emp.id; });
    }).sort(function (a, b) {
      return String(b.contributionDate || '').localeCompare(String(a.contributionDate || ''));
    });

    var approvedCount = contribs.filter(function (c) { return c.status === 'Approved'; }).length;
    var pendingCount = contribs.filter(function (c) {
      return c.status !== 'Approved' && c.status !== 'Rejected' && c.status !== 'Draft';
    }).length;

    // Category breakdown for employee
    var catPts = {};
    contribs.filter(function (c) { return c.status === 'Approved'; }).forEach(function (c) {
      var alloc = (c.teamAllocations || []).find(function (a) { return a.employeeId === emp.id; });
      var pts = Math.round(((c.finalPoints || 0) * (alloc ? alloc.percentage : 100)) / 100);
      catPts[c.categoryName] = (catPts[c.categoryName] || 0) + pts;
    });
    var empCatData = Object.keys(catPts).map(function (k) { return { label: k, value: catPts[k] }; });

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div class="cis-card card-pad-sm flex-between">' +
          '<div>' +
            '<div style="font-size:15px;font-weight:700">' + U.escapeHtml(emp.name) + ' <span class="pill-tag pastel-sage text-sage" style="margin-left:6px">' + U.escapeHtml(emp.designation || emp.role || 'Team Member') + '</span></div>' +
            '<div class="text-secondary" style="font-size:12px;margin-top:2px">' + U.escapeHtml(emp.department) + ' &bull; ' + U.escapeHtml(emp.teamName) + ' &bull; ' + U.escapeHtml(emp.projectName) + '</div>' +
          '</div>' +
          '<div class="flex-row">' +
            '<label class="text-muted" style="font-size:12px">Employee:</label>' +
            '<select id="emp-dash-select" class="cis-select-inline">' +
              employees.map(function (e) {
                return '<option value="' + e.id + '"' + (e.id === emp.id ? ' selected' : '') + '>' + U.escapeHtml(e.name) + ' (' + U.escapeHtml(e.department) + ')</option>';
              }).join('') +
            '</select>' +
            '<button type="button" class="btn btn-primary btn-sm" id="emp-dash-submit">' + U.icon('plusCircle', 14) + '<span>New Contribution</span></button>' +
          '</div>' +
        '</div>' +

        '<div class="grid-kpis-4">' +
          '<div class="kpi-card pastel-sage"><div class="kpi-top"><span class="kpi-label">Lifetime Impact Points</span><span class="text-sage">' + U.icon('sparkles', 16) + '</span></div><div class="kpi-value">' + Number(emp.lifetimePoints || 0).toLocaleString() + '</div><div class="kpi-sub">Cumulative across all years</div></div>' +
          '<div class="kpi-card pastel-blue"><div class="kpi-top"><span class="kpi-label">Annual Points (2026)</span><span class="text-blue">' + U.icon('calendar', 16) + '</span></div><div class="kpi-value">' + Number(emp.annualPoints || 0).toLocaleString() + '</div><div class="kpi-sub">Current cycle year</div></div>' +
          '<div class="kpi-card pastel-champagne"><div class="kpi-top"><span class="kpi-label">Current Excellence Badge</span><span class="text-champagne">' + U.icon('award', 16) + '</span></div><div class="kpi-value" style="font-size:19px;margin-top:12px">' + U.escapeHtml(emp.currentBadge || 'None') + '</div><div class="kpi-sub">' + (nextBadge ? (nextBadge.minPoints - (emp.lifetimePoints || 0)) + ' pts to ' + nextBadge.name : 'Pinnacle Tier Reached!') + '</div></div>' +
          '<div class="kpi-card pastel-mint"><div class="kpi-top"><span class="kpi-label">Contributions</span><span class="text-mint">' + U.icon('checkCircle', 16) + '</span></div><div class="kpi-value">' + approvedCount + ' <span style="font-size:14px;color:#68766F">/ ' + contribs.length + '</span></div><div class="kpi-sub">' + pendingCount + ' awaiting review</div></div>' +
        '</div>' +

        '<div class="grid-2">' +
          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:10px">Badge Milestone Progression</h3>' +
            '<div class="flex-between" style="font-size:12px;margin-bottom:6px">' +
              '<span>Current: <strong>' + U.escapeHtml(emp.currentBadge || 'None') + '</strong></span>' +
              '<span>' + (nextBadge ? 'Next: <strong>' + U.escapeHtml(nextBadge.name) + ' (' + nextBadge.minPoints + ' pts)</strong>' : 'Maximum Tier Achieved') + '</span>' +
            '</div>' +
            '<div class="progress-track"><div class="progress-fill" style="width:' + progressPct + '%"></div></div>' +
            '<div class="divider"></div>' +
            '<h4 style="font-size:12.5px;font-weight:700;margin-bottom:8px">Earned Specialist Badges</h4>' +
            ((emp.specialistBadges && emp.specialistBadges.length)
              ? '<div class="flex-row">' + emp.specialistBadges.map(function (sb) {
                  return '<span class="status-badge status-lavender">' + U.icon('star', 12) + '&nbsp;' + U.escapeHtml(sb) + '</span>';
                }).join('') + '</div>'
              : '<p class="text-muted" style="font-size:12px">No specialist badges awarded yet.</p>') +
          '</div>' +

          '<div class="cis-card card-pad">' +
            '<h3 style="font-size:14px;font-weight:700;margin-bottom:10px">Approved Points by Category</h3>' +
            '<div id="emp-cat-chart"></div>' +
          '</div>' +
        '</div>' +

        buildSpotlightAndQuarterlyHtml() +

        '<div class="cis-card card-pad">' +
          '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Personal Contribution History</h3>' +
          (contribs.length
            ? '<div class="table-wrap"><table class="cis-table">' +
                '<thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th class="text-right">Points</th></tr></thead>' +
                '<tbody>' +
                  contribs.map(function (c) {
                    return '<tr>' +
                      '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(c.id) + '</td>' +
                      '<td style="font-weight:600">' + U.escapeHtml(c.title) + '</td>' +
                      '<td class="text-secondary" style="font-size:12px">' + U.escapeHtml(c.categoryName) + '</td>' +
                      '<td class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(U.formatDate(c.contributionDate)) + '</td>' +
                      '<td>' + U.statusBadge(U.normalizeContributionStatus(c.status)) + '</td>' +
                      '<td class="text-right font-mono" style="font-weight:700">' + (c.status === 'Approved' ? (c.finalPoints + ' pts') : (c.basePoints + ' base')) + '</td>' +
                    '</tr>';
                  }).join('') +
                '</tbody>' +
              '</table></div>'
            : '<div class="empty-state">No contributions logged for this employee yet.</div>') +
        '</div>' +
      '</div>';

    window.CIS.charts.renderHorizontalBarChart(document.getElementById('emp-cat-chart'), empCatData, '#7BA2C4');

    document.getElementById('emp-dash-select').addEventListener('change', function () {
      selectedEmployeeId = this.value;
      renderEmployeeDashboard(container, onNavigate);
    });
    document.getElementById('emp-dash-submit').addEventListener('click', function () {
      onNavigate('submit-contribution');
    });
  }

  window.CIS.dashboard = {
    renderHomePage: renderHomePage,
    renderExecutiveDashboard: renderExecutiveDashboard,
    renderEmployeeDashboard: renderEmployeeDashboard
  };
})();
