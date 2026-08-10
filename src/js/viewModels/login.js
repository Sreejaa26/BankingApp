define([
  'knockout',
  'utils/api',
  'ojs/ojinputtext',
  'ojs/ojvalidationgroup',
  'ojs/ojmessages',
  'ojs/ojdialog'
], function (ko, api) {
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
    self.forgotPasswordStep = ko.observable(1);
    self.forgotPasswordEmail = ko.observable('');
    self.forgotPasswordOtp = ko.observable('');
    self.forgotPasswordNew = ko.observable('');
    self.forgotPasswordConfirm = ko.observable('');
    self.forgotPasswordResetToken = ko.observable('');
    self.forgotPasswordBusy = ko.observable(false);
    self.forgotPasswordError = ko.observable('');
    self.forgotPasswordInfo = ko.observable('');
    function keepCurrentValue(observable) {
      return function (event) {
        observable(event && event.detail ? event.detail.value || '' : '');
      };
    }
    self.usernameInput = keepCurrentValue(self.username);
    self.passwordInput = keepCurrentValue(self.password);
    self.twoFactorCodeInput = keepCurrentValue(self.twoFactorCode);
    self.forgotPasswordEmailInput = keepCurrentValue(self.forgotPasswordEmail);
    self.forgotPasswordOtpInput = keepCurrentValue(self.forgotPasswordOtp);
    self.forgotPasswordNewInput = keepCurrentValue(self.forgotPasswordNew);
    self.forgotPasswordConfirmInput = keepCurrentValue(self.forgotPasswordConfirm);
    self.showMessage = function (severity, summary, detail) {
      self.messages([{ severity: severity, summary: summary, detail: detail }]);
    };

    self.resetForgotPassword = function () {
      self.forgotPasswordStep(1);
      self.forgotPasswordEmail('');
      self.forgotPasswordOtp('');
      self.forgotPasswordNew('');
      self.forgotPasswordConfirm('');
      self.forgotPasswordResetToken('');
      self.forgotPasswordBusy(false);
      self.forgotPasswordError('');
      self.forgotPasswordInfo('');
    };

    self.openForgotPassword = function () {
      self.resetForgotPassword();
      requestAnimationFrame(function () {
        const dialog = document.getElementById('forgot-password-dialog');
        if (dialog) { dialog.open(); }
      });
    };

    self.closeForgotPassword = function () {
      const dialog = document.getElementById('forgot-password-dialog');
      if (dialog) { dialog.close(); }
    };

    self.requestPasswordReset = function () {
      const email = self.forgotPasswordEmail().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        self.forgotPasswordError('Enter the email address registered with your account.');
        return false;
      }
      self.forgotPasswordBusy(true); self.forgotPasswordError(''); self.forgotPasswordInfo('');
      api.request('/api/auth/password-reset/request', {
        method: 'POST', body: JSON.stringify({ email: email })
      }).then(function () {
        self.forgotPasswordStep(2);
        self.forgotPasswordInfo('If this email is registered, a six-digit reset code has been sent.');
      }).catch(function (error) {
        self.forgotPasswordError(error.message || 'Unable to request a password reset code.');
      }).finally(function () { self.forgotPasswordBusy(false); });
      return false;
    };

    self.verifyPasswordResetCode = function () {
      const otpCode = self.forgotPasswordOtp().trim();
      if (!/^\d{6}$/.test(otpCode)) {
        self.forgotPasswordError('Enter the six-digit reset code from your email.');
        return false;
      }
      self.forgotPasswordBusy(true); self.forgotPasswordError(''); self.forgotPasswordInfo('');
      api.request('/api/auth/password-reset/verify', {
        method: 'POST', body: JSON.stringify({ email: self.forgotPasswordEmail().trim(), otpCode: otpCode })
      }).then(function (response) {
        const verification = api.unwrap(response) || {};
        if (!verification.resetToken) { throw new Error('The server did not return a password reset token.'); }
        self.forgotPasswordResetToken(verification.resetToken);
        self.forgotPasswordStep(3);
        self.forgotPasswordInfo('Code verified. Create a new password for your account.');
      }).catch(function (error) {
        self.forgotPasswordError(error.message || 'The reset code is invalid or expired.');
      }).finally(function () { self.forgotPasswordBusy(false); });
      return false;
    };

    self.confirmPasswordReset = function () {
      const newPassword = self.forgotPasswordNew();
      const confirmPassword = self.forgotPasswordConfirm();
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword)) {
        self.forgotPasswordError('Use at least 8 characters with upper-case, lower-case, number, and special character.');
        return false;
      }
      if (newPassword !== confirmPassword) {
        self.forgotPasswordError('New password and confirmation do not match.');
        return false;
      }
      self.forgotPasswordBusy(true); self.forgotPasswordError(''); self.forgotPasswordInfo('');
      api.request('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ resetToken: self.forgotPasswordResetToken(), newPassword: newPassword, confirmPassword: confirmPassword })
      }).then(function () {
        self.closeForgotPassword();
        self.password('');
        self.showMessage('confirmation', 'Password updated', 'Your password was reset successfully. Sign in with your new password.');
        self.resetForgotPassword();
      }).catch(function (error) {
        self.forgotPasswordError(error.message || 'Unable to reset your password. Request a new code and try again.');
      }).finally(function () { self.forgotPasswordBusy(false); });
      return false;
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
