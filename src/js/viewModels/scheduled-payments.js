define([
  'knockout', 'utils/api', 'ojs/ojarraydataprovider', 'ojs/ojconverter-number',
  'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojmessages'
], function (ko, api, ArrayDataProvider, NumberConverters) {
  'use strict';

  function unwrap(response) { return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response; }
  function asArray(value) {
    if (Array.isArray(value)) { return value; }
    if (value && Array.isArray(value.content)) { return value.content; }
    if (value && Array.isArray(value.items)) { return value.items; }
    return [];
  }
  function option(value, label) { return { value: value, label: label }; }
  function toLocalInput(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) { return ''; }
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
  function toInstant(value) {
    if (!value) { return null; }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  function ScheduledPaymentsViewModel(params) {
    const self = this;
    const token = function () { return params.app.authToken(); };
    const tomorrow = new Date(Date.now() + 86400000); tomorrow.setHours(9, 0, 0, 0);
    const nextYear = new Date(tomorrow); nextYear.setFullYear(nextYear.getFullYear() + 1);

    self.loading = ko.observable(true);
    self.busyAction = ko.observable('');
    self.messages = ko.observableArray([]);
    self.schedules = ko.observableArray([]);
    self.accounts = ko.observableArray([]);
    self.billers = ko.observableArray([]);
    self.executions = ko.observableArray([]);
    self.selectedSchedule = ko.observable(null);
    self.pendingCancellation = ko.observable(null);
    self.editorOpen = ko.observable(false);
    self.editorMode = ko.observable('create');
    self.editingScheduleId = ko.observable('');
    self.statusFilter = ko.observable('');
    self.scheduleType = ko.observable('MONTHLY');
    self.sourceAccountId = ko.observable('');
    self.customerBillerId = ko.observable('');
    self.amount = ko.observable(0);
    self.description = ko.observable('');
    self.timezone = ko.observable('Asia/Kolkata');
    self.startAt = ko.observable(toLocalInput(tomorrow));
    self.endAt = ko.observable(toLocalInput(nextYear));
    self.maxRetries = ko.observable(3);
    self.currency = new NumberConverters.IntlNumberConverter({ style: 'currency', currency: 'INR', currencyDisplay: 'symbol' });
    self.formatMoney = function (value) { return self.currency.format(Number(value || 0)); };
    self.formatDate = function (value) {
      if (!value) { return '—'; }
      const normalized = String(value).replace(/(\.\d{3})\d+(Z|[+-])/, '$1$2');
      const parsed = new Date(normalized);
      return Number.isNaN(parsed.getTime()) ? String(value) : params.app.formatDate(parsed, { dateStyle: 'medium', timeStyle: 'short' });
    };
    self.scheduleInitials = function (row) { return String(row && row.scheduleType || 'Schedule').slice(0, 2); };
    self.statusClass = function (status) { return 'schedule-status schedule-status--' + String(status || 'unknown').toLowerCase(); };
    self.scheduleTypeOptions = new ArrayDataProvider([
      option('ONE_TIME', 'One time'), option('DAILY', 'Daily'), option('WEEKLY', 'Weekly'), option('MONTHLY', 'Monthly')
    ], { keyAttributes: 'value' });
    self.statusOptions = new ArrayDataProvider([
      option('', 'All statuses'), option('ACTIVE', 'Active'), option('PAUSED', 'Paused'), option('COMPLETED', 'Completed'),
      option('FAILED', 'Failed'), option('CANCELLED', 'Cancelled')
    ], { keyAttributes: 'value' });
    self.timezoneOptions = new ArrayDataProvider([
      option('Asia/Kolkata', 'India · Asia/Kolkata'), option('UTC', 'UTC'), option('Asia/Dubai', 'Dubai · Asia/Dubai'),
      option('Europe/London', 'London · Europe/London'), option('America/New_York', 'New York · America/New_York')
    ], { keyAttributes: 'value' });
    self.accountOptions = ko.pureComputed(function () {
      return new ArrayDataProvider(self.accounts().filter(function (row) { return row.status === 'ACTIVE'; }).map(function (row) {
        return option(row.accountId, String(row.accountType || 'Account').replace(/_/g, ' ') + ' · •••• ' + String(row.accountNumber || '').slice(-4) + ' · ' + self.formatMoney(row.availableBalance));
      }), { keyAttributes: 'value' });
    });
    self.billerOptions = ko.pureComputed(function () {
      return new ArrayDataProvider(self.billers().filter(function (row) { return row.status === 'ACTIVE'; }).map(function (row) {
        return option(row.customerBillerId, (row.nickname || row.biller.billerName) + ' · ' + row.consumerReference);
      }), { keyAttributes: 'value' });
    });
    self.activeCount = ko.pureComputed(function () { return self.schedules().filter(function (row) { return row.status === 'ACTIVE'; }).length; });
    self.pausedCount = ko.pureComputed(function () { return self.schedules().filter(function (row) { return row.status === 'PAUSED'; }).length; });
    self.nextSchedule = ko.pureComputed(function () {
      const rows = self.schedules().filter(function (row) { return row.status === 'ACTIVE' && row.nextExecutionAt; });
      rows.sort(function (a, b) { return new Date(a.nextExecutionAt) - new Date(b.nextExecutionAt); });
      return rows.length ? self.formatDate(rows[0].nextExecutionAt) : 'No upcoming payment';
    });

    self.showMessage = function (severity, summary, detail) { self.messages([{ severity: severity, summary: summary, detail: detail || '' }]); };
    self.clearMessage = function () { self.messages([]); };
    self.loadAccounts = function () {
      return api.request('/api/accounts', {}, token()).then(function (response) {
        const rows = asArray(unwrap(response)); self.accounts(rows);
        const active = rows.filter(function (row) { return row.status === 'ACTIVE'; });
        const valid = active.some(function (row) { return row.accountId === self.sourceAccountId(); });
        if (!valid) { self.sourceAccountId(active.length ? active[0].accountId : ''); }
      });
    };
    self.loadBillers = function () {
      return api.request('/api/billers', {}, token()).then(function (response) {
        const rows = asArray(unwrap(response)); self.billers(rows);
        const active = rows.filter(function (row) { return row.status === 'ACTIVE'; });
        const valid = active.some(function (row) { return row.customerBillerId === self.customerBillerId(); });
        if (!valid) { self.customerBillerId(active.length ? active[0].customerBillerId : ''); }
      });
    };
    self.loadSchedules = function () {
      const path = '/api/schedules' + (self.statusFilter() ? '?status=' + encodeURIComponent(self.statusFilter()) : '');
      return api.request(path, {}, token()).then(function (response) { self.schedules(asArray(unwrap(response))); });
    };
    self.refresh = function () {
      self.loading(true); self.clearMessage();
      return Promise.all([self.loadAccounts(), self.loadBillers(), self.loadSchedules()])
        .catch(function (error) { self.showMessage('error', 'Scheduled Payments could not be loaded', error.message); })
        .finally(function () { self.loading(false); });
    };
    self.applyStatusFilter = function () { self.loadSchedules().catch(function (error) { self.showMessage('error', 'Schedules could not be filtered', error.message); }); };

    self.resetEditor = function () {
      const start = new Date(Date.now() + 86400000); start.setHours(9, 0, 0, 0);
      const end = new Date(start); end.setFullYear(end.getFullYear() + 1);
      self.editorMode('create'); self.editingScheduleId(''); self.scheduleType('MONTHLY'); self.amount(0); self.description('');
      self.timezone('Asia/Kolkata'); self.startAt(toLocalInput(start)); self.endAt(toLocalInput(end)); self.maxRetries(3);
    };
    self.openCreate = function () { self.resetEditor(); self.editorOpen(true); self.clearMessage(); };
    self.closeEditor = function () { self.editorOpen(false); };
    self.payload = function () {
      return { scheduleType: self.scheduleType(), sourceAccountId: self.sourceAccountId(), customerBillerId: self.customerBillerId(),
        amount: Number(self.amount()), description: self.description().trim(), timezone: self.timezone(),
        startAt: toInstant(self.startAt()), endAt: self.endAt() ? toInstant(self.endAt()) : null, maxRetries: Number(self.maxRetries()) };
    };
    self.validatePayload = function (payload) {
      if (!payload.sourceAccountId || !payload.customerBillerId || !payload.scheduleType || !payload.timezone || !payload.startAt || !Number.isFinite(payload.amount) || payload.amount <= 0) {
        return 'Choose an active account and biller, then enter a positive amount and valid start date.';
      }
      if (payload.endAt && new Date(payload.endAt) <= new Date(payload.startAt)) { return 'The end date must be after the first payment date.'; }
      if (!Number.isInteger(payload.maxRetries) || payload.maxRetries < 0 || payload.maxRetries > 10) { return 'Maximum retries must be a whole number from 0 to 10.'; }
      return '';
    };
    self.saveSchedule = function () {
      const payload = self.payload(); const validation = self.validatePayload(payload);
      if (validation) { self.showMessage('error', 'Check the schedule details', validation); return false; }
      const editing = self.editorMode() === 'edit';
      const path = editing ? '/api/schedules/' + encodeURIComponent(self.editingScheduleId()) : '/api/schedules';
      self.busyAction('save'); self.clearMessage();
      api.request(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }, token()).then(function () {
        self.editorOpen(false); self.showMessage('confirmation', editing ? 'Schedule updated' : 'Schedule created', editing ? 'The next execution has been recalculated.' : 'Your bill payment schedule is active.');
        return self.loadSchedules();
      }).catch(function (error) { self.showMessage('error', 'Schedule could not be saved', error.message); }).finally(function () { self.busyAction(''); });
      return false;
    };
    self.editSchedule = function (row) {
      self.busyAction('detail-' + row.scheduleId); self.clearMessage();
      api.request('/api/schedules/' + encodeURIComponent(row.scheduleId), {}, token()).then(function (response) {
        const detail = unwrap(response) || row;
        self.editorMode('edit'); self.editingScheduleId(detail.scheduleId); self.scheduleType(detail.scheduleType);
        self.sourceAccountId(detail.sourceAccountId); self.customerBillerId(detail.customerBillerId); self.amount(Number(detail.amount));
        self.description(detail.description || ''); self.timezone(detail.timezone || 'Asia/Kolkata');
        self.startAt(toLocalInput(detail.startAt)); self.endAt(detail.endAt ? toLocalInput(detail.endAt) : ''); self.maxRetries(Number(detail.maxRetries == null ? 3 : detail.maxRetries));
        self.editorOpen(true);
      }).catch(function (error) { self.showMessage('error', 'Schedule detail could not be loaded', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.openSchedule = function (row) {
      self.busyAction('detail-' + row.scheduleId); self.clearMessage();
      Promise.all([
        api.request('/api/schedules/' + encodeURIComponent(row.scheduleId), {}, token()),
        api.request('/api/schedules/' + encodeURIComponent(row.scheduleId) + '/executions', {}, token())
      ]).then(function (responses) {
        self.selectedSchedule(unwrap(responses[0]) || row); self.executions(asArray(unwrap(responses[1])));
      }).catch(function (error) { self.showMessage('error', 'Schedule activity could not be loaded', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.closeSchedule = function () { self.selectedSchedule(null); self.executions([]); };
    self.changeStatus = function (row, action) {
      self.busyAction(action + '-' + row.scheduleId); self.clearMessage();
      api.request('/api/schedules/' + encodeURIComponent(row.scheduleId) + '/' + action, { method: 'POST' }, token()).then(function () {
        self.showMessage('confirmation', action === 'pause' ? 'Schedule paused' : 'Schedule resumed', action === 'pause' ? 'No payment will run until you resume it.' : 'The next execution has been scheduled.');
        return self.loadSchedules();
      }).catch(function (error) { self.showMessage('error', 'Schedule status could not be changed', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.pauseSchedule = function (row) { self.changeStatus(row, 'pause'); };
    self.resumeSchedule = function (row) { self.changeStatus(row, 'resume'); };
    self.requestCancellation = function (row) { self.pendingCancellation(row); self.clearMessage(); };
    self.cancelCancellation = function () { self.pendingCancellation(null); };
    self.confirmCancellation = function () {
      const row = self.pendingCancellation(); if (!row) { return; }
      self.busyAction('cancel-' + row.scheduleId);
      api.request('/api/schedules/' + encodeURIComponent(row.scheduleId), { method: 'DELETE' }, token()).then(function () {
        self.pendingCancellation(null); self.showMessage('confirmation', 'Schedule cancelled', 'No further executions will be created.'); return self.loadSchedules();
      }).catch(function (error) { self.showMessage('error', 'Schedule could not be cancelled', error.message); }).finally(function () { self.busyAction(''); });
    };
    self.refresh();
  }
  return ScheduledPaymentsViewModel;
});
