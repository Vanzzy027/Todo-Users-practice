import { getDbPool } from "../db/dbconfig.ts"

interface TodoResponse {
    todo_id: number;
    todo_name: string;
    description: string;
    due_date: string;
    user_id: number;
    created_at: string;
}

//get all todos
export const getAllTodosService = async (): Promise<TodoResponse[] > => {
    const db = getDbPool(); // Get existing connection instead of creating new one
    const result = await db.request().query('SELECT * FROM Todos');
    // console.log("🚀 ~ getAllTodos ~ result:", result)
    return result.recordset;
}

//get todo by todo_id
export const getTodoByIdService = async (todo_id: number): Promise<TodoResponse | null> => {
    const db = getDbPool(); // Get existing connection
    const result = await db.request()
        .input('todo_id', todo_id)
        .query('SELECT * FROM Todos WHERE todo_id = @todo_id');
    return result.recordset[0] || null;
}

//create new todo
export const createTodoService = async (todo_name:string, description:string, due_date:string, user_id:number): Promise<string> => {
    const db = getDbPool(); // Get existing connection
    const result = await db.request()
        .input('todo_name', todo_name)
        .input('description', description)
        .input('due_date', due_date)
        .input('user_id', user_id)
        .query('INSERT INTO Todos (todo_name, description, due_date, user_id) OUTPUT INSERTED.* VALUES (@todo_name, @description, @due_date, @user_id)');
    return result.rowsAffected[0] === 1 ? "Todo Created Successfully" : "Failed create todo try again"
}

//update todo by todo_id
export const updateTodoService = async (todo_id:number, todo_name:string, description:string, due_date:string, user_id:number): Promise<string> => {
    const  db = getDbPool();
    const result = await db.request()
        .input('todo_id', todo_id)
        .input('todo_name', todo_name)
        .input('description', description)
        .input('due_date', due_date)
        .input('user_id', user_id)
        .query('UPDATE Todos SET todo_name = @todo_name, description = @description, due_date = @due_date, user_id = @user_id OUTPUT INSERTED.* WHERE todo_id = @todo_id');
    return result.rowsAffected[0] === 1 ? "Todo Updated Successfully" : "Failed to update todo try again"
}

//delete todo by todo_id
export const deleteTodoService = async (todo_id:number): Promise<string> => {
    const db = getDbPool(); // Get existing connection
    const result = await db.request()
        .input('todo_id', todo_id)
        .query('DELETE FROM Todos OUTPUT DELETED.* WHERE todo_id = @todo_id');
    return result.rowsAffected[0] === 1 ? "Todo deleted successfully" : "Failed to delete"
}
