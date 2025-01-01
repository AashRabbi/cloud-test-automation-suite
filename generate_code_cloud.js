const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cloudPages = [
  'Dashboard', 'VirtualMachine', 'Storage', 'Network', 'Database', 'Security', 'Monitoring',
  'Billing', 'Support', 'Settings', 'UserManagement', 'RoleManagement', 'AuditLog',
  'Notifications', 'API', 'Integrations', 'Analytics', 'Reports', 'Compliance', 'Backup'
];

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const testsDir = path.join(__dirname, 'tests');
const utilsDir = path.join(srcDir, 'utils');
const featuresDir = path.join(__dirname, 'features');
const stepsDir = path.join(testsDir, 'steps');
const dataDir = path.join(__dirname, 'data');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(srcDir);
ensureDir(pagesDir);
ensureDir(testsDir);
ensureDir(utilsDir);
ensureDir(featuresDir);
ensureDir(stepsDir);
ensureDir(dataDir);

const dashboardPageTemplate = `
import { Page, expect } from '@playwright/test';
import { loginUser } from '../utils/helpers';

/**
 * Page object for the cloud dashboard, handling metrics, alerts, and navigation.
 */
export class DashboardPage {
  readonly page: Page;
  readonly locators = {
    overview: '#dashboard-overview',
    metrics: '#dashboard-metrics',
    alerts: '#dashboard-alerts',
    navToVM: '#nav-virtualmachine',
    navToStorage: '#nav-storage'
  };

  constructor(page: Page) {
    this.page = page;
  }

  async gotoDashboard() {
    await loginUser(this.page, 'admin', 'pass');
    await this.page.goto('/dashboard');
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async verifyMetrics() {
    await expect(this.page.locator(this.locators.metrics)).toBeVisible();
    await expect(this.page.locator(this.locators.metrics)).toContainText('CPU Usage');
    await expect(this.page.locator(this.locators.metrics)).toContainText('Memory Usage');
  }

  async checkAlerts(expectedCount = 0) {
    const alerts = this.page.locator(this.locators.alerts);
    await expect(alerts).toHaveCount(expectedCount);
  }

  async navigateToVirtualMachine() {
    await this.page.click(this.locators.navToVM);
    await expect(this.page).toHaveURL(/virtualmachine/);
  }

  async navigateToStorage() {
    await this.page.click(this.locators.navToStorage);
    await expect(this.page).toHaveURL(/storage/);
  }

  async verifyOverview() {
    await expect(this.page.locator(this.locators.overview)).toContainText('Cloud Overview');
  }
}
`;

const virtualMachinePageTemplate = `
import { Page, expect } from '@playwright/test';
import { setupTestData } from '../utils/helpers';

/**
 * Page object for managing virtual machines in the cloud platform.
 */
export class VirtualMachinePage {
  readonly page: Page;
  readonly locators = {
    vmList: '#vm-list',
    createButton: '#create-vm',
    vmNameInput: '#vm-name',
    vmTypeSelect: '#vm-type',
    submitButton: '#submit-vm',
    status: '#vm-status',
    deleteButton: '#delete-vm',
    confirmDelete: '#confirm-delete'
  };

  constructor(page: Page) {
    this.page = page;
  }

  async gotoVirtualMachine() {
    await setupTestData(this.page, { module: 'virtual-machine' });
    await this.page.goto('/virtual-machine');
    await expect(this.page).toHaveURL(/virtual-machine/);
  }

  async createVM(config = { name: 'test-vm', type: 'standard' }) {
    await this.page.click(this.locators.createButton);
    await this.page.fill(this.locators.vmNameInput, config.name);
    await this.page.selectOption(this.locators.vmTypeSelect, config.type);
    await this.page.click(this.locators.submitButton);
    await expect(this.page.locator(this.locators.status)).toHaveText('VM created successfully');
  }

  async verifyVMList(expectedCount) {
    const vms = this.page.locator(this.locators.vmList);
    await expect(vms).toHaveCount(expectedCount);
  }

  async deleteVM(vmName) {
    await this.page.click(`text=\${vmName}`);
    await this.page.click(this.locators.deleteButton);
    await this.page.click(this.locators.confirmDelete);
    await expect(this.page.locator(this.locators.status)).toHaveText('VM deleted');
  }

  async verifyVMStatus(vmName, expectedStatus) {
    await this.page.click(`text=\${vmName}`);
    await expect(this.page.locator(this.locators.status)).toHaveText(expectedStatus);
  }
}
`;

const defaultPageTemplate = (pageName) => `
import { Page, expect } from '@playwright/test';
import { setupTestData } from '../utils/helpers';

/**
 * Page object for the ${pageName} module in the cloud platform.
 */
export class ${pageName}Page {
  readonly page: Page;
  readonly locators = {
    mainInput: '#${pageName.toLowerCase()}-input',
    actionButton: '#${pageName.toLowerCase()}-action',
    status: '#${pageName.toLowerCase()}-status',
    header: '#${pageName.toLowerCase()}-header'
  };

  constructor(page: Page) {
    this.page = page;
  }

  async goto${pageName}() {
    await setupTestData(this.page, { module: '${pageName.toLowerCase()}' });
    await this.page.goto('/${pageName.toLowerCase()}');
    await expect(this.page).toHaveURL(/${pageName.toLowerCase()}/);
  }

  async performAction(data = {}) {
    await this.page.fill(this.locators.mainInput, data.value || 'test-${pageName.toLowerCase()}');
    await this.page.click(this.locators.actionButton);
    await expect(this.page.locator(this.locators.status)).toHaveText('Action completed');
  }

  async verifyUIElements() {
    await expect(this.page.locator(this.locators.header)).toBeVisible();
    await expect(this.page.locator(this.locators.mainInput)).toBeEnabled();
  }

  async performComplexAction(data = {}) {
    await this.performAction(data);
    await this.page.selectOption('#${pageName.toLowerCase()}-select', data.option || 'option1');
    await expect(this.page.locator(this.locators.status)).toHaveText('Complex action completed');
  }

  async verifyState(expectedState) {
    await expect(this.page.locator(this.locators.status)).toHaveText(expectedState);
  }
}
`;

const dashboardTestTemplate = `
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../src/pages/DashboardPage';
import { loginUser } from '../utils/helpers';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'admin', 'pass');
  });

  test('should display metrics on dashboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.gotoDashboard();
    await dashboardPage.verifyMetrics();
  });

  test('should have no alerts on dashboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.gotoDashboard();
    await dashboardPage.checkAlerts(0);
  });

  test('should navigate to Virtual Machine page', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.gotoDashboard();
    await dashboardPage.navigateToVirtualMachine();
  });

  test('should verify dashboard overview', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.gotoDashboard();
    await dashboardPage.verifyOverview();
  });
}
`;

const defaultTestTemplate = (pageName) => `
import { test, expect } from '@playwright/test';
import { ${pageName}Page } from '../src/pages/${pageName}Page';
import { loginUser } from '../utils/helpers';

test.describe('${pageName} Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, 'admin', 'pass');
  });

  test('should navigate to ${pageName} page', async ({ page }) => {
    const ${pageName.toLowerCase()}Page = new ${pageName}Page(page);
    await ${pageName.toLowerCase()}Page.goto${pageName}();
    await ${pageName.toLowerCase()}Page.verifyUIElements();
  });

  test('should perform action on ${pageName}', async ({ page }) => {
    const ${pageName.toLowerCase()}Page = new ${pageName}Page(page);
    await ${pageName.toLowerCase()}Page.goto${pageName}();
    await ${pageName.toLowerCase()}Page.performAction({ value: 'test-value' });
    await ${pageName.toLowerCase()}Page.verifyState('Action completed');
  });

  test('should perform complex action on ${pageName}', async ({ page }) => {
    const ${pageName.toLowerCase()}Page = new ${pageName}Page(page);
    await ${pageName.toLowerCase()}Page.goto${pageName}();
    await ${pageName.toLowerCase()}Page.performComplexAction({ value: 'complex-test', option: 'option2' });
    await ${pageName.toLowerCase()}Page.verifyState('Complex action completed');
  });

  test('should handle ${pageName} error case', async ({ page }) => {
    const ${pageName.toLowerCase()}Page = new ${pageName}Page(page);
    await ${pageName.toLowerCase()}Page.goto${pageName}();
    await ${pageName.toLowerCase()}Page.performAction({ value: '' });
    await expect(page.locator('#error')).toHaveText('Invalid input');
  });
}
`;

const defaultFeatureTemplate = (pageName) => `
Feature: ${pageName} Functionality
  As a cloud administrator
  I want to interact with the ${pageName} module
  So that I can manage ${pageName.toLowerCase()} resources efficiently

  Scenario: Navigate to ${pageName} page
    Given I am logged in as "admin"
    When I navigate to the ${pageName} page
    Then I should see the ${pageName} UI elements

  Scenario: Perform action on ${pageName}
    Given I am logged in as "admin"
    When I perform action on ${pageName} with value "test-value"
    Then I should see the state as "Action completed"

  Scenario: Perform complex action on ${pageName}
    Given I am logged in as "admin"
    When I perform complex action on ${pageName} with value "complex-test" and option "option2"
    Then I should see the state as "Complex action completed"
`;

const defaultStepTemplate = (pageName) => `
const { Given, When, Then } = require('@cucumber/cucumber');
const { ${pageName}Page } = require('../../src/pages/${pageName}Page');
const { loginUser } from '../../src/utils/helpers';

Given('I am logged in as {string}', async function (username) {
  await loginUser(this.page, username, 'pass');
});

When('I navigate to the ${pageName} page', async function () {
  const ${pageName.toLowerCase()}Page = new ${pageName}Page(this.page);
  await ${pageName.toLowerCase()}Page.goto${pageName}();
});

When('I perform action on ${pageName} with value {string}', async function (value) {
  const ${pageName.toLowerCase()}Page = new ${pageName}Page(this.page);
  await ${pageName.toLowerCase()}Page.performAction({ value });
});

When('I perform complex action on ${pageName} with value {string} and option {string}', async function (value, option) {
  const ${pageName.toLowerCase()}Page = new ${pageName}Page(this.page);
  await ${pageName.toLowerCase()}Page.performComplexAction({ value, option });
});

Then('I should see the state as {string}', async function (expectedState) {
  const ${pageName.toLowerCase()}Page = new ${pageName}Page(this.page);
  await ${pageName.toLowerCase()}Page.verifyState(expectedState);
});

Then('I should see the ${pageName} UI elements', async function () {
  const ${pageName.toLowerCase()}Page = new ${pageName}Page(this.page);
  await ${pageName.toLowerCase()}Page.verifyUIElements();
});
`;

const utilsTemplate = `
import { Page } from '@playwright/test';

/**
 * Utility functions for cloud test automation suite.
 */
export async function loginUser(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#login-button');
  await page.waitForURL('/dashboard');
}

export async function setupTestData(page: Page, data: any) {
  // Simulate setting up cloud test data
  await page.evaluate((testData) => {
    window.localStorage.setItem('cloudTestData', JSON.stringify(testData));
  }, data);
}

export async function clearTestData(page: Page) {
  await page.evaluate(() => {
    window.localStorage.clear();
  });
}

export async function generateCloudReport(page: Page, reportName: string) {
  // Simulate generating a cloud test report
  await page.evaluate((name) => {
    console.log(\`Generating cloud report: \${name}\`);
  }, reportName);
}

export async function scaleVM(page: Page, scaleFactor: number) {
  // Simulate scaling virtual machines
  await page.fill('#scale-factor', scaleFactor.toString());
  await page.click('#scale-vm');
  await expect(page.locator('#vm-status')).toHaveText('Scaling in progress');
}
`;

const dataTemplate = `
{
  "vms": [
    { "id": "vm001", "name": "prod-vm-1", "status": "running", "region": "us-east" },
    { "id": "vm002", "name": "test-vm-2", "status": "stopped", "region": "us-west" }
  ],
  "storage": [
    { "id": "st001", "name": "data-store-1", "size": "500GB", "type": "block" },
    { "id": "st002", "name": "backup-store-2", "size": "1TB", "type": "object" }
  ],
  "users": [
    { "username": "admin", "role": "admin", "accessLevel": "full" },
    { "username": "user1", "role": "user", "accessLevel": "read" }
  ]
}
`;

function getPageTemplate(page) {
  if (page === 'Dashboard') return dashboardPageTemplate;
  if (page === 'VirtualMachine') return virtualMachinePageTemplate;
  return defaultPageTemplate(page);
}

function getTestTemplate(page) {
  if (page === 'Dashboard') return dashboardTestTemplate;
  return defaultTestTemplate(page);
}

// Write utils and data
fs.writeFileSync(path.join(utilsDir, 'helpers.js'), utilsTemplate);
execSync(`git add ${path.join(utilsDir, 'helpers.js')}`, { stdio: 'inherit' });
execSync(`GIT_AUTHOR_DATE="2025-01-01T09:00:00" GIT_COMMITTER_DATE="2025-01-01T09:00:00" git commit -m "Add utility helpers for login and test data"`, { stdio: 'inherit' });

fs.writeFileSync(path.join(dataDir, 'test-data.json'), dataTemplate);
execSync(`git add ${path.join(dataDir, 'test-data.json')}`, { stdio: 'inherit' });
execSync(`GIT_AUTHOR_DATE="2025-01-02T09:00:00" GIT_COMMITTER_DATE="2025-01-02T09:00:00" git commit -m "Add test data for cloud resources"`, { stdio: 'inherit' });

// Add pages
cloudPages.forEach((page, index) => {
  const date = new Date('2025-01-03');
  date.setDate(date.getDate() + index * 5);
  const dateStr = date.toISOString().split('T')[0] + 'T18:00:00';

  const pageFile = path.join(pagesDir, `${page}Page.js`);
  const testFile = path.join(testsDir, `${page.toLowerCase()}.test.js`);
  const featureFile = path.join(featuresDir, `${page.toLowerCase()}.feature`);
  const stepFile = path.join(stepsDir, `${page.toLowerCase()}.steps.js`);

  fs.writeFileSync(pageFile, getPageTemplate(page), 'utf8');
  fs.writeFileSync(testFile, getTestTemplate(page), 'utf8');
  fs.writeFileSync(featureFile, defaultFeatureTemplate(page), 'utf8');
  fs.writeFileSync(stepFile, defaultStepTemplate(page), 'utf8');

  execSync(`git add ${pageFile} ${testFile} ${featureFile} ${stepFile}`, { stdio: 'inherit' });
  execSync(`GIT_AUTHOR_DATE="${dateStr}" GIT_COMMITTER_DATE="${dateStr}" git commit -m "Add ${page} page, tests, and Cucumber features"`, { stdio: 'inherit' });
});

// Add June commits
const juneDates = ['2025-06-05', '2025-06-10'];
juneDates.forEach((date, index) => {
  const updateFile = path.join(testsDir, `vm_update${index + 1}.test.js`);
  fs.writeFileSync(updateFile, `
import { test } from '@playwright/test';
import { VirtualMachinePage } from '../src/pages/VirtualMachinePage';

test('VM maintenance update ${index + 1}', async ({ page }) => {
  const vmPage = new VirtualMachinePage(page);
  await vmPage.gotoVirtualMachine();
  await vmPage.createVM({ name: 'update-vm-${index + 1}', type: 'high-performance' });
  await vmPage.verifyVMList(3);
});
  `, 'utf8');
  execSync(`git add ${updateFile}`, { stdio: 'inherit' });
  execSync(`GIT_AUTHOR_DATE="${date}T18:00:00" GIT_COMMITTER_DATE="${date}T18:00:00" git commit -m "Add VM maintenance test ${date}"`, { stdio: 'inherit' });
});