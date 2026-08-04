define(['knockout'], function (ko) {
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
      eyebrow: 'Borrowing', title: 'Loans', description: 'Track repayments, view loan details, and explore eligible offers.', action: 'Explore offers', endpoint: 'GET /api/loans',
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
    const data = pages[params.route] || pages.accounts;
    Object.keys(data).forEach(function (key) { this[key] = data[key]; }, this);
    this.heroImage = data.heroImage || '';
    this.heroAlt = data.heroAlt || '';
    this.highlights = ko.observableArray(data.highlights.map(function (item) { return { label: item[0], value: item[1] }; }));
    this.items = ko.observableArray(data.items.map(normalizeItem));
    this.secondaryItems = ko.observableArray(data.secondary.map(normalizeItem));
  }

  return PageViewModel;
});
