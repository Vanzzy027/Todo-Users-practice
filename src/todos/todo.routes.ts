import { type Context, Hono } from 'hono'
import * as todoControllers from './todo.controller.ts'
import { adminRoleAuth } from 'src/middleware/bearAuth.ts'
// import { createTodo, deleteTodo, getAllTodos, getTodoById, updateTodo } from './todo.controller.ts'

const todoRoutes = new Hono()



// Get all todos
todoRoutes.get('/todos', adminRoleAuth, todoControllers.getAllTodos)

// Get todo by ID
todoRoutes.get('/todos/:todo_id', todoControllers.getTodoById)

// Create a new todo
todoRoutes.post('/todos', todoControllers.createTodo)

// Update a todo
todoRoutes.put('/todos/:todo_id', todoControllers.updateTodo)

// Delete a todo
todoRoutes.delete('/todos/:todo_id', todoControllers.deleteTodo)

export default todoRoutes