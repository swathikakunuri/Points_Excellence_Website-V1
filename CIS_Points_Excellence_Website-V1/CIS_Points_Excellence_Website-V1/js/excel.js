/* ==========================================================================
   CIS Portal — 100% Offline Excel (.xlsx) & CSV Import / Export Engine
   Zero External Libraries, Zero CDNs, Works Completely Offline via file://
   - Writes valid OpenXML .xlsx workbooks (ZIP STORE + CRC32 + XML)
   - Reads real .xlsx (deflated & stored ZIP + sharedStrings + sheet XML) & .csv
   - Merges imported rows into IndexedDB while preserving all existing records
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  // ---- CRC32 Table for valid ZIP/.xlsx archives ----
  var CRC_TABLE = new Uint32Array(256);
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    CRC_TABLE[n] = c >>> 0;
  }

  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function strToUtf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str);
    }
    var utf8 = unescape(encodeURIComponent(str));
    var out = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; i++) out[i] = utf8.charCodeAt(i);
    return out;
  }

  function utf8BytesToStr(bytes) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return decodeURIComponent(escape(bin));
  }

  function xmlEscape(val) {
    return String(val === null || val === undefined ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function colIndexToLetter(idx) {
    var letter = '';
    var num = idx + 1;
    while (num > 0) {
      var rem = (num - 1) % 26;
      letter = String.fromCharCode(65 + rem) + letter;
      num = Math.floor((num - 1) / 26);
    }
    return letter;
  }

  function letterToColIndex(letters) {
    var idx = 0;
    for (var i = 0; i < letters.length; i++) {
      idx = idx * 26 + (letters.charCodeAt(i) - 64);
    }
    return idx - 1;
  }

  // ---- Pure JS ZIP Writer (STORE method = 0, universally accepted by Excel) ----
  function buildZipBlob(files, mimeType) {
    var localParts = [];
    var centralParts = [];
    var offset = 0;

    for (var i = 0; i < files.length; i++) {
      var nameBytes = strToUtf8Bytes(files[i].name);
      var dataBytes = typeof files[i].content === 'string'
        ? strToUtf8Bytes(files[i].content)
        : files[i].content;
      var crc = crc32(dataBytes);
      var size = dataBytes.length;

      // Local File Header (30 bytes + name)
      var lfh = new Uint8Array(30 + nameBytes.length);
      var lv = new DataView(lfh.buffer);
      lv.setUint32(0, 0x04034B50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
      lv.setUint16(8, 0, true);      // STORE
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      lfh.set(nameBytes, 30);

      localParts.push(lfh, dataBytes);

      // Central Directory Header (46 bytes + name)
      var cdh = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(cdh.buffer);
      cv.setUint32(0, 0x02014B50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      cdh.set(nameBytes, 46);
      centralParts.push(cdh);

      offset += lfh.length + dataBytes.length;
    }

    var cdSize = 0;
    for (var j = 0; j < centralParts.length; j++) cdSize += centralParts[j].length;

    // End of Central Directory (22 bytes)
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054B50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    var allParts = localParts.concat(centralParts, [eocd]);
    return new Blob(allParts, { type: mimeType || 'application/octet-stream' });
  }

  // ---- Export to Real .xlsx Excel Workbook ----
  function exportToXlsx(rows, filename, sheetName) {
    if (!rows || rows.length === 0) {
      window.CIS.utils.toast('No rows available to export.', 'warning');
      return;
    }
    var safeSheet = String(sheetName || 'CIS_Data').replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Sheet1';
    var headers = Object.keys(rows[0]);

    var sheetRowsXml = [];
    // Header row (style s="1" bold with pastel sage fill)
    var headerCells = [];
    for (var h = 0; h < headers.length; h++) {
      var ref = colIndexToLetter(h) + '1';
      headerCells.push('<c r="' + ref + '" t="inlineStr" s="1"><is><t>' + xmlEscape(headers[h]) + '</t></is></c>');
    }
    sheetRowsXml.push('<row r="1">' + headerCells.join('') + '</row>');

    // Data rows
    for (var r = 0; r < rows.length; r++) {
      var rowNum = r + 2;
      var cells = [];
      for (var c = 0; c < headers.length; c++) {
        var val = rows[r][headers[c]];
        var cellRef = colIndexToLetter(c) + rowNum;
        if (typeof val === 'number' && isFinite(val)) {
          cells.push('<c r="' + cellRef + '"><v>' + val + '</v></c>');
        } else {
          var textVal = Array.isArray(val) ? val.join('; ') : (val === null || val === undefined ? '' : String(val));
          cells.push('<c r="' + cellRef + '" t="inlineStr"><is><t>' + xmlEscape(textVal) + '</t></is></c>');
        }
      }
      sheetRowsXml.push('<row r="' + rowNum + '">' + cells.join('') + '</row>');
    }

    var contentTypes =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '</Types>';

    var rootRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>';

    var workbookXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets><sheet name="' + xmlEscape(safeSheet) + '" sheetId="1" r:id="rId1"/></sheets>' +
      '</workbook>';

    var workbookRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '</Relationships>';

    var stylesXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<fonts count="2">' +
      '<font><sz val="11"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="11"/><color rgb="FF42534B"/><name val="Calibri"/></font>' +
      '</fonts>' +
      '<fills count="3">' +
      '<fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFE4EEE7"/><bgColor indexed="64"/></patternFill></fill>' +
      '</fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="2">' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
      '</cellXfs>' +
      '</styleSheet>';

    var sheetXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<sheetData>' + sheetRowsXml.join('') + '</sheetData>' +
      '</worksheet>';

    var blob = buildZipBlob([
      { name: '[Content_Types].xml', content: contentTypes },
      { name: '_rels/.rels', content: rootRels },
      { name: 'xl/workbook.xml', content: workbookXml },
      { name: 'xl/_rels/workbook.xml.rels', content: workbookRels },
      { name: 'xl/styles.xml', content: stylesXml },
      { name: 'xl/worksheets/sheet1.xml', content: sheetXml }
    ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    var outName = filename.toLowerCase().endsWith('.xlsx') ? filename : filename + '.xlsx';
    window.CIS.utils.downloadBlob(blob, outName);
    window.CIS.utils.toast('Exported Excel file: ' + outName, 'success');
  }

  // ---- Export to UTF-8 BOM CSV (Excel compatible) ----
  function exportToCsv(rows, filename) {
    if (!rows || rows.length === 0) {
      window.CIS.utils.toast('No rows available to export.', 'warning');
      return;
    }
    var headers = Object.keys(rows[0]);
    var lines = [headers.map(csvEscape).join(',')];
    for (var i = 0; i < rows.length; i++) {
      var line = [];
      for (var j = 0; j < headers.length; j++) {
        var v = rows[i][headers[j]];
        line.push(csvEscape(Array.isArray(v) ? v.join('; ') : v));
      }
      lines.push(line.join(','));
    }
    var blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var outName = filename.toLowerCase().endsWith('.csv') ? filename : filename + '.csv';
    window.CIS.utils.downloadBlob(blob, outName);
    window.CIS.utils.toast('Exported CSV file: ' + outName, 'success');
  }

  function csvEscape(val) {
    var s = val === null || val === undefined ? '' : String(val);
    if (/[",\r\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  // ---- Parse CSV (RFC 4180) ----
  function parseCsvText(text) {
    var clean = text.replace(/^\uFEFF/, '');
    var rows = [];
    var curRow = [];
    var curCell = '';
    var inQuotes = false;

    for (var i = 0; i < clean.length; i++) {
      var ch = clean[i];
      var next = clean[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') {
          curCell += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          curCell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          curRow.push(curCell);
          curCell = '';
        } else if (ch === '\r' && next === '\n') {
          curRow.push(curCell);
          rows.push(curRow);
          curRow = [];
          curCell = '';
          i++;
        } else if (ch === '\n' || ch === '\r') {
          curRow.push(curCell);
          rows.push(curRow);
          curRow = [];
          curCell = '';
        } else {
          curCell += ch;
        }
      }
    }
    if (curCell.length > 0 || curRow.length > 0) {
      curRow.push(curCell);
      rows.push(curRow);
    }
    return matrixToObjects(rows);
  }

  function matrixToObjects(matrix) {
    if (!matrix || matrix.length < 2) return [];
    var headers = matrix[0].map(function (h) { return String(h || '').trim(); });
    var result = [];
    for (var r = 1; r < matrix.length; r++) {
      var row = matrix[r];
      var hasAny = row.some(function (cell) { return String(cell || '').trim() !== ''; });
      if (!hasAny) continue;
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        if (!headers[c]) continue;
        obj[headers[c]] = row[c] !== undefined ? String(row[c]).trim() : '';
      }
      result.push(obj);
    }
    return result;
  }

  // ---- Parse Real Binary .xlsx (ZIP + DeflateRaw + XML) ----
  async function inflateRawBytes(compressed) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('This browser does not support built-in DecompressionStream for compressed .xlsx files. Please save the spreadsheet as CSV and import.');
    }
    var ds = new DecompressionStream('deflate-raw');
    var writer = ds.writable.getWriter();
    writer.write(compressed);
    writer.close();
    var reader = ds.readable.getReader();
    var chunks = [];
    var total = 0;
    while (true) {
      var step = await reader.read();
      if (step.done) break;
      chunks.push(step.value);
      total += step.value.length;
    }
    var out = new Uint8Array(total);
    var pos = 0;
    for (var i = 0; i < chunks.length; i++) {
      out.set(chunks[i], pos);
      pos += chunks[i].length;
    }
    return out;
  }

  async function readZipEntries(arrayBuffer) {
    var bytes = new Uint8Array(arrayBuffer);
    var view = new DataView(arrayBuffer);
    // Find End of Central Directory (0x06054b50)
    var eocdOffset = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 65558); i--) {
      if (view.getUint32(i, true) === 0x06054B50) {
        eocdOffset = i;
        break;
      }
    }
    if (eocdOffset < 0) {
      throw new Error('Invalid .xlsx archive (ZIP directory not found).');
    }
    var totalEntries = view.getUint16(eocdOffset + 10, true);
    var cdOffset = view.getUint32(eocdOffset + 16, true);
    var entries = {};
    var ptr = cdOffset;

    for (var e = 0; e < totalEntries; e++) {
      if (view.getUint32(ptr, true) !== 0x02014B50) break;
      var method = view.getUint16(ptr + 10, true);
      var compSize = view.getUint32(ptr + 20, true);
      var nameLen = view.getUint16(ptr + 28, true);
      var extraLen = view.getUint16(ptr + 30, true);
      var commentLen = view.getUint16(ptr + 32, true);
      var localOffset = view.getUint32(ptr + 42, true);
      var name = utf8BytesToStr(bytes.subarray(ptr + 46, ptr + 46 + nameLen));

      var lNameLen = view.getUint16(localOffset + 26, true);
      var lExtraLen = view.getUint16(localOffset + 28, true);
      var dataStart = localOffset + 30 + lNameLen + lExtraLen;
      var rawSlice = bytes.subarray(dataStart, dataStart + compSize);

      if (method === 0) {
        entries[name] = rawSlice;
      } else if (method === 8) {
        entries[name] = await inflateRawBytes(rawSlice);
      }
      ptr += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  async function parseXlsxArrayBuffer(buffer) {
    var entries = await readZipEntries(buffer);
    var parser = new DOMParser();

    var sharedStrings = [];
    if (entries['xl/sharedStrings.xml']) {
      var ssDoc = parser.parseFromString(utf8BytesToStr(entries['xl/sharedStrings.xml']), 'application/xml');
      var siNodes = ssDoc.getElementsByTagName('si');
      for (var s = 0; s < siNodes.length; s++) {
        var tNodes = siNodes[s].getElementsByTagName('t');
        var combined = '';
        for (var t = 0; t < tNodes.length; t++) {
          combined += tNodes[t].textContent || '';
        }
        sharedStrings.push(combined);
      }
    }

    var sheetKey = Object.keys(entries).find(function (k) {
      return /^xl\/worksheets\/sheet1\.xml$/i.test(k);
    }) || Object.keys(entries).find(function (k) {
      return /^xl\/worksheets\/sheet.*\.xml$/i.test(k);
    });

    if (!sheetKey) {
      throw new Error('Could not find worksheet data inside the .xlsx file.');
    }

    var sheetDoc = parser.parseFromString(utf8BytesToStr(entries[sheetKey]), 'application/xml');
    var rowNodes = sheetDoc.getElementsByTagName('row');
    var matrix = [];

    for (var r = 0; r < rowNodes.length; r++) {
      var cNodes = rowNodes[r].getElementsByTagName('c');
      var rowArr = [];
      for (var c = 0; c < cNodes.length; c++) {
        var cell = cNodes[c];
        var ref = cell.getAttribute('r') || '';
        var colMatch = ref.match(/^([A-Z]+)/i);
        var colIdx = colMatch ? letterToColIndex(colMatch[1].toUpperCase()) : c;
        var type = cell.getAttribute('t') || '';
        var val = '';

        if (type === 's') {
          var vNode = cell.getElementsByTagName('v')[0];
          var idx = vNode ? parseInt(vNode.textContent, 10) : -1;
          val = idx >= 0 && sharedStrings[idx] !== undefined ? sharedStrings[idx] : '';
        } else if (type === 'inlineStr') {
          var tNodesCell = cell.getElementsByTagName('t');
          for (var ti = 0; ti < tNodesCell.length; ti++) val += tNodesCell[ti].textContent || '';
        } else {
          var vNodeStd = cell.getElementsByTagName('v')[0];
          val = vNodeStd ? (vNodeStd.textContent || '') : '';
        }
        rowArr[colIdx] = val;
      }
      matrix.push(rowArr);
    }

    return matrixToObjects(matrix);
  }

  function readSpreadsheetFile(file) {
    return new Promise(function (resolve, reject) {
      var name = String(file.name || '').toLowerCase();
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Failed to read file.')); };

      if (name.endsWith('.xlsx')) {
        reader.onload = function (e) {
          parseXlsxArrayBuffer(e.target.result).then(resolve).catch(reject);
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = function (e) {
          try {
            resolve(parseCsvText(String(e.target.result || '')));
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  function pickField(row, candidates) {
    var keys = Object.keys(row);
    for (var c = 0; c < candidates.length; c++) {
      var target = candidates[c].toLowerCase().replace(/[\s_-]+/g, '');
      for (var k = 0; k < keys.length; k++) {
        var normKey = keys[k].toLowerCase().replace(/[\s_-]+/g, '');
        if (normKey === target && row[keys[k]] !== '') return row[keys[k]];
      }
    }
    return '';
  }

  /**
   * Imports rows from .xlsx / .csv and MERGES into IndexedDB while preserving
   * every existing record (never deletes or resets existing database records).
   */
  async function importRecordsFromFile(file, entityType, actor) {
    var rows = await readSpreadsheetFile(file);
    if (!rows.length) {
      throw new Error('The file contains no data rows.');
    }

    var storage = window.CIS.storage;
    var added = 0;
    var updated = 0;

    if (entityType === 'employees') {
      var existingEmps = storage.getAll('employees');
      var teams = storage.getAll('teams');
      var projects = storage.getAll('projects');

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var name = pickField(r, ['name', 'employeeName', 'fullName']);
        var email = pickField(r, ['email', 'emailAddress']);
        if (!name && !email) continue;

        var id = pickField(r, ['id', 'employeeId', 'empId']);
        var existing = existingEmps.find(function (e) {
          return (id && e.id === id) || (email && e.email.toLowerCase() === email.toLowerCase());
        });

        var teamName = pickField(r, ['teamName', 'team']) || (existing ? existing.teamName : (teams[0] ? teams[0].name : 'Cloud Platform Ops'));
        var matchedTeam = teams.find(function (t) { return t.name.toLowerCase() === teamName.toLowerCase(); }) || teams[0];
        var projName = pickField(r, ['projectName', 'project']) || (existing ? existing.projectName : (projects[0] ? projects[0].name : 'Project Horizon Cloud Migration'));
        var matchedProj = projects.find(function (p) { return p.name.toLowerCase() === projName.toLowerCase(); }) || projects[0];

        var empRecord = existing ? Object.assign({}, existing) : {
          id: id || window.CIS.utils.genId('EMP'),
          active: true,
          lifetimePoints: 0,
          annualPoints: 0,
          currentBadge: 'None',
          badgeHistory: [],
          specialistBadges: []
        };
        empRecord.name = name || empRecord.name;
        empRecord.email = email || empRecord.email || (empRecord.id.toLowerCase() + '@techm-cis.local');
        empRecord.department = pickField(r, ['department', 'dept']) || empRecord.department || (matchedTeam ? matchedTeam.department : 'Cloud Engineering');
        empRecord.designation = pickField(r, ['designation', 'title', 'role']) || empRecord.designation || 'Engineer';
        empRecord.teamId = matchedTeam ? matchedTeam.id : 'TM-01';
        empRecord.teamName = matchedTeam ? matchedTeam.name : teamName;
        empRecord.projectId = matchedProj ? matchedProj.id : 'PRJ-01';
        empRecord.projectName = matchedProj ? matchedProj.name : projName;

        await storage.put('employees', empRecord);
        if (existing) updated++; else added++;
      }
      await storage.recalculateAllPointsAndBadges();
    } else if (entityType === 'contributions') {
      var emps = storage.getAll('employees');
      var acts = storage.getAll('points_master');
      var existingContribs = storage.getAll('contributions');

      for (var j = 0; j < rows.length; j++) {
        var row = rows[j];
        var title = pickField(row, ['title', 'contributionTitle', 'contribution']);
        if (!title) continue;
        var cid = pickField(row, ['id', 'contributionId']);
        var prev = cid ? existingContribs.find(function (c) { return c.id === cid; }) : null;
        var empRef = pickField(row, ['employeeId', 'employeeName', 'employee']);
        var empObj = emps.find(function (e) {
          return e.id === empRef || e.name.toLowerCase() === String(empRef).toLowerCase() || e.email.toLowerCase() === String(empRef).toLowerCase();
        }) || emps[0];
        var actRef = pickField(row, ['activityId', 'activityName', 'activity']);
        var actObj = acts.find(function (a) {
          return a.id === actRef || a.name.toLowerCase() === String(actRef).toLowerCase();
        }) || acts[0];

        var status = pickField(row, ['status']) || (prev ? prev.status : 'Manager Review');
        var basePts = Number(pickField(row, ['basePoints', 'points'])) || actObj.defaultPoints;
        var mult = Number(pickField(row, ['approvedMultiplier', 'multiplier', 'requestedMultiplier'])) || 1.0;
        var finalPts = status === 'Approved' ? Math.round(basePts * mult) : 0;
        var dateStr = pickField(row, ['contributionDate', 'date']) || new Date().toISOString().slice(0, 10);

        var rec = prev ? Object.assign({}, prev) : {
          id: cid || window.CIS.utils.genId('CON'),
          contributionType: 'Individual',
          approvalHistory: [],
          submissionDate: new Date().toISOString()
        };
        rec.employeeId = empObj.id;
        rec.employeeName = empObj.name;
        rec.department = pickField(row, ['department']) || empObj.department;
        rec.teamId = empObj.teamId;
        rec.teamName = empObj.teamName;
        rec.projectId = empObj.projectId;
        rec.projectName = empObj.projectName;
        rec.categoryId = actObj.categoryId;
        rec.categoryName = pickField(row, ['categoryName', 'category']) || actObj.categoryName;
        rec.activityId = actObj.id;
        rec.activityName = actObj.name;
        rec.title = title;
        rec.description = pickField(row, ['description']) || ('Imported contribution: ' + title);
        rec.evidence = pickField(row, ['evidence']) || 'Imported from spreadsheet';
        rec.measurableImpact = pickField(row, ['measurableImpact', 'impact']) || '';
        rec.timeSavedHours = Number(pickField(row, ['timeSavedHours', 'timeSaved'])) || 0;
        rec.costSavedUsd = Number(pickField(row, ['costSavedUsd', 'costSaved'])) || 0;
        rec.contributionDate = dateStr;
        rec.basePoints = basePts;
        rec.requestedMultiplier = mult;
        rec.approvedMultiplier = mult;
        rec.finalPoints = finalPts;
        rec.status = status;
        rec.teamAllocations = [{ employeeId: empObj.id, employeeName: empObj.name, percentage: 100 }];

        await storage.put('contributions', rec);
        if (prev) updated++; else added++;
      }
      await storage.recalculateAllPointsAndBadges();
    } else if (entityType === 'points_master') {
      var existingActs = storage.getAll('points_master');
      for (var k = 0; k < rows.length; k++) {
        var ar = rows[k];
        var actName = pickField(ar, ['name', 'activityName', 'activity']);
        if (!actName) continue;
        var aid = pickField(ar, ['id', 'activityId']);
        var prevAct = existingActs.find(function (a) {
          return (aid && a.id === aid) || a.name.toLowerCase() === actName.toLowerCase();
        });
        var actRec = prevAct ? Object.assign({}, prevAct) : {
          id: aid || window.CIS.utils.genId('ACT'),
          active: true
        };
        actRec.categoryId = pickField(ar, ['categoryId']) || actRec.categoryId || 'CAT-01';
        actRec.categoryName = pickField(ar, ['categoryName', 'category']) || actRec.categoryName || 'Innovation & Automation';
        actRec.name = actName;
        actRec.description = pickField(ar, ['description']) || actRec.description || ('Activity: ' + actName);
        actRec.defaultPoints = Number(pickField(ar, ['defaultPoints', 'points'])) || actRec.defaultPoints || 15;
        actRec.evidenceRequirements = pickField(ar, ['evidenceRequirements', 'evidence']) || actRec.evidenceRequirements || 'Supporting evidence required';
        actRec.approvalRequirement = pickField(ar, ['approvalRequirement', 'approval']) || actRec.approvalRequirement || 'Manager Only';

        await storage.put('points_master', actRec);
        if (prevAct) updated++; else added++;
      }
    } else if (entityType === 'assets') {
      var existingAssets = storage.getAll('assets');
      var empList = storage.getAll('employees');
      for (var m = 0; m < rows.length; m++) {
        var asr = rows[m];
        var assetName = pickField(asr, ['name', 'assetName']);
        if (!assetName) continue;
        var asid = pickField(asr, ['id', 'assetId']);
        var prevAsset = existingAssets.find(function (a) {
          return (asid && a.id === asid) || a.name.toLowerCase() === assetName.toLowerCase();
        });
        var creatorRef = pickField(asr, ['creatorName', 'creator', 'creatorId']);
        var creator = empList.find(function (e) {
          return e.id === creatorRef || e.name.toLowerCase() === String(creatorRef).toLowerCase();
        }) || empList[0];

        var assetRec = prevAsset ? Object.assign({}, prevAsset) : {
          id: asid || window.CIS.utils.genId('AST'),
          creationDate: new Date().toISOString().slice(0, 10),
          adoptionTeams: [],
          approvalStatus: 'Pending'
        };
        assetRec.name = assetName;
        assetRec.category = pickField(asr, ['category']) || assetRec.category || 'Reusable Asset';
        assetRec.description = pickField(asr, ['description']) || assetRec.description || '';
        assetRec.technology = pickField(asr, ['technology', 'techStack']) || assetRec.technology || '';
        assetRec.creatorId = creator.id;
        assetRec.creatorName = creator.name;
        assetRec.teamId = creator.teamId;
        assetRec.teamName = creator.teamName;
        assetRec.projectId = creator.projectId;
        assetRec.projectName = creator.projectName;
        assetRec.currentStage = pickField(asr, ['currentStage', 'stage']) || assetRec.currentStage || 'Create';
        assetRec.adoptionCount = Number(pickField(asr, ['adoptionCount'])) || assetRec.adoptionCount || 0;
        assetRec.reuseCount = Number(pickField(asr, ['reuseCount'])) || assetRec.reuseCount || 0;
        assetRec.estimatedTimeSavedHours = Number(pickField(asr, ['estimatedTimeSavedHours', 'timeSaved'])) || assetRec.estimatedTimeSavedHours || 0;
        assetRec.estimatedCostSavedUsd = Number(pickField(asr, ['estimatedCostSavedUsd', 'costSaved'])) || assetRec.estimatedCostSavedUsd || 0;
        assetRec.measurableValue = pickField(asr, ['measurableValue', 'value']) || assetRec.measurableValue || '';

        await storage.put('assets', assetRec);
        if (prevAsset) updated++; else added++;
      }
    }

    return { added: added, updated: updated, total: rows.length };
  }

  window.CIS.excel = {
    exportToXlsx: exportToXlsx,
    exportToCsv: exportToCsv,
    readSpreadsheetFile: readSpreadsheetFile,
    importRecordsFromFile: importRecordsFromFile,
    buildZipBlob: buildZipBlob
  };
})();
