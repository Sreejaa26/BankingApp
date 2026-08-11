define([
  'knockout', 'utils/api', 'ojs/ojinputtext', 'ojs/ojdatetimepicker', 'ojs/ojmessages'
], function (ko, api) {
  'use strict';

  function AuditViewModel(params) {
    const self = this;
    const token = function () { return params.app.authToken(); };
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    self.loading = ko.observable(true);
    self.messages = ko.observableArray([]);
    self.items = ko.observableArray([]);
    self.page = ko.observable(0);
    self.totalPages = ko.observable(0);
    self.totalElements = ko.observable(0);
    self.mode = ko.observable('search');
    self.selectedItem = ko.observable(null);
    self.summary = ko.observable({ total: 0, byEventType: {}, byStatus: {}, bySeverity: {} });
    self.fromDate = ko.observable(weekAgo.toISOString().slice(0, 10));
    self.toDate = ko.observable(today.toISOString().slice(0, 10));
    self.actorUserId = ko.observable('');
    self.action = ko.observable('');
    self.sourceService = ko.observable('');
    self.entityType = ko.observable('');
    self.referenceId = ko.observable('');
    self.correlationId = ko.observable('');
    self.status = ko.observable('');
    self.severity = ko.observable('');

    function entries(value) {
      return Object.keys(value || {}).map(function (key) { return { label: key, count: value[key] }; })
        .sort(function (left, right) { return right.count - left.count; });
    }
    self.statusRows = ko.pureComputed(function () { return entries(self.summary().byStatus); });
    self.severityRows = ko.pureComputed(function () { return entries(self.summary().bySeverity); });
    self.eventRows = ko.pureComputed(function () { return entries(self.summary().byEventType).slice(0, 5); });
    self.modeLabel = ko.pureComputed(function () {
      if (self.mode() === 'timeline') { return 'Chronological timeline'; }
      if (self.mode() === 'user') { return 'Actor history'; }
      return 'Newest events';
    });
    self.activeFilterCount = ko.pureComputed(function () {
      return [self.actorUserId(), self.action(), self.sourceService(), self.entityType(), self.referenceId(), self.correlationId(), self.status(), self.severity()]
        .filter(function (value) { return String(value || '').trim(); }).length;
    });

    self.formatDate = function (value) {
      if (!value) { return '—'; }
      const normalized = String(value).replace(/(\.\d{3})\d+(Z|[+-])/, '$1$2');
      const parsed = new Date(normalized);
      return Number.isNaN(parsed.getTime()) ? String(value) : params.app.formatDate(parsed, { dateStyle: 'medium', timeStyle: 'short' });
    };
    self.eventInitials = function (row) { return String(row && row.action || row && row.eventType || 'AU').slice(0, 2).toUpperCase(); };
    self.severityClass = function (value) { return 'audit-severity audit-severity--' + String(value || 'info').toLowerCase(); };
    self.prettyMetadata = function (value) {
      if (!value) { return '{}'; }
      try { return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2); }
      catch (error) { return String(value); }
    };
    self.showMessage = function (severity, summary, detail) { self.messages([{ severity: severity, summary: summary, detail: detail || '' }]); };

    function instant(value, endOfDay) {
      if (!value) { return '' ; }
      return value + (endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z');
    }
    function addQuery(parts, name, value) {
      const clean = String(value || '').trim();
      if (clean) { parts.push(encodeURIComponent(name) + '=' + encodeURIComponent(clean)); }
    }
    function commonQuery(includeAllFilters) {
      const parts = [];
      addQuery(parts, 'from', instant(self.fromDate(), false));
      addQuery(parts, 'to', instant(self.toDate(), true));
      if (includeAllFilters) {
        addQuery(parts, 'actorUserId', self.actorUserId());
        addQuery(parts, 'action', self.action());
        addQuery(parts, 'sourceService', self.sourceService());
        addQuery(parts, 'entityType', self.entityType());
        addQuery(parts, 'referenceId', self.referenceId());
        addQuery(parts, 'correlationId', self.correlationId());
        addQuery(parts, 'status', self.status());
        addQuery(parts, 'severity', self.severity());
      }
      addQuery(parts, 'page', self.page());
      addQuery(parts, 'size', 25);
      return parts;
    }
    function eventsPath() {
      if (self.mode() === 'user') {
        return '/api/audit/users/' + encodeURIComponent(String(self.actorUserId()).trim()) + '?' + commonQuery(false).join('&');
      }
      return '/api/audit' + (self.mode() === 'timeline' ? '/timeline' : '') + '?' + commonQuery(true).join('&');
    }
    function loadEvents() {
      return api.request(eventsPath(), {}, token()).then(function (response) {
        const page = api.unwrap(response) || {};
        self.items(Array.isArray(page.items) ? page.items : []);
        self.totalPages(Number(page.totalPages || 0));
        self.totalElements(Number(page.totalElements || 0));
      });
    }
    function loadSummary() {
      const parts = [];
      addQuery(parts, 'from', instant(self.fromDate(), false));
      addQuery(parts, 'to', instant(self.toDate(), true));
      return api.request('/api/audit/summary?' + parts.join('&'), {}, token()).then(function (response) {
        self.summary(api.unwrap(response) || { total: 0, byEventType: {}, byStatus: {}, bySeverity: {} });
      });
    }
    function validateRange() {
      if (self.fromDate() && self.toDate() && self.fromDate() > self.toDate()) {
        self.showMessage('error', 'Invalid date range', 'The start date must be on or before the end date.');
        return false;
      }
      return true;
    }
    self.refresh = function () {
      if (!validateRange()) { return Promise.resolve(); }
      self.loading(true); self.messages([]);
      return Promise.all([loadEvents(), loadSummary()]).catch(function (error) {
        self.showMessage('error', 'Audit data could not be loaded', error.message);
      }).finally(function () { self.loading(false); });
    };
    self.search = function () { self.mode('search'); self.page(0); return self.refresh(); };
    self.openTimeline = function () { self.mode('timeline'); self.page(0); return self.refresh(); };
    self.openUserTimeline = function () {
      if (!String(self.actorUserId() || '').trim()) {
        self.showMessage('warning', 'Actor user ID required', 'Enter an actor user ID to load that user’s audit history.');
        return;
      }
      self.mode('user'); self.page(0); return self.refresh();
    };
    self.clearFilters = function () {
      [self.actorUserId, self.action, self.sourceService, self.entityType, self.referenceId, self.correlationId, self.status, self.severity]
        .forEach(function (field) { field(''); });
      self.mode('search'); self.page(0); return self.refresh();
    };
    self.previousPage = function () { if (self.page() > 0) { self.page(self.page() - 1); return self.refresh(); } };
    self.nextPage = function () { if (self.page() + 1 < self.totalPages()) { self.page(self.page() + 1); return self.refresh(); } };
    self.openDetail = function (row) {
      self.messages([]);
      return api.request('/api/audit/' + encodeURIComponent(row.auditId), {}, token()).then(function (response) {
        self.selectedItem(api.unwrap(response));
      }).catch(function (error) { self.showMessage('error', 'Audit event could not be opened', error.message); });
    };
    self.closeDetail = function () { self.selectedItem(null); };
    self.useActor = function (row) { self.actorUserId(row.actorUserId || ''); return self.openUserTimeline(); };

    self.refresh();
  }

  return AuditViewModel;
});
