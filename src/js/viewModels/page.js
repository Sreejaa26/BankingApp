define([
  'knockout',
  'utils/api',
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
  'ojs/ojfilepicker',
  'ojs/ojvalidationgroup'
], function (ko, api, ArrayDataProvider, PagingDataProviderView, RegExpValidator, NumberConverters, DateTimeConverters) {
  'use strict';

  const pages = {
    profile: {
      eyebrow: 'Your details', title: 'Profile', description: 'Keep your identity and contact details accurate for secure banking.', action: 'Update profile', endpoint: 'GET /api/customers/me',
      highlights: [['Profile status', 'Loading'], ['KYC status', 'Not submitted'], ['Access level', 'Customer']],
      primaryEyebrow: 'Personal profile', primaryTitle: 'Your banking identity', secondaryEyebrow: 'Security', secondaryTitle: 'Verification status', secondaryCopy: 'Complete your profile and KYC before requesting a new bank account.',
      items: [['P', 'Customer profile', 'Personal and address information', 'Secure', 'Protected']],
      secondary: [['ID', 'Identity details', 'Used for regulated banking services', 'Required', '', 100], ['KYC', 'KYC verification', 'Reviewed by bank operations', 'Pending', '', 35]]
    },
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
      eyebrow: 'Borrowing', title: 'Loans', description: 'Track existing loans and calculate repayment estimates from the loan service.', action: 'Calculate a new loan', endpoint: 'GET /api/loans',
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
      eyebrow: 'Stay informed', title: 'Notifications', description: 'Review the status of automatic security and transaction email notifications.', action: 'Notification status', endpoint: 'GET /api/notifications/email/history',
      highlights: [['Unread','3'],['Security alerts','0'],['This week','9']],
      primaryEyebrow: 'Email delivery', primaryTitle: 'Notification status', secondaryEyebrow: 'Automatic events', secondaryTitle: 'Supported alerts', secondaryCopy: 'The backend sends email notifications for supported security and banking events.',
      items: [['₹','Salary received','₹82,500 credited to Savings •••• 4821','28 Jul','New',null,true],['UP','UPI payment successful','₹1,840 paid to Fresh Basket','Today','New'],['EM','EMI reminder','Home loan EMI is due on 05 Aug','27 Jul','New'],['✓','Profile verification complete','Your annual KYC review was approved','24 Jul','Read']],
      secondary: [['01','Transaction emails','Generated by supported payment events','Automatic','',100],['02','Security emails','Registration and login activity','Automatic','',100],['03','Delivery status','Tracked by the notification service','Backend managed','',100]]
    },
    admin: {
      eyebrow: 'Operations', title: 'Admin Dashboard', description: 'Monitor customer activity, service health, and operational risk.', action: 'Refresh operations', endpoint: 'GET /api/admin/dashboard',
      highlights: [['Active customers','18,420'],['Pending reviews','24'],['Service health','99.99%']],
      primaryEyebrow: 'Operations queue', primaryTitle: 'Items requiring attention', secondaryEyebrow: 'Platform overview', secondaryTitle: 'Service status', secondaryCopy: 'Core banking services are operating within their normal thresholds.',
      items: [['KY','KYC reviews','12 applications awaiting verification','12','High priority'],['TR','Transfer reviews','7 payments flagged for review','7','Review'],['AC','Account approvals','5 new customer applications','5','Pending']],
      secondary: [['API','Banking API','42 ms average response','99.99%','Operational',100],['UPI','Payments network','68 ms average response','99.98%','Operational',100],['ID','Identity service','51 ms average response','99.99%','Operational',100]]
    }
  };

  function normalizeItem(item) {
    return { icon: item[0], name: item[1], meta: item[2], value: item[3], status: item[4] || '', progress: item[5], positive: Boolean(item[6]) };
  }

  function responseData(response) {
    return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
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
    this.isProfile = params.route === 'profile';
    this.isAccounts = params.route === 'accounts';
    this.isLoans = params.route === 'loans';
    this.isTransactions = params.route === 'transactions';
    this.isBeneficiaries = params.route === 'beneficiaries';
    this.isTransfer = params.route === 'transfer';
    this.isCards = params.route === 'cards';
    this.isNotifications = params.route === 'notifications';
    this.isAdmin = params.route === 'admin';
    this.isNotificationHistoryAvailable = this.isNotifications && params.app.currentRole() === 'ADMIN';
    this.statementDownloadStatus = ko.observable('');
    this.actionPanelOpen = ko.observable(false);
    this.actionError = ko.observable('');
    this.actionSuccess = ko.observable('');
    this.actionMessages = ko.observableArray([]);
    this.pendingTransferDestination = ko.observable('');
    this.pendingTransferAmount = ko.observable(0);
    this.pendingTransfer = null;
    this.beneficiaryLookup = {};
    this.actionPanelTitle = this.isProfile ? 'Update your profile' : this.isAccounts ? 'Open a new account' : this.isBeneficiaries ? 'Add a beneficiary' : this.isTransfer ? 'Make a new transfer' : this.isCards ? 'Card centre' : this.isNotifications ? 'Notification settings' : 'Review approvals';

    this.profileFullName = ko.observable('');
    this.profileFatherOrSpouseName = ko.observable('');
    this.profileDateOfBirth = ko.observable('');
    this.profileAddressLine1 = ko.observable('');
    this.profileAddressLine2 = ko.observable('');
    this.profileCity = ko.observable('');
    this.profileState = ko.observable('');
    this.profileCountry = ko.observable('India');
    this.profilePostalCode = ko.observable('');
    this.kycAadhaar = ko.observable('');
    this.kycPan = ko.observable('');
    this.kycDocumentType = ko.observable('AADHAAR');
    this.kycDocumentFile = ko.observable(null);
    this.kycDocumentFileName = ko.observable('');
    this.newAccountType = ko.observable('SAVINGS');
    this.branchIfsc = ko.observable('');
    this.beneficiaryName = ko.observable('');
    this.beneficiaryAccount = ko.observable('');
    this.beneficiaryIfsc = ko.observable('');
    this.beneficiaryNickname = ko.observable('');
    this.beneficiaryRelationship = ko.observable('OTHER');
    this.beneficiaryFavourite = ko.observable(false);
    this.transferFrom = ko.observable('');
    this.transferBeneficiary = ko.observable('');
    this.transferAmount = ko.observable(10000);
    this.transferPurpose = ko.observable('Personal transfer');
    this.cardLocked = ko.observable(false);
    this.activeCardId = ko.observable('');
    this.activeCardName = ko.observable('No card available');
    this.activeCardStatus = ko.observable('UNAVAILABLE');
    this.cardLimit = ko.observable(200000);
    this.cardApplicationType = ko.observable('Credit card');
    this.cardProduct = ko.observable('Northstar Signature');
    this.cardApplicantIncome = ko.observable(85000);
    this.cardDeliveryAddress = ko.observable('');
    this.cardApplicationSubmitted = ko.observable(false);
    this.cardApplicationReference = ko.observable('Not submitted');
    this.cardApplicationStatus = ko.observable('Backend support pending');
    this.cardActionLabel = ko.pureComputed(function () {
      if (self.activeCardStatus() === 'ISSUED') { return 'Activate card'; }
      return self.activeCardStatus() === 'BLOCKED' ? 'Unblock card' : 'Block card';
    });
    this.accountNumberValidators = [new RegExpValidator({ pattern: '^\\d{1,30}$', messageSummary: 'Enter a valid account number', messageDetail: 'Use up to 30 digits.' })];
    this.ifscValidators = [new RegExpValidator({ pattern: '^[A-Za-z]{4}0[A-Za-z0-9]{6}$', messageSummary: 'Enter a valid IFSC code', messageDetail: 'Example: HDFC0001234.' })];
    this.currencyConverter = new NumberConverters.IntlNumberConverter({ style: 'currency', currency: 'INR', currencyDisplay: 'symbol' });
    this.transactionDateConverter = new DateTimeConverters.IntlDateTimeConverter({ dateStyle: 'medium' });

    this.accountTypeOptions = new ArrayDataProvider([
      { value: 'SAVINGS', label: 'Savings account' },
      { value: 'CURRENT', label: 'Current account' },
      { value: 'SALARY', label: 'Salary account' }
    ], { keyAttributes: 'value' });
    this.branchOptions = ko.observable(new ArrayDataProvider([], { keyAttributes: 'value' }));
    this.kycDocumentTypeOptions = new ArrayDataProvider([{ value: 'AADHAAR', label: 'Aadhaar document' }, { value: 'PAN', label: 'PAN document' }, { value: 'ADDRESS_PROOF', label: 'Address proof' }], { keyAttributes: 'value' });
    this.transferAccountOptions = ko.observable(new ArrayDataProvider([], { keyAttributes: 'value' }));
    this.transferBeneficiaryOptions = ko.observable(new ArrayDataProvider([], { keyAttributes: 'value' }));
    this.beneficiaryRelationshipOptions = new ArrayDataProvider([
      { value: 'FAMILY', label: 'Family' }, { value: 'FRIEND', label: 'Friend' },
      { value: 'SELF', label: 'My account' }, { value: 'BUSINESS', label: 'Business' },
      { value: 'OTHER', label: 'Other' }
    ], { keyAttributes: 'value' });
    this.transactionRows = ko.observableArray([]);
    this.transactionTableData = new ArrayDataProvider(this.transactionRows, { keyAttributes: 'id' });
    this.pagingTransactions = new PagingDataProviderView(this.transactionTableData);
    this.transactionColumns = [
      { headerText: 'Type', field: 'type', width: '70px' },
      { headerText: 'Description', field: 'description' },
      { headerText: 'Date', field: 'date' },
      { headerText: 'Amount', field: 'amount' },
      { headerText: 'Status', field: 'status' }
    ];
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
    this.loanInfo = ko.observable('');
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
      self.loanError(''); self.loanInfo('Calculating with the loan service…');
      api.request('/api/loans/calculate', { method: 'POST', body: JSON.stringify({ loanAmount: amount, annualInterestRate: self.selectedLoanRate(), tenureMonths: Number(self.loanTenure()), startDate: null }) }, params.app.authToken()).then(function (response) {
        const estimate = responseData(response) || {};
        self.loanInfo('Backend EMI estimate: ' + self.currencyConverter.format(Number(estimate.monthlyEmi || 0)) + ' per month. Customer loan applications are not yet exposed by the backend.');
      }).catch(function (error) { self.loanInfo(''); self.loanError(error.message || 'Unable to calculate the loan estimate.'); });
      return false;
    };
    this.startAnotherApplication = function () {
      self.loanApplicationSubmitted(false);
      self.applicationReference('');
      self.loanError('');
    };
    this.loadLoanData = function () {
      if (!self.isLoans) { return; }
      api.request('/api/loans', {}, params.app.authToken()).then(function (response) {
        const loans = responseData(response) || [];
        self.items(loans.map(function (loan) { return { icon: String(loan.loanType || 'LN').slice(0, 2), name: String(loan.loanType || 'Loan').replace(/_/g, ' '), meta: 'Loan •••• ' + String(loan.loanNumber || '').slice(-4) + ' · EMI ' + self.currencyConverter.format(Number(loan.emiAmount || 0)), value: self.currencyConverter.format(Number(loan.outstandingBalance || 0)), status: loan.status }; }));
        const outstanding = loans.reduce(function (sum, loan) { return sum + Number(loan.outstandingBalance || 0); }, 0);
        self.highlights([{ label: 'Outstanding', value: self.currencyConverter.format(outstanding) }, { label: 'Active loans', value: String(loans.filter(function (loan) { return loan.status === 'ACTIVE'; }).length) }, { label: 'Total loans', value: String(loans.length) }]);
      }).catch(function (error) { self.loanError(error.message || 'Unable to load loan details.'); });
    };
    this.loadTransactionData = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || !self.isTransactions) { return; }
      api.request('/api/transactions?page=0&size=100', {}, token).then(function (response) {
        const page = responseData(response) || {};
        const transactions = page.content || [];
        self.transactionRows(transactions.map(function (transaction) {
          const amount = Number(transaction.amount || 0);
          const signedAmount = (transaction.debitCredit === 'DEBIT' ? '-' : '+') + self.currencyConverter.format(amount);
          return { id: transaction.transactionId, type: transaction.transactionType, description: transaction.description || transaction.referenceNumber || transaction.transactionType, date: self.transactionDateConverter.format(new Date(transaction.transactionDate)), amount: signedAmount, status: transaction.status };
        }));
        self.items(transactions.slice(0, 6).map(function (transaction) {
          return { icon: String(transaction.transactionType || 'TX').slice(0, 2), name: transaction.description || transaction.transactionType, meta: self.transactionDateConverter.format(new Date(transaction.transactionDate)), value: (transaction.debitCredit === 'DEBIT' ? '-' : '+') + self.currencyConverter.format(Number(transaction.amount || 0)), status: transaction.status, positive: transaction.debitCredit === 'CREDIT' };
        }));
        const incoming = transactions.filter(function (item) { return item.debitCredit === 'CREDIT'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
        const outgoing = transactions.filter(function (item) { return item.debitCredit === 'DEBIT'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
        self.highlights([{ label: 'Outgoing', value: self.currencyConverter.format(outgoing) }, { label: 'Incoming', value: self.currencyConverter.format(incoming) }, { label: 'Transactions', value: String(page.totalElements == null ? transactions.length : page.totalElements) }]);
      }).catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to load transactions.'); });
    };
    this.pollReport = function (jobId, attempt) {
      const token = params.app.authToken();
      api.request('/api/reports/' + encodeURIComponent(jobId), {}, token).then(function (job) {
        if (job.status === 'COMPLETED') {
          self.statementDownloadStatus('Report ready. Starting download…');
          return api.download('/api/reports/' + encodeURIComponent(jobId) + '/download', token).then(function (file) {
            const url = URL.createObjectURL(file.blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.fileName; anchor.style.display = 'none'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 0);
            self.statementDownloadStatus(file.fileName + ' downloaded successfully.');
          });
        }
        if (job.status === 'FAILED') { throw new Error(job.failureReason || 'The report could not be generated.'); }
        if (attempt >= 40) { throw new Error('The report is still processing. Try downloading it again shortly.'); }
        setTimeout(function () { self.pollReport(jobId, attempt + 1); }, 1500);
      }).catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to download the statement.'); });
    };
    this.downloadStatement = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token) { self.statementDownloadStatus('Please sign in again before downloading a statement.'); return; }
      self.statementDownloadStatus('Preparing your secure transaction report…');
      api.request('/api/reports/transactions', { method: 'POST', headers: { 'Idempotency-Key': api.createIdempotencyKey() }, body: JSON.stringify({ format: 'CSV', ownerUserId: null, accountId: null, from: null, to: null, filters: {} }) }, token).then(function (queued) {
        if (!queued || !queued.reportJobId) { throw new Error('The report service did not return a job ID.'); }
        self.pollReport(queued.reportJobId, 0);
      }).catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to queue the statement report.'); });
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
    this.loadProfileData = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || !self.isProfile) { return; }
      api.request('/api/customers/me', {}, token).then(function (response) {
        const profile = responseData(response) || {};
        self.profileFullName(profile.fullName || '');
        self.profileFatherOrSpouseName(profile.fatherOrSpouseName || '');
        self.profileDateOfBirth(profile.dateOfBirth || '');
        self.profileAddressLine1(profile.addressLine1 || '');
        self.profileAddressLine2(profile.addressLine2 || '');
        self.profileCity(profile.city || ''); self.profileState(profile.state || '');
        self.profileCountry(profile.country || 'India'); self.profilePostalCode(profile.postalCode || '');
        params.app.customerName(profile.fullName || params.app.customerName());
        self.highlights.splice(0, 1, { label: 'Profile status', value: profile.profileStatus || 'INCOMPLETE' });
      }).catch(function (error) { self.actionError(error.message || 'Unable to load your profile.'); });
      api.request('/api/customers/me/kyc', {}, token).then(function (response) {
        const kyc = responseData(response) || {};
        self.highlights.splice(1, 1, { label: 'KYC status', value: kyc.status || 'NOT_SUBMITTED' });
      }).catch(function (error) {
        if (error.status !== 404) { self.actionError(error.message || 'Unable to load KYC status.'); }
      });
    };
    this.submitProfile = function () {
      const required = [self.profileFullName(), self.profileFatherOrSpouseName(), self.profileDateOfBirth(), self.profileAddressLine1(), self.profileCity(), self.profileState(), self.profileCountry(), self.profilePostalCode()];
      if (required.some(function (value) { return !String(value || '').trim(); }) || !/^\d{4}-\d{2}-\d{2}$/.test(self.profileDateOfBirth())) {
        self.actionError('Complete all required profile fields and use YYYY-MM-DD for the date of birth.'); return false;
      }
      const token = params.app.authToken();
      api.request('/api/customers/me', { method: 'PUT', body: JSON.stringify({
        fullName: self.profileFullName().trim(), fatherOrSpouseName: self.profileFatherOrSpouseName().trim(), dateOfBirth: self.profileDateOfBirth().trim(),
        addressLine1: self.profileAddressLine1().trim(), addressLine2: self.profileAddressLine2().trim(), city: self.profileCity().trim(),
        state: self.profileState().trim(), country: self.profileCountry().trim(), postalCode: self.profilePostalCode().trim()
      }) }, token).then(function () {
        self.actionError(''); self.actionSuccess('Your profile was updated successfully.'); self.showActionMessage('confirmation', 'Profile updated', self.actionSuccess()); self.loadProfileData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to update your profile.'); self.showActionMessage('error', 'Profile needs attention', self.actionError()); });
      return false;
    };
    this.onProfileKycSelect = function (event) {
      const files = event.detail && event.detail.files;
      const file = files && files[0];
      if (file && file.size > 5 * 1024 * 1024) { self.actionError('KYC documents must be 5 MB or smaller.'); self.kycDocumentFile(null); self.kycDocumentFileName(''); return; }
      self.kycDocumentFile(file || null); self.kycDocumentFileName(file ? file.name : ''); self.actionError('');
    };
    this.submitKyc = function () {
      const aadhaar = self.kycAadhaar().replace(/\s/g, '');
      const pan = self.kycPan().trim().toUpperCase();
      if (!/^\d{12}$/.test(aadhaar) || !/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) { self.actionError('Enter a valid 12-digit Aadhaar number and PAN in the format ABCDE1234F.'); return false; }
      const token = params.app.authToken();
      let identitySaved = false;
      api.request('/api/customers/me/kyc', { method: 'PUT', body: JSON.stringify({ aadhaarNumber: aadhaar, panNumber: pan }) }, token).then(function () {
        identitySaved = true;
        const file = self.kycDocumentFile();
        if (!file) { return null; }
        const form = new FormData(); form.append('documentType', self.kycDocumentType()); form.append('file', file);
        return api.upload('/api/customers/me/kyc/documents', form, token);
      }).then(function () {
        self.actionError(''); self.actionSuccess(self.kycDocumentFile() ? 'KYC details and document submitted for review.' : 'KYC identity details submitted for review.'); self.showActionMessage('confirmation', 'KYC submitted', self.actionSuccess()); self.loadProfileData();
      }).catch(function (error) { self.actionError(identitySaved ? 'KYC details were saved, but the document upload failed: ' + (error.message || 'Unknown upload error') : (error.message || 'Unable to submit KYC details.')); self.showActionMessage('error', 'KYC needs attention', self.actionError()); });
      return false;
    };
    this.loadAccountsData = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || !self.isAccounts) { return; }
      Promise.all([api.request('/api/accounts', {}, token), api.request('/api/branches', {}, token)]).then(function (responses) {
        const accounts = responseData(responses[0]) || [];
        const branches = responseData(responses[1]) || [];
        const total = accounts.reduce(function (sum, account) { return sum + Number(account.availableBalance || 0); }, 0);
        self.highlights([{ label: 'Total balance', value: self.currencyConverter.format(total) }, { label: 'Available now', value: self.currencyConverter.format(total) }, { label: 'Active accounts', value: String(accounts.filter(function (account) { return account.status === 'ACTIVE'; }).length) }]);
        self.items(accounts.map(function (account) {
          const number = String(account.accountNumber || '');
          return { icon: String(account.accountType || 'AC').slice(0, 2), name: String(account.accountType || 'Account').replace(/_/g, ' '), meta: '•••• ' + number.slice(-4) + ' · ' + account.branchIfsc, value: self.currencyConverter.format(Number(account.availableBalance || 0)), status: account.status || '' };
        }));
        self.branchOptions(new ArrayDataProvider(branches.map(function (branch) { return { value: branch.ifsc, label: branch.branchName + ' · ' + branch.city + ' · ' + branch.ifsc }; }), { keyAttributes: 'value' }));
      }).catch(function (error) { self.actionError(error.message || 'Unable to load account details.'); });
    };
    this.submitNewAccount = function () {
      if (!self.newAccountType() || !self.branchIfsc()) { self.actionError('Choose an account type and branch.'); return false; }
      const token = params.app.authToken();
      const idempotencyKey = api.createIdempotencyKey();
      api.request('/api/banking/accounts/open', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ accountType: self.newAccountType(), branchIfsc: self.branchIfsc() }) }, token).then(function (response) {
        const opened = responseData(response) || {};
        self.actionError(''); self.actionSuccess('Account opened successfully. Reference ' + (opened.referenceNumber || opened.accountNumber || 'created') + '.'); self.showActionMessage('confirmation', 'Account opened', self.actionSuccess()); self.loadAccountsData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to open the account. Complete your profile and KYC, then try again.'); self.showActionMessage('error', 'Account request needs attention', self.actionError()); });
      return false;
    };
    this.loadPaymentData = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || (!self.isBeneficiaries && !self.isTransfer)) { return; }
      Promise.all([
        api.request('/api/beneficiaries?favouritesOnly=false', {}, token),
        api.request('/api/accounts', {}, token)
      ]).then(function (responses) {
        const beneficiaries = responseData(responses[0]) || [];
        const accounts = responseData(responses[1]) || [];
        self.beneficiaryLookup = {};
        beneficiaries.forEach(function (beneficiary) { self.beneficiaryLookup[beneficiary.beneficiaryId] = beneficiary; });
        if (self.isBeneficiaries) {
          self.items(beneficiaries.map(function (beneficiary) {
            const accountNumber = String(beneficiary.accountNumber || '');
            return { icon: (beneficiary.beneficiaryName || '?').slice(0, 2).toUpperCase(), name: beneficiary.beneficiaryName, meta: (beneficiary.ifscCode || '') + ' · •••• ' + accountNumber.slice(-4), value: beneficiary.relationship || 'OTHER', status: beneficiary.status || '' };
          }));
        }
        self.transferBeneficiaryOptions(new ArrayDataProvider(beneficiaries.filter(function (beneficiary) { return beneficiary.status === 'VERIFIED'; }).map(function (beneficiary) {
          const accountNumber = String(beneficiary.accountNumber || '');
          return { value: beneficiary.beneficiaryId, label: beneficiary.beneficiaryName + ' · •••• ' + accountNumber.slice(-4) };
        }), { keyAttributes: 'value' }));
        self.transferAccountOptions(new ArrayDataProvider(accounts.filter(function (account) { return account.status === 'ACTIVE'; }).map(function (account) {
          const accountNumber = String(account.accountNumber || '');
          return { value: account.accountId, label: account.accountType + ' · •••• ' + accountNumber.slice(-4) };
        }), { keyAttributes: 'value' }));
      }).catch(function (error) {
        self.actionError(error.message || 'Unable to load your payment details.');
      });
    };
    this.submitBeneficiary = function () {
      const accountNumber = self.beneficiaryAccount().replace(/\s/g, '');
      const ifscCode = self.beneficiaryIfsc().trim().toUpperCase();
      if (!self.beneficiaryName().trim() || !self.beneficiaryNickname().trim() || !/^\d{1,30}$/.test(accountNumber) || !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode)) {
        self.actionError('Enter the beneficiary name, nickname, account number, and an 11-character IFSC code.');
        return false;
      }
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token) { self.actionError('Please sign in again before adding a beneficiary.'); return false; }
      api.request('/api/beneficiaries', { method: 'POST', body: JSON.stringify({ nickname: self.beneficiaryNickname().trim(), beneficiaryName: self.beneficiaryName().trim(), relationship: self.beneficiaryRelationship(), accountNumber: accountNumber, ifscCode: ifscCode, favourite: self.beneficiaryFavourite() }) }, token).then(function () {
        self.actionError(''); self.actionSuccess('Beneficiary added for verification. A cooling period may apply.'); self.showActionMessage('confirmation', 'Beneficiary added', self.actionSuccess()); self.loadPaymentData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to add the beneficiary.'); self.showActionMessage('error', 'Beneficiary needs attention', self.actionError()); });
      return false;
    };
    this.submitTransfer = function () {
      const amount = Number(self.transferAmount());
      const beneficiary = self.beneficiaryLookup[self.transferBeneficiary()];
      if (!self.transferFrom() || !beneficiary) { self.actionError('Choose an active account and a verified beneficiary first.'); self.showActionMessage('error', 'Transfer needs attention', self.actionError()); return false; }
      if (!amount || amount < 1 || amount > 500000) { self.actionError('Enter a transfer amount between ₹1 and ₹5,00,000.'); self.showActionMessage('error', 'Transfer amount needs attention', self.actionError()); return false; }
      self.pendingTransfer = { sourceAccountId: self.transferFrom(), destinationAccountNumber: beneficiary.accountNumber, amount: amount, description: self.transferPurpose().trim(), idempotencyKey: api.createIdempotencyKey() };
      self.actionError(''); self.actionMessages([]); self.pendingTransferDestination(beneficiary.beneficiaryName + ' (account ending ' + String(beneficiary.accountNumber).slice(-4) + ')'); self.pendingTransferAmount(amount);
      requestAnimationFrame(function () { const dialog = document.getElementById('transfer-confirmation-dialog'); if (dialog) { dialog.open(); } });
      return false;
    };
    this.cancelTransferConfirmation = function () {
      const dialog = document.getElementById('transfer-confirmation-dialog');
      if (dialog) { dialog.close(); }
    };
    this.confirmTransfer = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || !self.pendingTransfer) { self.actionError('Please start the transfer again.'); return; }
      api.request('/api/banking/transfer', { method: 'POST', headers: { 'Idempotency-Key': self.pendingTransfer.idempotencyKey }, body: JSON.stringify({ sourceAccountId: self.pendingTransfer.sourceAccountId, destinationAccountNumber: self.pendingTransfer.destinationAccountNumber, amount: self.pendingTransfer.amount, description: self.pendingTransfer.description }) }, token).then(function () {
        self.actionSuccess('Transfer of ₹' + self.pendingTransferAmount().toLocaleString('en-IN') + ' to ' + self.pendingTransferDestination() + ' has been submitted for secure processing.'); self.showActionMessage('confirmation', 'Transfer submitted', self.actionSuccess()); self.cancelTransferConfirmation(); self.loadPaymentData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to submit the transfer.'); self.showActionMessage('error', 'Transfer needs attention', self.actionError()); });
    };
    this.loadCardData = function () {
      if (!self.isCards) { return; }
      api.request('/api/cards', {}, params.app.authToken()).then(function (response) {
        const cards = responseData(response) || [];
        self.items(cards.map(function (card) { return { icon: String(card.cardType || 'DC').slice(0, 2), name: String(card.cardType || 'Debit') + ' card', meta: card.maskedCardNumber + ' · expires ' + card.expiryMonth + '/' + card.expiryYear, value: self.currencyConverter.format(Number(card.dailyTransactionLimit || 0)), status: card.status }; }));
        self.highlights([{ label: 'Cards', value: String(cards.length) }, { label: 'Active', value: String(cards.filter(function (card) { return card.status === 'ACTIVE'; }).length) }, { label: 'Blocked', value: String(cards.filter(function (card) { return card.status === 'BLOCKED'; }).length) }]);
        if (cards.length) {
          const card = cards[0]; self.activeCardId(card.cardId); self.activeCardName(String(card.cardType || 'Debit') + ' card ' + card.maskedCardNumber); self.activeCardStatus(card.status); self.cardLocked(card.status === 'BLOCKED'); self.cardLimit(Number(card.dailyTransactionLimit || 0));
        }
      }).catch(function (error) { self.actionError(error.message || 'Unable to load your cards.'); });
    };
    this.toggleCardLock = function () {
      if (!self.activeCardId()) { self.actionError('No card is available for this action.'); return; }
      let endpoint = '/block';
      if (self.activeCardStatus() === 'BLOCKED') { endpoint = '/unblock'; }
      if (self.activeCardStatus() === 'ISSUED') { endpoint = '/activate'; }
      const options = { method: 'POST' };
      if (endpoint === '/block') { options.body = JSON.stringify({ reason: 'Customer requested temporary block' }); }
      api.request('/api/cards/' + encodeURIComponent(self.activeCardId()) + endpoint, options, params.app.authToken()).then(function (response) {
        const card = responseData(response) || {}; self.activeCardStatus(card.status || self.activeCardStatus()); self.cardLocked(self.activeCardStatus() === 'BLOCKED'); self.actionError(''); self.actionSuccess('Card status updated to ' + self.activeCardStatus() + '.'); self.loadCardData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to update the card status.'); });
    };
    this.updateCardLimit = function () {
      if (!self.activeCardId() || Number(self.cardLimit()) <= 0) { self.actionError('Choose a card and enter a valid daily limit.'); return; }
      api.request('/api/cards/' + encodeURIComponent(self.activeCardId()) + '/limit', { method: 'PUT', body: JSON.stringify({ dailyTransactionLimit: Number(self.cardLimit()) }) }, params.app.authToken()).then(function () { self.actionError(''); self.actionSuccess('The daily card limit was updated.'); self.loadCardData(); }).catch(function (error) { self.actionError(error.message || 'Unable to update the card limit.'); });
    };
    this.submitCardApplication = function () {
      self.actionSuccess('');
      self.actionError('The current backend can list and manage existing debit cards, but it does not yet provide a customer credit/debit card application endpoint.');
      return false;
    };
    this.loadNotificationData = function () {
      if (!self.isNotifications) { return; }
      if (!self.isNotificationHistoryAvailable) {
        self.highlights([{ label: 'Security emails', value: 'Automatic' }, { label: 'Transaction emails', value: 'Automatic' }, { label: 'Delivery controls', value: 'Bank managed' }]);
        self.items([{ icon: 'EM', name: 'Email notifications are automatic', meta: 'Registration, login, transfers, cards, loans, and other supported banking events', value: 'Protected', status: 'Enabled' }]);
        return;
      }
      const token = params.app.authToken();
      api.request('/api/notifications/email/history', {}, token).then(function (response) {
        const notifications = responseData(response) || [];
        self.items(notifications.map(function (notification) { return { icon: 'EM', name: notification.subject || notification.type || 'Email notification', meta: notification.recipient + ' · ' + self.transactionDateConverter.format(new Date(notification.createdAt)), value: String(notification.retryCount || 0) + ' retries', status: notification.status }; }));
        self.highlights([{ label: 'Emails', value: String(notifications.length) }, { label: 'Sent', value: String(notifications.filter(function (item) { return item.status === 'SENT'; }).length) }, { label: 'Needs attention', value: String(notifications.filter(function (item) { return item.status === 'FAILED'; }).length) }]);
      }).catch(function (error) { self.actionError(error.message || 'Unable to load email delivery history.'); });
    };
    this.loadAdminData = function () {
      if (!self.isAdmin || params.app.currentRole() !== 'ADMIN') { return; }
      api.request('/api/admin/dashboard', {}, params.app.authToken()).then(function (dashboard) {
        const sections = dashboard.sections || {};
        const rows = Object.keys(sections).map(function (key) {
          const section = sections[key] || {}; const values = section.data && typeof section.data === 'object' ? Object.values(section.data).filter(function (value) { return typeof value === 'number'; }) : [];
          return { icon: key.slice(0, 2).toUpperCase(), name: key.replace(/-/g, ' '), meta: section.error || ('Updated ' + self.transactionDateConverter.format(new Date(section.asOf || dashboard.generatedAt))), value: values.length ? String(values[0]) : section.status, status: section.status };
        });
        self.items(rows);
        self.highlights(rows.slice(0, 3).map(function (row) { return { label: row.name, value: row.value }; }));
      }).catch(function (error) { self.actionError(error.message || 'Unable to load the admin dashboard.'); });
    };
    this.saveNotificationSettings = function () {
      self.actionError(''); self.loadNotificationData(); self.actionSuccess(self.isNotificationHistoryAvailable ? 'Email delivery history refreshed.' : 'Security and transaction emails are managed automatically by the bank.');
    };
    this.reviewApprovals = function () {
      self.loadAdminData(); self.actionSuccess('The current operations dashboard was refreshed.');
    };
    this.primaryAction = this.isLoans ? this.openLoanApplication : this.isTransactions ? this.downloadStatement : this.openPageAction;
    this.loadProfileData();
    this.loadAccountsData();
    this.loadPaymentData();
    this.loadTransactionData();
    this.loadNotificationData();
    this.loadAdminData();
    this.loadCardData();
    this.loadLoanData();
  }

  return PageViewModel;
});
