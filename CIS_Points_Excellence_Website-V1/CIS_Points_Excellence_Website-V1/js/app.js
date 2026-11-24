/* ==========================================================================
   CIS Portal — Application Bootstrap & Page Router (Direct Home Launch)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var activePage = 'home';

  function navigate(pageId) {
    activePage = pageId || 'home';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    var appRoot = document.getElementById('app');
    if (!appRoot) return;

    appRoot.innerHTML = window.CIS.navigation.renderShell(activePage);
    window.CIS.navigation.bindShellEvents(appRoot, navigate, render);

    var pageSlot = document.getElementById('page-content');
    if (!pageSlot) return;

    switch (activePage) {
      case 'home':
        window.CIS.dashboard.renderHomePage(pageSlot, navigate);
        break;
      case 'executive-dashboard':
        window.CIS.dashboard.renderExecutiveDashboard(pageSlot);
        break;
      case 'employee-dashboard':
        window.CIS.dashboard.renderEmployeeDashboard(pageSlot, navigate);
        break;
      case 'submit-contribution':
        window.CIS.contributions.renderSubmitContribution(pageSlot, navigate);
        break;
      case 'all-contributions':
      case 'my-contributions':
        window.CIS.contributions.renderAllContributions(pageSlot, navigate);
        break;
      case 'approvals':
        window.CIS.approvals.renderApprovals(pageSlot);
        break;
      case 'team-management':
        window.CIS.employees.renderTeamManagement(pageSlot);
        break;
      case 'points-master':
        window.CIS.badges.renderPointsMaster(pageSlot);
        break;
      case 'excellence-badges':
        window.CIS.badges.renderExcellenceBadges(pageSlot);
        break;
      case 'specialist-badges':
        window.CIS.badges.renderSpecialistBadges(pageSlot);
        break;
      case 'recognition':
        window.CIS.badges.renderRecognition(pageSlot);
        break;
      case 'asset-lifecycle':
        window.CIS.assets.renderAssetLifecycle(pageSlot);
        break;
      case 'reports':
        window.CIS.reports.renderReports(pageSlot);
        break;
      default:
        activePage = 'home';
        window.CIS.dashboard.renderHomePage(pageSlot, navigate);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.CIS.utils.closeModal();
    }
  });

  async function bootstrap() {
    try {
      await window.CIS.storage.init();
      render();
    } catch (err) {
      var appRoot = document.getElementById('app');
      if (appRoot) {
        appRoot.innerHTML =
          '<div style="max-width:520px;margin:60px auto;padding:24px;background:#FFFFFF;border:1px solid #E5E9E4;border-radius:14px">' +
            '<h2 style="color:#7A3E36;margin-bottom:8px">Startup Notice</h2>' +
            '<p style="color:#42534B;font-size:13px">Could not initialize browser storage: ' + window.CIS.utils.escapeHtml(err.message) + '</p>' +
          '</div>';
      }
    }
  }

  window.CIS.app = {
    navigate: navigate,
    render: render
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
