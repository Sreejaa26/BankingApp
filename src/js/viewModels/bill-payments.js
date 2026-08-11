define([
  'knockout', 'utils/api', 'ojs/ojarraydataprovider', 'ojs/ojconverter-number', 'ojs/ojconverter-datetime',
  'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojmessages'
], function (ko, api, ArrayDataProvider, NumberConverters, DateTimeConverters) {
  'use strict';

  function unwrap(response) { return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response; }
  function asArray(value) {
    if (Array.isArray(value)) { return value; }
    if (value && Array.isArray(value.content)) { return value.content; }
    if (value && Array.isArray(value.items)) { return value.items; }
    return [];
  }
  function option(value, label) { return { value: value, label: label }; }

  function BillPaymentsViewModel(params) {
    const self = this;
    const token = function () { return params.app.authToken(); };
    self.loading = ko.observable(true);
    self.busyAction = ko.observable('');
    self.messages = ko.observableArray([]);
    self.catalog = ko.observableArray([]);
    self.registrations = ko.observableArray([]);
    self.accounts = ko.observableArray([]);
    self.payments = ko.observableArray([]);
    self.selectedPayment = ko.observable(null);
    self.pendingPayment = ko.observable(null);
    self.pendingDeactivation = ko.observable(null);
    self.registrationPanelOpen = ko.observable(false);
    self.registrationMode = ko.observable('create');
    self.editingRegistrationId = ko.observable('');
    self.historyPage = ko.observable(0);
    self.historyTotalPages = ko.observable(0);
    self.historyTotalElements = ko.observable(0);
    self.currency = new NumberConverters.IntlNumberConverter({ style: 'currency', currency: 'INR', currencyDisplay: 'symbol' });
    self.dateTime = new DateTimeConverters.IntlDateTimeConverter({ dateStyle: 'medium', timeStyle: 'short' });
    self.formatMoney = function (value) { return self.currency.format(Number(value || 0)); };
    self.formatDate = function (value) {
      if (!value) { return '—'; }
      const normalized = String(value).replace(/(\.\d{3})\d+(Z|[+-])/, '$1$2');
      const parsed = new Date(normalized);
      if (Number.isNaN(parsed.getTime())) { return String(value); }
      const formatted = params.app.formatDate(parsed, { dateStyle: 'medium', timeStyle: 'short' });
      return formatted || String(value);
    };
    self.billerInitials = function (row) { return String(row && row.billerName || 'Bill').slice(0, 2).toUpperCase(); };
    self.statusClass = function (status) { return 'bill-status bill-status--' + String(status || 'unknown').toLowerCase(); };

    self.categoryOptions = new ArrayDataProvider([
      option('', 'All categories'), option('ELECTRICITY', 'Electricity'), option('WATER', 'Water'), option('GAS', 'Gas'),
      option('TELECOM', 'Telecom'), option('INTERNET', 'Internet'), option('INSURANCE', 'Insurance'), option('OTHER', 'Other')
    ], { keyAttributes: 'value' });
    self.historyStatusOptions = new ArrayDataProvider([
      option('', 'All statuses'), option('PENDING', 'Pending'), option('SUCCESS', 'Success'),
      option('FAILED', 'Failed'), option('CANCELLED', 'Cancelled')
    ], { keyAttributes: 'value' });
    self.selectedCategory = ko.observable('');
    self.registrationBillerId = ko.observable('');
    self.registrationConsumerReference = ko.observable('');
    self.registrationNickname = ko.observable('');
    self.paymentAccountId = ko.observable('');
    self.paymentBillerId = ko.observable('');
    self.paymentAmount = ko.observable(0);
    self.paymentDescription = ko.observable('');
    self.historyStatus = ko.observable('');
    self.historyAccountId = ko.observable('');
    self.historyBillerId = ko.observable('');
    self.historyFrom = ko.observable('');
    self.historyTo = ko.observable('');

    self.catalogOptions = ko.pureComputed(function () {
      const selectedCategory = self.selectedCategory();
      return new ArrayDataProvider(self.catalog().filter(function (row) { return !selectedCategory || row.category === selectedCategory; })
        .map(function (row) { return option(row.billerId, row.billerName + ' · ' + row.category); }), { keyAttributes: 'value' });
    });
    self.registrationOptions = ko.pureComputed(function () {
      return new ArrayDataProvider(self.registrations().filter(function (row) { return row.status === 'ACTIVE'; }).map(function (row) {
        return option(row.customerBillerId, (row.nickname || row.biller.billerName) + ' · ' + row.consumerReference);
      }), { keyAttributes: 'value' });
    });
    self.historyBillerOptions = ko.pureComputed(function () {
      return new ArrayDataProvider(self.registrations().filter(function (row) { return row.biller; }).map(function (row) {
        return option(row.biller.billerId, row.nickname || row.biller.billerName);
      }), { keyAttributes: 'value' });
    });
    self.accountOptions = ko.pureComputed(function () {
      return new ArrayDataProvider(self.accounts().filter(function (row) { return row.status === 'ACTIVE'; }).map(function (row) {
        const number = String(row.accountNumber || '');
        return option(row.accountId, String(row.accountType || 'Account').replace(/_/g, ' ') + ' · •••• ' + number.slice(-4) + ' · ' + self.formatMoney(row.availableBalance));
      }), { keyAttributes: 'value' });
    });
    self.showMessage = function (severity, summary, detail) { self.messages([{ severity: severity, summary: summary, detail: detail || '' }]); };
    self.clearMessage = function () { self.messages([]); };

    self.loadCatalog = function () { return api.request('/api/billers/catalog', {}, token()).then(function (response) { self.catalog(asArray(unwrap(response))); }); };
    self.loadRegistrations = function () {
      return api.request('/api/billers', {}, token()).then(function (response) {
        const rows = asArray(unwrap(response)); self.registrations(rows);
        const active = rows.filter(function (row) { return row.status === 'ACTIVE'; });
        const currentIsActive = active.some(function (row) { return row.customerBillerId === self.paymentBillerId(); });
        if (!currentIsActive) { self.paymentBillerId(active.length ? active[0].customerBillerId : ''); }
      });
    };
    self.loadAccounts = function () {
      return api.request('/api/accounts', {}, token()).then(function (response) {
        const rows = asArray(unwrap(response)); self.accounts(rows);
        const active = rows.filter(function (row) { return row.status === 'ACTIVE'; });
        if (!self.paymentAccountId() && active.length) { self.paymentAccountId(active[0].accountId); }
      });
    };
    self.historyPath = function (page) {
      const hasFilters = Boolean(self.historyStatus() || self.historyAccountId() || self.historyBillerId() || self.historyFrom() || self.historyTo());
      const query = [];
      const add = function (name, value) { if (value !== '' && value != null) { query.push(encodeURIComponent(name) + '=' + encodeURIComponent(value)); } };
      add('status', self.historyStatus()); add('sourceAccountId', self.historyAccountId()); add('billerId', self.historyBillerId());
      add('from', self.historyFrom() ? self.historyFrom() + 'T00:00:00Z' : ''); add('to', self.historyTo() ? self.historyTo() + 'T23:59:59Z' : '');
      add('page', page); add('size', 10);
      return (hasFilters ? '/api/bill-payments/history?' : '/api/bill-payments?') + query.join('&');
    };
    self.loadHistory = function (page) {
      const targetPage = Math.max(0, Number(page == null ? self.historyPage() : page));
      return api.request(self.historyPath(targetPage), {}, token()).then(function (response) {
        const result = unwrap(response) || {};
        self.payments(asArray(result).map(function (row) { return Object.assign({}, row, { formattedCreatedAt: self.formatDate(row.createdAt) }); }));
        self.historyPage(Number(result.number == null ? result.page || targetPage : result.number));
        self.historyTotalPages(Number(result.totalPages || 0));
        self.historyTotalElements(Number(result.totalElements == null ? self.payments().length : result.totalElements));
      });
    };
    self.refresh = function () {
      self.loading(true); self.clearMessage();
      return Promise.all([self.loadCatalog(), self.loadRegistrations(), self.loadAccounts(), self.loadHistory(0)])
        .catch(function (error) { self.showMessage('error', 'Bill Payments could not be loaded', error.message); })
        .finally(function () { self.loading(false); });
    };

    self.openRegistration = function () {
      self.registrationMode('create'); self.editingRegistrationId(''); self.registrationBillerId('');
      self.registrationConsumerReference(''); self.registrationNickname(''); self.registrationPanelOpen(true); self.clearMessage();
    };
    self.editRegistration = function (row) {
      self.busyAction('detail-' + row.customerBillerId); self.clearMessage();
      api.request('/api/billers/' + encodeURIComponent(row.customerBillerId), {}, token()).then(function (response) {
        const detail = unwrap(response) || row;
        self.registrationMode('edit'); self.editingRegistrationId(detail.customerBillerId);
        self.registrationBillerId(detail.biller && detail.biller.billerId || detail.billerId);
        self.registrationConsumerReference(detail.consumerReference || ''); self.registrationNickname(detail.nickname || '');
        self.registrationPanelOpen(true);
      }).catch(function (error) { self.showMessage('error', 'Biller detail could not be loaded', error.message); })
        .finally(function () { self.busyAction(''); });
    };
    self.closeRegistration = function () { self.registrationPanelOpen(false); };
    self.saveRegistration = function () {
      const consumerReference = self.registrationConsumerReference().trim();
      const nickname = self.registrationNickname().trim();
      if (!self.registrationBillerId() || consumerReference.length < 3 || nickname.length < 2) {
        self.showMessage('error', 'Complete the biller form', 'Choose a biller, enter a consumer reference of at least 3 characters, and a nickname of at least 2 characters.'); return false;
      }
      const editing = self.registrationMode() === 'edit';
      const path = editing ? '/api/billers/' + encodeURIComponent(self.editingRegistrationId()) : '/api/billers';
      self.busyAction('registration'); self.clearMessage();
      api.request(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify({
        billerId: self.registrationBillerId(), consumerReference: consumerReference, nickname: nickname
      }) }, token()).then(function () {
        self.registrationPanelOpen(false); self.showMessage('confirmation', editing ? 'Biller updated' : 'Biller registered', 'The biller is ready for secure payments.');
        return self.loadRegistrations();
      }).catch(function (error) { self.showMessage('error', 'Biller could not be saved', error.message); }).finally(function () { self.busyAction(''); });
      return false;
    };
    self.requestDeactivation = function (row) { self.pendingDeactivation(row); self.clearMessage(); };
    self.cancelDeactivation = function () { self.pendingDeactivation(null); };
    self.confirmDeactivation = function () {
      const row = self.pendingDeactivation(); if (!row) { return; }
      self.busyAction('deactivate-' + row.customerBillerId);
      api.request('/api/billers/' + encodeURIComponent(row.customerBillerId), { method: 'DELETE' }, token()).then(function () {
        self.pendingDeactivation(null); self.showMessage('confirmation', 'Biller deactivated', 'The registration will no longer be available for payments.'); return self.loadRegistrations();
      }).catch(function (error) { self.showMessage('error', 'Biller could not be deactivated', error.message); }).finally(function () { self.busyAction(''); });
    };

    self.reviewPayment = function () {
      const amount = Number(self.paymentAmount());
      const account = self.accounts().find(function (row) { return row.accountId === self.paymentAccountId(); });
      const biller = self.registrations().find(function (row) { return row.customerBillerId === self.paymentBillerId(); });
      if (!account || !biller || !Number.isFinite(amount) || amount <= 0) {
        self.showMessage('error', 'Complete the payment details', 'Choose an active account and registered biller, then enter a positive amount.'); return false;
      }
      self.pendingPayment({ sourceAccountId: account.accountId, customerBillerId: biller.customerBillerId, amount: amount,
        description: self.paymentDescription().trim() || 'Bill payment to ' + biller.biller.billerName,
        accountLabel: String(account.accountType || 'Account').replace(/_/g, ' ') + ' •••• ' + String(account.accountNumber || '').slice(-4),
        billerLabel: biller.nickname || biller.biller.billerName, idempotencyKey: api.createIdempotencyKey() });
      self.clearMessage(); return false;
    };
    self.cancelPayment = function () { self.pendingPayment(null); };
    self.confirmPayment = function () {
      const pending = self.pendingPayment(); if (!pending) { return; }
      self.busyAction('payment'); self.clearMessage();
      api.request('/api/banking/bill-payments', { method: 'POST', headers: { 'Idempotency-Key': pending.idempotencyKey },
        body: JSON.stringify({ sourceAccountId: pending.sourceAccountId, customerBillerId: pending.customerBillerId, amount: pending.amount, description: pending.description }) }, token())
        .then(function (response) {
          const result = unwrap(response) || {}; self.pendingPayment(null); self.paymentAmount(0); self.paymentDescription('');
          self.showMessage('confirmation', 'Payment submitted', 'Reference ' + (result.referenceNumber || result.billPaymentId || 'created') + '.');
          Promise.all([self.loadHistory(0), self.loadAccounts()]).catch(function (refreshError) {
            self.showMessage('warning', 'Payment submitted; refresh needed', refreshError.message);
          });
        }).catch(function (error) { self.showMessage('error', 'Payment could not be completed', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.openPayment = function (row) {
      self.busyAction('detail-' + row.billPaymentId);
      api.request('/api/bill-payments/' + encodeURIComponent(row.billPaymentId), {}, token()).then(function (response) {
        const detail = unwrap(response) || {};
        self.selectedPayment(Object.assign({}, detail, { formattedCreatedAt: self.formatDate(detail.createdAt) }));
      })
        .catch(function (error) { self.showMessage('error', 'Payment detail could not be loaded', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.closePayment = function () { self.selectedPayment(null); };
    self.applyHistoryFilters = function () { self.loadHistory(0).catch(function (error) { self.showMessage('error', 'History could not be filtered', error.message); }); return false; };
    self.clearHistoryFilters = function () { self.historyStatus(''); self.historyAccountId(''); self.historyBillerId(''); self.historyFrom(''); self.historyTo(''); self.applyHistoryFilters(); };
    self.previousHistoryPage = function () { if (self.historyPage() > 0) { self.loadHistory(self.historyPage() - 1); } };
    self.nextHistoryPage = function () { if (self.historyPage() + 1 < self.historyTotalPages()) { self.loadHistory(self.historyPage() + 1); } };
    self.refresh();
  }
  return BillPaymentsViewModel;
});
