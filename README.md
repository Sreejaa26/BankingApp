# BankingApp Frontend

This is the frontend application for the Internet Banking platform. It provides the user interface for customer banking and admin operations such as login, registration, account management, beneficiary transfer, card services, loan applications, KYC upload, transactions, and support.

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

## License

Internal project for banking platform development.
