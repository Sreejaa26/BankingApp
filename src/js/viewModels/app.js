define([
  'knockout',
  'utils/i18n',
  'ojs/ojconfig',
  'ojs/ojcontext',
  'ojs/ojmodule-element-utils'
], function (ko, i18n, Config, Context, ModuleElementUtils) {
  'use strict';

  function AppViewModel() {
    const self = this;

    self.isAuthenticated = ko.observable(false);
    self.authView = ko.observable(window.location.hash === '#/register' ? 'register' : 'login');
    self.activeRoute = ko.observable('dashboard');
    self.authModuleConfig = ko.observable({ view: [], viewModel: null });
    self.mainModuleConfig = ko.observable({ view: [], viewModel: null });
    self.navigationOpen = ko.observable(false);
    self.customerName = ko.observable('Sreeja Pamu');
    self.locale = ko.observable(i18n.initialLocale());
    self.languageOptions = i18n.languageOptions;
    self.t = function (key, fallback) { return i18n.translate(self.locale(), key, fallback); };
    self.formatCurrency = function (value) { return i18n.formatCurrency(self.locale(), value); };
    self.formatDate = function (value, options) { return i18n.formatDate(self.locale(), value, options); };
    i18n.persistLocale(self.locale());

    self.navigationItems = [
      { route: 'dashboard', labelKey: 'nav.dashboard', icon: '⌂' },
      { route: 'accounts', labelKey: 'nav.accounts', icon: '▤' },
      { route: 'transactions', labelKey: 'nav.transactions', icon: '↕' },
      { route: 'beneficiaries', labelKey: 'nav.beneficiaries', icon: '◎' },
      { route: 'transfer', labelKey: 'nav.transfer', icon: '↗' },
      { route: 'loans', labelKey: 'nav.loans', icon: '◇' },
      { route: 'cards', labelKey: 'nav.cards', icon: '▱' },
      { route: 'notifications', labelKey: 'nav.notifications', icon: '◌' },
      { route: 'admin', labelKey: 'nav.admin', icon: '⌘' }
    ];
    self.navigationItems.forEach(function (item) {
      item.label = ko.pureComputed(function () { return self.t(item.labelKey); });
    });
    self.primaryNavigationItems = self.navigationItems.slice(0, 7);

    const validRoutes = self.navigationItems.map(function (item) { return item.route; });

    self.activeTitle = ko.pureComputed(function () {
      const match = self.navigationItems.find(function (item) {
        return item.route === self.activeRoute();
      });
      return match ? ko.unwrap(match.label) : self.t('nav.dashboard');
    });

    self.openNavigation = function () { self.navigationOpen(true); };
    self.closeNavigation = function () { self.navigationOpen(false); };

    self.loadModule = function (name, params) {
      return ModuleElementUtils.createConfig({
        name: name,
        params: Object.assign({ app: self }, params || {})
      }).then(function (config) {
        if (self.isAuthenticated()) {
          self.mainModuleConfig(config);
        } else {
          self.authModuleConfig(config);
        }
      });
    };

    self.syncHash = function () {
      const candidate = window.location.hash.replace(/^#\/?/, '').split('/')[0];

      if (!self.isAuthenticated()) {
        const view = candidate === 'register' ? 'register' : 'login';
        self.authView(view);
        return self.loadModule(view);
      }

      const route = validRoutes.indexOf(candidate) >= 0 ? candidate : 'dashboard';
      self.activeRoute(route);
      self.navigationOpen(false);
      return self.loadModule(route === 'dashboard' ? 'dashboard' : 'page', { route: route });
    };

    self.navigate = function (route) {
      const nextHash = '#/' + route;
      if (window.location.hash === nextHash) {
        self.syncHash();
      } else {
        window.location.hash = nextHash;
      }
    };

    self.showRegister = function () {
      window.location.hash = '#/register';
    };

    self.showLogin = function () {
      window.location.hash = '';
      self.syncHash();
    };

    self.login = function (username, password, twoFactorCode) {
      // Replace this demo boundary with POST /api/auth/login.
      self.customerName(username || 'Sreeja Pamu');
      self.isAuthenticated(true);
      self.navigate('dashboard');
      return Promise.resolve();
    };

    self.register = function (details) {
      // Replace this demo boundary with POST /api/auth/register.
      self.customerName(details.fullName);
      self.isAuthenticated(true);
      self.navigate('dashboard');
      return Promise.resolve();
    };

    self.logout = function () {
      self.isAuthenticated(false);
      self.authView('login');
      window.location.hash = '';
      self.syncHash();
    };

    self.locale.subscribe(function (locale) {
      i18n.persistLocale(locale);
      Config.setLocale(locale, self.syncHash);
    });

    self.start = function () {
      window.addEventListener('hashchange', self.syncHash);
      Config.setLocale(self.locale(), function () {
        self.syncHash().finally(function () {
          Context.getPageContext().getBusyContext().applicationBootstrapComplete();
        });
      });
    };
  }

  return AppViewModel;
});
