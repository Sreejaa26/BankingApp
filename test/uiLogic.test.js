const test = require('node:test');
const assert = require('node:assert/strict');
const uiLogic = require('../src/js/utils/uiLogic');

test('uses the IST calendar month at a UTC month boundary', function () {
  assert.equal(uiLogic.istMonthKey('2026-07-31T20:00:00Z'), '2026-08');
  assert.equal(uiLogic.istMonthKey('invalid'), '');
});

test('masks currency while retaining only the last three digits', function () {
  assert.equal(uiLogic.maskedCurrency('₹7,35,500'), '₹ ******500');
  assert.equal(uiLogic.maskedCurrency(''), '₹ ******0');
});

test('creates greetings from IST rather than the browser timezone', function () {
  assert.equal(uiLogic.greetingFor('2026-08-11T02:30:00Z', 'Sreeja'), 'Good morning, Sreeja.');
  assert.equal(uiLogic.greetingFor('2026-08-11T08:30:00Z', 'Sreeja'), 'Good afternoon, Sreeja.');
  assert.equal(uiLogic.greetingFor('2026-08-11T14:30:00Z', 'Sreeja'), 'Good evening, Sreeja.');
});

test('explains every transfer-readiness state', function () {
  assert.match(uiLogic.transferReadinessMessage(true, true), /activate an account/);
  assert.match(uiLogic.transferReadinessMessage(true, false), /before transferring/);
  assert.match(uiLogic.transferReadinessMessage(false, true), /bank verification/);
  assert.match(uiLogic.transferReadinessMessage(false, false), /ready for transfer/);
});

test('retains an eligible selection and clears or defaults an invalid selection', function () {
  const rows = [{ accountId: 'one' }, { accountId: 'two' }];
  assert.equal(uiLogic.selectedEligibleId('two', rows, 'accountId'), 'two');
  assert.equal(uiLogic.selectedEligibleId('missing', rows, 'accountId'), 'one');
  assert.equal(uiLogic.selectedEligibleId('missing', [], 'accountId'), '');
});

test('puts Help and support in customer top navigation', function () {
  const allItems = ['dashboard', 'accounts', 'transactions', 'beneficiaries', 'transfer', 'loans', 'cards', 'support']
    .map(function (route) { return { route: route }; });
  const routes = uiLogic.primaryNavigationItems(allItems.slice(0, 7), allItems, false).map(function (item) { return item.route; });
  assert.deepEqual(routes, ['dashboard', 'accounts', 'transactions', 'beneficiaries', 'transfer', 'loans', 'cards', 'support']);
});

test('does not add customer support navigation to the admin-only menu', function () {
  const adminItems = [{ route: 'admin' }, { route: 'reports' }, { route: 'audit' }];
  assert.deepEqual(uiLogic.primaryNavigationItems(adminItems, adminItems, true), adminItems);
});
