/* ==========================================================================
   CIS Portal — Top Header, Horizontal Dropdown Navigation & Module Metadata
   Preserves Elegant Light Pastel Theme — Direct Open Access (No Login / Roles)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var ALL_MODULES = [
    { id: 'executive-dashboard', label: 'Executive Dashboard', description: 'Organization-wide KPIs, live analytics charts, and multi-dimensional filters.', icon: 'chart', group: 'Insights', pastelBg: 'pastel-blue', iconColor: 'text-blue' },
    { id: 'employee-dashboard', label: 'Employee Dashboard', description: 'Personal lifetime vs. annual points, badge progression, and contribution summary.', icon: 'user', group: 'Employees', pastelBg: 'pastel-sage', iconColor: 'text-sage' },
    { id: 'submit-contribution', label: 'Submit Contribution', description: 'Log individual or team impact with automated Points Master lookup and evidence.', icon: 'plusCircle', group: 'Contributions', pastelBg: 'pastel-blue', iconColor: 'text-blue' },
    { id: 'all-contributions', label: 'All Contributions', description: 'Track all submitted contributions, view approval details, and review workflow status.', icon: 'fileText', group: 'Contributions', pastelBg: 'pastel-mint', iconColor: 'text-mint' },
    { id: 'team-management', label: 'Team Management', description: 'Review department teams, member directories, Excel import/export, and team points.', icon: 'users', group: 'Employees', pastelBg: 'pastel-sage', iconColor: 'text-sage' },
    { id: 'points-master', label: 'Points & Activities', description: 'Browse and configure the 9-category activity framework and impact multipliers.', icon: 'book', group: 'Points & Recognition', pastelBg: 'pastel-champagne', iconColor: 'text-champagne' },
    { id: 'excellence-badges', label: 'Excellence Badges', description: 'Explore 7 cumulative lifetime tiers from Bronze Contributor to CIS Legend.', icon: 'award', group: 'Points & Recognition', pastelBg: 'pastel-champagne', iconColor: 'text-champagne' },
    { id: 'specialist-badges', label: 'Specialist Badges', description: 'Nominate and evaluate employees for 12 CIS specialist honors.', icon: 'star', group: 'Points & Recognition', pastelBg: 'pastel-lavender', iconColor: 'text-lavender' },
    { id: 'asset-lifecycle', label: 'Asset Lifecycle', description: 'Manage reusable organizational assets across all 6 lifecycle stages and value.', icon: 'layers', group: 'Operations', pastelBg: 'pastel-mint', iconColor: 'text-mint' },
    { id: 'approvals', label: 'Approvals', description: 'Multi-level manager, technical, and leadership review queue with multipliers.', icon: 'checkSquare', group: 'Operations', pastelBg: 'pastel-blush', iconColor: 'text-blush' },
    { id: 'recognition', label: 'Recognition & Rewards', description: 'Celebrate top contributors, non-monetary pathways, and reward proposals.', icon: 'trophy', group: 'Points & Recognition', pastelBg: 'pastel-lavender', iconColor: 'text-lavender' },
    { id: 'reports', label: 'Reports & Analytics', description: 'Generate live organizational reports with Excel (.xlsx) & CSV import/export.', icon: 'spreadsheet', group: 'Insights', pastelBg: 'pastel-blue', iconColor: 'text-blue' }
  ];

  var NAV_GROUPS = [
    { id: 'home', label: 'Home', directPage: 'home' },
    {
      id: 'employees',
      label: 'Employees',
      items: [
        { id: 'employee-dashboard', label: 'Employee Dashboard', icon: 'user' },
        { id: 'team-management', label: 'Team Management', icon: 'users' }
      ]
    },
    {
      id: 'contributions',
      label: 'Contributions',
      items: [
        { id: 'submit-contribution', label: 'Submit Contribution', icon: 'plusCircle' },
        { id: 'all-contributions', label: 'All Contributions', icon: 'fileText' }
      ]
    },
    {
      id: 'points-recognition',
      label: 'Points & Recognition',
      items: [
        { id: 'points-master', label: 'Points & Activities', icon: 'book' },
        { id: 'excellence-badges', label: 'Excellence Badges', icon: 'award' },
        { id: 'specialist-badges', label: 'Specialist Badges', icon: 'star' },
        { id: 'recognition', label: 'Recognition & Rewards', icon: 'trophy' }
      ]
    },
    {
      id: 'operations',
      label: 'Operations',
      items: [
        { id: 'approvals', label: 'Approvals', icon: 'checkSquare' },
        { id: 'asset-lifecycle', label: 'Asset Lifecycle', icon: 'layers' }
      ]
    },
    {
      id: 'insights',
      label: 'Insights',
      items: [
        { id: 'executive-dashboard', label: 'Executive Dashboard', icon: 'chart' },
        { id: 'reports', label: 'Reports & Analytics', icon: 'spreadsheet' }
      ]
    }
  ];

  var openDropdownId = null;
  var mobileMenuOpen = false;

  function renderShell(activePage) {
    var U = window.CIS.utils;
    var currentModule = ALL_MODULES.find(function (m) { return m.id === activePage; });

    // Build Desktop Nav HTML
    var navHtml = NAV_GROUPS.map(function (group) {
      if (group.directPage) {
        var isAct = activePage === group.directPage;
        return '<div class="nav-item-wrap">' +
          '<button type="button" class="nav-btn ' + (isAct ? 'active' : '') + '" data-nav-page="' + group.directPage + '">' +
            '<span class="text-sage">' + U.icon('home', 14) + '</span>' +
            '<span>' + U.escapeHtml(group.label) + '</span>' +
          '</button>' +
        '</div>';
      }

      var items = group.items || [];
      var groupActive = items.some(function (it) { return it.id === activePage; });
      var isOpen = openDropdownId === group.id;

      var dropdownHtml = isOpen
        ? '<div class="nav-dropdown">' +
            items.map(function (it) {
              var itAct = activePage === it.id;
              return '<button type="button" class="dropdown-item ' + (itAct ? 'active' : '') + '" data-nav-page="' + it.id + '">' +
                '<span class="text-sage">' + U.icon(it.icon, 15) + '</span>' +
                '<span>' + U.escapeHtml(it.label) + '</span>' +
              '</button>';
            }).join('') +
          '</div>'
        : '';

      return '<div class="nav-item-wrap">' +
        '<button type="button" class="nav-btn ' + (groupActive ? 'active-blue' : (isOpen ? 'active' : '')) + '" data-nav-dropdown="' + group.id + '">' +
          '<span>' + U.escapeHtml(group.label) + '</span>' +
          U.icon('chevronDown', 13) +
        '</button>' +
        dropdownHtml +
      '</div>';
    }).join('');

    // Build Mobile Drawer HTML
    var mobileHtml = mobileMenuOpen
      ? '<div class="mobile-drawer">' +
          NAV_GROUPS.map(function (group) {
            if (group.directPage) {
              var isAct = activePage === group.directPage;
              return '<div class="mobile-group"><button type="button" class="dropdown-item ' + (isAct ? 'active' : '') + '" data-nav-page="' + group.directPage + '">' +
                U.icon('home', 15) + '<span>' + U.escapeHtml(group.label) + '</span>' +
              '</button></div>';
            }
            var items = group.items || [];
            return '<div class="mobile-group">' +
              '<div class="mobile-group-label">' + U.escapeHtml(group.label) + '</div>' +
              '<div class="mobile-grid">' +
                items.map(function (it) {
                  return '<button type="button" class="dropdown-item ' + (activePage === it.id ? 'active' : '') + '" data-nav-page="' + it.id + '">' +
                    '<span class="text-sage">' + U.icon(it.icon, 15) + '</span>' +
                    '<span>' + U.escapeHtml(it.label) + '</span>' +
                  '</button>';
                }).join('') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>'
      : '';

    // Sub-header breadcrumbs on inner pages
    var subHeaderHtml = (activePage !== 'home' && currentModule)
      ? '<div class="sub-header"><div class="sub-header-inner">' +
          '<div>' +
            '<div class="breadcrumbs">' +
              '<button type="button" class="breadcrumb-link" data-nav-page="home">Home</button>' +
              '<span>/</span><span>' + U.escapeHtml(currentModule.group) + '</span>' +
              '<span>/</span><strong style="color:#42534B">' + U.escapeHtml(currentModule.label) + '</strong>' +
            '</div>' +
            '<h1 class="page-title">' + U.escapeHtml(currentModule.label) + '</h1>' +
          '</div>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-nav-page="home">' +
            U.icon('arrowLeft', 14) + '<span>Back to Home Dashboard</span>' +
          '</button>' +
        '</div></div>'
      : '';

    return '<div class="app-shell">' +
      '<div class="sticky-nav-wrap" id="cis-nav-wrap">' +
        '<header class="top-header">' +
          '<div class="header-inner">' +
            '<button type="button" class="brand-btn" data-nav-page="home">' +
              '<img src="assets/tech-mahindra-logo.svg" alt="Tech Mahindra" class="brand-logo"/>' +
              '<span class="brand-divider" aria-hidden="true"></span>' +
              '<span>' +
                '<span class="brand-title">CIS Impact Points &amp; Excellence Portal</span>' +
                '<span class="brand-subtitle">Tech Mahindra CIS &bull; Standalone Offline Edition</span>' +
              '</span>' +
            '</button>' +

            '<div class="header-actions">' +
              (activePage !== 'home'
                ? '<button type="button" class="btn btn-secondary btn-sm hide-sm" data-nav-page="home">' + U.icon('home', 14) + '<span>Home</span></button>'
                : '') +
              '<button type="button" class="btn btn-primary btn-sm hide-sm" data-nav-page="submit-contribution">' +
                U.icon('plusCircle', 14) + '<span>Submit Contribution</span>' +
              '</button>' +
              '<button type="button" class="btn btn-outline btn-sm mobile-menu-toggle" id="mobile-menu-btn" aria-label="Toggle Menu">' +
                U.icon(mobileMenuOpen ? 'x' : 'menu', 16) +
              '</button>' +
            '</div>' +
          '</div>' +
        '</header>' +

        '<nav class="top-nav" aria-label="Primary navigation">' +
          '<div class="top-nav-inner">' + navHtml + '</div>' +
        '</nav>' +
        mobileHtml +
      '</div>' +

      subHeaderHtml +

      '<main class="main-viewport" id="page-content"></main>' +
    '</div>';
  }

  function bindShellEvents(root, onNavigate, onRerenderNav) {
    var pageBtns = root.querySelectorAll('[data-nav-page]');
    for (var i = 0; i < pageBtns.length; i++) {
      pageBtns[i].addEventListener('click', function () {
        var target = this.getAttribute('data-nav-page');
        openDropdownId = null;
        mobileMenuOpen = false;
        onNavigate(target);
      });
    }

    var ddBtns = root.querySelectorAll('[data-nav-dropdown]');
    for (var j = 0; j < ddBtns.length; j++) {
      ddBtns[j].addEventListener('click', function (e) {
        e.stopPropagation();
        var gid = this.getAttribute('data-nav-dropdown');
        openDropdownId = (openDropdownId === gid) ? null : gid;
        onRerenderNav();
      });
    }

    var mobBtn = document.getElementById('mobile-menu-btn');
    if (mobBtn) {
      mobBtn.addEventListener('click', function () {
        mobileMenuOpen = !mobileMenuOpen;
        onRerenderNav();
      });
    }
  }

  document.addEventListener('click', function (e) {
    if (!openDropdownId) return;
    var wrap = document.getElementById('cis-nav-wrap');
    if (wrap && !wrap.contains(e.target)) {
      openDropdownId = null;
      if (window.CIS.app && window.CIS.app.render) {
        window.CIS.app.render();
      }
    }
  });

  window.CIS.navigation = {
    ALL_MODULES: ALL_MODULES,
    NAV_GROUPS: NAV_GROUPS,
    renderShell: renderShell,
    bindShellEvents: bindShellEvents
  };
})();
