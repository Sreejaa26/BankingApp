define([
  'knockout',
  'ojs/ojinputtext'
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
    self.twoFactorQr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6AQAAAACgl2eQAAACvUlEQVR4Xu2YQXLjMAwEwY8Q///FPoX8CLnTw8ROdEjtIcJeRLkcCehUIcAAsBP75/MnrpbLeYBzHuCcBzjn34AR0fZoe3WdXNF729PGOmDqNXK0EU12gSEnxkpg6HHO0QlLDyP3ajbWAqMtXbpZqaut/A/AUpVUKjJE2fJEXgjABCrRNUS2yd2lmvcC6HNez1XVV/8vAz6rR0+CDMn301gHqFmk1NMwQaUw0MeFgIoivapYirQtJW2rdVy9QkBHNvpGykmGWUPEpYCEilVv6Sy95FIHKDbSIskozJVnkGqyZiHg2PQ2/S6eLH0NsgRoDpLIJpO0uV7jVawCYBAQKyRSqp0bpeCdhcD0ClN1XCNnie7NUmDidMEC7VAs+rcU2PROJ12bVaaAI9L5qgMU1EQ0+oiVpMzrjRALAY+Q1Viok0GiR+u3EBgskUnfSimdwUGlqFgdII1wZES2PNJEvi0DlCAly6sUtWyGCJZXogoAaUS2OB/1pBzS5ZtCgGYhIFVrQqtmvX0NsgCYVKtZIaoT4nGt+vuvuB9YGmCaXEn30DT2edHVAZugNELkwS+nhgk7rhSQTz07tU/xIp5AwoWAx9dgnataJ1in6l2s+4Htbz6d4Jokg08J+1qs+wH2Kir56FiNcxLVSgFZTmkUqPKliWpLVALDaQmPMKtHmrWAS4FBkPrxiZmpBeIjKrdwSrTq3Nz4y4BJqogMnx0LzWQloLgklEZwZAyp0EPaLIUAwzzdtWoiVku+Fl0VoGh4dVTiT92LG/NlAEexUSLvdETD77yCLAAI7Uwv9cw4lWPPvf+K+4HJa/JvgU5sB5WQCb4MUE6QB989Ar9bOd6DtApwy6hhTq58Ww2Qn0H/4uIJbyWwEarGhmbZYIpQtkC/dQCiHUwu7GxVNS7XN1XfDPx0HuCcBzjnAc75BeAv45uj3goFPmcAAAAASUVORK5CYII=';
    self.acceptedTerms = ko.observable(false);
    self.isSubmitting = ko.observable(false);
    self.error = ko.observable('');
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
      if (mobileDigits.length < 10) {
        self.error('Enter a valid 10-digit mobile number.');
        return false;
      }
      if (self.password().length < 8) {
        self.error('Create a password with at least 8 characters.');
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
      self.step(2);
      return false;
    };

    self.verifyTwoFactor = function () {
      if (!/^\d{6}$/.test(self.twoFactorCode().trim())) {
        self.error('Enter the current 6-digit code from your authenticator app.');
        return false;
      }

      self.error('');
      self.isSubmitting(true);
      self.app.register({
        fullName: self.fullName().trim(),
        email: self.email().trim(),
        mobile: self.mobile().trim(),
        username: self.username().trim(),
        password: self.password(),
        twoFactorCode: self.twoFactorCode().trim(),
        twoFactorEnabled: true
      }).catch(function () {
        self.error('We could not create your profile. Please try again.');
      }).finally(function () {
        self.isSubmitting(false);
      });
      return false;
    };

    self.backToDetails = function () {
      self.error('');
      self.twoFactorCode('');
      self.step(1);
    };

    self.showLogin = function () { self.app.showLogin(); };
  }

  return RegisterViewModel;
});
