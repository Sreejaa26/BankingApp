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
  'ojs/ojdatetimepicker',
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
      eyebrow: 'Borrowing', title: 'Loans', description: 'Track existing loans, compare repayment estimates, and submit a new loan application.', action: 'Apply for a new loan', endpoint: 'GET /api/loans',
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
      eyebrow: 'Stay informed', title: 'Notifications', description: 'Your latest account and card updates.', action: '', endpoint: '',
      highlights: [],
      primaryEyebrow: 'Recent updates', primaryTitle: 'Notifications', secondaryEyebrow: '', secondaryTitle: '', secondaryCopy: '',
      items: [['AC','Account created','Your new Northstar bank account was created successfully.','Recent','New'],['CA','Card application submitted','Your card application was received and is under review.','Recent','New']],
      secondary: []
    },
    support: {
      eyebrow: 'We are here to help', title: 'Help & Support', description: 'Contact Northstar support or use the guided assistant for quick answers.', action: '', endpoint: '',
      highlights: [], primaryEyebrow: '', primaryTitle: '', secondaryEyebrow: '', secondaryTitle: '', secondaryCopy: '', items: [], secondary: []
    },
    admin: {
      eyebrow: 'Operations', title: 'Admin Dashboard', description: 'Monitor customer activity, service health, and operational risk.', action: 'Refresh operations', endpoint: 'GET /api/admin/dashboard',
      highlights: [['Active customers','18,420'],['Pending reviews','24'],['Service health','99.99%']],
      primaryEyebrow: 'Operations queue', primaryTitle: 'Items requiring attention', secondaryEyebrow: 'Platform overview', secondaryTitle: 'Service status', secondaryCopy: 'Core banking services are operating within their normal thresholds.',
      items: [['KY','KYC reviews','12 applications awaiting verification','12','High priority'],['TR','Transfer reviews','7 payments flagged for review','7','Review'],['AC','Account approvals','5 new customer applications','5','Pending']],
      secondary: [['API','Banking API','42 ms average response','99.99%','Operational',100],['UPI','Payments network','68 ms average response','99.98%','Operational',100],['ID','Identity service','51 ms average response','99.99%','Operational',100]]
    }
  };

  const SUPPORT_TOPICS = [
    { name: 'Accounts', icon: 'AC', questions: [
      { question: 'How can I view my account balance?', answer: 'Open Accounts to see the available balance for each of your accounts.' },
      { question: 'How do I open a new account?', answer: 'Open Accounts, select Open an account, choose the account type and branch, then submit.' },
      { question: 'Which account types are available?', answer: 'Savings, Current, and Fixed Deposit accounts are available.' },
      { question: 'Why can’t I open an account?', answer: 'Complete your profile and KYC verification before opening an account.' },
      { question: 'Can I download an account statement?', answer: 'Open Transactions and select Download statement.' }
    ] },
    { name: 'Transactions', icon: 'TX', questions: [
      { question: 'How do I view transaction history?', answer: 'Open Transactions to see your recent and previous transactions.' },
      { question: 'How do I download a statement?', answer: 'Select Download statement on the Transactions page.' },
      { question: 'What does debit mean?', answer: 'Debit means money was deducted from your account.' },
      { question: 'What does credit mean?', answer: 'Credit means money was added to your account.' },
      { question: 'Why is a transaction pending?', answer: 'It may still be undergoing bank processing or security verification.' }
    ] },
    { name: 'Beneficiaries', icon: 'BN', questions: [
      { question: 'What is a beneficiary?', answer: 'A beneficiary is a person or business you can send money to.' },
      { question: 'How do I add a beneficiary?', answer: 'Open Beneficiaries, select Add beneficiary, and enter the requested bank details.' },
      { question: 'Which details are required?', answer: 'Enter the name, account number, IFSC, nickname, and relationship.' },
      { question: 'What does Verified mean?', answer: 'Verified means the beneficiary is ready to receive transfers.' },
      { question: 'Why is my beneficiary pending?', answer: 'Bank verification or a security cooling period may still be in progress.' }
    ] },
    { name: 'Transfer Money', icon: 'TR', questions: [
      { question: 'How do I transfer money?', answer: 'Choose a source account, verified beneficiary, amount, and transfer purpose.' },
      { question: 'Why can’t I select a beneficiary?', answer: 'Only verified beneficiaries can receive transfers.' },
      { question: 'What should I enter as transfer purpose?', answer: 'Enter a short reason such as rent, bills, or personal transfer.' },
      { question: 'Why did my transfer fail?', answer: 'Check your balance, beneficiary details, transfer limit, and service availability.' },
      { question: 'Is money transfer secure?', answer: 'Yes. Transfers require authenticated access and a confirmation step.' }
    ] },
    { name: 'Loans', icon: 'LN', questions: [
      { question: 'Which loan types are available?', answer: 'Home, Vehicle, Personal, Education, and Business loans are available.' },
      { question: 'How do I apply for a loan?', answer: 'Open Loans, select a loan product, and complete the application form.' },
      { question: 'Can I calculate EMI before applying?', answer: 'Yes. The Loans page shows an estimated EMI before submission.' },
      { question: 'Can I track my loan application?', answer: 'Yes. Submitted applications display their current review status.' },
      { question: 'Is the EMI final?', answer: 'No. The displayed EMI is an estimate until the loan is approved.' }
    ] },
    { name: 'Cards', icon: 'CD', questions: [
      { question: 'What card types are available?', answer: 'Debit and Credit cards are available.' },
      { question: 'How do I apply for a card?', answer: 'Open Cards and complete the card application form.' },
      { question: 'How do I block a lost card?', answer: 'Use the card-status control on the Cards page to block it immediately.' },
      { question: 'Can I unblock my card?', answer: 'Yes. Use the same card-status control when the card is safe to use.' },
      { question: 'Can I track a card application?', answer: 'Yes. The application tracker shows the current stage.' }
    ] },
    { name: 'Profile & KYC', icon: 'KY', questions: [
      { question: 'How do I update my profile?', answer: 'Open Profile, edit your details, and save them securely.' },
      { question: 'Why is profile completion required?', answer: 'Your profile must be complete before KYC verification and account opening.' },
      { question: 'How do I submit Aadhaar and PAN details?', answer: 'Enter them during step 2 of the Profile setup.' },
      { question: 'Which KYC documents are required?', answer: 'Aadhaar and PAN documents are mandatory. Address proof is optional.' },
      { question: 'What file formats are accepted?', answer: 'PDF, JPG, and PNG files up to 5 MB are accepted.' }
    ] },
    { name: 'Notifications', icon: 'NT', questions: [
      { question: 'Where can I view notifications?', answer: 'Select the notification icon in the top navigation.' },
      { question: 'What notifications are shown?', answer: 'The frontend currently shows account-created and card-application updates.' },
      { question: 'Why is my card notification pending?', answer: 'Your card application may still be under eligibility and account review.' },
      { question: 'What should I do about an unknown alert?', answer: 'Change your password if necessary and contact Northstar support immediately.' }
    ] }
  ];

  function normalizeItem(item) {
    return { icon: item[0], name: item[1], meta: item[2], value: item[3], status: item[4] || '', progress: item[5], positive: Boolean(item[6]) };
  }

  function responseData(response) {
    return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response;
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
    this.isSupport = params.route === 'support';
    this.isAdmin = params.route === 'admin';
    this.isNotificationHistoryAvailable = this.isNotifications && params.app.currentRole() === 'ADMIN';
    this.statementDownloadStatus = ko.observable('');
    this.actionPanelOpen = ko.observable(this.isProfile);
    this.actionError = ko.observable('');
    this.actionSuccess = ko.observable('');
    this.actionMessages = ko.observableArray([]);
    this.pendingTransferDestination = ko.observable('');
    this.pendingTransferAmount = ko.observable(0);
    this.pendingTransfer = null;
    this.beneficiaryLookup = {};
    this.actionPanelTitle = this.isProfile ? 'Update your profile' : this.isAccounts ? 'Open a new account' : this.isBeneficiaries ? 'Add a beneficiary' : this.isTransfer ? 'Make a new transfer' : this.isCards ? 'Card centre' : this.isNotifications ? 'Notification settings' : 'Review approvals';

    this.supportTopics = SUPPORT_TOPICS;
    this.supportSelectedTopic = ko.observable(null);
    this.supportQuestions = ko.observableArray([]);
    this.supportMessages = ko.observableArray([
      { sender: 'bot', text: 'Hello! I’m the Northstar help assistant. Choose a topic below and I’ll guide you to an answer.' }
    ]);
    this.scrollSupportChat = function () {
      requestAnimationFrame(function () {
        const messageArea = document.querySelector('.support-chat__messages');
        if (messageArea) { messageArea.scrollTop = messageArea.scrollHeight; }
      });
    };
    this.selectSupportTopic = function (topic) {
      self.supportSelectedTopic(topic);
      self.supportQuestions(topic.questions || []);
      self.supportMessages.push({ sender: 'user', text: topic.name });
      self.supportMessages.push({ sender: 'bot', text: 'Choose a ' + topic.name + ' question below.' });
      self.scrollSupportChat();
    };
    this.selectSupportQuestion = function (item) {
      self.supportMessages.push({ sender: 'user', text: item.question });
      self.supportMessages.push({ sender: 'bot', text: item.answer });
      self.scrollSupportChat();
    };
    this.showSupportTopics = function () {
      self.supportSelectedTopic(null);
      self.supportQuestions([]);
      self.supportMessages.push({ sender: 'bot', text: 'Choose another help topic.' });
      self.scrollSupportChat();
    };
    this.resetSupportChat = function () {
      self.supportSelectedTopic(null);
      self.supportQuestions([]);
      self.supportMessages([{ sender: 'bot', text: 'Hello! I’m the Northstar help assistant. Choose a topic below and I’ll guide you to an answer.' }]);
    };

    this.profileFullName = ko.observable('');
    this.profileFatherOrSpouseName = ko.observable('');
    this.profileDateOfBirth = ko.observable('');
    this.profileAddressLine1 = ko.observable('');
    this.profileAddressLine2 = ko.observable('');
    this.profileCity = ko.observable('');
    this.profileState = ko.observable('');
    this.profileCountry = ko.observable('India');
    this.profilePostalCode = ko.observable('');
    this.profileDobMax = new Date(Date.now() + (330 * 60 * 1000)).toISOString().slice(0, 10);
    this.kycAadhaar = ko.observable('');
    this.kycPan = ko.observable('');
    this.kycAadhaarDocumentFile = ko.observable(null);
    this.kycAadhaarDocumentFileName = ko.observable('');
    this.kycPanDocumentFile = ko.observable(null);
    this.kycPanDocumentFileName = ko.observable('');
    this.kycAddressDocumentFile = ko.observable(null);
    this.kycAddressDocumentFileName = ko.observable('');
    this.kycUploadedDocumentTypes = ko.observableArray([]);
    this.profileOnboardingStep = ko.observable(1);
    this.profileOnboardingLoading = ko.observable(this.isProfile);
    this.profileKycStatus = ko.observable('NOT_SUBMITTED');
    this.newAccountType = ko.observable('SAVINGS');
    this.branchIfsc = ko.observable('');
    this.accountOpeningEligible = ko.observable(false);
    this.accountOpeningEligibilityMessage = ko.observable('Checking profile and KYC eligibility...');
    this.selectedAccount = ko.observable(null);
    this.accountPortfolio = ko.observableArray([]);
    this.accountMiniStatement = ko.observableArray([]);
    this.accountDetailLoading = ko.observable(false);
    this.accountDetailError = ko.observable('');
    this.accountMiniStatementLimit = ko.observable(10);
    this.goToProfileSetup = function () { params.app.navigate('profile'); };
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
    this.cardApplicationAccountId = ko.observable('');
    this.cardApplicationType = ko.observable('CREDIT');
    this.cardProduct = ko.observable('GOLD');
    this.cardApplicantIncome = ko.observable(85000);
    this.cardApplicantOccupation = ko.observable('Salaried professional');
    this.cardRequestedLimit = ko.observable(30000);
    this.cardDeliveryAddress = ko.observable('');
    this.cardApplicationSubmitted = ko.observable(false);
    this.cardApplicationReference = ko.observable('Not submitted');
    this.cardApplicationStatus = ko.observable('Not submitted');
    this.cardApplicationTypeLabel = ko.pureComputed(function () {
      return self.cardApplicationType() === 'DEBIT' ? 'Debit card' : 'Credit card';
    });
    this.cardActionLabel = ko.pureComputed(function () {
      if (self.activeCardStatus() === 'INACTIVE' || self.activeCardStatus() === 'ISSUED') { return 'Activate card'; }
      return self.activeCardStatus() === 'BLOCKED' ? 'Unblock card' : 'Block card';
    });
    this.accountNumberValidators = [new RegExpValidator({ pattern: '^\\d{1,30}$', messageSummary: 'Enter a valid account number', messageDetail: 'Use up to 30 digits.' })];
    this.ifscValidators = [new RegExpValidator({ pattern: '^[A-Za-z]{4}0[A-Za-z0-9]{6}$', messageSummary: 'Enter a valid IFSC code', messageDetail: 'Example: HDFC0001234.' })];
    this.currencyConverter = new NumberConverters.IntlNumberConverter({ style: 'currency', currency: 'INR', currencyDisplay: 'symbol' });
    this.transactionDateConverter = new DateTimeConverters.IntlDateTimeConverter({ dateStyle: 'medium' });
    this.adminEnumLabel = function (value) {
      return String(value || '').split('_').map(function (word) {
        return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';
      }).join(' ');
    };
    this.adminMoney = function (value) {
      return self.currencyConverter.format(Number(value || 0));
    };
    this.adminDate = function (value) {
      if (!value) { return 'Not provided'; }
      var date = new Date(value);
      return Number.isNaN(date.getTime()) ? 'Not provided' : self.transactionDateConverter.format(date);
    };
    this.adminShortId = function (value) {
      return String(value || '').slice(0, 8);
    };
    this.adminFileSize = function (value) {
      const bytes = Number(value || 0);
      if (bytes < 1024) { return bytes + ' B'; }
      if (bytes < 1024 * 1024) { return (bytes / 1024).toFixed(1) + ' KB'; }
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    this.adminDocumentActionLabel = function (document) {
      return document && document.contentType === 'application/pdf' ? 'View PDF' : 'View image';
    };

    this.accountTypeOptions = new ArrayDataProvider([
      { value: 'SAVINGS', label: 'Savings account' },
      { value: 'CURRENT', label: 'Current account' },
      { value: 'SALARY', label: 'Salary account' }
    ], { keyAttributes: 'value' });
    this.branchOptionRows = ko.observableArray([]);
    this.branchOptions = new ArrayDataProvider(this.branchOptionRows, { keyAttributes: 'value' });
    this.indiaStateOptions = new ArrayDataProvider([
      'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
      'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
      'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
      'West Bengal'
    ].map(function (state) { return { value: state, label: state }; }), { keyAttributes: 'value' });
    this.transferAccountOptionRows = ko.observableArray([]);
    this.transferBeneficiaryOptionRows = ko.observableArray([]);
    this.transferAccountOptions = new ArrayDataProvider(this.transferAccountOptionRows, { keyAttributes: 'value' });
    this.transferBeneficiaryOptions = new ArrayDataProvider(this.transferBeneficiaryOptionRows, { keyAttributes: 'value' });
    this.beneficiaryRelationshipOptions = new ArrayDataProvider([
      { value: 'FAMILY', label: 'Family' }, { value: 'FRIEND', label: 'Friend' },
      { value: 'SELF', label: 'My account' }, { value: 'BUSINESS', label: 'Business' },
      { value: 'OTHER', label: 'Other' }
    ], { keyAttributes: 'value' });
    this.transactionRows = ko.observableArray([]);
    this.transactionTableData = new ArrayDataProvider(this.transactionRows, { keyAttributes: 'id' });
    this.pagingTransactions = new PagingDataProviderView(this.transactionTableData);
    this.transactionPage = ko.observable(0);
    this.transactionTotalPages = ko.observable(0);
    this.transactionTotalElements = ko.observable(0);
    this.transactionLoading = ko.observable(false);
    this.transactionMode = ko.observable('All transactions');
    this.transactionSelected = ko.observable(null);
    this.transactionStatement = ko.observable(null);
    this.transactionAccountId = ko.observable('');
    this.transactionAccountNumber = ko.observable('');
    this.transactionTypeFilter = ko.observable('');
    this.transactionStatusFilter = ko.observable('');
    this.transactionMinAmount = ko.observable(null);
    this.transactionMaxAmount = ko.observable(null);
    this.transactionReference = ko.observable('');
    this.transactionFromDate = ko.observable('');
    this.transactionToDate = ko.observable('');
    this.transactionSortBy = ko.observable('transactionDate');
    this.transactionDirection = ko.observable('desc');
    this.transactionAccountOptionRows = ko.observableArray([]);
    this.transactionAccountOptions = new ArrayDataProvider(this.transactionAccountOptionRows, { keyAttributes: 'value' });
    this.transactionTypeOptions = new ArrayDataProvider([
      { value: '', label: 'All transaction types' }, { value: 'DEPOSIT', label: 'Deposit' }, { value: 'WITHDRAWAL', label: 'Withdrawal' },
      { value: 'TRANSFER', label: 'Transfer' }, { value: 'BILL_PAYMENT', label: 'Bill payment' }, { value: 'LOAN_REPAYMENT', label: 'Loan repayment' }
    ], { keyAttributes: 'value' });
    this.transactionStatusOptions = new ArrayDataProvider([
      { value: '', label: 'All statuses' }, { value: 'SUCCESS', label: 'Success' }, { value: 'PENDING', label: 'Pending' },
      { value: 'FAILED', label: 'Failed' }, { value: 'REVERSED', label: 'Reversed' }
    ], { keyAttributes: 'value' });
    this.transactionSortOptions = new ArrayDataProvider([
      { value: 'transactionDate', label: 'Date' }, { value: 'amount', label: 'Amount' }, { value: 'status', label: 'Status' },
      { value: 'transactionType', label: 'Transaction type' }, { value: 'referenceNumber', label: 'Reference number' }
    ], { keyAttributes: 'value' });
    this.transactionDirectionOptions = new ArrayDataProvider([{ value: 'desc', label: 'Descending' }, { value: 'asc', label: 'Ascending' }], { keyAttributes: 'value' });
    this.transactionColumns = [
      { headerText: 'Type', field: 'type', width: '70px' },
      { headerText: 'Description', field: 'description' },
      { headerText: 'Date', field: 'date' },
      { headerText: 'Amount', field: 'amount' },
      { headerText: 'Status', field: 'status' }
    ];
    this.cardTypeOptions = new ArrayDataProvider([
      { value: 'CREDIT', label: 'Credit card' },
      { value: 'DEBIT', label: 'Debit card' }
    ], { keyAttributes: 'value' });
    this.cardProductOptions = new ArrayDataProvider([
      { value: 'CLASSIC', label: 'Northstar Classic' },
      { value: 'GOLD', label: 'Northstar Gold - rewards' },
      { value: 'PLATINUM', label: 'Northstar Platinum - premium benefits' }
    ], { keyAttributes: 'value' });
    this.cardAccountOptionRows = ko.observableArray([]);
    this.cardAccountOptions = new ArrayDataProvider(this.cardAccountOptionRows, { keyAttributes: 'value' });
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
    this.loanAccountId = ko.observable('');
    this.loanAccountOptionRows = ko.observableArray([]);
    this.loanAccountOptions = new ArrayDataProvider(this.loanAccountOptionRows, { keyAttributes: 'value' });
    this.adminLoading = ko.observable(false);
    this.adminActionBusy = ko.observable('');
    this.adminDocumentBusy = ko.observable('');
    this.adminLastUpdated = ko.observable('Not loaded');
    this.adminServiceRows = ko.observableArray([]);
    this.adminCardApplications = ko.observableArray([]);
    this.adminLoanApplications = ko.observableArray([]);
    this.adminKycReviews = ko.observableArray([]);

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
      const accountId = self.loanAccountId();
      const loanTypeMap = {
        'Personal loan': 'PERSONAL',
        'Home loan': 'HOME',
        'Vehicle loan': 'VEHICLE',
        'Education loan': 'EDUCATION',
        'Gold loan': 'PERSONAL',
        'Custom loan': 'BUSINESS'
      };
      const employmentMap = {
        'Salaried': 'SALARIED',
        'Self-employed': 'SELF_EMPLOYED',
        'Business owner': 'BUSINESS_OWNER'
      };
      if (!accountId) {
        self.loanError('Choose the bank account that should be linked to this loan.');
        return false;
      }
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
      self.loanError(''); self.loanInfo('Checking the estimate and submitting your application...');
      api.request('/api/loans/calculate', { method: 'POST', body: JSON.stringify({ loanAmount: amount, annualInterestRate: self.selectedLoanRate(), tenureMonths: Number(self.loanTenure()), startDate: null }) }, params.app.authToken()).then(function (response) {
        const estimate = responseData(response) || {};
        self.loanInfo('Estimated EMI: ' + self.currencyConverter.format(Number(estimate.monthlyEmi || 0)) + ' per month. Submitting application...');
        return api.request('/api/loans/applications', { method: 'POST', body: JSON.stringify({
          linkedAccountId: accountId,
          loanType: loanTypeMap[self.loanType()] || 'PERSONAL',
          requestedAmount: amount,
          tenureMonths: Number(self.loanTenure()),
          monthlyIncome: income,
          employmentType: employmentMap[self.employmentType()] || 'OTHER',
          purpose: self.loanPurpose()
        }) }, params.app.authToken());
      }).then(function (response) {
        const application = responseData(response) || {};
        self.applicationReference(application.applicationId || 'Submitted');
        self.loanApplicationSubmitted(true);
        self.loanInfo('Your loan application was submitted and is awaiting bank review.');
        self.loadLoanData();
      }).catch(function (error) { self.loanInfo(''); self.loanError(error.message || 'Unable to submit the loan application.'); });
      return false;
    };
    this.startAnotherApplication = function () {
      self.loanApplicationSubmitted(false);
      self.applicationReference('');
      self.loanError('');
    };
    this.loadLoanData = function () {
      if (!self.isLoans) { return; }
      const token = params.app.authToken();
      api.request('/api/accounts', {}, token).then(function (response) {
        const accounts = responseData(response) || [];
        const activeAccounts = accounts.filter(function (account) { return account.status === 'ACTIVE'; });
        self.loanAccountOptionRows(activeAccounts.map(function (account) {
          const number = String(account.accountNumber || '');
          return { value: account.accountId, label: String(account.accountType || 'Account').replace(/_/g, ' ') + ' - ending ' + number.slice(-4) };
        }));
        if (activeAccounts.length && !activeAccounts.some(function (account) { return account.accountId === self.loanAccountId(); })) {
          self.loanAccountId(activeAccounts[0].accountId);
        }
      }).catch(function (error) {
        self.loanError(error.message || 'Unable to load active accounts for the loan application.');
      });
      Promise.all([
        api.request('/api/loans', {}, token),
        api.request('/api/loans/applications', {}, token)
      ]).then(function (responses) {
        const loans = responseData(responses[0]) || [];
        const applications = responseData(responses[1]) || [];
        const loanRows = loans.map(function (loan) { return { icon: String(loan.loanType || 'LN').slice(0, 2), name: String(loan.loanType || 'Loan').replace(/_/g, ' '), meta: 'Loan ending ' + String(loan.loanNumber || '').slice(-4) + ' - EMI ' + self.currencyConverter.format(Number(loan.emiAmount || 0)), value: self.currencyConverter.format(Number(loan.outstandingBalance || 0)), status: loan.status }; });
        const applicationRows = applications.map(function (application) { return { icon: 'AP', name: String(application.loanType || 'Loan').replace(/_/g, ' ') + ' application', meta: 'Reference ' + String(application.applicationId || '').slice(0, 8), value: self.currencyConverter.format(Number(application.requestedAmount || 0)), status: application.status }; });
        self.items(loanRows.concat(applicationRows));
        const outstanding = loans.reduce(function (sum, loan) { return sum + Number(loan.outstandingBalance || 0); }, 0);
        self.highlights([{ label: 'Outstanding', value: self.currencyConverter.format(outstanding) }, { label: 'Active loans', value: String(loans.filter(function (loan) { return loan.status === 'ACTIVE'; }).length) }, { label: 'Applications', value: String(applications.length) }]);
      }).catch(function (error) { self.loanError(error.message || 'Unable to load loan details.'); });
    };
    this.transactionDate = function (value) {
      if (!value || String(value).trim().toLowerCase() === 'null') { return 'Date unavailable'; }
      const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : self.transactionDateConverter.format(date);
    };
    this.transactionAmount = function (transaction) {
      return (transaction.debitCredit === 'DEBIT' ? '-' : '+') + self.currencyConverter.format(Number(transaction.amount || 0));
    };
    this.transactionIcon = function (value) { return String(value || 'TX').slice(0, 2); };
    this.transactionEnum = function (value) { return String(value || 'Not provided').replace(/_/g, ' '); };
    this.transactionAddQuery = function (parts, name, value) {
      if (value !== null && value !== undefined && String(value).trim() !== '') { parts.push(encodeURIComponent(name) + '=' + encodeURIComponent(String(value).trim())); }
    };
    this.transactionInstant = function (value, endOfDay) { return value ? value + (endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z') : ''; };
    this.applyTransactionPage = function (response, label) {
      const page = responseData(response) || {};
      const transactions = Array.isArray(page.content) ? page.content : [];
      self.transactionRows(transactions);
      self.transactionPage(Number(page.number || 0)); self.transactionTotalPages(Number(page.totalPages || 0)); self.transactionTotalElements(Number(page.totalElements == null ? transactions.length : page.totalElements));
      self.transactionMode(label);
      const incoming = transactions.filter(function (item) { return item.debitCredit === 'CREDIT'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
      const outgoing = transactions.filter(function (item) { return item.debitCredit === 'DEBIT'; }).reduce(function (sum, item) { return sum + Number(item.amount || 0); }, 0);
      self.highlights([{ label: 'Outgoing on page', value: self.currencyConverter.format(outgoing) }, { label: 'Incoming on page', value: self.currencyConverter.format(incoming) }, { label: 'Matching transactions', value: String(self.transactionTotalElements()) }]);
    };
    this.fetchTransactions = function (mode, pageNumber) {
      const token = params.app.authToken(); const parts = []; const page = pageNumber == null ? self.transactionPage() : pageNumber;
      self.transactionAddQuery(parts, 'page', page); self.transactionAddQuery(parts, 'size', 20);
      let path = '/api/transactions'; let label = 'All transactions';
      if (mode === 'account') {
        if (!self.transactionAccountId()) { self.statementDownloadStatus('Choose an account first.'); return Promise.resolve(); }
        path = '/api/transactions/account/' + encodeURIComponent(self.transactionAccountId()); label = 'Selected account';
      } else if (mode === 'search') {
        path = '/api/transactions/search'; label = 'Filtered search';
        self.transactionAddQuery(parts, 'accountId', self.transactionAccountId()); self.transactionAddQuery(parts, 'accountNumber', self.transactionAccountNumber());
        self.transactionAddQuery(parts, 'transactionType', self.transactionTypeFilter()); self.transactionAddQuery(parts, 'status', self.transactionStatusFilter());
        self.transactionAddQuery(parts, 'minAmount', self.transactionMinAmount()); self.transactionAddQuery(parts, 'maxAmount', self.transactionMaxAmount());
        self.transactionAddQuery(parts, 'referenceNumber', self.transactionReference()); self.transactionAddQuery(parts, 'fromDate', self.transactionInstant(self.transactionFromDate(), false));
        self.transactionAddQuery(parts, 'toDate', self.transactionInstant(self.transactionToDate(), true)); self.transactionAddQuery(parts, 'sortBy', self.transactionSortBy()); self.transactionAddQuery(parts, 'direction', self.transactionDirection());
      }
      self.transactionLoading(true); self.statementDownloadStatus(''); self.transactionPage(page);
      return api.request(path + '?' + parts.join('&'), {}, token).then(function (response) { self.applyTransactionPage(response, label); })
        .catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to load transactions.'); })
        .then(function () { self.transactionLoading(false); });
    };
    this.loadTransactionData = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || !self.isTransactions) { return; }
      self.transactionLoading(true);
      return Promise.all([
        api.request('/api/accounts', {}, token).then(function (response) {
          const accounts = responseData(response) || [];
          self.transactionAccountOptionRows(accounts.map(function (account) { return { value: account.accountId, label: self.accountTypeLabel(account.accountType) + ' · ending ' + String(account.accountNumber || '').slice(-4) }; }));
          if (!self.transactionAccountId() && accounts.length) { self.transactionAccountId(accounts[0].accountId); }
        }),
        self.fetchTransactions('all', 0)
      ]).catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to initialize transaction history.'); }).then(function () { self.transactionLoading(false); });
    };
    this.searchTransactions = function () {
      if (self.transactionFromDate() && self.transactionToDate() && self.transactionFromDate() > self.transactionToDate()) { self.statementDownloadStatus('The transaction start date must be before the end date.'); return false; }
      if (self.transactionMinAmount() != null && self.transactionMaxAmount() != null && Number(self.transactionMinAmount()) > Number(self.transactionMaxAmount())) { self.statementDownloadStatus('Minimum amount cannot exceed maximum amount.'); return false; }
      self.transactionStatement(null); self.transactionPage(0); self.fetchTransactions('search', 0); return false;
    };
    this.showAllTransactions = function () { self.transactionStatement(null); self.transactionPage(0); return self.fetchTransactions('all', 0); };
    this.showAccountTransactions = function () { self.transactionStatement(null); self.transactionPage(0); return self.fetchTransactions('account', 0); };
    this.clearTransactionFilters = function () {
      self.transactionAccountNumber(''); self.transactionTypeFilter(''); self.transactionStatusFilter(''); self.transactionMinAmount(null); self.transactionMaxAmount(null); self.transactionReference(''); self.transactionFromDate(''); self.transactionToDate(''); self.transactionSortBy('transactionDate'); self.transactionDirection('desc');
      return self.showAllTransactions();
    };
    this.previousTransactionPage = function () { if (self.transactionPage() > 0) { const mode = self.transactionMode() === 'Filtered search' ? 'search' : self.transactionMode() === 'Selected account' ? 'account' : 'all'; return self.fetchTransactions(mode, self.transactionPage() - 1); } };
    this.nextTransactionPage = function () { if (self.transactionPage() + 1 < self.transactionTotalPages()) { const mode = self.transactionMode() === 'Filtered search' ? 'search' : self.transactionMode() === 'Selected account' ? 'account' : 'all'; return self.fetchTransactions(mode, self.transactionPage() + 1); } };
    this.openTransactionDetail = function (row) {
      self.statementDownloadStatus('');
      return api.request('/api/transactions/' + encodeURIComponent(row.transactionId), {}, params.app.authToken()).then(function (response) { self.transactionSelected(responseData(response)); })
        .catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to open transaction detail.'); });
    };
    this.closeTransactionDetail = function () { self.transactionSelected(null); };
    this.loadStatementData = function () {
      if (!self.transactionAccountId()) { self.statementDownloadStatus('Choose an account before loading statement data.'); return; }
      const parts = []; self.transactionAddQuery(parts, 'accountId', self.transactionAccountId()); self.transactionAddQuery(parts, 'fromDate', self.transactionInstant(self.transactionFromDate(), false)); self.transactionAddQuery(parts, 'toDate', self.transactionInstant(self.transactionToDate(), true));
      self.transactionLoading(true); self.statementDownloadStatus('');
      return api.request('/api/transactions/statement?' + parts.join('&'), {}, params.app.authToken()).then(function (response) { self.transactionStatement(responseData(response)); self.transactionMode('Statement data'); })
        .catch(function (error) { self.statementDownloadStatus(error.message || 'Unable to load statement data.'); }).then(function () { self.transactionLoading(false); });
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
      self.profileOnboardingLoading(true);
      const profileRequest = api.request('/api/customers/me', {}, token).then(responseData).catch(function (error) {
        self.actionError(error.message || 'Unable to load your profile.'); return null;
      });
      const kycRequest = api.request('/api/customers/me/kyc', {}, token).then(responseData).catch(function (error) {
        if (error.status !== 404) { self.actionError(error.message || 'Unable to load KYC status.'); }
        return null;
      });
      const documentsRequest = api.request('/api/customers/me/kyc/documents', {}, token).then(responseData).catch(function (error) {
        if (error.status !== 404) { self.actionError(error.message || 'Unable to load KYC documents.'); }
        return [];
      });
      return Promise.all([profileRequest, kycRequest, documentsRequest]).then(function (results) {
        const profile = results[0] || {};
        const kyc = results[1];
        const documents = Array.isArray(results[2]) ? results[2] : [];
        const documentTypes = documents.map(function (document) { return document.documentType; });
        const requiredDocumentsComplete = documentTypes.indexOf('AADHAAR') >= 0 && documentTypes.indexOf('PAN') >= 0;
        const profileComplete = isCustomerProfileComplete(profile);
        self.kycUploadedDocumentTypes(documentTypes);
        self.profileFullName(profile.fullName || '');
        self.profileFatherOrSpouseName(profile.fatherOrSpouseName || '');
        self.profileDateOfBirth(profile.dateOfBirth || '');
        self.profileAddressLine1(profile.addressLine1 || '');
        self.profileAddressLine2(profile.addressLine2 || '');
        self.profileCity(profile.city || ''); self.profileState(profile.state || '');
        self.profileCountry(profile.country || 'India'); self.profilePostalCode(profile.postalCode || '');
        params.app.customerName(profile.fullName || params.app.customerName());
        self.profileKycStatus(kyc && kyc.status ? kyc.status : 'NOT_SUBMITTED');
        self.highlights.splice(0, 1, { label: 'Profile status', value: profileComplete ? 'COMPLETE' : 'INCOMPLETE' });
        self.highlights.splice(1, 1, { label: 'KYC status', value: self.profileKycStatus() });
        if (!profileComplete) { self.profileOnboardingStep(1); }
        else if (!kyc) { self.profileOnboardingStep(2); }
        else if (!requiredDocumentsComplete && kyc.status !== 'VERIFIED') { self.profileOnboardingStep(3); }
        else { self.profileOnboardingStep(4); }
      }).finally(function () { self.profileOnboardingLoading(false); });
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
        self.actionError(''); self.actionSuccess('Personal and address details saved successfully.'); self.showActionMessage('confirmation', 'Step 1 complete', self.actionSuccess()); self.profileOnboardingStep(2); return self.loadProfileData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to update your profile.'); self.showActionMessage('error', 'Profile needs attention', self.actionError()); });
      return false;
    };
    this.selectProfileKycDocument = function (event, fileObservable, nameObservable) {
      const files = event.detail && event.detail.files;
      const file = files && files[0];
      if (file && file.size > 5 * 1024 * 1024) { self.actionError('KYC documents must be 5 MB or smaller.'); fileObservable(null); nameObservable(''); return; }
      fileObservable(file || null); nameObservable(file ? file.name : ''); self.actionError('');
    };
    this.onProfileAadhaarDocumentSelect = function (event) { self.selectProfileKycDocument(event, self.kycAadhaarDocumentFile, self.kycAadhaarDocumentFileName); };
    this.onProfilePanDocumentSelect = function (event) { self.selectProfileKycDocument(event, self.kycPanDocumentFile, self.kycPanDocumentFileName); };
    this.onProfileAddressDocumentSelect = function (event) { self.selectProfileKycDocument(event, self.kycAddressDocumentFile, self.kycAddressDocumentFileName); };
    this.hasUploadedKycDocument = function (documentType) { return self.kycUploadedDocumentTypes().indexOf(documentType) >= 0; };
    this.submitKycIdentity = function () {
      const aadhaar = self.kycAadhaar().replace(/\s/g, '');
      const pan = self.kycPan().trim().toUpperCase();
      if (!/^\d{12}$/.test(aadhaar) || !/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) { self.actionError('Enter a valid 12-digit Aadhaar number and PAN in the format ABCDE1234F.'); return false; }
      const token = params.app.authToken();
      api.request('/api/customers/me/kyc', { method: 'PUT', body: JSON.stringify({ aadhaarNumber: aadhaar, panNumber: pan }) }, token).then(function () {
        self.actionError(''); self.actionSuccess('Aadhaar and PAN saved. Upload your KYC proof to finish.'); self.showActionMessage('confirmation', 'Step 2 complete', self.actionSuccess()); self.profileKycStatus('PENDING'); self.profileOnboardingStep(3);
      }).catch(function (error) { self.actionError(error.message || 'Unable to submit Aadhaar and PAN details.'); self.showActionMessage('error', 'Identity details need attention', self.actionError()); });
      return false;
    };
    this.submitKycDocument = function () {
      const aadhaarReady = self.hasUploadedKycDocument('AADHAAR') || Boolean(self.kycAadhaarDocumentFile());
      const panReady = self.hasUploadedKycDocument('PAN') || Boolean(self.kycPanDocumentFile());
      if (!aadhaarReady || !panReady) { self.actionError('Upload both Aadhaar and PAN documents. Address proof is optional.'); return false; }
      const token = params.app.authToken();
      const selectedDocuments = [
        { documentType: 'AADHAAR', file: self.kycAadhaarDocumentFile() },
        { documentType: 'PAN', file: self.kycPanDocumentFile() },
        { documentType: 'ADDRESS_PROOF', file: self.kycAddressDocumentFile() }
      ].filter(function (document) { return Boolean(document.file); });
      const uploads = selectedDocuments.map(function (document) {
        const form = new FormData(); form.append('documentType', document.documentType); form.append('file', document.file);
        return api.upload('/api/customers/me/kyc/documents', form, token);
      });
      Promise.all(uploads).then(function () {
        self.actionError(''); self.actionSuccess('Required Aadhaar and PAN documents uploaded successfully. KYC was submitted for bank review.'); self.showActionMessage('confirmation', 'Account setup complete', self.actionSuccess()); self.profileOnboardingStep(4); self.loadProfileData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to upload the KYC documents.'); self.showActionMessage('error', 'Document upload needs attention', self.actionError()); });
      return false;
    };
    this.openAccountDetail = function (account) {
      if (!account || !account.accountId) { return; }
      const token = params.app.authToken();
      self.accountDetailLoading(true);
      self.accountDetailError('');
      const detailRequest = api.request('/api/accounts/' + encodeURIComponent(account.accountId), {}, token).then(function (response) {
        self.selectedAccount(responseData(response) || {});
      });
      const statementRequest = api.request('/api/accounts/' + encodeURIComponent(account.accountId) + '/mini-statement?limit=' + encodeURIComponent(self.accountMiniStatementLimit()), {}, token).then(function (response) {
        const statement = responseData(response) || {};
        self.accountMiniStatement(Array.isArray(statement.transactions) ? statement.transactions : []);
      });
      return Promise.all([detailRequest, statementRequest]).catch(function (error) {
        self.accountDetailError(error.message || 'Unable to load the account detail and mini-statement.');
      }).then(function () { self.accountDetailLoading(false); });
    };
    this.refreshAccountDetail = function () {
      const account = self.selectedAccount();
      if (account) { return self.openAccountDetail(account); }
    };
    this.accountTransactionAmount = function (transaction) {
      return (transaction.debitCredit === 'DEBIT' ? '-' : '+') + self.currencyConverter.format(Number(transaction.amount || 0));
    };
    this.accountMoney = function (value) { return self.currencyConverter.format(Number(value || 0)); };
    this.accountTypeLabel = function (value) { return String(value || 'Account').replace(/_/g, ' '); };
    this.accountTransactionIcon = function (value) { return String(value || 'TX').slice(0, 2); };
    this.accountTransactionDate = function (value) {
      if (!value || String(value).trim().toLowerCase() === 'null') { return 'Date unavailable'; }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : self.transactionDateConverter.format(date);
    };
    this.accountCreatedDate = function (value) {
      if (!value || String(value).trim().toLowerCase() === 'null') { return 'Not available'; }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : self.transactionDateConverter.format(date);
    };
    this.loadAccountsData = function () {
      const token = params.app && params.app.authToken && params.app.authToken();
      if (!token || !self.isAccounts) { return; }
      Promise.all([
        api.request('/api/accounts', {}, token),
        api.request('/api/branches', {}, token),
        api.request('/api/customers/me', {}, token).then(responseData).catch(function () { return null; }),
        api.request('/api/customers/me/kyc', {}, token).then(responseData).catch(function () { return null; })
      ]).then(function (responses) {
        const accounts = responseData(responses[0]) || [];
        const branches = responseData(responses[1]) || [];
        const profileComplete = isCustomerProfileComplete(responses[2]);
        const kycVerified = Boolean(responses[3] && responses[3].status === 'VERIFIED');
        self.accountOpeningEligible(profileComplete && kycVerified);
        self.accountOpeningEligibilityMessage(!profileComplete ? 'Complete Step 1: personal and address details' : !kycVerified ? 'KYC must be verified before account opening' : 'Profile complete and KYC verified');
        const total = accounts.reduce(function (sum, account) { return sum + Number(account.availableBalance || 0); }, 0);
        self.highlights([{ label: 'Total balance', value: self.currencyConverter.format(total) }, { label: 'Available now', value: self.currencyConverter.format(total) }, { label: 'Active accounts', value: String(accounts.filter(function (account) { return account.status === 'ACTIVE'; }).length) }]);
        const portfolio = accounts.map(function (account) {
          const number = String(account.accountNumber || '');
          return { accountId: account.accountId, icon: String(account.accountType || 'AC').slice(0, 2), name: String(account.accountType || 'Account').replace(/_/g, ' '), meta: '•••• ' + number.slice(-4) + ' · ' + account.branchIfsc, value: self.currencyConverter.format(Number(account.availableBalance || 0)), status: account.status || '', primaryAccount: Boolean(account.primaryAccount) };
        });
        self.items(portfolio);
        self.accountPortfolio(portfolio);
        self.branchOptionRows(branches.map(function (branch) { return { value: branch.ifsc, label: branch.branchName + ' · ' + branch.city + ' · ' + branch.ifsc }; }));
        if (!self.branchIfsc() && branches.length) { self.branchIfsc(branches[0].ifsc); }
        if (accounts.length) {
          const selectedId = self.selectedAccount() && self.selectedAccount().accountId;
          const selected = accounts.find(function (account) { return account.accountId === selectedId; }) || accounts[0];
          self.openAccountDetail(selected);
        } else {
          self.accountPortfolio([]); self.selectedAccount(null); self.accountMiniStatement([]);
        }
      }).catch(function (error) { self.actionError(error.message || 'Unable to load account details.'); });
    };
    this.submitNewAccount = function () {
      if (!self.accountOpeningEligible()) { self.actionError(self.accountOpeningEligibilityMessage()); self.showActionMessage('error', 'Complete account setup first', self.actionError()); return false; }
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
        const verifiedBeneficiaries = beneficiaries.filter(function (beneficiary) { return beneficiary.status === 'VERIFIED'; });
        const activeAccounts = accounts.filter(function (account) { return account.status === 'ACTIVE'; });
        self.transferBeneficiaryOptionRows(verifiedBeneficiaries.map(function (beneficiary) {
          const accountNumber = String(beneficiary.accountNumber || '');
          return { value: beneficiary.beneficiaryId, label: beneficiary.beneficiaryName + ' · •••• ' + accountNumber.slice(-4) };
        }));
        self.transferAccountOptionRows(activeAccounts.map(function (account) {
          const accountNumber = String(account.accountNumber || '');
          return { value: account.accountId, label: account.accountType + ' · •••• ' + accountNumber.slice(-4) };
        }));
        if (!self.transferBeneficiary() && verifiedBeneficiaries.length) { self.transferBeneficiary(verifiedBeneficiaries[0].beneficiaryId); }
        if (!self.transferFrom() && activeAccounts.length) { self.transferFrom(activeAccounts[0].accountId); }
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
      const token = params.app.authToken();
      Promise.all([
        api.request('/api/cards', {}, token),
        api.request('/api/accounts', {}, token),
        api.request('/api/cards/applications', {}, token)
      ]).then(function (responses) {
        const cards = responseData(responses[0]) || [];
        const accounts = responseData(responses[1]) || [];
        const applications = responseData(responses[2]) || [];
        const activeAccounts = accounts.filter(function (account) { return account.status === 'ACTIVE'; });
        self.cardAccountOptionRows(activeAccounts.map(function (account) {
          const number = String(account.accountNumber || '');
          return { value: account.accountId, label: String(account.accountType || 'Account').replace(/_/g, ' ') + ' - ending ' + number.slice(-4) };
        }));
        if (!self.cardApplicationAccountId() && activeAccounts.length) { self.cardApplicationAccountId(activeAccounts[0].accountId); }
        self.items(cards.map(function (card) { return { icon: String(card.cardType || 'DC').slice(0, 2), name: String(card.cardType || 'Debit') + ' card', meta: card.maskedCardNumber + ' · expires ' + card.expiryMonth + '/' + card.expiryYear, value: self.currencyConverter.format(Number(card.dailyTransactionLimit || 0)), status: card.status }; }));
        self.highlights([{ label: 'Cards', value: String(cards.length) }, { label: 'Active', value: String(cards.filter(function (card) { return card.status === 'ACTIVE'; }).length) }, { label: 'Blocked', value: String(cards.filter(function (card) { return card.status === 'BLOCKED'; }).length) }]);
        if (cards.length) {
          const card = cards[0]; self.activeCardId(card.cardId); self.activeCardName(String(card.cardType || 'Debit') + ' card ' + card.maskedCardNumber); self.activeCardStatus(card.status); self.cardLocked(card.status === 'BLOCKED');
        }
        if (applications.length) {
          const latest = applications[0];
          self.cardApplicationType(latest.cardType || self.cardApplicationType());
          self.cardProduct(latest.cardProduct || self.cardProduct());
          self.cardApplicationReference(latest.applicationId || 'Submitted');
          self.cardApplicationStatus(latest.status || 'PENDING');
          self.cardApplicationSubmitted(true);
        }
      }).catch(function (error) { self.actionError(error.message || 'Unable to load your cards.'); });
    };
    this.toggleCardLock = function () {
      if (!self.activeCardId()) { self.actionError('No card is available for this action.'); return; }
      let endpoint = '/block';
      if (self.activeCardStatus() === 'BLOCKED') { endpoint = '/unblock'; }
      if (self.activeCardStatus() === 'INACTIVE' || self.activeCardStatus() === 'ISSUED') { endpoint = '/activate'; }
      const options = { method: 'POST' };
      if (endpoint === '/block') { options.body = JSON.stringify({ reason: 'Customer requested temporary block' }); }
      api.request('/api/cards/' + encodeURIComponent(self.activeCardId()) + endpoint, options, params.app.authToken()).then(function (response) {
        const card = responseData(response) || {}; self.activeCardStatus(card.status || self.activeCardStatus()); self.cardLocked(self.activeCardStatus() === 'BLOCKED'); self.actionError(''); self.actionSuccess('Card status updated to ' + self.activeCardStatus() + '.'); self.loadCardData();
      }).catch(function (error) { self.actionError(error.message || 'Unable to update the card status.'); });
    };
    this.submitCardApplication = function () {
      self.actionSuccess('');
      const accountId = self.cardApplicationAccountId();
      const monthlyIncome = Number(self.cardApplicantIncome());
      const requestedLimit = Number(self.cardRequestedLimit());
      const address = self.cardDeliveryAddress().trim();
      if (!accountId || !self.cardApplicationType() || !self.cardProduct()) {
        self.actionError('Choose an account, card type, and card product.');
        return false;
      }
      if (!monthlyIncome || monthlyIncome < 1 || !requestedLimit || requestedLimit < 1 || !address) {
        self.actionError('Enter your monthly income, requested daily limit, and complete delivery address.');
        return false;
      }
      self.actionError('');
      self.cardApplicationStatus('Submitting...');
      api.request('/api/cards/applications', { method: 'POST', body: JSON.stringify({
        accountId: accountId,
        cardType: self.cardApplicationType(),
        cardProduct: self.cardProduct(),
        annualIncome: monthlyIncome * 12,
        occupation: self.cardApplicantOccupation().trim() || 'Not specified',
        deliveryAddress: address,
        requestedDailyLimit: requestedLimit
      }) }, params.app.authToken()).then(function (response) {
        const application = responseData(response) || {};
        self.cardApplicationReference(application.applicationId || 'Submitted');
        self.cardApplicationStatus(application.status || 'PENDING');
        self.cardApplicationSubmitted(true);
        self.actionSuccess('Your card application was submitted successfully for bank review.');
        self.showActionMessage('confirmation', 'Card application submitted', self.actionSuccess());
        self.loadCardData();
      }).catch(function (error) {
        self.cardApplicationStatus('Needs attention');
        self.actionError(error.message || 'Unable to submit the card application.');
        self.showActionMessage('error', 'Card application needs attention', self.actionError());
      });
      return false;
    };
    this.loadNotificationData = function () {
      if (!self.isNotifications) { return; }
      self.highlights([]);
      self.items([
        { icon: 'AC', name: 'Account created', meta: 'Your new Northstar bank account was created successfully.', value: 'Recent', status: 'New', progress: null, positive: false },
        { icon: 'CA', name: 'Card application submitted', meta: 'Your card application was received and is under review.', value: 'Recent', status: 'New', progress: null, positive: false }
      ]);
      self.secondaryItems([]);
    };
    this.updateAdminHighlights = function () {
      const unavailable = self.adminServiceRows().filter(function (row) { return row.status !== 'AVAILABLE'; }).length;
      self.highlights([
        { label: 'Pending KYC reviews', value: String(self.adminKycReviews().length) },
        { label: 'Pending card applications', value: String(self.adminCardApplications().length) },
        { label: 'Pending loan applications', value: String(self.adminLoanApplications().length) }
      ]);
      self.secondaryItems([
        { icon: 'API', name: 'Operational APIs', meta: 'Admin dashboard requests completed on page entry', value: String(self.adminServiceRows().length), status: unavailable ? unavailable + ' unavailable' : 'All available', progress: unavailable ? 70 : 100 },
        { icon: 'KYC', name: 'Identity verification', meta: 'Approvals enable customer account opening', value: String(self.adminKycReviews().length), status: 'Pending' },
        { icon: 'AP', name: 'Product approvals', meta: 'Card and loan applications awaiting a decision', value: String(self.adminCardApplications().length + self.adminLoanApplications().length), status: 'Pending' }
      ]);
    };
    this.loadAdminApprovalQueues = function () {
      const token = params.app.authToken();
      return Promise.all([
        api.request('/api/cards/admin/applications?status=PENDING&page=0&size=50', {}, token)
          .then(responseData).catch(function (error) { return { failed: true, message: 'Card approvals: ' + error.message }; }),
        api.request('/api/loans/admin/applications?status=PENDING&page=0&size=50', {}, token)
          .then(responseData).catch(function (error) { return { failed: true, message: 'Loan approvals: ' + error.message }; }),
        api.request('/api/customers/kyc/reviews?status=PENDING', {}, token)
          .then(responseData).catch(function (error) { return { failed: true, message: 'KYC approvals: ' + error.message }; })
      ]).then(function (responses) {
        self.adminCardApplications(Array.isArray(responses[0]) ? responses[0] : []);
        self.adminLoanApplications(Array.isArray(responses[1]) ? responses[1] : []);
        const kycReviews = Array.isArray(responses[2]) ? responses[2].map(function (review) {
          return Object.assign({}, review, {
            documents: ko.observableArray([]),
            documentsLoading: ko.observable(true),
            documentsError: ko.observable('')
          });
        }) : [];
        self.adminKycReviews(kycReviews);
        const failures = responses.filter(function (response) { return response && response.failed; });
        if (failures.length) { self.actionError(failures.map(function (failure) { return failure.message; }).join(' | ')); }
        self.updateAdminHighlights();
        return Promise.all(kycReviews.map(function (review) {
          return api.request('/api/customers/' + encodeURIComponent(review.userId) + '/kyc/documents', {}, token)
            .then(function (response) {
              const documents = responseData(response);
              review.documents(Array.isArray(documents) ? documents : []);
            }).catch(function (error) {
              review.documentsError(error.message || 'Unable to load this customer\'s documents.');
            }).finally(function () {
              review.documentsLoading(false);
            });
        }));
      });
    };
    this.loadAdminData = function () {
      if (!self.isAdmin || params.app.currentRole() !== 'ADMIN') { return Promise.resolve(); }
      const token = params.app.authToken();
      const operations = [
        ['Dashboard', '/api/admin/dashboard'],
        ['Customers', '/api/admin/customers?page=0&size=10'],
        ['Accounts', '/api/admin/accounts?page=0&size=10'],
        ['Beneficiaries', '/api/admin/beneficiaries?page=0&size=10'],
        ['Transactions', '/api/admin/transactions?page=0&size=10'],
        ['Workflows', '/api/admin/workflows?page=0&size=10'],
        ['Loans', '/api/admin/loans?page=0&size=10'],
        ['Cards', '/api/admin/cards?page=0&size=10'],
        ['Branches', '/api/admin/branches?page=0&size=10'],
        ['Bill payments', '/api/admin/bill-payments?page=0&size=10'],
        ['Schedules', '/api/admin/schedules?page=0&size=10'],
        ['Audit summary', '/api/admin/audit-summary'],
        ['System health', '/api/admin/system']
      ];
      self.adminLoading(true);
      self.actionError('');
      const operationalRequests = operations.map(function (operation) {
        return api.request(operation[1], {}, token).then(function (response) {
          const payload = responseData(response);
          let count = '';
          if (Array.isArray(payload)) { count = String(payload.length); }
          else if (payload && Array.isArray(payload.items)) { count = String(payload.items.length); }
          else if (payload && payload.sections) { count = String(Object.keys(payload.sections).length); }
          else if (payload && payload.services) { count = String(Object.keys(payload.services).length); }
          return { name: operation[0], endpoint: operation[1], status: 'AVAILABLE', count: count || 'Ready' };
        }).catch(function (error) {
          return { name: operation[0], endpoint: operation[1], status: 'UNAVAILABLE', count: error.status ? 'HTTP ' + error.status : 'Failed' };
        });
      });
      return Promise.all([Promise.all(operationalRequests), self.loadAdminApprovalQueues()]).then(function (results) {
        self.adminServiceRows(results[0]);
        self.items(results[0].map(function (row) {
          return { icon: row.name.slice(0, 2).toUpperCase(), name: row.name, meta: row.endpoint, value: row.count, status: row.status };
        }));
        self.adminLastUpdated(self.transactionDateConverter.format(new Date()));
        self.updateAdminHighlights();
      }).catch(function (error) {
        self.actionError(error.message || 'Unable to load the admin approval queues.');
      }).finally(function () {
        self.adminLoading(false);
      });
    };
    this.approveCardApplication = function (application) {
      const actionId = 'card-' + application.applicationId;
      if (self.adminActionBusy()) { return; }
      self.adminActionBusy(actionId); self.actionError(''); self.actionSuccess('');
      api.request('/api/cards/admin/applications/' + encodeURIComponent(application.applicationId) + '/approve', {
        method: 'POST',
        body: JSON.stringify({ approvedDailyLimit: Number(application.requestedDailyLimit || 30000), notes: 'Approved from admin dashboard' })
      }, params.app.authToken()).then(function () {
        self.actionSuccess('Card application approved and the card was issued successfully.');
        return self.loadAdminApprovalQueues();
      }).catch(function (error) {
        self.actionError(error.message || 'Unable to approve the card application.');
      }).finally(function () { self.adminActionBusy(''); });
    };
    this.approveLoanApplication = function (application) {
      const actionId = 'loan-' + application.applicationId;
      const rates = { HOME: 8.35, VEHICLE: 9.25, PERSONAL: 10.4, EDUCATION: 8.75, BUSINESS: 11.25 };
      if (self.adminActionBusy()) { return; }
      self.adminActionBusy(actionId); self.actionError(''); self.actionSuccess('');
      api.request('/api/loans/admin/applications/' + encodeURIComponent(application.applicationId) + '/approve', {
        method: 'POST',
        body: JSON.stringify({
          approvedAmount: Number(application.requestedAmount),
          annualInterestRate: rates[application.loanType] || 10.4,
          tenureMonths: Number(application.requestedTenureMonths),
          startDate: null,
          notes: 'Approved from admin dashboard'
        })
      }, params.app.authToken()).then(function () {
        self.actionSuccess('Loan application approved and the loan account was created successfully.');
        return self.loadAdminApprovalQueues();
      }).catch(function (error) {
        self.actionError(error.message || 'Unable to approve the loan application.');
      }).finally(function () { self.adminActionBusy(''); });
    };
    this.approveKycReview = function (review) {
      const actionId = 'kyc-' + review.userId;
      if (self.adminActionBusy()) { return; }
      self.adminActionBusy(actionId); self.actionError(''); self.actionSuccess('');
      api.request('/api/customers/' + encodeURIComponent(review.userId) + '/kyc/status', {
        method: 'PUT', body: JSON.stringify({ status: 'VERIFIED', rejectionReason: null })
      }, params.app.authToken()).then(function () {
        self.actionSuccess('KYC approved. The customer is now eligible to open an account.');
        return self.loadAdminApprovalQueues();
      }).catch(function (error) {
        self.actionError(error.message || 'Unable to approve the KYC review.');
      }).finally(function () { self.adminActionBusy(''); });
    };
    this.openKycDocument = function (document) {
      const actionId = 'document-' + document.documentId;
      if (self.adminDocumentBusy()) { return; }
      self.adminDocumentBusy(actionId); self.actionError('');
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.document.title = 'Loading KYC document';
        previewWindow.document.body.textContent = 'Loading secure KYC document...';
      }
      const contentPath = '/api/customers/' + encodeURIComponent(document.userId) + '/kyc/documents/' + encodeURIComponent(document.documentId) + '/content';
      api.download(contentPath, params.app.authToken()).then(function (file) {
        const objectUrl = URL.createObjectURL(file.blob);
        if (previewWindow) {
          previewWindow.location.replace(objectUrl);
        } else {
          const anchor = window.document.createElement('a');
          anchor.href = objectUrl; anchor.download = file.fileName || document.originalFileName || 'kyc-document';
          anchor.style.display = 'none'; window.document.body.appendChild(anchor); anchor.click(); anchor.remove();
        }
        setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 60000);
      }).catch(function (error) {
        if (previewWindow) { previewWindow.close(); }
        self.actionError(error.message || 'Unable to open the KYC document.');
      }).finally(function () {
        self.adminDocumentBusy('');
      });
    };
    this.saveNotificationSettings = function () {
      self.actionError(''); self.loadNotificationData(); self.actionSuccess(self.isNotificationHistoryAvailable ? 'Email delivery history refreshed.' : 'Security and transaction emails are managed automatically by the bank.');
    };
    this.reviewApprovals = function () {
      self.loadAdminData().then(function () { self.actionSuccess('Operations and approval queues refreshed.'); });
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
