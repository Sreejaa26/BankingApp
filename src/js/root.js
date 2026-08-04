/**
 * Northstar Digital Banking MVVM bootstrap.
 */
require([
  'ojs/ojbootstrap',
  'knockout',
  './viewModels/app',
  'ojs/ojknockout',
  'ojs/ojmodule-element'
], function (Bootstrap, ko, AppViewModel) {
  Bootstrap.whenDocumentReady().then(function () {
    const app = new AppViewModel();
    ko.applyBindings(app, document.getElementById('globalBody'));
    app.start();
  });
});
