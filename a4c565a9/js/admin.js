/* ============================================================
   AI FITNESS COACH — SHARED ADMIN HELPERS
   Used by all admin CRUD pages. Depends on app.js, utils.js,
   firebase-db.js, firebase-storage.js.
   ============================================================ */

/**
 * afcAdminTable({ columns, rows, actions })
 * Returns an HTML string for a responsive .table-2 table.
 * columns: [{key, label, render?(row, key)}]
 * rows: object { key: rowData } or array of [key, rowData]
 * actions: [{icon, title, cls, onClick(row, key)}]
 * Each <tr> gets data-key="..." for event delegation.
 */
window.afcAdminTable = function (opts) {
  opts = opts || {};
  var cols = opts.columns || [];
  var rows = opts.rows || {};
  var actions = opts.actions || [];

  /* Normalize rows to array of [key, data] */
  var entries = [];
  if (Array.isArray(rows)) {
    entries = rows;
  } else if (rows && typeof rows === "object") {
    Object.keys(rows).forEach(function (k) {
      entries.push([k, rows[k]]);
    });
  }

  var thead = "<thead><tr>";
  cols.forEach(function (c) {
    thead += "<th>" + afcEscape(c.label) + "</th>";
  });
  if (actions.length) thead += "<th>Actions</th>";
  thead += "</tr></thead>";

  var tbody = "<tbody>";
  if (!entries.length) {
    var colSpan = cols.length + (actions.length ? 1 : 0);
    tbody += '<tr><td colspan="' + colSpan + '" class="text-center text-muted-2 py-4">No records found.</td></tr>';
  } else {
    entries.forEach(function (entry) {
      var key = entry[0];
      var row = entry[1] || {};
      tbody += '<tr data-key="' + afcEscape(key) + '">';
      cols.forEach(function (c) {
        var val = row[c.key];
        if (typeof c.render === "function") {
          tbody += "<td>" + c.render(row, key) + "</td>";
        } else {
          tbody += "<td>" + afcEscape(val == null ? "" : val) + "</td>";
        }
      });
      if (actions.length) {
        tbody += '<td><div class="row-actions">';
        actions.forEach(function (a) {
          tbody += '<button class="btn ' + (a.cls || "btn-outline-secondary") + '" data-action="' +
            afcEscape(a.title || "") + '" data-key="' + afcEscape(key) + '" title="' +
            afcEscape(a.title || "") + '"><i class="bi bi-' + afcEscape(a.icon) + '"></i></button>';
        });
        tbody += "</div></td>";
      }
      tbody += "</tr>";
    });
  }
  tbody += "</tbody>";

  return '<div class="admin-table-wrap"><table class="table-2">' + thead + tbody + "</table></div>";
};

/**
 * afcAdminBindActions(container, handlers)
 * Event delegation: listens for clicks on [data-action][data-key]
 * inside container. handlers is { actionTitle: function(rowKey) }.
 */
window.afcAdminBindActions = function (container, handlers) {
  if (!container) return;
  container.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action][data-key]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");
    var key = btn.getAttribute("data-key");
    if (handlers[action]) {
      handlers[action](key);
    }
  });
};

/**
 * afcAdminSearchFilter(inputSel, rowSel)
 * Client-side text filtering with debounce.
 * Filters table rows (tr[data-key]) by matching text content
 * against the search input value.
 */
window.afcAdminSearchFilter = function (inputSel, rowSel) {
  var input = document.querySelector(inputSel);
  if (!input) return;
  var handler = afcDebounce(function () {
    var q = input.value.toLowerCase().trim();
    var rows = document.querySelectorAll(rowSel);
    rows.forEach(function (row) {
      var text = row.textContent.toLowerCase();
      row.style.display = (!q || text.indexOf(q) !== -1) ? "" : "none";
    });
  }, 250);
  input.addEventListener("input", handler);
};

/**
 * afcToggleField(path, field)
 * Toggles a boolean field at path/field in Firebase.
 * Returns the new value.
 */
window.afcToggleField = async function (path, field) {
  var current = await afcDbGet(path + "/" + field);
  var next = !current;
  await afcDbUpdate(path, (function () { var o = {}; o[field] = next; return o; })());
  return next;
};

/**
 * afcConfirmDelete(label)
 * Wraps afcConfirm with danger styling for delete confirmations.
 * Returns Promise<boolean>.
 */
window.afcConfirmDelete = function (label) {
  return afcConfirm({
    title: "Delete " + (label || "this item") + "?",
    body: "This action cannot be undone.",
    okText: "Delete",
    danger: true
  });
};

/**
 * afcImgUploadField — Image upload pattern for admin modals.
 *
 * USAGE: After afcFormModal returns data, if the page needs an image:
 *   1. Call afcPickImage() to let user select a file.
 *   2. Validate with afcValidateImage(file) — returns error string or null.
 *   3. Upload with afcUpload(storagePath, file, onProgress).
 *   4. Show progress via afcToast or afcLoader.
 *   5. Use the returned download URL as the image field value.
 *
 * Example:
 *   var data = await afcFormModal({...});
 *   if (!data) return;
 *   // If user wants to upload instead of URL:
 *   var file = await afcPickImage();
 *   if (file) {
 *     var err = afcValidateImage(file);
 *     if (err) { afcToast(err, "error"); return; }
 *     afcLoader("Uploading image...");
 *     var url = await afcUpload("exercises/" + slug + "/image.jpg", file, function(pct) {
 *       // optional progress
 *     });
 *     afcLoaderOff();
 *     data.image = url;
 *   }
 */

/**
 * Helper: generate a URL-safe slug from a name string.
 */
window.afcSlugify = function (name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
