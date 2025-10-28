import { type Context } from "hono"
import * as userServices from "./user.service.ts";
import bcrypt from "bcryptjs";



//get all users
export const getAllUsers = async (c: Context) => {
    try {
        const result = await userServices.getAllUsersService();
        // console.log("🚀 ~ getAllUsers ~ result:", result)
        if (result.length === 0) {
            return c.json({ message: 'No users found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching users:', error.message);
        return c.json({ error: 'Failed to fetch users' }, 500);
    }
}

//get user by user_id
export const getUserById = async (c: Context) => {
    const user_id = parseInt(c.req.param('user_id'))
    try {
        const result = await userServices.getUserByIdService(user_id);
        if (result === null) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching user:', error);
        return c.json({ error: 'Failed to fetch user' }, 500);
    }
}







//Updating just one user by user_id
export const updateUser = async (c: Context) => {
  try {
    const user_id = parseInt(c.req.param('user_id'));
    console.log("User ID:", user_id);

    const body = await c.req.json();

    const checkExists = await userServices.getUserByIdService(user_id);
    if (!checkExists) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (body.password) {
      const saltRounds = bcrypt.genSaltSync(10);
      body.password = bcrypt.hashSync(body.password, saltRounds);
    }

    const result = await userServices.updateUserService(
      user_id,
      body.first_name,
      body.last_name,
      body.email,
      body.phone_number,
      body.password
    );

    if (!result) {
      return c.json({ error: 'Failed to update user' }, 400);
    }

    return c.json({ message: 'User updated successfully', updated_user: result }, 200);
  } catch (error: any) {
    console.error('Error updating user:', error.message, error.stack);
    return c.json({ error: "Can't update user" }, 500);
  }
};


// update multiple users

// update multiple users
export const updateUsers = async (c: Context) => {
    try {
        const users = await c.req.json(); // expecting array of users

        if (!Array.isArray(users) || users.length === 0) {
            return c.json({ message: 'Invalid or empty user data' }, 400);
        }

        const results = [];
        for (const user of users) {
            const { user_id, first_name, last_name, email, phone_number, password } = user;
            const updatedUser = await userServices.updateUserService(
                user_id,
                first_name,
                last_name,
                email,
                phone_number,
                password
            );
            results.push(updatedUser);
        }

        return c.json({
            message: 'Users updated successfully',
            updatedUsers: results
        }, 200);

    } catch (error) {
        console.error('Bulk update error:', error);
        return c.json({ message: 'Server error', error }, 500);
    }
};



// export const updateUsers = async (req: Request, res: Response) => {
//   try {
//     const users = req.body; // expecting an array of user objects

//     if (!Array.isArray(users) || users.length === 0) {
//       return res.status(400).json({ message: 'Invalid or empty user data' });
//     }

//     const results = [];
//     for (const user of users) {
//       const { user_id, first_name, last_name, email, phone_number, password } = user;
//       const updatedUser = await userServices.updateUserService(
//         user_id,
//         first_name,
//         last_name,
//         email,
//         phone_number,
//         password
//       );
//       results.push(updatedUser);
//     }

//     return res.status(200).json({
//       message: 'Users updated successfully',
//       updatedUsers: results
//     });
//   } catch (error) {
//     console.error('Bulk update error:', error);
//     return res.status(500).json({ message: 'Server error', error });
//   }
// };







// //update user by user_id
// export const updateUser = async (c: Context) => {
//     try {
//         const user_id = parseInt(c.req.param('user_id'))
//         const body = await c.req.json()

//         //check if user exists
//         const checkExists = await userServices.getUserByIdService(user_id);
//         if (checkExists === null) {
//             return c.json({ error: 'User not found' }, 404);
        
//         }
//                 //hash password
//                 const saltRounds = bcrypt.genSaltSync(10);
//                 const hashedPassword = bcrypt.hashSync(body.password, saltRounds);
//                 body.password = hashedPassword;
//                 // console.log("Hashed Password", hashedPassword)
//                 // console.log("Body to send to DB", body)



//         const result = await userServices.updateUserService(user_id, body.first_name, body.last_name, body.email, body.phone_number, body.password);
//         if (result === null) {
//             return c.json({ error: 'Failed to update user' }, 404);
//         }

//         return c.json({ message: 'User updated successfully', updated_user: result }, 200);
//     } catch (error) {
//         console.error('Error updating user:', error);
//         return c.json({ error: "Can't update user" }, 500);
//     }
// }


//delete user by user_id
export const deleteUser = async (c: Context) => {
    const user_id = parseInt(c.req.param('user_id'))
    try {
        //check if user exists
        const check = await userServices.getUserByIdService(user_id);
        if (check === null) {
            return c.json({ error: 'User not found' }, 404);
        }

        //delete user if exists
        const result = await userServices.deleteUserService(user_id);
        if (result === null) {
            return c.json({ error: 'Failed to delete user' }, 404);
        }

        return c.json({ message: 'User deleted successfully', deleted_user: result }, 200);
    } catch (error) {
        console.error('Error deleting user:', error);
        return c.json({ error: 'Failed to delete user' }, 500);
    }
}
