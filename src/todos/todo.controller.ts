import { type Context } from "hono"
import * as todoService from "./todo.service.ts"


export const getAllTodos = async (c: Context) => {
    const todos = await todoService.getAllTodosService();
    if (todos.length === 0) {
        return c.json({ message: 'No todos found' }, 404);
    }
    return c.json(todos);
}


//get todo by todo_id
export const getTodoById = async (c: Context) => {
     const todo_id = parseInt(c.req.param('todo_id'))
    //  console.log("🚀 ~ getTodoById ~ todo_id:", todo_id)
    try {
        const result = await todoService.getTodoByIdService(todo_id);
        if (result === null) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching todo:', error);
        return c.json({ error: 'Failed to fetch todo' }, 500);
    }
}

export const createTodo = async (c:Context) => {
    
    const body = await c.req.json() as  {todo_name:string,description:string,due_date:string,user_id:number}
    try {
        const result = await todoService.createTodoService(body.todo_name, body.description, body.due_date, body.user_id);
        if (result === "Todo Created Successfully") {
            return c.json({ message: result }, 201);
        }else {
            return c.json({ error: 'Failed to create todo' }, 500);
        }
    } catch (error) {
        console.error('Error creating todo:', error);
        return c.json({ error: 'Failed to create todo' }, 500);
    }
}

export const updateTodo = async (c:Context) => {
    const todo_id = Number(c.req.param('todo_id'))
    const body = await c.req.json() as  {todo_name?:string,description?:string,due_date?:string,user_id?:number}
    try {
          
        //check if todo exists
        const checkIfExists = await todoService.getTodoByIdService(todo_id);
        // console.log("🚀 ~ updateTodo ~ check:", check)
        if (checkIfExists === null) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        const result = await todoService.updateTodoService(todo_id, body.todo_name || '', body.description || '', body.due_date || '', body.user_id || 0);
        if (result === "Todo Updated Successfully") {
            return c.json({ error: 'Failed to update todo' }, 500);
        }
        return c.json({ message: result}, 200);
    } catch (error) {
        console.error('Error updating todo:', error);
        return c.json({ error: 'Failed to update todo' }, 500);
    }
}

export const deleteTodo = async(c:Context) => {
    const todo_id = parseInt(c.req.param('todo_id'))
    
    try {
        //check if todo exists
        const check = await todoService.getTodoByIdService(Number(todo_id));
        if (check === null) {
            return c.json({ error: 'Todo not found' }, 404);
        }
        //delete todo
        const result = await todoService.deleteTodoService(todo_id);
        if (result === null) {
            return c.json({ error: 'Failed to delete todo' }, 500);
        }
        return c.json({ message: result }, 200);
    } catch (error) {
        console.error('Error deleting todo:', error);
        return c.json({ error: 'Failed to delete todo' }, 500);
    }
}
