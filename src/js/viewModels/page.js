define([
  'knockout',
  'utils/statementDownload',
  'ojs/ojarraydataprovider',
  'ojs/ojpagingdataproviderview',
  'ojs/ojvalidator-regexp',
  'ojs/ojconverter-number',
  'ojs/ojconverter-datetime',
  'ojs/ojinputnumber',
  'ojs/ojinputtext',
  'ojs/ojselectsingle',
  'ojs/ojtable',
  'ojs/ojpagingcontrol',
  'ojs/ojdialog',
  'ojs/ojmessages',
  'ojs/ojvalidationgroup'
], function (ko, downloadStatementFile, ArrayDataProvider, PagingDataProviderView, RegExpValidator, NumberConverters, DateTimeConverters) {
  'use strict';

  const pages = {
    accounts: {
      eyebrow: 'Your money', title: 'Accounts', description: 'Review balances, account details, statements, and interest earned.', action: 'Open an account', endpoint: 'GET /api/accounts',
      highlights: [['Total balance', '₹4,82,650'], ['Available now', '₹4,36,650'], ['Active accounts', '3']],
      primaryEyebrow: 'Portfolio', primaryTitle: 'Your accounts', secondaryEyebrow: 'Monthly snapshot', secondaryTitle: 'Balance distribution', secondaryCopy: 'Your savings account holds most of your available balance.',
      items: [['SA','Savings account','•••• 4821 · Primary','₹3,24,850','Active'],['CA','Current account','•••• 7634 · Business','₹1,11,800','Active'],['FD','Fixed deposit','Matures 18 Mar 2027','₹46,000','6.8% p.a.']],
      secondary: [['01','Savings','67% of portfolio','₹3.25L','',67],['02','Current','23% of portfolio','₹1.12L','',23],['03','Deposits','10% of portfolio','₹46K','',10]]
    },
    transactions: {
      eyebrow: 'Activity', title: 'Transactions', description: 'Search, filter, categorize, and export your complete transaction history.', action: 'Download statement', endpoint: 'GET /api/transactions',
      highlights: [['This month','₹48,730'],['Incoming','₹1,04,500'],['Transactions','28']],
      primaryEyebrow: 'Latest activity', primaryTitle: 'Recent transactions', secondaryEyebrow: 'Spending overview', secondaryTitle: 'Top categories', secondaryCopy: 'Essentials and monthly bills account for most of this month’s spend.',
      items: [['UP','UPI · Fresh Basket','Today, 10:42 AM','−₹1,840','Completed'],['IN','Salary credit','28 Jul, 9:05 AM','+₹82,500','Received',null,true],['EB','Electricity bill','27 Jul, 6:30 PM','−₹3,260','Auto-paid'],['TR','Transfer to Ananya','26 Jul, 2:14 PM','−₹12,000','Completed']],
      secondary: [['01','Bills & utilities','8 payments','₹18,400','',72],['02','Shopping','11 payments','₹14,260','',56],['03','Food & dining','9 payments','₹9,870','',39]]
    },
    beneficiaries: {
      eyebrow: 'Payments', title: 'Beneficiaries', description: 'Manage trusted people and businesses you send money to.', action: 'Add beneficiary', endpoint: 'GET /api/beneficiaries',
      highlights: [['Active','12'],['Recently paid','4'],['Pending approval','1']],
      primaryEyebrow: 'Trusted contacts', primaryTitle: 'Recently paid', secondaryEyebrow: 'Beneficiary status', secondaryTitle: 'Your payment network', secondaryCopy: 'All recently used beneficiaries have completed bank verification.',
      items: [['AS','Ananya Sharma','HDFC Bank · •••• 2046','₹12,000','Paid 26 Jul'],['RM','Rohan Mehta','ICICI Bank · •••• 9183','₹8,500','Paid 19 Jul'],['SP','Sreeja Pamu','Northstar Bank · •••• 5502','₹25,000','Paid 12 Jul']],
      secondary: [['✓','Verified','Ready for instant payment','11','',92],['⌛','Pending approval','Available after cooling period','1','',8]]
    },
    transfer: {
      eyebrow: 'Move money', title: 'Transfer Money', description: 'Make secure transfers between your accounts or to a beneficiary.', action: 'New transfer', endpoint: 'POST /api/transactions/transfer',
      highlights: [['Daily limit','₹5,00,000'],['Available today','₹5,00,000'],['Scheduled','2']],
      primaryEyebrow: 'Quick transfer', primaryTitle: 'Start a secure payment', secondaryEyebrow: 'Upcoming', secondaryTitle: 'Scheduled transfers', secondaryCopy: 'Review scheduled payments before they are processed.',
      items: [['1','Choose an account','Savings account · ₹3,24,850 available','From','Selected'],['2','Select beneficiary','Choose from 12 verified contacts','To','Required'],['3','Enter transfer details','Amount, purpose and payment date','₹0','Next step']],
      secondary: [['AS','Ananya Sharma','02 Aug · Monthly rent','₹22,000','Scheduled'],['MF','Mutual Fund SIP','05 Aug · Auto transfer','₹10,000','Scheduled']]
    },
    loans: {
      eyebrow: 'Borrowing', title: 'Loans', description: 'Track repayments, view loan details, and explore eligible offers.', action: 'Apply for a new loan', endpoint: 'GET /api/loans',
      heroImage: 'styles/images/northstar-loan-planning.png', heroAlt: 'Couple reviewing their financing options together on a laptop',
      highlights: [['Outstanding','₹8,42,000'],['Next EMI','₹24,600'],['Due date','05 Aug']],
      primaryEyebrow: 'Repayment overview', primaryTitle: 'Active loans', secondaryEyebrow: 'Next payment', secondaryTitle: 'Upcoming EMI', secondaryCopy: 'Your next instalment is scheduled for automatic payment from Savings •••• 4821.',
      items: [['HL','Home loan','Loan •••• 8401 · 7.9% p.a.','₹7,64,000','62% repaid',62],['PL','Personal loan','Loan •••• 1178 · 10.4% p.a.','₹78,000','74% repaid',74]],
      secondary: [['05','Home loan EMI','Due 05 Aug 2026','₹18,400','Auto-pay on'],['08','Personal loan EMI','Due 08 Aug 2026','₹6,200','Auto-pay on']]
    },
    cards: {
      eyebrow: 'Card controls', title: 'Cards', description: 'Manage limits, freeze cards, update usage controls, and view card activity.', action: 'Manage cards', endpoint: 'GET /api/cards',
      heroImage: 'styles/images/northstar-premium-cards.png', heroAlt: 'Two premium Northstar-style payment cards',
      highlights: [['Available credit','₹1,76,400'],['Current spend','₹23,600'],['Active cards','2']],
      primaryEyebrow: 'Wallet', primaryTitle: 'Your cards', secondaryEyebrow: 'Credit usage', secondaryTitle: 'Limit overview', secondaryCopy: 'You have used 12% of your total credit limit this billing cycle.',
      items: [['VI','Northstar Signature','Visa · •••• 4902','₹1,76,400','Available'],['MC','Northstar Debit','Mastercard · •••• 8214','₹3,24,850','Active']],
      secondary: [['₹','Current spend','Statement closes 12 Aug','₹23,600','',12],['L','Total limit','Across active credit cards','₹2,00,000','',100]]
    },
    notifications: {
      eyebrow: 'Stay informed', title: 'Notifications', description: 'Review security alerts, transaction updates, and account messages.', action: 'Notification settings', endpoint: 'GET /api/notifications',
      highlights: [['Unread','3'],['Security alerts','0'],['This week','9']],
      primaryEyebrow: 'Inbox', primaryTitle: 'Recent notifications', secondaryEyebrow: 'Preferences', secondaryTitle: 'Alert summary', secondaryCopy: 'Critical security and transaction alerts are enabled on all registered channels.',
      items: [['₹','Salary received','₹82,500 credited to Savings •••• 4821','28 Jul','New',null,true],['UP','UPI payment successful','₹1,840 paid to Fresh Basket','Today','New'],['EM','EMI reminder','Home loan EMI is due on 05 Aug','27 Jul','New'],['✓','Profile verification complete','Your annual KYC review was approved','24 Jul','Read']],
      secondary: [['01','Transaction alerts','Email, SMS and push','On','',100],['02','Security alerts','SMS and push','On','',100],['03','Product updates','Email only','On','',100]]
    },
    admin: {
      eyebrow: 'Operations', title: 'Admin Dashboard', description: 'Monitor customer activity, approvals, service health, and operational risk.', action: 'Review approvals', endpoint: 'GET /api/admin/overview',
      highlights: [['Active customers','18,420'],['Pending reviews','24'],['Service health','99.99%']],
      primaryEyebrow: 'Operations queue', primaryTitle: 'Items requiring attention', secondaryEyebrow: 'Platform overview', secondaryTitle: 'Service status', secondaryCopy: 'Core banking services are operating within their normal thresholds.',
      items: [['KY','KYC reviews','12 applications awaiting verification','12','High priority'],['TR','Transfer reviews','7 payments flagged for review','7','Review'],['AC','Account approvals','5 new customer applications','5','Pending']],
      secondary: [['API','Banking API','42 ms average response','99.99%','Operational',100],['UPI','Payments network','68 ms average response','99.98%','Operational',100],['ID','Identity service','51 ms average response','99.99%','Operational',100]]
    }
  };

  function normalizeItem(item) {
    return { icon: item[0], name: item[1], meta: item[2], value: item[3], status: item[4] || '', progress: item[5], positive: Boolean(item[6]) };
  }

  function PageViewModel(params) {
    const self = this;
    const data = pages[params.route] || pages.accounts;
    const translatePage = function (key, fallback) {
      return params.app && params.app.t ? params.app.t('page.' + params.route + '.' + key, fallback) : fallback;
    };
    Object.keys(data).forEach(function (key) { this[key] = data[key]; }, this);
    this.eyebrow = translatePage('eyebrow', data.eyebrow);
    this.title = translatePage('title', data.title);
    this.description = translatePage('description', data.description);
    this.action = translatePage('action', data.action);
    this.heroImage = data.heroImage || '';
    this.heroAlt = data.heroAlt || '';
    this.highlights = ko.observableArray(data.highlights.map(function (item, index) {
      return { label: translatePage('highlight' + index, item[0]), value: item[1] };
    }));
    this.items = ko.observableArray(data.items.map(normalizeItem));
    this.secondaryItems = ko.observableArray(data.secondary.map(normalizeItem));
    this.pageRouteClass = 'page-route--' + params.route;
    this.isAccounts = params.route === 'accounts';
    this.isLoans = params.route === 'loans';
    this.isTransactions = params.route === 'transactions';
    this.isBeneficiaries = params.route === 'beneficiaries';
    this.isTransfer = params.route === 'transfer';
    this.isCards = params.route === 'cards';
    this.isNotifications = params.route === 'notifications';
    this.isAdmin = params.route === 'admin';
    this.statementDownloadStatus = ko.observable('');
    this.actionPanelOpen = ko.observable(false);
    this.actionError = ko.observable('');
    this.actionSuccess = ko.observable('');
    this.actionMessages = ko.observableArray([]);
    this.pendingTransferDestination = ko.observable('');
    this.pendingTransferAmount = ko.observable(0);
    this.actionPanelTitle = this.isAccounts ? 'Open a new account' : this.isBeneficiaries ? 'Add a beneficiary' : this.isTransfer ? 'Make a new transfer' : this.isCards ? 'Card centre' : this.isNotifications ? 'Notification settings' : 'Review approvals';

    this.newAccountType = ko.observable('Savings account');
    this.initialDeposit = ko.observable(10000);
    this.beneficiaryName = ko.observable('');
    this.beneficiaryAccount = ko.observable('');
    this.beneficiaryIfsc = ko.observable('');
    this.beneficiaryNickname = ko.observable('');
    this.transferFrom = ko.observable('Savings •••• 4821');
    this.transferDestinationType = ko.observable('Saved beneficiary');
    this.transferBeneficiary = ko.observable('Ananya Sharma');
    this.transferRecipientName = ko.observable('');
    this.transferRecipientAccount = ko.observable('');
    this.transferRecipientAccountConfirm = ko.observable('');
    this.transferRecipientIfsc = ko.observable('');
    this.transferAmount = ko.observable(10000);
    this.transferPurpose = ko.observable('Personal transfer');
    this.cardLocked = ko.observable(false);
    this.cardOnlineEnabled = ko.observable(true);
    this.cardInternationalEnabled = ko.observable(false);
    this.cardLimit = ko.observable(200000);
    this.cardApplicationType = ko.observable('Credit card');
    this.cardProduct = ko.observable('Northstar Signature');
    this.cardApplicantIncome = ko.observable(85000);
    this.cardDeliveryAddress = ko.observable('');
    this.cardApplicationSubmitted = ko.observable(false);
    this.cardApplicationReference = ko.observable('NSC-24080291');
    this.cardApplicationStatus = ko.observable('Under review');
    this.accountNumberValidators = [new RegExpValidator({ pattern: '^\\d{8,18}$', messageSummary: 'Enter a valid account number', messageDetail: 'Use 8 to 18 digits.' })];
    this.ifscValidators = [new RegExpValidator({ pattern: '^[A-Za-z]{4}0[A-Za-z0-9]{6}$', messageSummary: 'Enter a valid IFSC code', messageDetail: 'Example: HDFC0001234.' })];
    this.currencyConverter = new NumberConverters.IntlNumberConverter({ style: 'currency', currency: 'INR', currencyDisplay: 'symbol' });
    this.transactionDateConverter = new DateTimeConverters.IntlDateTimeConverter({ dateStyle: 'medium' });

    this.accountTypeOptions = new ArrayDataProvider([
      { value: 'Savings account', label: 'Savings account' },
      { value: 'Current account', label: 'Current account' },
      { value: 'Salary account', label: 'Salary account' },
      { value: 'Fixed deposit', label: 'Fixed deposit' }
    ], { keyAttributes: 'value' });
    this.transferAccountOptions = new ArrayDataProvider([
      { value: 'Savings •••• 4821', label: 'Savings •••• 4821 - ₹3,24,850' },
      { value: 'Current •••• 7634', label: 'Current •••• 7634 - ₹1,11,800' }
    ], { keyAttributes: 'value' });
    this.transferDestinationOptions = new ArrayDataProvider([
      { value: 'Saved beneficiary', label: 'Saved beneficiary' },
      { value: 'Other bank account', label: 'Other bank account' }
    ], { keyAttributes: 'value' });
    this.transferBeneficiaryOptions = new ArrayDataProvider([
      { value: 'Ananya Sharma', label: 'Ananya Sharma' },
      { value: 'Rohan Mehta', label: 'Rohan Mehta' },
      { value: 'Sreeja Pamu', label: 'Sreeja Pamu' }
    ], { keyAttributes: 'value' });
    this.transactionTableData = new ArrayDataProvider((pages.transactions.items || []).map(function (item, index) {
      const dates = [new Date(2026, 7, 4, 10, 42), new Date(2026, 6, 28, 9, 5), new Date(2026, 6, 27, 18, 30), new Date(2026, 6, 26, 14, 14)];
      return { id: index + 1, type: item[0], description: item[1], date: self.transactionDateConverter.format(dates[index] || new Date()), amount: item[3], status: item[4] };
    }), { keyAttributes: 'id' });
    this.pagingTransactions = new PagingDataProviderView(this.transactionTableData);
    this.transactionColumns = [
      { headerText: 'Type', field: 'type', width: '70px' },
      { headerText: 'Description', field: 'description' },
      { headerText: 'Date', field: 'date' },
      { headerText: 'Amount', field: 'amount' },
      { headerText: 'Status', field: 'status' }
    ];
    this.isOtherAccountTransfer = ko.pureComputed(function () {
      return self.transferDestinationType() === 'Other bank account';
    });
    this.cardTypeOptions = new ArrayDataProvider([
      { value: 'Credit card', label: 'Credit card' },
      { value: 'Debit card', label: 'Debit card' }
    ], { keyAttributes: 'value' });
    this.cardProductOptions = new ArrayDataProvider([
      { value: 'Northstar Signature', label: 'Northstar Signature - rewards' },
      { value: 'Northstar Everyday', label: 'Northstar Everyday - no annual fee' },
      { value: 'Northstar Travel', label: 'Northstar Travel - lounge benefits' }
    ], { keyAttributes: 'value' });
    this.loanApplicationOpen = ko.observable(false);
    this.loanApplicationSubmitted = ko.observable(false);
    this.loanError = ko.observable('');
    this.loanType = ko.observable('Personal loan');
    this.loanAmount = ko.observable(500000);
    this.loanTenure = ko.observable('36');
    this.loanPurpose = ko.observable('Personal expenses');
    this.employmentType = ko.observable('Salaried');
    this.monthlyIncome = ko.observable(85000);
    this.applicationReference = ko.observable('');

    this.loanProducts = ko.observableArray([
      { icon: 'PL', type: 'Personal loan', rate: 10.4, limit: 'Up to ₹20 lakh', copy: 'Flexible funds for planned or unexpected personal expenses.', accent: 'loan-product--blue' },
      { icon: 'HL', type: 'Home loan', rate: 7.9, limit: 'Up to ₹1.5 crore', copy: 'Competitive rates and longer tenures for your next home.', accent: 'loan-product--green' },
      { icon: 'VL', type: 'Vehicle loan', rate: 9.2, limit: 'Up to ₹50 lakh', copy: 'Finance a new or used vehicle with predictable repayments.', accent: 'loan-product--gold' },
      { icon: 'EL', type: 'Education loan', rate: 8.6, limit: 'Up to ₹75 lakh', copy: 'Support tuition, living costs and study expenses in India or abroad.', accent: 'loan-product--violet' },
      { icon: 'GL', type: 'Gold loan', rate: 8.9, limit: 'Up to ₹25 lakh', copy: 'Unlock funds against eligible gold with flexible repayment choices.', accent: 'loan-product--amber' },
      { icon: 'CL', type: 'Custom loan', rate: 9.5, limit: 'Flexible amount', copy: 'Create a borrowing plan around a purpose, amount and tenure that suits you.', accent: 'loan-product--custom' }
    ]);

    this.loanTenureOptions = new ArrayDataProvider([
      { value: '12', label: '12 months' },
      { value: '24', label: '24 months' },
      { value: '36', label: '36 months' },
      { value: '48', label: '48 months' },
      { value: '60', label: '60 months' }
    ], { keyAttributes: 'value' });
    this.loanPurposeOptions = new ArrayDataProvider([
      { value: 'Personal expenses', label: 'Personal expenses' },
      { value: 'Home purchase', label: 'Home purchase' },
      { value: 'Vehicle purchase', label: 'Vehicle purchase' },
      { value: 'Education', label: 'Education' },
      { value: 'Medical expenses', label: 'Medical expenses' }
    ], { keyAttributes: 'value' });
    this.employmentOptions = new ArrayDataProvider([
      { value: 'Salaried', label: 'Salaried' },
      { value: 'Self-employed', label: 'Self-employed' },
      { value: 'Business owner', label: 'Business owner' }
    ], { keyAttributes: 'value' });

    this.selectedLoanRate = ko.pureComputed(function () {
      const product = self.loanProducts().find(function (item) { return item.type === self.loanType(); });
      return product ? product.rate : 10.4;
    });
    this.estimatedEmi = ko.pureComputed(function () {
      const principal = Number(self.loanAmount()) || 0;
      const months = Number(self.loanTenure()) || 1;
      const monthlyRate = self.selectedLoanRate() / 1200;
      if (!principal || !monthlyRate) { return 0; }
      const factor = Math.pow(1 + monthlyRate, months);
      return Math.round(principal * monthlyRate * factor / (factor - 1));
    });
    this.formattedEmi = ko.pureComputed(function () {
      return '₹' + self.estimatedEmi().toLocaleString('en-IN');
    });
    this.totalInterest = ko.pureComputed(function () {
      const total = self.estimatedEmi() * (Number(self.loanTenure()) || 0) - (Number(self.loanAmount()) || 0);
      return '₹' + Math.max(0, total).toLocaleString('en-IN');
    });

    this.openLoanApplication = function () {
      self.loanError('');
      self.loanApplicationSubmitted(false);
      self.loanApplicationOpen(true);
      requestAnimationFrame(function () {
        const panel = document.getElementById('loan-application');
        if (panel) { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    };
    this.chooseLoanProduct = function (product) {
      self.loanType(product.type);
      const purposeByProduct = {
        'Home loan': 'Home purchase',
        'Vehicle loan': 'Vehicle purchase',
        'Education loan': 'Education',
        'Gold loan': 'Personal expenses',
        'Custom loan': 'Personal expenses'
      };
      self.loanPurpose(purposeByProduct[product.type] || 'Personal expenses');
      self.openLoanApplication();
    };
    this.scrollLoanProducts = function (direction, data, event) {
      const marketplace = event.currentTarget.closest('.loan-marketplace');
      const productRail = marketplace ? marketplace.querySelector('.loan-product-grid') : null;
      if (productRail) {
        productRail.scrollBy({ left: direction * 350, behavior: 'smooth' });
      }
    };
    this.closeLoanApplication = function () {
      self.loanApplicationOpen(false);
      self.loanError('');
    };
    this.submitLoanApplication = function () {
      const amount = Number(self.loanAmount());
      const income = Number(self.monthlyIncome());
      if (!amount || amount < 50000) {
        self.loanError('Enter a loan amount of at least ₹50,000.');
        return false;
      }
      if (!income || income < 15000) {
        self.loanError('Enter a valid monthly income of at least ₹15,000.');
        return false;
      }
      if (self.estimatedEmi() > income * 0.5) {
        self.loanError('Choose a lower amount or longer tenure so the estimated EMI stays within 50% of monthly income.');
        return false;
      }
      self.loanError('');
      self.applicationReference('NSL-' + Date.now().toString().slice(-8));
      self.loanApplicationSubmitted(true);
      return false;
    };
    this.startAnotherApplication = function () {
      self.loanApplicationSubmitted(false);
      self.applicationReference('');
      self.loanError('');
    };
    this.downloadStatement = function () {
      const fileName = downloadStatementFile();
      self.statementDownloadStatus(fileName + ' downloaded successfully.');
    };
    this.openPageAction = function () {
      self.actionError('');
      self.actionSuccess('');
      self.actionPanelOpen(true);
      requestAnimationFrame(function () {
        const panel = document.getElementById('page-action-panel');
        if (panel) { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    };
    this.closePageAction = function () {
      self.actionPanelOpen(false);
      self.actionError('');
      self.actionSuccess('');
      self.actionMessages([]);
    };
    this.showActionMessage = function (severity, summary, detail) {
      self.actionMessages([{ severity: severity, summary: summary, detail: detail }]);
    };
    this.submitNewAccount = function () {
      if (Number(self.initialDeposit()) < 1000) {
        self.actionError('Enter an opening deposit of at least ₹1,000.');
        return false;
      }
      self.actionError('');
      self.actionSuccess(self.newAccountType() + ' request submitted. Reference NSA-' + Date.now().toString().slice(-6) + '.');
      return false;
    };
    this.submitBeneficiary = function () {
      if (!self.beneficiaryName().trim() || !/^\d{8,18}$/.test(self.beneficiaryAccount().replace(/\s/g, '')) || !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(self.beneficiaryIfsc().trim())) {
        self.actionError('Enter the beneficiary name, a valid account number, and an 11-character IFSC code.');
        return false;
      }
      self.actionError('');
      self.actionSuccess(self.beneficiaryName().trim() + ' was added for verification. A cooling period may apply.');
      return false;
    };
    this.submitTransfer = function () {
      const amount = Number(self.transferAmount());
      if (!amount || amount < 1 || amount > 500000) {
        self.actionError('Enter a transfer amount between ₹1 and ₹5,00,000.');
        self.showActionMessage('error', 'Transfer amount needs attention', self.actionError());
        return false;
      }
      let destination = self.transferBeneficiary();
      if (self.isOtherAccountTransfer()) {
        const recipientName = self.transferRecipientName().trim();
        const accountNumber = self.transferRecipientAccount().replace(/\s/g, '');
        const confirmedAccount = self.transferRecipientAccountConfirm().replace(/\s/g, '');
        const ifsc = self.transferRecipientIfsc().trim();
        if (!recipientName || !/^\d{8,18}$/.test(accountNumber) || !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifsc)) {
          self.actionError('Enter the recipient name, a valid account number, and an 11-character IFSC code.');
          self.showActionMessage('error', 'Recipient details need attention', self.actionError());
          return false;
        }
        if (accountNumber !== confirmedAccount) {
          self.actionError('The account numbers do not match. Check them and try again.');
          self.showActionMessage('error', 'Account confirmation failed', self.actionError());
          return false;
        }
        destination = recipientName + ' (account ending ' + accountNumber.slice(-4) + ')';
      }
      self.actionError('');
      self.actionMessages([]);
      self.pendingTransferDestination(destination);
      self.pendingTransferAmount(amount);
      requestAnimationFrame(function () {
        const dialog = document.getElementById('transfer-confirmation-dialog');
        if (dialog) { dialog.open(); }
      });
      return false;
    };
    this.cancelTransferConfirmation = function () {
      const dialog = document.getElementById('transfer-confirmation-dialog');
      if (dialog) { dialog.close(); }
    };
    this.confirmTransfer = function () {
      const amount = self.pendingTransferAmount();
      const destination = self.pendingTransferDestination();
      self.actionSuccess('Transfer of ₹' + amount.toLocaleString('en-IN') + ' to ' + destination + ' has been submitted for secure processing.');
      self.showActionMessage('confirmation', 'Transfer submitted', self.actionSuccess());
      self.cancelTransferConfirmation();
    };
    this.toggleCardLock = function () {
      self.cardLocked(!self.cardLocked());
      self.actionSuccess(self.cardLocked() ? 'Northstar Signature card is temporarily locked.' : 'Northstar Signature card is active again.');
    };
    this.toggleOnlinePayments = function () {
      self.cardOnlineEnabled(!self.cardOnlineEnabled());
      self.actionSuccess('Online payments are now ' + (self.cardOnlineEnabled() ? 'enabled.' : 'disabled.'));
    };
    this.toggleInternationalPayments = function () {
      self.cardInternationalEnabled(!self.cardInternationalEnabled());
      self.actionSuccess('International payments are now ' + (self.cardInternationalEnabled() ? 'enabled.' : 'disabled.'));
    };
    this.submitCardApplication = function () {
      if (self.cardApplicationType() === 'Credit card' && Number(self.cardApplicantIncome()) < 20000) {
        self.actionError('A minimum monthly income of ₹20,000 is required for this credit-card application.');
        return false;
      }
      if (!self.cardDeliveryAddress().trim()) {
        self.actionError('Enter the delivery address for your new card.');
        return false;
      }
      self.actionError('');
      self.cardApplicationReference('NSC-' + Date.now().toString().slice(-8));
      self.cardApplicationStatus('Application received');
      self.cardApplicationSubmitted(true);
      self.actionSuccess(self.cardApplicationType() + ' application submitted successfully.');
      return false;
    };
    this.saveNotificationSettings = function () {
      self.actionSuccess('Notification preferences were saved successfully.');
    };
    this.reviewApprovals = function () {
      self.actionSuccess('The approvals queue is ready. Select an item below to review it.');
    };
    this.primaryAction = this.isLoans ? this.openLoanApplication : this.isTransactions ? this.downloadStatement : this.openPageAction;
  }

  return PageViewModel;
});
