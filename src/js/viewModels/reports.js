define([
  'knockout', 'utils/api', 'ojs/ojarraydataprovider', 'ojs/ojconverter-number',
  'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojmessages'
], function (ko, api, ArrayDataProvider, NumberConverters) {
  'use strict';

  function asArray(value) {
    if (Array.isArray(value)) { return value; }
    if (value && Array.isArray(value.items)) { return value.items; }
    if (value && Array.isArray(value.content)) { return value.content; }
    return [];
  }
  function option(value, label) { return { value: value, label: label }; }
  function dateInput(value) { return value.toISOString().slice(0, 10); }

  const REPORTS = {
    ACCOUNT_STATEMENT: { label: 'Account statement', endpoint: 'account-statements', account: true, customer: true },
    TRANSACTIONS: { label: 'Transactions', endpoint: 'transactions', account: true, status: true, subtype: 'Transaction type', customer: true, admin: true },
    CUSTOMERS: { label: 'Customers', endpoint: 'customers', status: true, admin: true },
    CARDS: { label: 'Cards', endpoint: 'cards', status: true, subtype: 'Card type', customer: true, admin: true },
    LOANS: { label: 'Loans', endpoint: 'loans', status: true, subtype: 'Loan type', customer: true, admin: true },
    BILL_PAYMENTS: { label: 'Bill payments', endpoint: 'bill-payments', status: true, customer: true, admin: true },
    SCHEDULES: { label: 'Schedules', endpoint: 'schedules', status: true, subtype: 'Operation type', reference: 'Schedule ID', customer: true, admin: true },
    ADMIN_OVERVIEW: { label: 'Admin overview', endpoint: 'admin-overview', admin: true },
    AUDIT: { label: 'Audit', endpoint: 'audit', status: true, subtype: 'Severity', reference: 'Reference ID', admin: true }
  };

  function ReportsViewModel(params) {
    const self = this;
    const token = function () { return params.app.authToken(); };
    const isAdmin = params.app.currentRole() === 'ADMIN';
    const today = new Date(); const monthAgo = new Date(today.getTime() - 30 * 86400000);
    let disposed = false; let pollTimer = null; let pollingJobId = '';

    self.isAdmin = isAdmin;
    self.loading = ko.observable(true);
    self.busyAction = ko.observable('');
    self.messages = ko.observableArray([]);
    self.accounts = ko.observableArray([]);
    self.history = ko.observableArray([]);
    self.historyPage = ko.observable(0);
    self.historyTotalPages = ko.observable(0);
    self.historyTotalElements = ko.observable(0);
    self.requesterFilter = ko.observable('');
    self.selectedReportType = ko.observable(isAdmin ? 'ADMIN_OVERVIEW' : 'TRANSACTIONS');
    self.format = ko.observable('PDF');
    self.ownerUserId = ko.observable('');
    self.accountId = ko.observable('');
    self.fromDate = ko.observable(dateInput(monthAgo));
    self.toDate = ko.observable(dateInput(today));
    self.filterStatus = ko.observable('');
    self.filterSubtype = ko.observable('');
    self.referenceFilter = ko.observable('');
    self.pendingReport = ko.observable(null);
    self.activeJob = ko.observable(null);
    self.selectedJob = ko.observable(null);
    self.downloadStatus = ko.observable('');
    self.number = new NumberConverters.IntlNumberConverter({ maximumFractionDigits: 0 });

    const availableTypes = Object.keys(REPORTS).filter(function (key) { return isAdmin ? REPORTS[key].admin : REPORTS[key].customer; });
    self.reportTypeOptions = new ArrayDataProvider(availableTypes.map(function (key) { return option(key, REPORTS[key].label); }), { keyAttributes: 'value' });
    self.formatOptions = new ArrayDataProvider([option('PDF', 'PDF document'), option('CSV', 'CSV spreadsheet')], { keyAttributes: 'value' });
    self.accountOptions = ko.pureComputed(function () {
      return new ArrayDataProvider(self.accounts().filter(function (row) { return row.status === 'ACTIVE'; }).map(function (row) {
        return option(row.accountId, String(row.accountType || 'Account').replace(/_/g, ' ') + ' · •••• ' + String(row.accountNumber || '').slice(-4));
      }), { keyAttributes: 'value' });
    });
    self.selectedConfig = ko.pureComputed(function () { return REPORTS[self.selectedReportType()] || REPORTS.TRANSACTIONS; });
    self.showAccount = ko.pureComputed(function () { return Boolean(self.selectedConfig().account); });
    self.accountRequired = ko.pureComputed(function () { return self.selectedReportType() === 'ACCOUNT_STATEMENT'; });
    self.showStatus = ko.pureComputed(function () { return Boolean(self.selectedConfig().status); });
    self.showSubtype = ko.pureComputed(function () { return Boolean(self.selectedConfig().subtype); });
    self.subtypeLabel = ko.pureComputed(function () { return self.selectedConfig().subtype || 'Type'; });
    self.showReference = ko.pureComputed(function () { return Boolean(self.selectedConfig().reference); });
    self.referenceLabel = ko.pureComputed(function () { return self.selectedConfig().reference || 'Reference'; });
    self.completedCount = ko.pureComputed(function () { return self.history().filter(function (row) { return row.status === 'COMPLETED'; }).length; });
    self.runningCount = ko.pureComputed(function () { return self.history().filter(function (row) { return row.status === 'QUEUED' || row.status === 'RUNNING'; }).length; });
    self.formatDate = function (value) {
      if (!value) { return '—'; }
      const normalized = String(value).replace(/(\.\d{3})\d+(Z|[+-])/, '$1$2'); const parsed = new Date(normalized);
      return Number.isNaN(parsed.getTime()) ? String(value) : params.app.formatDate(parsed, { dateStyle: 'medium', timeStyle: 'short' });
    };
    self.formatSize = function (bytes) {
      const value = Number(bytes || 0); if (!value) { return '—'; }
      if (value < 1024) { return value + ' B'; } if (value < 1048576) { return (value / 1024).toFixed(1) + ' KB'; }
      return (value / 1048576).toFixed(1) + ' MB';
    };
    self.reportLabel = function (type) { return REPORTS[type] ? REPORTS[type].label : String(type || 'Report').replace(/_/g, ' '); };
    self.jobInitials = function (row) { return String(row && row.reportType || 'Report').slice(0, 2); };
    self.statusClass = function (status) { return 'report-status report-status--' + String(status || 'unknown').toLowerCase(); };
    self.hasFilters = function (filters) { return filters && Object.keys(filters).length > 0; };
    self.showMessage = function (severity, summary, detail) { self.messages([{ severity: severity, summary: summary, detail: detail || '' }]); };
    self.clearMessage = function () { self.messages([]); };

    self.loadAccounts = function () {
      if (isAdmin) { return Promise.resolve(); }
      return api.request('/api/accounts', {}, token()).then(function (response) {
        const rows = asArray(api.unwrap(response)); self.accounts(rows);
        const active = rows.filter(function (row) { return row.status === 'ACTIVE'; });
        if (!self.accountId() && active.length) { self.accountId(active[0].accountId); }
      });
    };
    self.historyPath = function (page) {
      let path = '/api/reports/history?page=' + encodeURIComponent(page) + '&size=10';
      if (isAdmin && self.requesterFilter().trim()) { path += '&requesterUserId=' + encodeURIComponent(self.requesterFilter().trim()); }
      return path;
    };
    self.loadHistory = function (page) {
      const target = Math.max(0, Number(page == null ? self.historyPage() : page));
      return api.request(self.historyPath(target), {}, token()).then(function (response) {
        const result = api.unwrap(response) || response || {}; self.history(asArray(result)); self.historyPage(Number(result.page || target));
        self.historyTotalPages(Number(result.totalPages || 0)); self.historyTotalElements(Number(result.totalElements == null ? self.history().length : result.totalElements));
      });
    };
    self.refresh = function () {
      self.loading(true); self.clearMessage();
      return Promise.all([self.loadAccounts(), self.loadHistory(0)]).catch(function (error) { self.showMessage('error', 'Reports could not be loaded', error.message); })
        .finally(function () { self.loading(false); });
    };
    self.applyRequesterFilter = function () { self.loadHistory(0).catch(function (error) { self.showMessage('error', 'Report history could not be filtered', error.message); }); return false; };
    self.previousHistoryPage = function () { if (self.historyPage() > 0) { self.loadHistory(self.historyPage() - 1); } };
    self.nextHistoryPage = function () { if (self.historyPage() + 1 < self.historyTotalPages()) { self.loadHistory(self.historyPage() + 1); } };

    self.buildFilters = function () {
      const type = self.selectedReportType(); const filters = {};
      if (type === 'TRANSACTIONS') { if (self.accountId()) { filters.accountId = self.accountId(); } if (self.filterSubtype().trim()) { filters.transactionType = self.filterSubtype().trim(); } }
      if (type === 'CARDS' && self.filterSubtype().trim()) { filters.cardType = self.filterSubtype().trim(); }
      if (type === 'LOANS' && self.filterSubtype().trim()) { filters.loanType = self.filterSubtype().trim(); }
      if (type === 'SCHEDULES') { if (self.filterSubtype().trim()) { filters.operationType = self.filterSubtype().trim(); } if (self.referenceFilter().trim()) { filters.scheduleId = self.referenceFilter().trim(); } }
      if (type === 'AUDIT') { if (self.filterSubtype().trim()) { filters.severity = self.filterSubtype().trim(); } if (self.referenceFilter().trim()) { filters.referenceId = self.referenceFilter().trim(); } }
      if (self.selectedConfig().status && self.filterStatus().trim()) { filters.status = self.filterStatus().trim(); }
      return filters;
    };
    self.reviewReport = function () {
      const type = self.selectedReportType(); const config = REPORTS[type];
      if (!config) { self.showMessage('error', 'Choose a report type', 'Select one of the available reports.'); return false; }
      if (type === 'ACCOUNT_STATEMENT' && !self.accountId()) { self.showMessage('error', 'Choose an account', 'Account statements require an active account.'); return false; }
      if (self.fromDate() && self.toDate() && self.fromDate() > self.toDate()) { self.showMessage('error', 'Check the date range', 'The start date must be before the end date.'); return false; }
      const payload = { format: self.format(), ownerUserId: isAdmin && self.ownerUserId().trim() ? self.ownerUserId().trim() : null,
        accountId: self.showAccount() && self.accountId() ? self.accountId() : null,
        from: self.fromDate() ? self.fromDate() + 'T00:00:00Z' : null, to: self.toDate() ? self.toDate() + 'T23:59:59Z' : null, filters: self.buildFilters() };
      self.pendingReport({ type: type, label: config.label, endpoint: config.endpoint, payload: payload, idempotencyKey: api.createIdempotencyKey() }); self.clearMessage();
      return false;
    };
    self.cancelReport = function () { self.pendingReport(null); };
    self.pollJob = function (jobId, attempt) {
      if (disposed || pollingJobId !== jobId) { return; }
      api.request('/api/reports/' + encodeURIComponent(jobId), {}, token()).then(function (job) {
        if (disposed || pollingJobId !== jobId) { return; }
        self.activeJob(job); const terminal = ['COMPLETED', 'FAILED', 'EXPIRED'].indexOf(job.status) >= 0;
        if (terminal) { pollingJobId = ''; pollTimer = null; self.loadHistory(0); if (job.status === 'COMPLETED') { self.showMessage('confirmation', 'Report ready', job.generatedFile ? job.generatedFile.fileName : 'The report is ready to download.'); } return; }
        const delay = Math.min(1500 * Math.pow(1.7, attempt), 8000);
        pollTimer = setTimeout(function () { self.pollJob(jobId, attempt + 1); }, delay);
      }).catch(function (error) { pollingJobId = ''; pollTimer = null; self.showMessage('error', 'Report status could not be refreshed', error.message); });
    };
    self.confirmReport = function () {
      const pending = self.pendingReport(); if (!pending) { return; }
      self.busyAction('queue'); self.clearMessage();
      api.request('/api/reports/' + pending.endpoint, { method: 'POST', headers: { 'Idempotency-Key': pending.idempotencyKey }, body: JSON.stringify(pending.payload) }, token())
        .then(function (queued) {
          self.pendingReport(null); self.activeJob({ reportJobId: queued.reportJobId, reportType: pending.type, format: pending.payload.format,
            status: queued.status || 'QUEUED', failureReason: null, generatedFile: null, createdAt: null, startedAt: null, completedAt: null });
          if (pollTimer) { clearTimeout(pollTimer); } pollingJobId = queued.reportJobId; self.pollJob(queued.reportJobId, 0);
          self.showMessage('info', queued.idempotentReplay ? 'Existing report resumed' : 'Report queued', 'Generation is running in the background.');
        }).catch(function (error) { self.showMessage('error', 'Report could not be queued', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.trackJob = function (job) {
      if (pollTimer) { clearTimeout(pollTimer); } self.activeJob(job); pollingJobId = job.reportJobId; self.pollJob(job.reportJobId, 0);
    };
    self.openJob = function (job) {
      self.busyAction('detail-' + job.reportJobId);
      api.request('/api/reports/' + encodeURIComponent(job.reportJobId), {}, token()).then(function (detail) { self.selectedJob(detail); })
        .catch(function (error) { self.showMessage('error', 'Report detail could not be loaded', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.closeJob = function () { self.selectedJob(null); };
    self.downloadReport = function (job) {
      self.busyAction('download-' + job.reportJobId); self.downloadStatus('Downloading ' + self.reportLabel(job.reportType) + '…');
      return api.download('/api/reports/' + encodeURIComponent(job.reportJobId) + '/download', token()).then(function (file) {
        const generatedName = job.generatedFile && job.generatedFile.fileName;
        const downloadName = generatedName || file.fileName;
        const url = URL.createObjectURL(file.blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = downloadName;
        anchor.style.display = 'none'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 0);
        self.downloadStatus(downloadName + ' downloaded.');
      }).catch(function (error) { self.downloadStatus(''); self.showMessage('error', 'Report could not be downloaded', error.message); })
        .finally(function () { self.busyAction(''); });
    };
    self.disconnected = function () { disposed = true; pollingJobId = ''; if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; } };
    self.refresh();
  }
  return ReportsViewModel;
});
