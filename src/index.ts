import { serve } from '@hono/node-server';
import { type Context, Hono } from 'hono';
import todoRoutes from './todos/todo.routes.ts';
import userRoutes from './users/user.routes.ts';
import  initDatabaseConnection  from './db/dbconfig.ts'
import {logger} from 'hono/logger'
import { prometheus } from '@hono/prometheus';
import { limiter } from './middleware/rateLimiter.ts';
import authRoutes from './auth/auth.route.ts';

const app = new Hono();

//prometheus middleware
const {printMetrics, registerMetrics} =  prometheus()

app.use('*', registerMetrics); //prometheus to monitor metrics
app.get('/metrics', printMetrics); //endpoint to expose metrics

// Apply logger middleware
app.use('*', logger()); //logs request and response to the console

// Apply rate limiter middleware
app.use(limiter);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Hono.js API Server',
    documentation: 'Visit /api for available endpoints',
    status: 'running'
  });
});

// API routes
app.get('/api', (c:Context) => {
  return c.json({
    message: 'Welcome to the Hono.js API',
    routes: {
      todos: {
        getAll: '/api/todos [GET]',
        getById: '/api/todos/:todo_id [GET]',
        create: '/api/todos [POST]',
        update: '/api/todos/:todo_id [PUT]',
        delete: '/api/todos/:todo_id [DELETE]'
      },
      users: {
        getAll: '/api/users [GET]',
        getById: '/api/users/:user_id [GET]',
        create: '/api/users [POST]',
        update: '/api/users/:user_id [PUT]',
        delete: '/api/users/:user_id [DELETE]'
      }
    }
  },200);
});


// 404 handler
app.notFound((c: Context) => {
  return c.json({
    success: false,
    message: 'Route not found',
    path: c.req.path
  }, 404);
});

// Mount API routes
app.route("/api", todoRoutes);
app.route("/api", userRoutes);
app.route("/api", authRoutes);


const port = Number(process.env.PORT) || 3000;


// Establish DB connection and then start the server
initDatabaseConnection()
  .then(() => {
    // Start the server only after DB connection is established
    serve({
      fetch: app.fetch,
      port
    }, (info) => {
      console.log(`🚀 Server is running on http://localhost:${info.port}`);
    })
  }).catch((error) => {
    console.error('Failed to initialize database connection:', error);
  });


