import { getDbPool } from "../db/dbconfig.ts"
import bcrypt from "bcryptjs";  

interface UserResponse {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    user_type?: string;
    password: string;
}

//get all users
export const getAllUsersService = async (): Promise<UserResponse[] > => {

        const db = getDbPool(); // Get existing connection instead of creating new one
        const query = 'SELECT * FROM Users';
        const result = await db.request().query(query);
        return result.recordset;
}

//get user by user_id
export const getUserByIdService = async (user_id: number): Promise<UserResponse | null> => {
        const db = getDbPool(); // Get existing connection
        const query = 'SELECT * FROM Users WHERE user_id = @user_id';
        const result = await db.request()
            .input('user_id', user_id)
            .query(query);
        return result.recordset[0] || null;
}

//get user by email
export const getUserByEmailService = async (email: string): Promise<UserResponse | null> => {
    const db = getDbPool(); // Get existing connection
    const query = 'SELECT * FROM Users WHERE email = @email';
    const result = await db.request()
        .input('email', email)
        .query(query);
    return result.recordset[0] || null;
}



// update user by user_id







// export const updateUserService = async (
//   user_id: number,
//   first_name: string,
//   last_name: string,
//   email: string,
//   phone_number: string,
//   password: string
// ): Promise<UserResponse | null> => {
//   try {
//     const db = getDbPool();

//     // ✅ fixed SQL syntax — OUTPUT must come after SET
//     const query = `
//       UPDATE Users
//       SET first_name = @first_name,
//           last_name = @last_name,
//           phone_number = @phone_number,
//           email = @email,
//           password = @password
//       OUTPUT INSERTED.*
//       WHERE user_id = @user_id
//     `;

//     // 🧠 debug log (optional — helps trace what’s being updated)
//     console.log('Updating user:', { user_id, first_name, last_name, email });

//     const result = await db.request()
//       .input('user_id', user_id)
//       .input('first_name', first_name)
//       .input('last_name', last_name)
//       .input('phone_number', phone_number)
//       .input('email', email)
//       .input('password', password)
//       .query(query);

//     return result.recordset[0] || null;

//   } catch (error: any) {
//     // 🚨 show SQL-level errors clearly
//     console.error('SQL Error in updateUserService:', error.message);
//     console.error('Stack trace:', error.stack);
//     throw error; // this will be caught by your controller
//   }
// };







// update user by user_id with password hashing
export const updateUserService = async (
  user_id: number,
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  password: string
) => {
  try {
    const db = getDbPool();

    // hash password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const query = `
      UPDATE Users
      SET first_name = @first_name,
          last_name = @last_name,
          phone_number = @phone_number,
          email = @email,
          password = @password
      OUTPUT INSERTED.*
      WHERE user_id = @user_id
    `;

    const result = await db.request()
      .input('user_id', user_id)
      .input('first_name', first_name)
      .input('last_name', last_name)
      .input('phone_number', phone_number)
      .input('email', email)
      .input('password', hashedPassword)
      .query(query);

    return result.recordset[0] || null;

  } catch (error: any) {
    console.error('SQL Error in updateUserService:', error.message);
    throw error;
  }
};














// //update user by user_id
// export const updateUserService = async (user_id:number, first_name:string,last_name:string,email:string,phone_number:string, password: string): Promise<UserResponse | null> => {
//         const  db = getDbPool();
//         const query = 'UPDATE Users SET first_name = @first_name, last_name = @last_name, phone_number = @phone_number, email = @email, password = @password OUTPUT INSERTED.* WHERE user_id = @user_id';
//         const result = await db.request()
//             .input('user_id', user_id)
//             .input('first_name', first_name)
//             .input('last_name', last_name)
//             .input('phone_number', phone_number)
//             .input('email', email)
//             .input('password', password) 
//             .query(query);
//         return result.recordset[0] || null;
// }


















//delete user by user_id
export const deleteUserService = async (user_id:number): Promise<string> => {
        const db = getDbPool(); // Get existing connection
        const query = 'DELETE FROM Users WHERE user_id = @user_id';
        const result = await db.request()
            .input('user_id', user_id)
            .query(query);
        return result.rowsAffected[0] === 1 ? "User deleted successfully 🎊" : "Failed to delete user";
}
