define(['knockout', 'utils/api', 'utils/statementDownload', 'utils/uiLogic', 'ojs/ojchart', 'ojs/ojdialog'], function (ko, api, downloadStatementFile, uiLogic) {
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

  function loadTransactionHistory(token, pageNumber, collectedRows) {
    return api.request('/api/transactions?page=' + pageNumber + '&size=100', {}, token).then(function (response) {
      const transactionPage = api.unwrap(response) || {};
      const pageRows = Array.isArray(transactionPage.content) ? transactionPage.content : [];
      const rows = collectedRows.concat(pageRows);
      const totalPages = Number(transactionPage.totalPages || 0);
      if (pageNumber + 1 < totalPages) {
        return loadTransactionHistory(token, pageNumber + 1, rows);
      }
      return { content: rows, totalElements: transactionPage.totalElements == null ? rows.length : transactionPage.totalElements };
    });
  }

  function maskedCurrency(value) {
    const digits = String(value || '').replace(/[^0-9]/g, '');
    return '₹ ******' + (digits.slice(-3) || '0');
  }

  function isCustomerProfileComplete(profile) {
    if (!profile) { return false; }
    return [
      profile.fullName,
      profile.fatherOrSpouseName,
      profile.dateOfBirth,
      profile.addressLine1,
      profile.city,
      profile.state,
      profile.country,
      profile.postalCode
    ].every(function (value) { return Boolean(String(value || '').trim()); });
  }

  function DashboardViewModel(params) {
    const self = this;
    self.app = params.app;
    self.statementDownloadStatus = ko.observable('');
    self.dashboardLoading = ko.observable(true);
    self.dashboardError = ko.observable('');
    self.onboardingRequired = ko.observable(false);
    self.onboardingStep = ko.observable(1);
    self.onboardingCopy = ko.observable('Complete your personal and address details to continue.');
    self.onboardingDestination = ko.observable('profile');
    self.onboardingActionLabel = ko.observable('Continue account setup');
    self.dashboardNow = ko.observable(new Date());
    self.dashboardDate = ko.pureComputed(function () {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short'
      }).format(self.dashboardNow());
    });
    self.dashboardMonth = ko.pureComputed(function () {
      return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' }).format(self.dashboardNow());
    });
    self.greeting = ko.pureComputed(function () {
      return uiLogic.greetingFor(self.dashboardNow(), self.app.customerName());
    });
    const dashboardClockTimer = window.setInterval(function () {
      self.dashboardNow(new Date());
    }, 60000);
    self.totalBalance = ko.observable(self.app.formatCurrency(0));
    self.monthlyIncome = ko.observable(self.app.formatCurrency(0));
    self.monthlySpending = ko.observable(self.app.formatCurrency(0));
    self.revealedMetric = ko.observable('');
    self.totalBalanceDisplay = ko.pureComputed(function () { return self.revealedMetric() === 'balance' ? self.totalBalance() : uiLogic.maskedCurrency(self.totalBalance()); });
    self.monthlyIncomeDisplay = ko.pureComputed(function () { return self.revealedMetric() === 'income' ? self.monthlyIncome() : uiLogic.maskedCurrency(self.monthlyIncome()); });
    self.monthlySpendingDisplay = ko.pureComputed(function () { return self.revealedMetric() === 'spending' ? self.monthlySpending() : uiLogic.maskedCurrency(self.monthlySpending()); });
    self.revealTotalBalance = function () { self.revealedMetric('balance'); };
    self.revealMonthlyIncome = function () { self.revealedMetric('income'); };
    self.revealMonthlySpending = function () { self.revealedMetric('spending'); };
    self.hideRevealedMetric = function () { self.revealedMetric(''); };
    self.monthlySpendingShare = ko.observable('0% of monthly income');
    self.monthlySpendingShareWidth = ko.observable('0%');

    self.cashFlowGroups = ko.observableArray(['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']);
    self.cashFlowSeries = ko.observableArray([
      { name: 'Income', items: [82, 91, 86, 98, 96, 105], color: '#27666b', markerDisplayed: 'on' },
      { name: 'Spending', items: [52, 44, 58, 49, 61, 49], color: '#d87308', markerDisplayed: 'on' }
    ]);
    self.spendingGroups = ko.observableArray(['August']);
    self.spendingSeries = ko.observableArray([
      { name: 'Housing', items: [38], color: '#155183' },
      { name: 'Food', items: [26], color: '#2391c4' },
      { name: 'Bills', items: [21], color: '#d87308' },
      { name: 'Travel', items: [15], color: '#12805c' }
    ]);
    self.spendingDataLabel = function (context) {
      return context.value + '%';
    };

    self.accounts = ko.observableArray([]);
    self.needsOnboarding = ko.pureComputed(function () { return !self.dashboardLoading() && self.onboardingRequired(); });
    self.hasAccounts = ko.pureComputed(function () { return !self.dashboardLoading() && !self.onboardingRequired() && self.accounts().length > 0; });

    self.transactions = ko.observableArray([]);
    self.optionalSummariesLoading = ko.observable(true);
    self.optionalSummaries = ko.observableArray([
      { key: 'bills', icon: 'BP', label: 'Bill payments', value: '—', meta: 'Loading payment activity…', status: 'Loading', route: 'bill-payments', accent: 'dashboard-summary--bills', available: true },
      { key: 'schedules', icon: 'SC', label: 'Schedules', value: '—', meta: 'Loading scheduled payments…', status: 'Loading', route: 'scheduled-payments', accent: 'dashboard-summary--schedules', available: true },
      { key: 'reports', icon: 'RP', label: 'Reports', value: '—', meta: 'Loading report jobs…', status: 'Loading', route: 'reports', accent: 'dashboard-summary--reports', available: true },
      { key: 'loans', icon: 'LN', label: 'Loans', value: '—', meta: 'Loading loan portfolio…', status: 'Loading', route: 'loans', accent: 'dashboard-summary--loans', available: true },
      { key: 'cards', icon: 'CD', label: 'Cards', value: '—', meta: 'Loading card portfolio…', status: 'Loading', route: 'cards', accent: 'dashboard-summary--cards', available: true }
    ]);

    self.offers = ko.observableArray([
      { icon: '◇', tag: 'Pre-approved', eyebrow: 'Personal loan', title: 'Funds when plans cannot wait', copy: 'Borrow up to ₹8 lakh with a simple digital journey.', action: 'View your offer', route: 'loans', accentClass: 'offer-card--blue' },
      { icon: '▱', tag: 'Rewards', eyebrow: 'Northstar credit card', title: 'More value from everyday spending', copy: 'Earn 5× points on dining, travel and online purchases.', action: 'Explore cards', route: 'cards', accentClass: 'offer-card--gold' },
      { icon: '↗', tag: 'New', eyebrow: 'Smart deposits', title: 'Put your surplus balance to work', copy: 'Flexible deposits with attractive rates and easy access.', action: 'Start saving', route: 'accounts', accentClass: 'offer-card--green' }
    ]);

    self.go = function (route) { self.app.navigate(route); };
    self.openSummary = function (summary) { if (summary && summary.available !== false) { self.go(summary.route); } };
    self.summaryRows = function (response) {
      const payload = api.unwrap(response);
      if (Array.isArray(payload)) { return payload; }
      if (payload && Array.isArray(payload.items)) { return payload.items; }
      if (payload && Array.isArray(payload.content)) { return payload.content; }
      return [];
    };
    self.optionalFailure = function (key, icon, label, route, accent, error) {
      return { key: key, icon: icon, label: label, value: '—', meta: error && error.status ? 'Service returned HTTP ' + error.status : 'Temporarily unavailable', status: 'Unavailable', route: route, accent: accent + ' dashboard-summary--unavailable', available: false };
    };
    self.loadOptionalSummaries = function () {
      const token = self.app.authToken(); self.optionalSummariesLoading(true);
      const requests = [
        api.request('/api/bill-payments', {}, token).then(function (response) {
          const rows = self.summaryRows(response); const successful = rows.filter(function (row) { return row.status === 'SUCCESS'; }).length;
          return { key: 'bills', icon: 'BP', label: 'Bill payments', value: String(rows.length), meta: successful + ' completed successfully', status: rows.length ? 'Activity' : 'None yet', route: 'bill-payments', accent: 'dashboard-summary--bills', available: true };
        }).catch(function (error) { return self.optionalFailure('bills', 'BP', 'Bill payments', 'bill-payments', 'dashboard-summary--bills', error); }),
        api.request('/api/schedules', {}, token).then(function (response) {
          const rows = self.summaryRows(response); const active = rows.filter(function (row) { return row.status === 'ACTIVE'; }).length;
          return { key: 'schedules', icon: 'SC', label: 'Schedules', value: String(active), meta: rows.length + ' total · ' + active + ' active', status: active ? 'Upcoming' : 'No active', route: 'scheduled-payments', accent: 'dashboard-summary--schedules', available: true };
        }).catch(function (error) { return self.optionalFailure('schedules', 'SC', 'Schedules', 'scheduled-payments', 'dashboard-summary--schedules', error); }),
        api.request('/api/reports/history?page=0&size=20', {}, token).then(function (response) {
          const payload = api.unwrap(response) || {}; const rows = self.summaryRows(payload); const completed = rows.filter(function (row) { return row.status === 'COMPLETED'; }).length;
          return { key: 'reports', icon: 'RP', label: 'Reports', value: String(payload.totalElements == null ? rows.length : payload.totalElements), meta: completed + ' ready on this page', status: completed ? 'Ready' : 'No downloads', route: 'reports', accent: 'dashboard-summary--reports', available: true };
        }).catch(function (error) { return self.optionalFailure('reports', 'RP', 'Reports', 'reports', 'dashboard-summary--reports', error); }),
        api.request('/api/loans', {}, token).then(function (response) {
          const rows = self.summaryRows(response); const active = rows.filter(function (row) { return row.status === 'ACTIVE' || row.status === 'OVERDUE'; }).length;
          return { key: 'loans', icon: 'LN', label: 'Loans', value: String(active), meta: rows.length + ' loan accounts in portfolio', status: active ? 'Active' : 'No active', route: 'loans', accent: 'dashboard-summary--loans', available: true };
        }).catch(function (error) { return self.optionalFailure('loans', 'LN', 'Loans', 'loans', 'dashboard-summary--loans', error); }),
        api.request('/api/cards', {}, token).then(function (response) {
          const rows = self.summaryRows(response); const active = rows.filter(function (row) { return row.status === 'ACTIVE'; }).length; const blocked = rows.filter(function (row) { return row.status === 'BLOCKED'; }).length;
          return { key: 'cards', icon: 'CD', label: 'Cards', value: String(active), meta: rows.length + ' cards · ' + blocked + ' blocked', status: active ? 'Active' : 'No active', route: 'cards', accent: 'dashboard-summary--cards', available: true };
        }).catch(function (error) { return self.optionalFailure('cards', 'CD', 'Cards', 'cards', 'dashboard-summary--cards', error); })
      ];
      return Promise.all(requests).then(function (summaries) { self.optionalSummaries(summaries); }).then(function () { self.optionalSummariesLoading(false); });
    };
    self.startOnboarding = function () {
      const dialog = document.getElementById('dashboard-onboarding-dialog');
      if (dialog && dialog.isOpen && dialog.isOpen()) { dialog.close(); }
      self.app.navigate(self.onboardingDestination());
    };
    self.openOnboardingPrompt = function () {
      requestAnimationFrame(function () {
        const dialog = document.getElementById('dashboard-onboarding-dialog');
        if (dialog && dialog.open && (!dialog.isOpen || !dialog.isOpen())) { dialog.open(); }
      });
    };
    self.loadDashboardAccounts = function () {
      const token = self.app.authToken();
      Promise.all([
        api.request('/api/accounts', {}, token),
        loadTransactionHistory(token, 0, []).catch(function () { return { content: [] }; }),
        api.request('/api/customers/me', {}, token).catch(function () { return { data: null }; }),
        api.request('/api/customers/me/kyc', {}, token).catch(function () { return { data: null }; }),
        api.request('/api/customers/me/kyc/documents', {}, token).catch(function () { return { data: [] }; })
      ]).then(function (responses) {
        const accountRows = api.unwrap(responses[0]) || [];
        const transactionPage = api.unwrap(responses[1]) || {};
        const profile = api.unwrap(responses[2]);
        const kyc = api.unwrap(responses[3]);
        const kycDocuments = api.unwrap(responses[4]) || [];
        const accounts = Array.isArray(accountRows) ? accountRows : [];
        const transactionRows = Array.isArray(transactionPage.content) ? transactionPage.content : [];
        const profileComplete = isCustomerProfileComplete(profile);
        const identityComplete = Boolean(kyc);
        const uploadedDocumentTypes = Array.isArray(kycDocuments) ? kycDocuments.map(function (document) { return document.documentType; }) : [];
        const documentComplete = (uploadedDocumentTypes.indexOf('AADHAAR') >= 0 && uploadedDocumentTypes.indexOf('PAN') >= 0) || Boolean(kyc && kyc.status === 'VERIFIED');
        let requiresOnboarding = true;
        self.onboardingDestination('profile'); self.onboardingActionLabel('Continue account setup');
        if (!profileComplete) {
          self.onboardingStep(1); self.onboardingCopy('Add your personal information and complete address details.');
        } else if (!identityComplete) {
          self.onboardingStep(2); self.onboardingCopy('Your profile is saved. Add your Aadhaar and PAN details next.');
        } else if (!documentComplete) {
          self.onboardingStep(3); self.onboardingCopy('Your identity details are saved. Upload a KYC document to finish.');
        } else if (kyc.status !== 'VERIFIED') {
          self.onboardingStep(3); self.onboardingCopy('Your KYC was submitted and is waiting for bank approval.'); self.onboardingActionLabel('View KYC status');
        } else if (!accounts.length) {
          self.onboardingStep(3); self.onboardingCopy('Your profile and KYC are verified. Open your first bank account.'); self.onboardingDestination('accounts'); self.onboardingActionLabel('Open first account');
        } else {
          requiresOnboarding = false;
        }
        self.onboardingRequired(requiresOnboarding);
        const total = accounts.reduce(function (sum, account) { return sum + Number(account.availableBalance || 0); }, 0);
        const currentMonth = uiLogic.istMonthKey(self.dashboardNow());
        const monthlyTransactions = transactionRows.filter(function (transaction) {
          return String(transaction.status || '').toUpperCase() === 'SUCCESS' && uiLogic.istMonthKey(transaction.transactionDate) === currentMonth;
        });
        const incoming = monthlyTransactions.filter(function (transaction) { return transaction.debitCredit === 'CREDIT'; }).reduce(function (sum, transaction) { return sum + Number(transaction.amount || 0); }, 0);
        const outgoing = monthlyTransactions.filter(function (transaction) { return transaction.debitCredit === 'DEBIT'; }).reduce(function (sum, transaction) { return sum + Number(transaction.amount || 0); }, 0);
        const spendingPercentage = incoming > 0 ? Math.round((outgoing / incoming) * 100) : 0;
        self.totalBalance(self.app.formatCurrency(total));
        self.monthlyIncome(self.app.formatCurrency(accounts.length ? incoming : 0));
        self.monthlySpending(self.app.formatCurrency(accounts.length ? outgoing : 0));
        self.monthlySpendingShare(accounts.length ? spendingPercentage + '% of monthly income' : '0% of monthly income');
        self.monthlySpendingShareWidth(accounts.length ? Math.min(spendingPercentage, 100) + '%' : '0%');
        self.transactions(accounts.length ? transactionRows.slice(0, 5).map(function (transaction) {
          const positive = transaction.debitCredit === 'CREDIT';
          return {
            icon: String(transaction.transactionType || 'TX').slice(0, 2),
            name: transaction.description || transaction.transactionType || 'Banking transaction',
            meta: self.app.formatDate(new Date(transaction.transactionDate)),
            amount: (positive ? '+ ' : '− ') + self.app.formatCurrency(Number(transaction.amount || 0)),
            positive: positive
          };
        }) : []);
        self.accounts(accounts.map(function (account, index) {
          const number = String(account.accountNumber || '');
          return {
            icon: String(account.accountType || 'AC').slice(0, 2),
            iconClass: index % 2 ? 'account-icon--gold' : '',
            name: String(account.accountType || 'Account').replace(/_/g, ' ') + ' account',
            meta: '•• ' + number.slice(-4) + ' · ' + (account.status || 'Pending'),
            amount: self.app.formatCurrency(Number(account.availableBalance || 0))
          };
        }));
        if (requiresOnboarding) {
          self.totalBalance(self.app.formatCurrency(0));
          self.monthlyIncome(self.app.formatCurrency(0));
          self.monthlySpending(self.app.formatCurrency(0));
          self.monthlySpendingShare('0% of monthly income');
          self.monthlySpendingShareWidth('0%');
          self.transactions([]);
          self.openOnboardingPrompt();
        }
      }).catch(function (error) {
        self.dashboardError(error.message || 'Unable to load your account summary.');
        self.accounts([]);
        self.totalBalance(self.app.formatCurrency(0));
        self.monthlyIncome(self.app.formatCurrency(0));
        self.monthlySpending(self.app.formatCurrency(0));
        self.monthlySpendingShare('0% of monthly income');
        self.monthlySpendingShareWidth('0%');
        self.transactions([]);
      }).finally(function () { self.dashboardLoading(false); });
    };
    self.downloadStatement = function () {
      const fileName = downloadStatementFile();
      self.statementDownloadStatus(fileName + ' downloaded successfully.');
    };
    self.disconnected = function () {
      window.clearInterval(dashboardClockTimer);
    };
    self.loadDashboardAccounts();
    self.loadOptionalSummaries();
  }

  return DashboardViewModel;
});
