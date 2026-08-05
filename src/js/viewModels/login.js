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
    self.step = ko.observable(1);
    self.rememberUsername = ko.observable(false);
    self.isSubmitting = ko.observable(false);
    self.error = ko.observable('');
    self.messages = ko.observableArray([]);
    self.showMessage = function (severity, summary, detail) {
      self.messages([{ severity: severity, summary: summary, detail: detail }]);
    };

    self.continueToTwoFactor = function () {
      if (!self.username().trim() || !self.password()) {
        self.error('Enter both your username and password.');
        self.showMessage('error', 'Sign-in details required', self.error());
        return false;
      }

      self.error('');
      self.messages([]);
      self.step(2);
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
      self.app.login(self.username().trim(), self.password(), self.twoFactorCode().trim())
        .catch(function () {
          self.error('We could not sign you in. Check your details and try again.');
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
      self.step(1);
    };

    self.showRegister = function () {
      self.app.showRegister();
    };
  }

  return LoginViewModel;
});
