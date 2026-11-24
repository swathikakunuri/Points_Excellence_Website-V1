/* ==========================================================================
   CIS Portal — Offline Interactive SVG Chart Library (Zero External CDNs)
   Harmonious Pastel Corporate Palette:
   Sage (#7CA38F), Dusty Blue (#7BA2C4), Lavender (#9E8BB8),
   Champagne (#C8A86B), Blush (#C98C84), Mint (#6FA895)
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var PALETTE = ['#7CA38F', '#7BA2C4', '#9E8BB8', '#C8A86B', '#C98C84', '#6FA895', '#8DA8B8', '#B89E82'];

  function esc(s) {
    return window.CIS.utils.escapeHtml(s);
  }

  function showTip(evt, html) {
    var tip = document.getElementById('chart-tooltip');
    if (!tip) return;
    tip.innerHTML = html;
    tip.style.display = 'block';
    tip.style.left = Math.min(window.innerWidth - 220, evt.clientX + 12) + 'px';
    tip.style.top = Math.max(10, evt.clientY - 36) + 'px';
  }

  function hideTip() {
    var tip = document.getElementById('chart-tooltip');
    if (tip) tip.style.display = 'none';
  }

  function bindTooltips(container) {
    if (!container) return;
    var targets = container.querySelectorAll('[data-tip]');
    for (var i = 0; i < targets.length; i++) {
      (function (el) {
        el.addEventListener('mousemove', function (e) {
          showTip(e, el.getAttribute('data-tip'));
        });
        el.addEventListener('mouseleave', hideTip);
      })(targets[i]);
    }
  }

  function renderLineChart(container, data, series) {
    if (!container) return;
    if (!data || !data.length) {
      container.innerHTML = '<div class="empty-state">No data for selected filters.</div>';
      return;
    }
    var W = 560, H = 220, padL = 38, padR = 16, padT = 16, padB = 34;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxVal = 1;
    data.forEach(function (d) {
      series.forEach(function (s) {
        if (Number(d[s.key] || 0) > maxVal) maxVal = Number(d[s.key] || 0);
      });
    });
    maxVal = Math.ceil(maxVal * 1.15);

    var gridLines = '';
    for (var g = 0; g <= 4; g++) {
      var gy = padT + plotH - (g / 4) * plotH;
      var gVal = Math.round((g / 4) * maxVal);
      gridLines += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="#E5E9E4" stroke-dasharray="3 3"/>';
      gridLines += '<text x="' + (padL - 8) + '" y="' + (gy + 3) + '" text-anchor="end" font-size="10" fill="#77847D">' + gVal + '</text>';
    }

    var xLabels = '';
    var stepX = data.length > 1 ? plotW / (data.length - 1) : plotW / 2;
    for (var x = 0; x < data.length; x++) {
      var lx = data.length > 1 ? padL + x * stepX : padL + plotW / 2;
      xLabels += '<text x="' + lx + '" y="' + (H - 10) + '" text-anchor="middle" font-size="10" fill="#68766F">' + esc(data[x].label) + '</text>';
    }

    var linesSvg = '';
    series.forEach(function (s) {
      var pts = [];
      var circles = '';
      for (var i = 0; i < data.length; i++) {
        var val = Number(data[i][s.key] || 0);
        var cx = data.length > 1 ? padL + i * stepX : padL + plotW / 2;
        var cy = padT + plotH - (val / maxVal) * plotH;
        pts.push(cx.toFixed(1) + ',' + cy.toFixed(1));
        var tip = '<strong>' + esc(data[i].label) + '</strong><br/>' + esc(s.label) + ': <b>' + val + '</b>';
        circles += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="4" fill="#FFFFFF" stroke="' + s.color + '" stroke-width="2.2" data-tip="' + esc(tip) + '" style="cursor:pointer"/>';
      }
      linesSvg += '<polyline fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="' + pts.join(' ') + '"/>' + circles;
    });

    var legend = '<div class="chart-legend">' + series.map(function (s) {
      return '<span class="chart-legend-item"><span class="chart-dot" style="background:' + s.color + '"></span>' + esc(s.label) + '</span>';
    }).join('') + '</div>';

    container.innerHTML =
      '<div class="chart-box">' +
        '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '">' + gridLines + xLabels + linesSvg + '</svg>' +
        legend +
      '</div>';
    bindTooltips(container);
  }

  function renderBarChart(container, data, color, height) {
    if (!container) return;
    if (!data || !data.length) {
      container.innerHTML = '<div class="empty-state">No data available.</div>';
      return;
    }
    var W = 420, H = height || 210, padL = 36, padR = 12, padT = 14, padB = 42;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxVal = Math.max(1, Math.max.apply(null, data.map(function (d) { return Number(d.value || 0); })));
    maxVal = Math.ceil(maxVal * 1.15);

    var grid = '';
    for (var g = 0; g <= 3; g++) {
      var gy = padT + plotH - (g / 3) * plotH;
      var gv = Math.round((g / 3) * maxVal);
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="#E5E9E4" stroke-dasharray="3 3"/>';
      grid += '<text x="' + (padL - 6) + '" y="' + (gy + 3) + '" text-anchor="end" font-size="10" fill="#77847D">' + gv + '</text>';
    }

    var slotW = plotW / data.length;
    var barW = Math.min(36, Math.max(12, slotW * 0.56));
    var bars = '';

    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var val = Number(d.value || 0);
      var bh = (val / maxVal) * plotH;
      var bx = padL + i * slotW + (slotW - barW) / 2;
      var by = padT + plotH - bh;
      var fill = d.color || color || PALETTE[i % PALETTE.length];
      var shortLbl = String(d.label || '');
      if (shortLbl.length > 12) shortLbl = shortLbl.slice(0, 11) + '…';
      var tip = '<strong>' + esc(d.label) + '</strong>: <b>' + val.toLocaleString() + '</b>';

      bars += '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(1, bh).toFixed(1) + '" rx="5" fill="' + fill + '" data-tip="' + esc(tip) + '" style="cursor:pointer"/>';
      bars += '<text x="' + (bx + barW / 2).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="9.5" fill="#68766F">' + esc(shortLbl) + '</text>';
    }

    container.innerHTML = '<div class="chart-box"><svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '">' + grid + bars + '</svg></div>';
    bindTooltips(container);
  }

  function renderHorizontalBarChart(container, data, color) {
    if (!container) return;
    if (!data || !data.length) {
      container.innerHTML = '<div class="empty-state">No data available.</div>';
      return;
    }
    var rowH = 26;
    var W = 500, padL = 165, padR = 46, padT = 8, padB = 8;
    var H = padT + padB + data.length * rowH;
    var plotW = W - padL - padR;
    var maxVal = Math.max(1, Math.max.apply(null, data.map(function (d) { return Number(d.value || 0); })));

    var rowsSvg = '';
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var val = Number(d.value || 0);
      var y = padT + i * rowH;
      var bw = (val / maxVal) * plotW;
      var lbl = String(d.label || '');
      if (lbl.length > 24) lbl = lbl.slice(0, 23) + '…';
      var tip = '<strong>' + esc(d.label) + '</strong>: <b>' + val.toLocaleString() + ' pts</b>';

      rowsSvg += '<text x="' + (padL - 8) + '" y="' + (y + 16) + '" text-anchor="end" font-size="10.5" fill="#42534B">' + esc(lbl) + '</text>';
      rowsSvg += '<rect x="' + padL + '" y="' + (y + 4) + '" width="' + plotW + '" height="16" rx="4" fill="#F7F5EF"/>';
      rowsSvg += '<rect x="' + padL + '" y="' + (y + 4) + '" width="' + Math.max(2, bw).toFixed(1) + '" height="16" rx="4" fill="' + (color || '#7CA38F') + '" data-tip="' + esc(tip) + '" style="cursor:pointer"/>';
      rowsSvg += '<text x="' + (padL + Math.max(2, bw) + 6).toFixed(1) + '" y="' + (y + 16) + '" font-size="10.5" font-weight="600" fill="#42534B">' + val + '</text>';
    }

    container.innerHTML = '<div class="chart-box"><svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '">' + rowsSvg + '</svg></div>';
    bindTooltips(container);
  }

  function renderGroupedBarChart(container, data, series) {
    if (!container) return;
    if (!data || !data.length) {
      container.innerHTML = '<div class="empty-state">No data available.</div>';
      return;
    }
    var W = 500, H = 220, padL = 40, padR = 12, padT = 14, padB = 38;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxVal = 1;
    data.forEach(function (d) {
      series.forEach(function (s) {
        if (Number(d[s.key] || 0) > maxVal) maxVal = Number(d[s.key] || 0);
      });
    });
    maxVal = Math.ceil(maxVal * 1.15);

    var grid = '';
    for (var g = 0; g <= 3; g++) {
      var gy = padT + plotH - (g / 3) * plotH;
      var gv = Math.round((g / 3) * maxVal);
      grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="#E5E9E4" stroke-dasharray="3 3"/>';
      grid += '<text x="' + (padL - 6) + '" y="' + (gy + 3) + '" text-anchor="end" font-size="10" fill="#77847D">' + gv + '</text>';
    }

    var groupW = plotW / data.length;
    var barW = Math.min(24, (groupW * 0.7) / series.length);
    var bars = '';

    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var gx = padL + i * groupW + (groupW - barW * series.length - 4 * (series.length - 1)) / 2;
      for (var sIdx = 0; sIdx < series.length; sIdx++) {
        var s = series[sIdx];
        var val = Number(d[s.key] || 0);
        var bh = (val / maxVal) * plotH;
        var bx = gx + sIdx * (barW + 4);
        var by = padT + plotH - bh;
        var tip = '<strong>' + esc(d.label) + '</strong><br/>' + esc(s.label) + ': <b>' + val.toLocaleString() + '</b>';
        bars += '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(1, bh).toFixed(1) + '" rx="4" fill="' + s.color + '" data-tip="' + esc(tip) + '" style="cursor:pointer"/>';
      }
      var lbl = String(d.label || '');
      if (lbl.length > 15) lbl = lbl.slice(0, 14) + '…';
      bars += '<text x="' + (padL + i * groupW + groupW / 2).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="10" fill="#68766F">' + esc(lbl) + '</text>';
    }

    var legend = '<div class="chart-legend">' + series.map(function (s) {
      return '<span class="chart-legend-item"><span class="chart-dot" style="background:' + s.color + '"></span>' + esc(s.label) + '</span>';
    }).join('') + '</div>';

    container.innerHTML = '<div class="chart-box"><svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '">' + grid + bars + '</svg>' + legend + '</div>';
    bindTooltips(container);
  }

  function renderPieChart(container, data) {
    if (!container) return;
    var nonZero = (data || []).filter(function (d) { return Number(d.value || 0) > 0; });
    if (!nonZero.length) {
      container.innerHTML = '<div class="empty-state">No status records.</div>';
      return;
    }
    var total = nonZero.reduce(function (acc, d) { return acc + Number(d.value || 0); }, 0);
    var cx = 110, cy = 95, r = 74, innerR = 36;
    var angle = -Math.PI / 2;
    var slices = '';

    for (var i = 0; i < nonZero.length; i++) {
      var d = nonZero[i];
      var frac = Number(d.value) / total;
      var sweep = frac * Math.PI * 2;
      var x1 = cx + r * Math.cos(angle);
      var y1 = cy + r * Math.sin(angle);
      var x2 = cx + r * Math.cos(angle + sweep);
      var y2 = cy + r * Math.sin(angle + sweep);
      var ix1 = cx + innerR * Math.cos(angle + sweep);
      var iy1 = cy + innerR * Math.sin(angle + sweep);
      var ix2 = cx + innerR * Math.cos(angle);
      var iy2 = cy + innerR * Math.sin(angle);
      var largeArc = sweep > Math.PI ? 1 : 0;
      var color = d.color || PALETTE[i % PALETTE.length];
      var pct = Math.round(frac * 100);
      var tip = '<strong>' + esc(d.label) + '</strong>: <b>' + d.value + '</b> (' + pct + '%)';

      if (nonZero.length === 1) {
        slices += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + color + '" data-tip="' + esc(tip) + '"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + innerR + '" fill="#FFFFFF"/>';
      } else {
        var pathD = 'M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
          ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
          ' L ' + ix1.toFixed(1) + ' ' + iy1.toFixed(1) +
          ' A ' + innerR + ' ' + innerR + ' 0 ' + largeArc + ' 0 ' + ix2.toFixed(1) + ' ' + iy2.toFixed(1) + ' Z';
        slices += '<path d="' + pathD + '" fill="' + color + '" stroke="#FFFFFF" stroke-width="1.5" data-tip="' + esc(tip) + '" style="cursor:pointer"/>';
      }
      angle += sweep;
    }

    var centerLabel = '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="18" font-weight="700" fill="#42534B">' + total + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" font-size="9.5" fill="#77847D">Total</text>';

    var legend = '<div class="chart-legend">' + nonZero.map(function (d, idx) {
      var c = d.color || PALETTE[idx % PALETTE.length];
      return '<span class="chart-legend-item"><span class="chart-dot" style="background:' + c + '"></span>' + esc(d.label) + ' (' + d.value + ')</span>';
    }).join('') + '</div>';

    container.innerHTML = '<div class="chart-box"><svg class="chart-svg" viewBox="0 0 220 190" style="max-height:190px;margin:0 auto">' + slices + centerLabel + '</svg>' + legend + '</div>';
    bindTooltips(container);
  }

  window.CIS.charts = {
    PALETTE: PALETTE,
    renderLineChart: renderLineChart,
    renderBarChart: renderBarChart,
    renderHorizontalBarChart: renderHorizontalBarChart,
    renderGroupedBarChart: renderGroupedBarChart,
    renderPieChart: renderPieChart
  };
})();
