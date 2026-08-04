define(['knockout', 'ojs/ojchart'], function (ko) {
  'use strict';

  function DashboardViewModel(params) {
    const self = this;
    self.app = params.app;

    self.cashFlowGroups = ko.observableArray(['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']);
    self.cashFlowSeries = ko.observableArray([
      { name: 'Income', items: [82, 91, 86, 98, 96, 105] },
      { name: 'Spending', items: [52, 44, 58, 49, 61, 49] }
    ]);
    self.spendingGroups = ko.observableArray(['Housing', 'Food', 'Bills', 'Travel']);
    self.spendingSeries = ko.observableArray([
      { name: 'Spending', items: [38, 26, 21, 15] }
    ]);

    self.accounts = ko.observableArray([
      { icon: 'SA', iconClass: '', name: 'Everyday Savings', meta: '•• 4721 · Savings', amount: '₹2,84,100.20' },
      { icon: 'CA', iconClass: 'account-icon--gold', name: 'Current Account', meta: '•• 8490 · Current', amount: '₹1,52,550.00' },
      { icon: 'FD', iconClass: 'account-icon--green', name: 'Fixed Deposit', meta: '•• 1337 · Deposit', amount: '₹46,000.00' }
    ]);

    self.transactions = ko.observableArray([
      { icon: 'FM', name: 'Fresh Market', meta: 'Today, 10:42 AM', amount: '− ₹1,240', positive: false },
      { icon: 'SC', name: 'Salary credit', meta: 'Yesterday', amount: '+ ₹82,500', positive: true },
      { icon: 'NU', name: 'Northstar Utilities', meta: '26 Jul 2026', amount: '− ₹3,860', positive: false }
    ]);

    self.offers = ko.observableArray([
      { icon: '◇', tag: 'Pre-approved', eyebrow: 'Personal loan', title: 'Funds when plans cannot wait', copy: 'Borrow up to ₹8 lakh with a simple digital journey.', action: 'View your offer', route: 'loans', accentClass: 'offer-card--blue' },
      { icon: '▱', tag: 'Rewards', eyebrow: 'Northstar credit card', title: 'More value from everyday spending', copy: 'Earn 5× points on dining, travel and online purchases.', action: 'Explore cards', route: 'cards', accentClass: 'offer-card--gold' },
      { icon: '↗', tag: 'New', eyebrow: 'Smart deposits', title: 'Put your surplus balance to work', copy: 'Flexible deposits with attractive rates and easy access.', action: 'Start saving', route: 'accounts', accentClass: 'offer-card--green' }
    ]);

    self.go = function (route) { self.app.navigate(route); };
  }

  return DashboardViewModel;
});
