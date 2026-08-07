define([
  'knockout',
  'ojs/ojinputtext',
  'ojs/ojtrain',
  'ojs/ojvalidationgroup',
  'ojs/ojmessages'
], function (ko) {
  'use strict';

  ko.bindingHandlers.captchaCanvas = {
    update: function (element, valueAccessor) {
      const code = ko.unwrap(valueAccessor()) || '';
      const context = element.getContext('2d');
      const width = element.width;
      const height = element.height;
      const palette = ['#0b2948', '#1769aa', '#12805c', '#155183'];

      context.clearRect(0, 0, width, height);
      const background = context.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, '#f7fbfe');
      background.addColorStop(1, '#dfeef7');
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      for (let line = 0; line < 7; line += 1) {
        context.beginPath();
        context.moveTo(Math.random() * width, Math.random() * height);
        context.bezierCurveTo(
          Math.random() * width, Math.random() * height,
          Math.random() * width, Math.random() * height,
          Math.random() * width, Math.random() * height
        );
        context.strokeStyle = palette[line % palette.length] + '70';
        context.lineWidth = Math.random() * 1.5 + 0.7;
        context.stroke();
      }

      for (let dot = 0; dot < 55; dot += 1) {
        context.fillStyle = palette[dot % palette.length] + '55';
        context.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2 + 1, Math.random() * 2 + 1);
      }

      const characterWidth = width / (code.length + 1);
      Array.from(code).forEach(function (character, index) {
        context.save();
        context.translate(characterWidth * (index + 1), height / 2 + (Math.random() * 7 - 3.5));
        context.rotate((Math.random() - 0.5) * 0.38);
        context.font = '800 ' + (26 + Math.floor(Math.random() * 5)) + 'px "Segoe UI", sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = palette[index % palette.length];
        context.fillText(character, 0, 0);
        context.restore();
      });
    }
  };

  function RegisterViewModel(params) {
    const self = this;
    self.app = params.app;
    self.fullName = ko.observable('');
    self.email = ko.observable('');
    self.mobile = ko.observable('');
    self.username = ko.observable('');
    self.password = ko.observable('');
    self.confirmPassword = ko.observable('');
    self.captchaAnswer = ko.observable('');
    self.captchaCode = ko.observable('');
    self.twoFactorCode = ko.observable('');
    self.step = ko.observable(1);
    self.registrationTrainStep = ko.observable('details');
    self.registrationTrainSteps = ko.observableArray([
      { id: 'details', label: 'Personal details' },
      { id: 'verification', label: 'Verification' },
      { id: 'finish', label: 'Finish' }
    ]);
    self.twoFactorQr = ko.observable('');
    self.acceptedTerms = ko.observable(false);
    self.isSubmitting = ko.observable(false);
    self.error = ko.observable('');
    self.messages = ko.observableArray([]);
    function keepCurrentValue(observable) {
      return function (event) {
        observable(event && event.detail ? event.detail.value || '' : '');
      };
    }
    self.fullNameInput = keepCurrentValue(self.fullName);
    self.emailInput = keepCurrentValue(self.email);
    self.mobileInput = keepCurrentValue(self.mobile);
    self.usernameInput = keepCurrentValue(self.username);
    self.passwordInput = keepCurrentValue(self.password);
    self.confirmPasswordInput = keepCurrentValue(self.confirmPassword);
    self.captchaAnswerInput = keepCurrentValue(self.captchaAnswer);
    self.twoFactorCodeInput = keepCurrentValue(self.twoFactorCode);
    self.error.subscribe(function (message) {
      self.messages(message ? [{ severity: 'error', summary: 'Registration needs attention', detail: message }] : []);
    });
    self.refreshCaptcha = function () {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const previousCode = self.captchaCode();
      let code;
      do {
        code = '';
        for (let index = 0; index < 5; index += 1) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
      } while (code === previousCode);
      self.captchaCode(code);
      self.captchaAnswer('');
      self.captchaAnswer.valueHasMutated();
    };

    self.refreshCaptcha();

    self.continueToTwoFactor = function () {
      const mobileDigits = self.mobile().replace(/\D/g, '');
      if (!self.fullName().trim() || !self.email().trim() || !self.mobile().trim() || !self.username().trim()) {
        self.error('Complete all personal and account details.');
        return false;
      }
      if (self.email().indexOf('@') < 1) {
        self.error('Enter a valid email address.');
        return false;
      }
      if (!/^[+]?[0-9]{7,15}$/.test(self.mobile().trim())) {
        self.error('Enter 7 to 15 digits, with an optional leading +.');
        return false;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(self.password())) {
        self.error('Use at least 8 characters with uppercase, lowercase, a number, and a special character.');
        return false;
      }
      if (self.password() !== self.confirmPassword()) {
        self.error('Passwords do not match.');
        return false;
      }
      if (!self.captchaAnswer().trim()) {
        self.error('Complete the security check.');
        return false;
      }
      if (self.captchaAnswer().trim().toUpperCase() !== self.captchaCode()) {
        self.error('The CAPTCHA code is incorrect. Try the new image.');
        self.refreshCaptcha();
        return false;
      }
      if (!self.acceptedTerms()) {
        self.error('Accept the terms and privacy policy to continue.');
        return false;
      }

      self.error('');
      self.isSubmitting(true);
      const registrationDetails = {
        fullName: self.fullName().trim(),
        email: self.email().trim(),
        mobile: self.mobile().trim(),
        username: self.username().trim(),
        password: self.password()
      };
      self.app.register(registrationDetails)
        .then(function () {
          return self.app.login(registrationDetails.username, registrationDetails.password, null, { stayOnCurrentScreen: true });
        })
        .then(function () {
          return self.app.setupTwoFactor();
        })
        .then(function (setup) {
          if (!setup.qrCodeBase64) { throw new Error('The server did not return a QR code.'); }
          self.twoFactorQr('data:image/png;base64,' + setup.qrCodeBase64);
          self.step(2);
          self.registrationTrainStep('verification');
        })
        .catch(function (error) {
          self.error(error.message || 'We could not create your profile. Please try again.');
        })
        .finally(function () {
          self.isSubmitting(false);
        });
      return false;
    };

    self.verifyTwoFactor = function () {
      if (!/^\d{6}$/.test(self.twoFactorCode().trim())) {
        self.error('Enter the current 6-digit code from your authenticator app.');
        return false;
      }

      self.error('');
      self.isSubmitting(true);
      self.app.verifyTwoFactorSetup(self.twoFactorCode().trim()).then(function () {
        self.registrationTrainStep('finish');
      }).catch(function (error) {
        self.error(error.message || 'We could not verify your security code. Please try again.');
      }).finally(function () {
        self.isSubmitting(false);
      });
      return false;
    };

    self.backToDetails = function () {
      self.error('');
      self.twoFactorCode('');
      self.step(1);
      self.registrationTrainStep('details');
    };

    self.showLogin = function () { self.app.showLogin(); };
  }

  return RegisterViewModel;
});
