define([
  'knockout',
  'ojs/ojinputtext'
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

    self.continueToTwoFactor = function () {
      if (!self.username().trim() || !self.password()) {
        self.error('Enter both your username and password.');
        return false;
      }

      self.error('');
      self.step(2);
      return false;
    };

    self.verifyTwoFactor = function () {
      if (!/^\d{6}$/.test(self.twoFactorCode().trim())) {
        self.error('Enter the 6-digit code from your authenticator app.');
        return false;
      }

      self.error('');
      self.isSubmitting(true);
      self.app.login(self.username().trim(), self.password(), self.twoFactorCode().trim())
        .catch(function () {
          self.error('We could not sign you in. Check your details and try again.');
        })
        .finally(function () {
          self.isSubmitting(false);
        });
      return false;
    };

    self.backToCredentials = function () {
      self.error('');
      self.twoFactorCode('');
      self.step(1);
    };

    self.showRegister = function () {
      self.app.showRegister();
    };
  }

  return LoginViewModel;
});
