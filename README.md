# BankingApp Frontend

This is the frontend application for the Internet Banking platform. It provides the user interface for customer banking and admin operations such as login, registration, account management, beneficiary transfer, card services, loan applications, KYC upload, transactions, and support.

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/04b88180-9382-4a55-9f23-4ab6953208af" />

## Features

- User login and registration
- Two-factor authentication support
- Customer dashboard
- Account creation and account overview
- Beneficiary management
- Money transfer
- Transaction history and statements
- Card application and card controls
- Loan application and loan status views
- KYC and profile completion flow
- Admin dashboard for approvals and service operations
- Help and support section
- Responsive UI for desktop and mobile

## Tech Stack

- Frontend framework: Oracle JET / JavaScript / TypeScript
- Styling: CSS / SCSS
- Backend integration: REST APIs through the API Gateway
- Authentication: JWT-based login with session validation

## Project Structure

- `src/js/` - JavaScript and TypeScript logic
- `src/views/` - UI view templates
- `src/styles/` - styling files
- `src/resources/` - images, icons, and static assets

## API Connection

The frontend communicates only with the API Gateway, not directly with individual services.

Default local gateway URL:

```text
http://localhost:8080
```
## Oracle JET Usage

The frontend uses Oracle JET 20.1 to build an enterprise-style single-page banking application. Oracle JET provides reusable Web Components, validation, accessibility support, responsive utilities and integration with Knockout MVVM.

### Components Used

| Component | Usage |
|---|---|
| `oj-input-text` | Username, OTP, customer information, account details and text filters |
| `oj-input-password` | Login, registration and password-reset fields |
| `oj-input-number` | Transfer amount, bill payment, loan amount, income and tenure |
| `oj-select-single` | Accounts, branches, beneficiaries, billers, products and filters |
| `oj-input-date` | Date of birth, transaction dates and report filters |
| `oj-input-date-time` | Scheduled-payment execution date and time |
| `oj-file-picker` | Aadhaar, PAN and optional address-proof uploads |
| `oj-validation-group` | Form-level validation before submission |
| `oj-messages` | Success, warning and error feedback |
| `oj-dialog` | Onboarding, password reset, confirmations and approval dialogs |
| `oj-chart` | Dashboard financial charts |
| `oj-train` | Multi-step registration progress |

### Oracle JET Architecture

- HTML Views containing Oracle JET components are located in `src/js/views/`.
- JavaScript ViewModels containing Knockout observables and page logic are located in `src/js/viewModels/`.
- OJET modules such as `ojs/ojinputtext` and `ojs/ojdialog` are loaded using AMD and RequireJS.
- Knockout bindings connect components to ViewModel state.
- `ArrayDataProvider` supplies structured data to dropdowns and other data components.
- `main.js` configures modules, while `root.js` starts the application.
- `app.js` manages authentication, sessions, navigation, routing and dynamic module loading.

### Binding Example

```html
<oj-input-number
  label-hint="Loan amount"
  value="{{loanAmount}}"
  required>
</oj-input-number>
```

`loanAmount` is a Knockout observable. The `{{ }}` syntax creates two-way binding, so user input updates the ViewModel and ViewModel changes update the component.

### Development Commands

```powershell
npm install
npx ojet serve
npx ojet build
```

- `npm install` installs Oracle JET and project dependencies.
- `ojet serve` builds and runs the frontend locally with file watching.
- `ojet build` creates the deployable frontend output.
## Getting Started

### Prerequisites

- Node.js
- Oracle JET setup
- Backend services running locally
- API Gateway running on port `8080`

### Install dependencies

```bash
npm install
```

### Run the frontend

```bash
npx ojet serve
```

### Build the frontend

```bash
npx ojet build
```

## Environment Configuration

Update the frontend API base URL to point to the backend gateway:

```text
http://localhost:8080
```

## Notes

- Use the gateway for all API calls.
- Keep authentication tokens secure.
- Do not call individual microservice ports directly from the UI.
- Role-based screens should be shown based on the logged-in user type.

## Supported User Flows

### Customer

- Register and log in
- Complete profile and KYC
- Open accounts
- Add beneficiaries
- Transfer money
- View cards, loans, and transactions

### Admin

- View pending approvals
- Approve cards
- Approve loans
- Review KYC and customer onboarding
- Monitor operational dashboards

  ###Architecture of project
  <img width="2043" height="1377" alt="image" src="https://github.com/user-attachments/assets/52718b90-2dbd-4878-980f-a76511561edf" />
 

## License

Internal project for banking platform development.
