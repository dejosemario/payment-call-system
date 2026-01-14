# Payment Call System API

A NestJS-based backend service demonstrating wallet management, payment processing, and call session tracking.

## 🚀 Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (Passport)
- **Payment Gateway:** Monnify (Mocked)
- **Validation:** class-validator, class-transformer
- **Language:** TypeScript

## 📋 Features Implemented

### ✅ Authentication Module
- User signup with password hashing (bcrypt)
- User login with JWT token generation
- JWT-based route protection

### ✅ Wallet Module
- Automatic wallet creation per user
- Wallet balance tracking
- Fund wallet via Monnify integration
- Transaction history with pagination
- Idempotent transaction processing

### ✅ Payments Module
- Monnify payment initialization (mocked)
- Webhook handler for payment confirmation
- Automatic wallet crediting on successful payment
- Webhook signature verification (mocked)

### ✅ Calls Module
- Call session initiation with wallet balance check
- Call termination with automatic wallet deduction
- Call history tracking

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or Docker)
- npm or pnpm

### Installation
```bash
# Clone repository
git clone https://github.com/dejosemario/payment-call-system.git
cd payment-call-system

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configurations
```

### Environment Variables
```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/payment-call-system
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONNIFY_API_KEY=mock-api-key
MONNIFY_SECRET_KEY=mock-secret-key
MONNIFY_CONTRACT_CODE=mock-contract-code
```

### Run Application
```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Application runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

### Wallet Endpoints (Protected - Requires JWT)

#### Get Balance
```http
GET /wallet/balance
Authorization: Bearer {jwt-token}

Response:
{
  "balance": 5000,
  "currency": "NGN"
}
```

#### Fund Wallet
```http
POST /wallet/fund
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "amount": 5000,
  "email": "user@example.com"
}

Response:
{
  "transactionReference": "REF_xxx",
  "paymentReference": "REF_xxx",
  "accountNumber": "7012345678",
  "bankName": "Wema Bank",
  "accountName": "Payment Call System",
  "amount": 5000,
  "expiryDate": "2025-01-15T10:30:00Z",
  "checkoutUrl": "https://monnify.com/pay/REF_xxx"
}
```

#### Get Transactions
```http
GET /wallet/transactions?limit=20
Authorization: Bearer {jwt-token}

Response:
[
  {
    "type": "credit",
    "amount": 5000,
    "reference": "REF_xxx",
    "status": "success",
    "createdAt": "2025-01-14T09:15:30Z"
  }
]
```

### Payment Endpoints

#### Monnify Webhook (Public)
```http
POST /payments/monnify/webhook
Content-Type: application/json

{
  "transactionReference": "MNFY_xxx",
  "paymentReference": "REF_xxx",
  "amountPaid": 5000,
  "paymentStatus": "PAID",
  "paymentMethod": "ACCOUNT_TRANSFER",
  "paidOn": "2025-01-14T10:30:00Z"
}

Response:
{
  "message": "Webhook processed successfully",
  "transaction": {...}
}
```

### Call Endpoints (Protected - Requires JWT)

#### Initiate Call
```http
POST /calls/initiate
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "receiverId": "user-id-here",
  "costPerMinute": 50
}

Response:
{
  "callId": "call-session-id",
  "status": "initiated",
  "message": "Call initiated successfully"
}
```

#### End Call
```http
POST /calls/{callId}/end
Authorization: Bearer {jwt-token}

Response:
{
  "callId": "call-session-id",
  "duration": 5,
  "cost": 250,
  "status": "ended"
}
```

#### Get Call History
```http
GET /calls/history?limit=20
Authorization: Bearer {jwt-token}

Response:
[
  {
    "callId": "xxx",
    "receiverId": "yyy",
    "status": "ended",
    "duration": 5,
    "cost": 250,
    "startedAt": "2025-01-14T10:00:00Z",
    "endedAt": "2025-01-14T10:05:00Z"
  }
]
```

## 🏗️ Architecture Decisions

### Modular Domain-Driven Design
- Organized by business domains (auth, wallet, payments, calls)
- Each module is self-contained with:
  - **Controllers:** API layer
  - **Services:** Business logic
  - **Entities:** Domain models
  - **DTOs:** Data transfer objects

### Key Technical Decisions

#### 1. Money Storage
- Used `Number` type for simplicity in 3-hour constraint
- **Production:** Would use `Decimal128` or store as integers (amount in kobo/cents)

#### 2. Transaction Idempotency
- Unique `reference` field prevents duplicate processing
- Critical for payment webhooks that may retry

#### 3. Wallet Balance Check
- Call initiation checks balance before allowing calls
- Prevents negative balances

#### 4. JWT Validation
- Trusts JWT payload for performance (no DB lookup per request)
- **Production:** Add user existence check in JWT strategy

#### 5. Mocked Integrations
- Monnify API calls are mocked for demonstration
- Webhook signature verification is mocked
- **Production:** Implement real HMAC SHA512 verification

## 🚧 Production Considerations (Not Implemented Due to Time)

### Infrastructure Layer
- **Redis:** Distributed locking for concurrent wallet transactions
- **BullMQ:** Async job processing for payment confirmations
- **Rate Limiting:** Protect payment endpoints from abuse

### Enhanced Security
- **Webhook Signature Verification:** HMAC SHA512 validation
- **API Key Authentication:** For webhook endpoints
- **Rate Limiting:** Prevent brute force attacks
- **Request Logging:** Audit trail for financial transactions

### Database Optimizations
- **Indexes:** On userId, reference, status fields
- **Transactions:** MongoDB sessions for atomic wallet updates
- **Connection Pooling:** Optimize database connections

### Testing
- Unit tests for services (Jest)
- Integration tests for payment flows
- E2E tests for critical user journeys
- Load testing for concurrent transactions

### Monitoring & Observability
- **Logging:** Winston/Pino for structured logs
- **Metrics:** Prometheus for API performance
- **Alerting:** Failed payment notifications
- **Tracing:** Distributed tracing for debugging

### Additional Features
- **Webhook Retry Mechanism:** Exponential backoff for failed webhooks
- **Transaction Reconciliation:** Daily balance verification
- **Refund Support:** Handle payment reversals
- **Multi-Currency:** Support multiple currencies
- **Real-time Updates:** WebSocket for balance changes

## 🧪 Testing

### Manual Testing with cURL
```bash
# 1. Signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Login (save the token)
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.access_token')

# 3. Check balance
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 4. Fund wallet (note the reference)
curl -X POST http://localhost:3000/wallet/fund \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"email":"test@example.com"}'

# 5. Simulate webhook (use reference from step 4)
curl -X POST http://localhost:3000/payments/monnify/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transactionReference": "MNFY_xxx",
    "paymentReference": "REF_from_step_4",
    "amountPaid": 5000,
    "paymentStatus": "PAID"
  }'

# 6. Verify balance updated
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer $TOKEN"
```

## 📦 Project Structure
```
src/
├── common/
│   ├── decorators/       # Custom decorators (AuthUser)
│   ├── guards/           # Auth guards (JwtAuthGuard)
│   ├── entities/         # Base entity classes
│   └── types/            # Shared TypeScript types
├── config/               # Configuration modules
├── modules/
│   ├── auth/            # Authentication domain
│   │   ├── dtos/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/           # User domain
│   │   ├── entities/
│   │   ├── dtos/
│   │   └── users.service.ts
│   ├── wallet/          # Wallet domain
│   │   ├── entities/
│   │   ├── dtos/
│   │   ├── wallet.controller.ts
│   │   ├── wallet.service.ts
│   │   └── wallet.module.ts
│   ├── payments/        # Payment integration
│   │   ├── services/
│   │   ├── dtos/
│   │   ├── payments.controller.ts
│   │   └── payments.module.ts
│   └── calls/           # Call sessions
│       ├── entities/
│       ├── dtos/
│       ├── calls.controller.ts
│       ├── calls.service.ts
│       └── calls.module.ts
├── app.module.ts
└── main.ts
```

## 👨‍💻 Development Notes

### Time Breakdown
- **Hour 1:** Setup + Auth module (signup/login)
- **Hour 2:** Wallet + Payments module (funding/webhooks)
- **Hour 3:** Calls module + Documentation

### Commit History
See git log for incremental development process:
```bash
git log --oneline --graph
```

## 📝 License

This is a technical assessment project.

## 🤝 Author

**Josh** - Backend Engineer  
GitHub: [@dejosemario](https://github.com/dejosemario)
