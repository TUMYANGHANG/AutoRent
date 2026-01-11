# AutoRent Backend API

Backend API server for AutoRent vehicle rental platform.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Configure your `.env` file with your settings:

- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
- `EMAIL_*`: Email configuration for OTP (optional for development)
- `OTP_EXPIRY_MINUTES`: OTP expiration time (default: 10)

## Running the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user

  - Body: `{ name, email, password }`
  - Returns: `{ message, token, user }`

- `POST /api/auth/login` - Login user

  - Body: `{ email, password }`
  - Returns: `{ message, token, user }`

- `POST /api/auth/forgot-password` - Send OTP to email

  - Body: `{ email }`
  - Returns: `{ message }`

- `POST /api/auth/verify-otp` - Verify OTP code

  - Body: `{ email, otp }`
  - Returns: `{ message, resetToken }`

- `POST /api/auth/reset-password` - Reset password with OTP
  - Body: `{ email, otp, newPassword }`
  - Returns: `{ message }`

## Development Notes

- User data is stored in-memory (will be reset on server restart)
- In production, replace with a database (PostgreSQL recommended)
- OTP is logged to console in development mode if email is not configured
- All passwords are hashed using bcrypt
