/* ==========================================================================
   CIS Portal — Persistent Browser Storage (IndexedDB Primary + Local Engine)
   Guarantees:
   - IndexedDB primary persistence across browser refreshes & reopenings
   - Automatic localStorage fallback if IndexedDB is restricted
   - One-time initial seed migration (never overwrites user-entered records)
   - Full CRUD & live Points / Badge recalculation engine
   ========================================================================== */

(function () {
  window.CIS = window.CIS || {};

  var DB_NAME = 'CISImpactPortalDB';
  var DB_VERSION = 1;
  var STORE_NAMES = [
    'employees',
    'contributions',
    'points_master',
    'badges',
    'specialist_badges',
    'specialist_nominations',
    'approvals',
    'assets',
    'annual_points',
    'rewards',
    'settings',
    'projects',
    'teams',
    'meta'
  ];

  var dbInstance = null;
  var useFallbackLS = false;
  var LS_PREFIX = 'CIS_PORTAL_STORE_';

  var cache = {
    employees: [],
    contributions: [],
    points_master: [],
    badges: [],
    specialist_badges: [],
    specialist_nominations: [],
    approvals: [],
    assets: [],
    annual_points: [],
    rewards: [],
    settings: [],
    projects: [],
    teams: [],
    meta: []
  };

  function openIndexedDB() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) {
        useFallbackLS = true;
        resolve(null);
        return;
      }
      try {
        var req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = function (event) {
          var db = event.target.result;
          for (var i = 0; i < STORE_NAMES.length; i++) {
            var name = STORE_NAMES[i];
            if (!db.objectStoreNames.contains(name)) {
              db.createObjectStore(name, { keyPath: 'id' });
            }
          }
        };
        req.onsuccess = function (event) {
          dbInstance = event.target.result;
          resolve(dbInstance);
        };
        req.onerror = function () {
          useFallbackLS = true;
          resolve(null);
        };
      } catch (e) {
        useFallbackLS = true;
        resolve(null);
      }
    });
  }

  function idbGetAll(storeName) {
    if (useFallbackLS || !dbInstance) {
      try {
        var raw = window.localStorage.getItem(LS_PREFIX + storeName);
        return Promise.resolve(raw ? JSON.parse(raw) : []);
      } catch (e) {
        return Promise.resolve([]);
      }
    }
    return new Promise(function (resolve) {
      try {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          resolve([]);
          return;
        }
        var tx = dbInstance.transaction(storeName, 'readonly');
        var store = tx.objectStore(storeName);
        var req = store.getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { resolve([]); };
      } catch (e) {
        resolve([]);
      }
    });
  }

  function idbReplaceAll(storeName, records) {
    cache[storeName] = records;
    if (useFallbackLS || !dbInstance) {
      try {
        window.localStorage.setItem(LS_PREFIX + storeName, JSON.stringify(records));
      } catch (e) {}
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      try {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          resolve();
          return;
        }
        var tx = dbInstance.transaction(storeName, 'readwrite');
        var store = tx.objectStore(storeName);
        store.clear();
        for (var i = 0; i < records.length; i++) {
          store.put(records[i]);
        }
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      } catch (e) {
        resolve();
      }
    });
  }

  function idbPut(storeName, record) {
    var list = cache[storeName] || [];
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === record.id) { idx = i; break; }
    }
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    cache[storeName] = list;

    if (useFallbackLS || !dbInstance) {
      try {
        window.localStorage.setItem(LS_PREFIX + storeName, JSON.stringify(list));
      } catch (e) {}
      return Promise.resolve(record);
    }
    return new Promise(function (resolve) {
      try {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          resolve(record);
          return;
        }
        var tx = dbInstance.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(record);
        tx.oncomplete = function () { resolve(record); };
        tx.onerror = function () { resolve(record); };
      } catch (e) {
        resolve(record);
      }
    });
  }

  function idbDelete(storeName, id) {
    cache[storeName] = (cache[storeName] || []).filter(function (item) {
      return item.id !== id;
    });
    if (useFallbackLS || !dbInstance) {
      try {
        window.localStorage.setItem(LS_PREFIX + storeName, JSON.stringify(cache[storeName]));
      } catch (e) {}
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      try {
        if (!dbInstance.objectStoreNames.contains(storeName)) {
          resolve();
          return;
        }
        var tx = dbInstance.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      } catch (e) {
        resolve();
      }
    });
  }

  async function initStorage() {
    await openIndexedDB();
    var metaList = await idbGetAll('meta');
    var seededFlag = null;
    for (var m = 0; m < metaList.length; m++) {
      if (metaList[m].id === 'seed-status') seededFlag = metaList[m];
    }

    if (!seededFlag || !seededFlag.seeded) {
      var seed = window.buildCISSeedData();
      var keys = Object.keys(seed);
      for (var i = 0; i < keys.length; i++) {
        await idbReplaceAll(keys[i], seed[keys[i]]);
      }
      await idbPut('meta', {
        id: 'seed-status',
        seeded: true,
        seededAt: new Date().toISOString(),
        schemaVersion: DB_VERSION
      });
      await idbPut('meta', {
        id: 'catalog-version',
        version: window.CIS_CATALOG_VERSION || 'cis-official-9cat-v2',
        updatedAt: new Date().toISOString()
      });
    } else {
      for (var j = 0; j < STORE_NAMES.length; j++) {
        var sName = STORE_NAMES[j];
        cache[sName] = await idbGetAll(sName);
      }
      var catalogMeta = null;
      for (var cm = 0; cm < metaList.length; cm++) {
        if (metaList[cm].id === 'catalog-version') catalogMeta = metaList[cm];
      }
      var targetVersion = window.CIS_CATALOG_VERSION || 'cis-official-9cat-v2';
      if ((!catalogMeta || catalogMeta.version !== targetVersion) && typeof window.buildOfficialCISPointsMaster === 'function') {
        await idbReplaceAll('points_master', window.buildOfficialCISPointsMaster());
        await idbPut('meta', {
          id: 'catalog-version',
          version: targetVersion,
          updatedAt: new Date().toISOString()
        });
      }
    }
    return {
      backend: useFallbackLS ? 'localStorage' : 'IndexedDB',
      seededBefore: Boolean(seededFlag && seededFlag.seeded)
    };
  }

  function getAll(storeName) {
    return (cache[storeName] || []).slice();
  }

  function getSettings() {
    return (cache.settings && cache.settings[0]) || window.buildCISSeedData().settings[0];
  }

  /**
   * Recalculates lifetimePoints, annualPoints, currentBadge, and badgeHistory
   * for all employees from Approved contributions. Never removes earned lifetime badges.
   */
  async function recalculateAllPointsAndBadges() {
    var employees = getAll('employees');
    var contributions = getAll('contributions');
    var badges = getAll('badges').sort(function (a, b) { return a.minPoints - b.minPoints; });
    var settings = getSettings();
    var currentYear = Number(settings.currentCycleYear) || new Date().getFullYear();

    var approvedContribs = contributions.filter(function (c) { return c.status === 'Approved'; });
    var annualRecords = [];

    for (var i = 0; i < employees.length; i++) {
      var emp = employees[i];
      var lifetime = 0;
      var annual = 0;
      var annualCount = 0;

      for (var cIdx = 0; cIdx < approvedContribs.length; cIdx++) {
        var c = approvedContribs[cIdx];
        var allocs = c.teamAllocations && c.teamAllocations.length
          ? c.teamAllocations
          : [{ employeeId: c.employeeId, employeeName: c.employeeName, percentage: 100 }];
        var alloc = null;
        for (var a = 0; a < allocs.length; a++) {
          if (allocs[a].employeeId === emp.id) { alloc = allocs[a]; break; }
        }
        if (!alloc) continue;
        var share = Math.round((Number(c.finalPoints || 0) * Number(alloc.percentage || 100)) / 100);
        lifetime += share;
        var yr = new Date(c.contributionDate || c.submissionDate || Date.now()).getFullYear();
        if (yr === currentYear) {
          annual += share;
          annualCount += 1;
        }
      }

      var existingHistory = Array.isArray(emp.badgeHistory) ? emp.badgeHistory.slice() : [];
      var existingIds = {};
      for (var h = 0; h < existingHistory.length; h++) {
        existingIds[existingHistory[h].badgeId] = true;
      }

      for (var b = 0; b < badges.length; b++) {
        var bdg = badges[b];
        if (lifetime >= bdg.minPoints && !existingIds[bdg.id]) {
          existingHistory.push({
            badgeId: bdg.id,
            badgeName: bdg.name,
            achievedDate: new Date().toISOString().slice(0, 10),
            lifetimePointsAtAchievement: lifetime
          });
        }
      }

      var currentBadge = 'None';
      if (existingHistory.length > 0) {
        var earnedObjs = badges.filter(function (bdg) {
          return existingHistory.some(function (eh) { return eh.badgeId === bdg.id; });
        });
        if (earnedObjs.length > 0) {
          currentBadge = earnedObjs[earnedObjs.length - 1].name;
        }
      }

      emp.lifetimePoints = lifetime;
      emp.annualPoints = annual;
      emp.currentBadge = currentBadge;
      emp.badgeHistory = existingHistory;

      if (annual > 0) {
        annualRecords.push({
          id: 'AP-' + currentYear + '-' + emp.id,
          employeeId: emp.id,
          employeeName: emp.name,
          year: currentYear,
          points: annual,
          contributionsCount: annualCount
        });
      }
    }

    await idbReplaceAll('employees', employees);
    await idbReplaceAll('annual_points', annualRecords);
  }

  function isDuplicateContribution(employeeId, activityId, title, excludeId) {
    var settings = getSettings();
    if (!settings.duplicateCheckEnabled) return false;
    var normTitle = String(title || '').trim().toLowerCase();
    var windowMs = (Number(settings.duplicateWindowDays) || 30) * 86400000;
    var now = Date.now();
    var list = getAll('contributions');
    return list.some(function (c) {
      if (c.id === excludeId) return false;
      if (c.status === 'Rejected') return false;
      if (c.employeeId !== employeeId) return false;
      if (c.activityId !== activityId) return false;
      var sameTitle = String(c.title || '').trim().toLowerCase() === normTitle;
      var ts = new Date(c.submissionDate || c.contributionDate || Date.now()).getTime();
      return sameTitle && Math.abs(now - ts) <= windowMs;
    });
  }

  function determineNextStageAfterApproval() {
    return 'Approved';
  }

  window.CIS.storage = {
    init: initStorage,
    getAll: getAll,
    put: idbPut,
    remove: idbDelete,
    replaceAll: idbReplaceAll,
    getSettings: getSettings,
    recalculateAllPointsAndBadges: recalculateAllPointsAndBadges,
    isDuplicateContribution: isDuplicateContribution,
    determineNextStageAfterApproval: determineNextStageAfterApproval,
    isIndexedDBActive: function () { return !useFallbackLS && Boolean(dbInstance); }
  };
})();
