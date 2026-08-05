define([], function () {
  'use strict';

  function escapeCsvCell(value) {
    const text = String(value == null ? '' : value);
    return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function downloadStatement() {
    const rows = [
      ['Northstar Digital Banking'],
      ['Account', 'Everyday Savings •••• 4721'],
      ['Statement period', '01 August 2026 - 31 August 2026'],
      ['Generated on', '05 August 2026'],
      [],
      ['Date', 'Description', 'Reference', 'Debit (INR)', 'Credit (INR)', 'Balance (INR)', 'Status'],
      ['05 Aug 2026', 'Fresh Market', 'UPI-842190', '1240.00', '', '323610.20', 'Completed'],
      ['04 Aug 2026', 'Northstar Utilities', 'BILL-290184', '3860.00', '', '324850.20', 'Completed'],
      ['03 Aug 2026', 'Transfer to Ananya Sharma', 'NEFT-771204', '12000.00', '', '328710.20', 'Completed'],
      ['01 Aug 2026', 'Salary credit', 'SAL-082026', '', '82500.00', '340710.20', 'Received'],
      ['31 Jul 2026', 'Fresh Basket', 'UPI-330481', '1840.00', '', '258210.20', 'Completed'],
      ['30 Jul 2026', 'ATM cash withdrawal', 'ATM-663902', '5000.00', '', '260050.20', 'Completed']
    ];
    const csv = '\uFEFF' + rows.map(function (row) {
      return row.map(escapeCsvCell).join(',');
    }).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Northstar_Statement_August_2026.csv';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    return anchor.download;
  }

  return downloadStatement;
});
