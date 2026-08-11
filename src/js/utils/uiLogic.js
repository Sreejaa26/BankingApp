(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NorthstarUiLogic = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function istMonthKey(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) { return ''; }
    const parts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit'
    }).formatToParts(date);
    const year = parts.find(function (part) { return part.type === 'year'; });
    const month = parts.find(function (part) { return part.type === 'month'; });
    return year && month ? year.value + '-' + month.value : '';
  }

  function maskedCurrency(value) {
    const digits = String(value || '').replace(/[^0-9]/g, '');
    return '₹ ******' + (digits.slice(-3) || '0');
  }

  function greetingFor(value, customerName) {
    const date = value instanceof Date ? value : new Date(value);
    const hour = Number(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23'
    }).format(date));
    const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return salutation + ', ' + customerName + '.';
  }

  function transferReadinessMessage(accountUnavailable, beneficiaryUnavailable) {
    if (accountUnavailable && beneficiaryUnavailable) {
      return 'Open and activate an account, then add a beneficiary and wait for verification.';
    }
    if (accountUnavailable) { return 'Open and activate an account before transferring money.'; }
    if (beneficiaryUnavailable) { return 'Add a beneficiary and wait for bank verification before transferring money.'; }
    return 'Your account and beneficiary are ready for transfer.';
  }

  function selectedEligibleId(currentId, rows, idField) {
    const eligibleRows = Array.isArray(rows) ? rows : [];
    const selectedIsEligible = eligibleRows.some(function (row) { return row[idField] === currentId; });
    return selectedIsEligible ? currentId : (eligibleRows.length ? eligibleRows[0][idField] : '');
  }

  function primaryNavigationItems(items, allItems, isAdmin) {
    if (isAdmin) { return items.slice(); }
    const primaryRoutes = [
      'dashboard', 'accounts', 'transactions', 'beneficiaries', 'transfer',
      'bill-payments', 'scheduled-payments', 'loans', 'cards'
    ];
    const primaryItems = primaryRoutes.map(function (route) {
      return items.find(function (item) { return item.route === route; });
    }).filter(Boolean);
    const supportItem = allItems.find(function (item) { return item.route === 'support'; });
    return supportItem ? primaryItems.concat(supportItem) : primaryItems;
  }

  return {
    greetingFor: greetingFor,
    istMonthKey: istMonthKey,
    maskedCurrency: maskedCurrency,
    primaryNavigationItems: primaryNavigationItems,
    selectedEligibleId: selectedEligibleId,
    transferReadinessMessage: transferReadinessMessage
  };
}));
