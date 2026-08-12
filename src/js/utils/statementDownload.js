define([], function () {
  'use strict';

  function escapeCsvCell(value) {
    const text = String(value == null ? '' : value);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function downloadStatement(rows, fileName) {
    if (!Array.isArray(rows) || rows.length === 0) { return 'No data'; }
    const csv = '\uFEFF' + rows.map(function (row) {
      return row.map(escapeCsvCell).join(',');
    }).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || 'statement.csv';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    return anchor.download;
  }

  return downloadStatement;
});
