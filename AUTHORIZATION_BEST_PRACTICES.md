# Authorization Best Practices Guide

## 🔐 Current Implementation Analysis

Your current authorization system is well-structured! Here's what you've implemented correctly and suggestions for improvement.

## ✅ What You're Doing Right

### 1. **Role-Based Access Control (RBAC)**
```typescript
type UserRole = 'admin' | 'user' | 'both';
```
- Clear role definition
- Flexible middleware for different access levels

### 2. **JWT Token Verification**
```typescript
export const verifyToken = async (token: string, secret: string): Promise<DecodedToken | null>
```
- Proper error handling
- Returns null on failure (secure by default)

### 3. **Context Extension**
```typescript
declare module "hono" {
    interface Context {
        user?: DecodedToken;
    }
}
```
- Makes user data available throughout request lifecycle

## 🚀 Best Practices & Improvements

### 1. **Enhanced Authorization Patterns**

#### A. Resource-Based Authorization
```typescript
// Enhanced middleware for resource ownership
export const resourceOwnerAuth = async (c: Context, next: Next, resourceIdParam: string) => {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Bearer token required" }, 401);
    }
    
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token, process.env.JWT_SECRET as string);
    
    if (!decoded) {
        return c.json({ error: "Invalid token" }, 401);
    }
    
    // Get resource ID from URL params
    const resourceId = c.req.param(resourceIdParam);
    
    // Check if user owns the resource or is admin
    if (decoded.user_type === 'admin' || decoded.user_id.toString() === resourceId) {
        c.user = decoded;
        return next();
    }
    
    return c.json({ error: "Access denied" }, 403);
};

// Usage example
app.get('/users/:id/profile', 
    (c, next) => resourceOwnerAuth(c, next, 'id'), 
    getUserProfile
);
```

#### B. Permission-Based Authorization
```typescript
// Define granular permissions
interface UserPermissions {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
}

// Permission mapping by role
const ROLE_PERMISSIONS: Record<string, UserPermissions> = {
    admin: {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManageUsers: true
    },
    user: {
        canRead: true,
        canWrite: true,
        canDelete: false,
        canManageUsers: false
    }
};

// Permission-based middleware
export const requirePermission = (permission: keyof UserPermissions) => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header("Authorization");
        
        if (!authHeader?.startsWith("Bearer ")) {
            return c.json({ error: "Bearer token required" }, 401);
        }
        
        const token = authHeader.substring(7);
        const decoded = await verifyToken(token, process.env.JWT_SECRET as string);
        
        if (!decoded) {
            return c.json({ error: "Invalid token" }, 401);
        }
        
        const userPermissions = ROLE_PERMISSIONS[decoded.user_type];
        
        if (!userPermissions || !userPermissions[permission]) {
            return c.json({ error: "Insufficient permissions" }, 403);
        }
        
        c.user = decoded;
        return next();
    };
};

// Usage
app.delete('/users/:id', requirePermission('canManageUsers'), deleteUser);
app.post('/posts', requirePermission('canWrite'), createPost);
```

### 2. **Advanced Security Patterns**

#### A. Rate Limiting by User
```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'user_actions',
    points: 100, // Number of requests
    duration: 900, // Per 15 minutes
});

export const userRateLimitAuth = async (c: Context, next: Next) => {
    // First authenticate
    const authResult = await bothRolesAuth(c, next);
    if (authResult) return authResult; // If auth failed, return error
    
    // Then apply rate limiting
    try {
        await rateLimiter.consume(c.user!.user_id.toString());
        return next();
    } catch (rejRes) {
        return c.json({ error: 'Too many requests' }, 429);
    }
};
```

#### B. Refresh Token Implementation
```typescript
interface RefreshTokenPayload {
    user_id: number;
    token_version: number; // For token revocation
}

export const generateTokenPair = (user: UserPayload) => {
    const accessToken = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign(
        { user_id: user.user_id, token_version: 1 }, 
        process.env.REFRESH_SECRET!, 
        { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
};

export const refreshTokenAuth = async (c: Context) => {
    const { refreshToken } = await c.req.json();
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as RefreshTokenPayload;
        
        // Get user and check token version
        const user = await getUserByIdService(decoded.user_id);
        if (!user || user.token_version !== decoded.token_version) {
            return c.json({ error: 'Invalid refresh token' }, 401);
        }
        
        // Generate new token pair
        const tokens = generateTokenPair({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            user_type: user.user_type
        });
        
        return c.json(tokens);
    } catch (error) {
        return c.json({ error: 'Invalid refresh token' }, 401);
    }
};
```

### 3. **Middleware Composition Patterns**

#### A. Middleware Chaining
```typescript
// Compose multiple auth checks
export const adminOrOwnerAuth = async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
        return c.json({ error: "Bearer token required" }, 401);
    }
    
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token, process.env.JWT_SECRET as string);
    
    if (!decoded) {
        return c.json({ error: "Invalid token" }, 401);
    }
    
    const resourceId = c.req.param('userId');
    
    // Allow if admin OR if user is accessing their own resource
    if (decoded.user_type === 'admin' || decoded.user_id.toString() === resourceId) {
        c.user = decoded;
        return next();
    }
    
    return c.json({ error: "Access denied" }, 403);
};
```

#### B. Conditional Authorization
```typescript
export const conditionalAuth = (condition: (user: DecodedToken, context: Context) => boolean) => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header("Authorization");
        
        if (!authHeader?.startsWith("Bearer ")) {
            return c.json({ error: "Bearer token required" }, 401);
        }
        
        const token = authHeader.substring(7);
        const decoded = await verifyToken(token, process.env.JWT_SECRET as string);
        
        if (!decoded) {
            return c.json({ error: "Invalid token" }, 401);
        }
        
        if (!condition(decoded, c)) {
            return c.json({ error: "Access denied" }, 403);
        }
        
        c.user = decoded;
        return next();
    };
};

// Usage
app.get('/posts/:id', 
    conditionalAuth((user, c) => {
        // Allow access if user is admin or post is public
        return user.user_type === 'admin' || c.req.query('visibility') === 'public';
    }), 
    getPost
);
```

### 4. **Error Handling & Logging**

#### A. Structured Error Responses
```typescript
interface AuthError {
    error: string;
    code: string;
    timestamp: string;
    path: string;
}

export const createAuthError = (c: Context, message: string, code: string, status: number): Response => {
    const error: AuthError = {
        error: message,
        code,
        timestamp: new Date().toISOString(),
        path: c.req.path
    };
    
    // Log security events
    console.warn(`Auth Error: ${code} - ${message} - Path: ${c.req.path} - IP: ${c.req.header('x-forwarded-for') || 'unknown'}`);
    
    return c.json(error, status);
};
```

#### B. Security Event Logging
```typescript
export const logSecurityEvent = (event: string, context: Context, user?: DecodedToken) => {
    const logData = {
        event,
        timestamp: new Date().toISOString(),
        ip: context.req.header('x-forwarded-for') || 'unknown',
        userAgent: context.req.header('user-agent') || 'unknown',
        path: context.req.path,
        method: context.req.method,
        userId: user?.user_id || null,
        userType: user?.user_type || null
    };
    
    console.log(JSON.stringify(logData));
    
    // In production, send to logging service
    // await sendToLogService(logData);
};
```

### 5. **Route Protection Patterns**

#### A. Route Groups with Common Auth
```typescript
// Group routes with same auth requirements
const adminRoutes = new Hono();
const userRoutes = new Hono();

// Apply auth to entire group
adminRoutes.use('*', adminRoleAuth);
userRoutes.use('*', bothRolesAuth);

// Define routes
adminRoutes.get('/users', getAllUsers);
adminRoutes.delete('/users/:id', deleteUser);

userRoutes.get('/profile', getUserProfile);
userRoutes.put('/profile', updateProfile);

// Mount route groups
app.route('/admin', adminRoutes);
app.route('/api', userRoutes);
```

#### B. Dynamic Authorization
```typescript
export const dynamicAuth = async (c: Context, next: Next) => {
    const route = c.req.path;
    const method = c.req.method;
    
    // Define route-specific auth rules
    const authRules: Record<string, UserRole> = {
        'GET:/api/users': 'both',
        'POST:/api/users': 'admin',
        'DELETE:/api/users': 'admin',
        'GET:/api/posts': 'both',
        'POST:/api/posts': 'user'
    };
    
    const routeKey = `${method}:${route}`;
    const requiredRole = authRules[routeKey] || 'both';
    
    return authMiddleware(c, next, requiredRole);
};
```

## 🎯 Recommended Implementation Strategy

### Phase 1: Immediate Improvements
1. **Fix Bearer Token Parsing** (already done in your current fix)
2. **Add proper error codes** for different auth failures
3. **Implement request logging** for security events

### Phase 2: Enhanced Security
1. **Add refresh tokens** for better user experience
2. **Implement rate limiting** per user
3. **Add permission-based authorization** for granular control

### Phase 3: Advanced Features
1. **Resource ownership checks**
2. **Dynamic authorization rules**
3. **Audit logging** and monitoring

## 🔧 Configuration Example

```typescript
// config/auth.config.ts
export const AUTH_CONFIG = {
    JWT: {
        ACCESS_TOKEN_EXPIRY: '15m',
        REFRESH_TOKEN_EXPIRY: '7d',
        ALGORITHM: 'HS256'
    },
    RATE_LIMITING: {
        MAX_REQUESTS: 100,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    SECURITY: {
        BCRYPT_ROUNDS: 12,
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
    }
};
```

## 🚨 Security Checklist

- ✅ **JWT Secret** stored in environment variables
- ✅ **Bearer token** format validation
- ✅ **Role-based** access control
- ⚠️ **Token expiration** (consider shorter access tokens + refresh)
- ⚠️ **Rate limiting** (implement per-user limits)
- ⚠️ **HTTPS only** (ensure in production)
- ⚠️ **Input validation** (validate all auth inputs)
- ⚠️ **Audit logging** (log all auth events)
- ⚠️ **Token revocation** (implement token blacklisting)
- ⚠️ **Password policies** (enforce strong passwords)

Your current implementation is solid! These suggestions will help you build a production-ready authorization system.