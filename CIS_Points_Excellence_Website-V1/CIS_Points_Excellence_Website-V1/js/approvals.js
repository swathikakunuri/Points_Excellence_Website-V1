/* ==========================================================================
   CIS Portal — Manager Approvals Queue Module (Pending / Approved / Rejected)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var trackFilter = 'All';
  var reviewerLabel = 'Marcus Vance';

  function resolveValidationTrack(c, activities) {
    var act = (activities || []).find(function (a) { return a.id === c.activityId; });
    if (act && act.reviewTrack) return act.reviewTrack;
    var councilCats = { 'CAT-02': true, 'CAT-03': true, 'CAT-08': true };
    var blob = ((c.categoryName || '') + ' ' + (c.activityName || '') + ' ' + (c.title || '')).toLowerCase();
    var isCouncilKeyword = /accelerator|reusable|security|compliance|whitepaper|industry paper|patent|ip|framework|architecture/i.test(blob);
    var isMultiStage = act && (act.approvalRequirement === 'Manager + Technical' || act.approvalRequirement === 'Manager + Technical + Leadership');
    if (councilCats[c.categoryId] || isCouncilKeyword || isMultiStage || Number(c.basePoints || 0) >= 25 || Number(c.requestedMultiplier || 1) >= 2.0) {
      return 'Technical Review / CIS Contribution Council';
    }
    return 'Manager / Asset-Owner Validation';
  }

  function renderApprovals(container) {
    var U = window.CIS.utils;
    var S = window.CIS.storage;
    var settings = S.getSettings();
    var multipliers = (settings.multipliers || []).filter(function (m) { return m.active !== false; });
    var activities = S.getAll('points_master');

    var allContribs = S.getAll('contributions').filter(function (c) { return c.status !== 'Draft'; });
    var pendingAll = allContribs.filter(function (c) {
      return U.normalizeContributionStatus(c.status) === 'Pending';
    });

    var queue = pendingAll.filter(function (c) {
      if (trackFilter === 'All') return true;
      return resolveValidationTrack(c, activities) === trackFilter;
    }).sort(function (a, b) {
      return String(b.submissionDate || '').localeCompare(String(a.submissionDate || ''));
    });

    var recentApprovals = S.getAll('approvals').sort(function (a, b) {
      return String(b.timestamp || '').localeCompare(String(a.timestamp || ''));
    }).slice(0, 12);

    var counts = {
      pending: pendingAll.length,
      approved: allContribs.filter(function (c) { return c.status === 'Approved'; }).length,
      rejected: allContribs.filter(function (c) { return c.status === 'Rejected'; }).length,
      council: pendingAll.filter(function (c) { return resolveValidationTrack(c, activities).indexOf('Council') !== -1; }).length
    };

    container.innerHTML =
      '<div class="stack-lg">' +
        '<div class="grid-kpis-4">' +
          '<div class="kpi-card pastel-champagne"><div class="kpi-top"><span class="kpi-label">Pending Review</span><span class="text-champagne">' + U.icon('clock', 16) + '</span></div><div class="kpi-value">' + counts.pending + '</div></div>' +
          '<div class="kpi-card pastel-blue"><div class="kpi-top"><span class="kpi-label">Technical / Council Track</span><span class="text-blue">' + U.icon('shieldCheck', 16) + '</span></div><div class="kpi-value">' + counts.council + '</div></div>' +
          '<div class="kpi-card pastel-mint"><div class="kpi-top"><span class="kpi-label">Approved</span><span class="text-mint">' + U.icon('checkCircle', 16) + '</span></div><div class="kpi-value">' + counts.approved + '</div></div>' +
          '<div class="kpi-card pastel-blush"><div class="kpi-top"><span class="kpi-label">Rejected</span><span class="text-blush">' + U.icon('x', 16) + '</span></div><div class="kpi-value">' + counts.rejected + '</div></div>' +
        '</div>' +

        '<div class="cis-card card-pad-sm flex-between">' +
          '<div class="flex-row">' +
            '<label class="text-muted" style="font-size:12px" for="apr-reviewer-name">Manager / Reviewer:</label>' +
            '<input id="apr-reviewer-name" type="text" class="cis-input" style="max-width:220px" value="' + U.escapeHtml(reviewerLabel) + '" placeholder="Assigned Manager Name"/>' +
          '</div>' +
          '<div class="flex-row">' +
            '<label class="text-muted" style="font-size:12px">Review Track:</label>' +
            '<select id="apr-track-filter" class="cis-select-inline">' +
              ['All', 'Manager / Asset-Owner Validation', 'Technical Review / CIS Contribution Council'].map(function (tr) {
                return '<option value="' + U.escapeHtml(tr) + '"' + (trackFilter === tr ? ' selected' : '') + '>' + (tr === 'All' ? 'All Pending Reviews' : tr) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +

        '<div class="stack-md">' +
          (queue.length
            ? queue.map(function (c) {
                var track = resolveValidationTrack(c, activities);
                var isCouncil = track.indexOf('Council') !== -1;
                var trackClass = isCouncil ? 'pastel-lavender text-lavender' : 'pastel-sage text-sage';
                var reqMult = Number(c.requestedMultiplier || 1);
                return '<div class="cis-card card-pad">' +
                  '<div class="flex-between" style="margin-bottom:10px">' +
                    '<div>' +
                      '<div class="flex-row" style="gap:8px;flex-wrap:wrap">' +
                        '<span class="font-mono text-muted" style="font-size:12px">' + U.escapeHtml(c.id) + '</span>' +
                        U.statusBadge('Pending') +
                        '<span class="pill-tag ' + trackClass + '" title="Required Governance Review Track">' + U.icon('shieldCheck', 12) + '<span>' + U.escapeHtml(track) + '</span></span>' +
                        '<span class="pill-tag pastel-ivory text-secondary">' + U.escapeHtml(c.categoryName) + '</span>' +
                      '</div>' +
                      '<h3 style="font-size:16px;font-weight:700;margin-top:6px">' + U.escapeHtml(c.title) + '</h3>' +
                      '<div class="text-secondary" style="font-size:12px;margin-top:2px">By <strong>' + U.escapeHtml(c.employeeName) + '</strong> (<span class="font-mono">' + U.escapeHtml(c.employeeId) + '</span>) &bull; ' + U.escapeHtml(c.projectName || '—') + ' &bull; Date: ' + U.escapeHtml(U.formatDate(c.contributionDate)) + '</div>' +
                    '</div>' +
                    '<div class="kpi-card pastel-champagne" style="padding:8px 14px;text-align:right">' +
                      '<div style="font-size:11px;color:#6B5022">Base × Requested</div>' +
                      '<div class="font-mono" style="font-size:16px;font-weight:800">' + c.basePoints + ' × ' + reqMult.toFixed(1) + 'x = ' + Math.round(c.basePoints * reqMult) + ' pts</div>' +
                    '</div>' +
                  '</div>' +

                  '<p class="text-secondary" style="font-size:13px;margin-bottom:8px">' + U.escapeHtml(c.solutionImplemented || c.description) + '</p>' +
                  '<div class="flex-row" style="font-size:12px;color:#68766F;margin-bottom:8px;flex-wrap:wrap;gap:10px">' +
                    '<span><strong>Activity:</strong> ' + U.escapeHtml(c.activityName) + '</span>' +
                    (c.deliverableVersion ? '<span>&bull; <strong>Version:</strong> <span class="font-mono">' + U.escapeHtml(c.deliverableVersion) + '</span></span>' : '') +
                    '<span>&bull; <strong>Evidence:</strong> <span class="font-mono">' + U.escapeHtml(c.evidence) + '</span></span>' +
                    (Number(c.distinctProjectsReused || 0) > 0 ? '<span>&bull; <strong>Projects Using Asset:</strong> ' + Number(c.distinctProjectsReused) + '</span>' : '') +
                  '</div>' +
                  ((c.expectedImpact || c.actualImpact || c.baselineMeasurement || c.measurableImpact)
                    ? '<div class="flex-row" style="font-size:12px;color:#55665E;margin-bottom:14px;flex-wrap:wrap;gap:10px">' +
                        (c.baselineMeasurement ? '<span><strong>Baseline → Actual:</strong> ' + U.escapeHtml(c.baselineMeasurement) + ' → ' + U.escapeHtml(c.actualMeasurement || '—') + ' ' + U.escapeHtml(c.measurementUnit || '') + '</span>' : '') +
                        (c.actualImpact ? '<span>&bull; <strong>Actual Impact:</strong> ' + U.escapeHtml(c.actualImpact) + '</span>' : '') +
                        (c.measurableImpact ? '<span>&bull; <strong>Summary:</strong> ' + U.escapeHtml(c.measurableImpact) + '</span>' : '') +
                      '</div>'
                    : '<div style="margin-bottom:10px"></div>') +

                  '<div class="cis-card card-pad-sm pastel-ivory">' +
                    '<div class="grid-3" style="gap:10px;align-items:end">' +
                      '<div>' +
                        '<label class="form-label">Approved Multiplier (Override Allowed)</label>' +
                        '<select class="cis-select" data-mult-for="' + c.id + '" data-req-mult="' + reqMult + '">' +
                          multipliers.map(function (m) {
                            var sel = Number(m.value) === reqMult ? ' selected' : '';
                            return '<option value="' + m.value + '"' + sel + '>' + Number(m.value).toFixed(1) + 'x — ' + U.escapeHtml(m.label) + '</option>';
                          }).join('') +
                        '</select>' +
                      '</div>' +
                      '<div style="grid-column:span 2">' +
                        '<label class="form-label">Reviewer Comments</label>' +
                        '<input type="text" class="cis-input" data-comment-for="' + c.id + '" placeholder="Add manager verification notes or rejection reason..."/>' +
                      '</div>' +
                    '</div>' +
                    '<div class="hidden" data-override-box="' + c.id + '" style="margin-top:10px;padding:10px 12px;border-radius:10px;background:#F5EBD7;border:1px solid #E3D0AE">' +
                      '<label class="form-label" style="color:#6B5022;margin-bottom:4px">Multiplier Override Justification (Mandatory — Requested ' + reqMult.toFixed(1) + 'x changed)</label>' +
                      '<input type="text" class="cis-input" data-override-for="' + c.id + '" placeholder="Explain why the approved multiplier differs from the requested multiplier..."/>' +
                    '</div>' +
                    '<div class="flex-row" style="justify-content:flex-end;margin-top:10px;flex-wrap:wrap">' +
                      '<button type="button" class="btn btn-danger btn-sm" data-action="reject" data-cid="' + c.id + '">Reject</button>' +
                      '<button type="button" class="btn btn-success btn-sm" data-action="approve" data-cid="' + c.id + '">' + U.icon('checkCircle', 14) + '<span>Approve &amp; Award Points</span></button>' +
                    '</div>' +
                  '</div>' +
                '</div>';
              }).join('')
            : '<div class="empty-state">No contributions currently pending review.</div>') +
        '</div>' +

        '<div class="cis-card card-pad">' +
          '<h3 style="font-size:14px;font-weight:700;margin-bottom:12px">Recent Approval Decisions</h3>' +
          '<div class="table-wrap"><table class="cis-table">' +
            '<thead><tr><th>Deliverable / Asset</th><th>Employee</th><th>Reviewer</th><th>Decision</th><th>Approval Status</th><th class="text-right">Date</th></tr></thead>' +
            '<tbody>' +
              recentApprovals.map(function (a) {
                var normNew = U.normalizeContributionStatus(a.newStatus);
                return '<tr>' +
                  '<td style="font-weight:600">' + U.escapeHtml(a.contributionTitle || a.contributionId) +
                    (a.overrideJustification ? '<div class="text-muted" style="font-size:11px;font-weight:400">Override: ' + U.escapeHtml(a.overrideJustification) + '</div>' : '') +
                  '</td>' +
                  '<td>' + U.escapeHtml(a.employeeName) + '</td>' +
                  '<td>' + U.escapeHtml(a.reviewerName) + '</td>' +
                  '<td>' + U.statusBadge(a.decision === 'Approve' ? 'Approved' : (a.decision === 'Reject' ? 'Rejected' : normNew)) + '</td>' +
                  '<td>' + U.statusBadge(normNew) + '</td>' +
                  '<td class="text-right font-mono text-muted" style="font-size:12px">' + U.escapeHtml(U.formatDate(a.timestamp)) + '</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
      '</div>';

    var revInput = document.getElementById('apr-reviewer-name');
    if (revInput) {
      revInput.addEventListener('input', function () {
        reviewerLabel = this.value;
      });
    }

    document.getElementById('apr-track-filter').addEventListener('change', function () {
      trackFilter = this.value;
      renderApprovals(container);
    });

    container.querySelectorAll('[data-mult-for]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var cid = this.getAttribute('data-mult-for');
        var req = Number(this.getAttribute('data-req-mult') || 1);
        var chosen = Number(this.value || 1);
        var box = container.querySelector('[data-override-box="' + cid + '"]');
        if (box) {
          if (Math.abs(chosen - req) > 0.001) {
            box.classList.remove('hidden');
          } else {
            box.classList.add('hidden');
          }
        }
      });
    });

    container.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var action = this.getAttribute('data-action');
        var cid = this.getAttribute('data-cid');
        var contrib = allContribs.find(function (c) { return c.id === cid; });
        if (!contrib) return;

        var activeReviewer = (reviewerLabel || '').trim() || 'Assigned Manager';
        var multEl = container.querySelector('[data-mult-for="' + cid + '"]');
        var commEl = container.querySelector('[data-comment-for="' + cid + '"]');
        var overrideEl = container.querySelector('[data-override-for="' + cid + '"]');
        var mult = multEl ? (Number(multEl.value) || 1.0) : 1.0;
        var reqMult = Number(contrib.requestedMultiplier || 1.0);
        var isOverride = Math.abs(mult - reqMult) > 0.001;
        var comments = commEl ? commEl.value.trim() : '';
        var overrideReason = overrideEl ? overrideEl.value.trim() : '';

        if (action === 'reject' && !comments) {
          U.toast('Please enter reviewer comments explaining the rejection.', 'warning');
          return;
        }
        if (action === 'approve' && isOverride && !overrideReason) {
          var box = container.querySelector('[data-override-box="' + cid + '"]');
          if (box) box.classList.remove('hidden');
          U.toast('Multiplier override detected (' + reqMult.toFixed(1) + 'x → ' + mult.toFixed(1) + 'x). Please provide mandatory override justification.', 'warning');
          if (overrideEl) overrideEl.focus();
          return;
        }

        var prevStatus = U.normalizeContributionStatus(contrib.status);
        var nowIso = new Date().toISOString();
        var newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        var decisionLabel = action === 'approve' ? 'Approve' : 'Reject';

        contrib.reviewerName = activeReviewer;
        contrib.approvedDate = nowIso;
        if (action === 'approve') {
          contrib.approvedMultiplier = mult;
          if (isOverride) {
            contrib.multiplierOverrideJustification = overrideReason;
          }
          contrib.finalPoints = Math.round(Number(contrib.basePoints || 0) * mult);
        } else {
          contrib.finalPoints = 0;
        }

        var combinedComment = comments || (decisionLabel + 'd by ' + activeReviewer);
        if (action === 'approve' && isOverride) {
          combinedComment = (comments ? comments + ' | ' : '') + 'Multiplier Override (' + reqMult.toFixed(1) + 'x → ' + mult.toFixed(1) + 'x): ' + overrideReason;
        }

        contrib.status = newStatus;
        contrib.approvalHistory = (contrib.approvalHistory || []).concat([{
          id: U.genId('AH'),
          stage: 'Manager Review',
          reviewerId: 'CIS-REVIEWER',
          reviewerName: activeReviewer,
          decision: decisionLabel,
          comments: combinedComment,
          overrideJustification: isOverride ? overrideReason : '',
          previousStatus: prevStatus,
          newStatus: newStatus,
          multiplierApplied: mult,
          timestamp: nowIso
        }]);

        await S.put('contributions', contrib);
        await S.put('approvals', {
          id: U.genId('APR'),
          contributionId: contrib.id,
          contributionTitle: contrib.title,
          employeeId: contrib.employeeId,
          employeeName: contrib.employeeName,
          stage: 'Manager Review',
          reviewerId: 'CIS-REVIEWER',
          reviewerName: activeReviewer,
          decision: decisionLabel,
          comments: combinedComment,
          overrideJustification: isOverride ? overrideReason : '',
          previousStatus: prevStatus,
          newStatus: newStatus,
          timestamp: nowIso
        });

        await S.recalculateAllPointsAndBadges();
        if (newStatus === 'Approved') {
          U.toast('Approved by ' + activeReviewer + '! +' + contrib.finalPoints + ' pts awarded and totals recalculated.', 'success');
        } else {
          U.toast('Contribution rejected by ' + activeReviewer + '.', 'info');
        }

        renderApprovals(container);
      });
    });
  }

  window.CIS.approvals = {
    renderApprovals: renderApprovals
  };
})();
