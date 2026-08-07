define([
  'knockout',
  'ojs/ojinputtext',
  'ojs/ojvalidationgroup',
  'ojs/ojmessages'
], function (ko) {
  'use strict';

  function LoginViewModel(params) {
    const self = this;
    self.app = params.app;
    self.username = ko.observable('');
    self.password = ko.observable('');
    self.twoFactorCode = ko.observable('');
    self.twoFactorQr = ko.observable('');
    self.isSetupMode = ko.observable(false);
    self.step = ko.observable(1);
    self.rememberUsername = ko.observable(Boolean(localStorage.getItem('northstar.rememberedUsername')));
    self.isSubmitting = ko.observable(false);
    self.error = ko.observable('');
    self.messages = ko.observableArray([]);
    function keepCurrentValue(observable) {
      return function (event) {
        observable(event && event.detail ? event.detail.value || '' : '');
      };
    }
    self.usernameInput = keepCurrentValue(self.username);
    self.passwordInput = keepCurrentValue(self.password);
    self.twoFactorCodeInput = keepCurrentValue(self.twoFactorCode);
    self.showMessage = function (severity, summary, detail) {
      self.messages([{ severity: severity, summary: summary, detail: detail }]);
    };

    self.continueToTwoFactor = function () {
      if (!self.username().trim() || !self.password()) {
        self.error('Enter both your username and password.');
        self.showMessage('error', 'Sign-in details required', self.error());
        return false;
      }

      self.error(''); self.messages([]); self.isSubmitting(true);
      if (self.rememberUsername()) { localStorage.setItem('northstar.rememberedUsername', self.username().trim()); } else { localStorage.removeItem('northstar.rememberedUsername'); }
      self.app.login(self.username().trim(), self.password(), null, { stayOnCurrentScreen: true }).then(function (session) {
        if (session.twoFactorEnabled) { self.isSetupMode(false); self.step(2); return; }
        return self.app.setupTwoFactor().then(function (setup) {
          if (!setup || !setup.qrCodeBase64) { throw new Error('The server did not return a 2FA QR code.'); }
          self.twoFactorQr('data:image/png;base64,' + setup.qrCodeBase64);
          self.isSetupMode(true); self.step(2);
        });
      }).catch(function (error) {
        if (error.status === 400 && /otp/i.test(error.message || '')) {
          self.isSetupMode(false); self.step(2); return;
        }
        self.error(error.message || 'We could not verify your sign-in details.');
        self.showMessage('error', 'Sign-in failed', self.error());
      }).finally(function () { self.isSubmitting(false); });
      return false;
    };

    self.verifyTwoFactor = function () {
      if (!/^\d{6}$/.test(self.twoFactorCode().trim())) {
        self.error('Enter the 6-digit code from your authenticator app.');
        self.showMessage('error', 'Security code required', self.error());
        return false;
      }

      self.error('');
      self.messages([]);
      self.isSubmitting(true);
      const verification = self.isSetupMode()
        ? self.app.verifyTwoFactorSetup(self.twoFactorCode().trim())
        : self.app.login(self.username().trim(), self.password(), self.twoFactorCode().trim());
      verification
        .catch(function (error) {
          self.error(error.message || 'We could not sign you in. Check your details and try again.');
          self.showMessage('error', 'Sign-in failed', self.error());
        })
        .finally(function () {
          self.isSubmitting(false);
        });
      return false;
    };

    self.backToCredentials = function () {
      self.error('');
      self.messages([]);
      self.twoFactorCode('');
      self.twoFactorQr('');
      if (self.isSetupMode()) { self.app.logout(); }
      self.isSetupMode(false);
      self.step(1);
    };

    self.showRegister = function () {
      self.app.showRegister();
    };

    const rememberedUsername = localStorage.getItem('northstar.rememberedUsername');
    if (rememberedUsername) { self.username(rememberedUsername); }
  }

  return LoginViewModel;
});
