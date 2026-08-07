define([
  'knockout',
  'utils/i18n',
  'utils/api',
  'ojs/ojconfig',
  'ojs/ojcontext',
  'ojs/ojmodule-element-utils'
], function (ko, i18n, api, Config, Context, ModuleElementUtils) {
  'use strict';

  function AppViewModel() {
    const self = this;
    const SESSION_STORAGE_KEY = 'northstar.auth.session';

    self.isAuthenticated = ko.observable(false);
    self.authView = ko.observable(window.location.hash === '#/register' ? 'register' : 'login');
    self.activeRoute = ko.observable('dashboard');
    self.authModuleConfig = ko.observable({ view: [], viewModel: null });
    self.mainModuleConfig = ko.observable({ view: [], viewModel: null });
    self.navigationOpen = ko.observable(false);
    self.customerName = ko.observable('Sreeja Pamu');
    self.authToken = ko.observable('');
    self.currentRole = ko.observable('CUSTOMER');
    self.pendingSession = null;
    self.pendingLoginCredentials = null;
    self.locale = ko.observable(i18n.initialLocale());
    self.languageOptions = i18n.languageOptions;
    self.t = function (key, fallback) { return i18n.translate(self.locale(), key, fallback); };
    self.formatCurrency = function (value) { return i18n.formatCurrency(self.locale(), value); };
    self.formatDate = function (value, options) { return i18n.formatDate(self.locale(), value, options); };
    i18n.persistLocale(self.locale());

    const allNavigationItems = [
      { route: 'dashboard', labelKey: 'nav.dashboard', icon: '⌂' },
      { route: 'accounts', labelKey: 'nav.accounts', icon: '▤' },
      { route: 'transactions', labelKey: 'nav.transactions', icon: '↕' },
      { route: 'beneficiaries', labelKey: 'nav.beneficiaries', icon: '◎' },
      { route: 'transfer', labelKey: 'nav.transfer', icon: '↗' },
      { route: 'loans', labelKey: 'nav.loans', icon: '◇' },
      { route: 'cards', labelKey: 'nav.cards', icon: '▱' },
      { route: 'notifications', labelKey: 'nav.notifications', icon: '◌' },
      { route: 'admin', labelKey: 'nav.admin', icon: '⌘' },
      { route: 'profile', labelKey: 'nav.profile', labelFallback: 'Profile', icon: 'P' }
    ];
    allNavigationItems.forEach(function (item) {
      item.label = ko.pureComputed(function () { return self.t(item.labelKey, item.labelFallback); });
    });
    self.navigationItems = ko.pureComputed(function () {
      return allNavigationItems.filter(function (item) { return item.route !== 'admin' || self.currentRole() === 'ADMIN'; });
    });
    self.primaryNavigationItems = ko.pureComputed(function () { return self.navigationItems().slice(0, 7); });

    const validRoutes = allNavigationItems.map(function (item) { return item.route; });

    self.activeTitle = ko.pureComputed(function () {
      const match = allNavigationItems.find(function (item) {
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

      let route = validRoutes.indexOf(candidate) >= 0 ? candidate : 'dashboard';
      if (route === 'admin' && self.currentRole() !== 'ADMIN') { route = 'dashboard'; }
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

    self.persistSession = function (session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        token: session.token,
        expiresAt: session.expiresAt || null,
        username: session.username || 'Customer',
        role: session.role || 'CUSTOMER',
        twoFactorEnabled: Boolean(session.twoFactorEnabled)
      }));
    };

    self.applySession = function (session) {
      self.pendingSession = null;
      self.pendingLoginCredentials = null;
      self.authToken(session.token);
      self.customerName(session.username || 'Customer');
      self.currentRole(session.role || 'CUSTOMER');
      self.isAuthenticated(true);
      self.persistSession(session);
    };

    self.applyTemporarySession = function (session) {
      self.pendingSession = session;
      self.authToken(session.token);
      self.customerName(session.username || 'Customer');
      self.currentRole(session.role || 'CUSTOMER');
      self.isAuthenticated(false);
    };

    self.clearSession = function () {
      self.authToken('');
      self.currentRole('CUSTOMER');
      self.isAuthenticated(false);
      self.pendingSession = null;
      self.pendingLoginCredentials = null;
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    };

    self.restoreSession = function () {
      let storedSession;
      try { storedSession = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || 'null'); } catch (error) { storedSession = null; }
      if (!storedSession || !storedSession.token || (storedSession.expiresAt && new Date(storedSession.expiresAt).getTime() <= Date.now())) {
        self.clearSession();
        return Promise.resolve(false);
      }
      self.authToken(storedSession.token);
      return api.request('/api/auth/me', {}, storedSession.token).then(function (response) {
        const identity = api.unwrap(response) || {};
        self.applySession(Object.assign({}, storedSession, { username: identity.username, role: identity.role }));
        return true;
      }).catch(function (error) {
        if (error.status === 503) {
          self.applySession(storedSession);
          return true;
        }
        self.clearSession();
        return false;
      });
    };

    self.login = function (username, password, twoFactorCode, options) {
      const payload = { username: username, password: password };
      if (twoFactorCode) { payload.otpCode = twoFactorCode; }
      return api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(function (response) {
        const session = api.unwrap(response);
        if (options && options.stayOnCurrentScreen) {
          self.pendingLoginCredentials = { username: username, password: password };
          self.applyTemporarySession(session);
        } else {
          self.applySession(session);
          self.navigate('dashboard');
        }
        return session;
      });
    };

    self.register = function (details) {
      return api.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: details.username,
          email: details.email,
          phone: details.mobile,
          password: details.password,
          fullName: details.fullName
        })
      }).then(api.unwrap);
    };

    self.setupTwoFactor = function () {
      return api.request('/api/2fa/setup', { method: 'POST' }, self.authToken())
        .then(api.unwrap);
    };

    self.verifyTwoFactorSetup = function (otpCode) {
      const temporaryToken = self.authToken();
      const credentials = self.pendingLoginCredentials;
      return api.request('/api/2fa/verify-setup', {
        method: 'POST',
        body: JSON.stringify({ otpCode: otpCode })
      }, self.authToken()).then(function (response) {
        const status = api.unwrap(response) || {};
        if (!credentials) {
          if (self.pendingSession) { self.applySession(Object.assign({}, self.pendingSession, { twoFactorEnabled: true })); }
          self.navigate('dashboard');
          return status;
        }

        // Complete a real OTP-protected login after enrolment. This is the
        // point at which the backend sends the login alert email.
        return api.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
            otpCode: otpCode
          })
        }).then(function (loginResponse) {
          const completedSession = api.unwrap(loginResponse);
          return api.request('/api/auth/logout', { method: 'POST' }, temporaryToken)
            .catch(function () { return null; })
            .then(function () {
              self.applySession(completedSession);
              self.navigate('dashboard');
              return status;
            });
        });
      });
    };

    self.twoFactorStatus = function () {
      return api.request('/api/2fa/status', {}, self.authToken()).then(api.unwrap);
    };

    self.logout = function () {
      const token = self.authToken();
      const finishLogout = function () {
        self.clearSession();
        self.authView('login');
        window.location.hash = '';
        self.syncHash();
      };
      if (!token) { finishLogout(); return; }
      api.request('/api/auth/logout', { method: 'POST' }, token).catch(function () {
        // A missing or expired server session is still safe to clear locally.
      }).finally(finishLogout);
    };

    self.locale.subscribe(function (locale) {
      i18n.persistLocale(locale);
      Config.setLocale(locale, self.syncHash);
    });

    api.setUnauthorizedHandler(function () {
      self.clearSession();
      window.location.hash = '';
      self.syncHash();
    });

    self.start = function () {
      window.addEventListener('hashchange', self.syncHash);
      Config.setLocale(self.locale(), function () {
        self.restoreSession().then(self.syncHash).finally(function () { Context.getPageContext().getBusyContext().applicationBootstrapComplete(); });
      });
    };
  }

  return AppViewModel;
});
