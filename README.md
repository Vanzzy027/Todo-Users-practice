
# Hono API Authentication and Authorization

This project implements a secure authentication and authorization system using Hono.js, JWT tokens, and bcrypt for password hashing.

## 🔐 Features

- **User Registration**: Secure user registration with password hashing
- **User Login**: JWT-based authentication
- **Role-based Authorization**: Admin and User roles
- **Protected Routes**: Middleware for route protection
- **Password Security**: bcrypt for password hashing
- **Token Expiration**: 1-hour JWT token expiry

## 📋 Prerequisites

- Node.js (v18+)
- TypeScript
- Database (configured in your user service)

## 🛠️ Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=your-database-connection-string
```

## 🚀 API Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "User Registered successfully 🎊"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "Login successful 🎉",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "user_type": "user"
  }
}
```

## 🔒 Authorization Middleware

### Available Middlewares

1. **adminRoleAuth**: Only admin users
2. **userRoleAuth**: Only regular users
3. **bothRolesAuth**: Both admin and regular users

### Usage Examples

```typescript
import { Hono } from 'hono';
import { adminRoleAuth, userRoleAuth, bothRolesAuth } from './middleware/bearAuth';

const app = new Hono();

// Admin only route
app.get('/admin/users', adminRoleAuth, (c) => {
  // Only admins can access this
  const currentUser = c.user; // Access user info from token
  return c.json({ message: 'Admin dashboard' });
});

// User only route
app.get('/user/profile', userRoleAuth, (c) => {
  // Only regular users can access this
  return c.json({ message: 'User profile' });
});

// Both roles can access
app.get('/dashboard', bothRolesAuth, (c) => {
  // Both admins and users can access this
  return c.json({ message: 'Welcome to dashboard' });
});
```

## 🔑 Using JWT Tokens

### Client-side Storage

```javascript
// Store token after login
localStorage.setItem('authToken', response.token);

// Include in API requests
const token = localStorage.getItem('authToken');

fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Payload Structure

```typescript
{
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'admin' | 'user';
  iat: number; // issued at
  exp: number; // expires at
}
```

## 🛡️ Security Features

### Password Hashing

- Uses bcrypt with salt rounds of 10
- Passwords are never stored in plain text

### JWT Security

- Tokens expire after 1 hour
- Signed with secret key from environment variables
- Includes user role for authorization

### Input Validation

- Email uniqueness check during registration
- Proper error handling for invalid credentials
- Secure password comparison

## 📝 Error Responses

### Common Error Codes

| Status Code | Description                          |
| ----------- | ------------------------------------ |
| 400         | Bad Request (validation errors)      |
| 401         | Unauthorized (invalid/missing token) |
| 403         | Forbidden (insufficient permissions) |
| 500         | Internal Server Error                |

### Error Response Format

```json
{
  "error": "Error message here"
}
```

## 🧪 Testing with Thunder Client/Postman

### 1. Register a User

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com",
  "phone_number": "+1234567890",
  "password": "password123"
}
```

### 2. Login

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Access Protected Route

```http
GET http://localhost:3000/protected-route
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## 🔧 Customization

### Adding New Roles

1. Update the `UserRole` type in `bearAuth.ts`
2. Create new middleware functions
3. Update database user_type field

### Extending Token Expiry

```typescript
const token = jwt.sign(payload, secretKey, { expiresIn: '24h' }); // 24 hours
```

### Adding Refresh Tokens

Consider implementing refresh tokens for longer sessions:

- Short-lived access tokens (15-30 minutes)
- Long-lived refresh tokens (days/weeks)
- Token refresh endpoint

## 📚 Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "hono": "^3.x.x", 
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1"
}
```

## 🚨 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, random secret key
3. **HTTPS**: Always use HTTPS in production
4. **Token Storage**: Use httpOnly cookies for better security
5. **Rate Limiting**: Implement rate limiting for auth endpoints
6. **Input Sanitization**: Validate and sanitize all inputs

## 🐛 Common Issues

### "Invalid token" Error

- Check if token is properly formatted with "Bearer " prefix
- Verify JWT_SECRET matches between sign and verify operations
- Ensure token hasn't expired

### "Unauthorized" Error

- Verify user role matches required role for the route
- Check if token is included in Authorization header

### Database Connection Issues

- Verify DATABASE_URL is correct
- Ensure database service is running
- Check user service implementation
