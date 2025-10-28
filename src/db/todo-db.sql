
-- USERS TABLE

IF OBJECT_ID('Users', 'U') IS NOT NULL
    DROP TABLE Users;
GO

CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('admin', 'user')) NOT NULL DEFAULT 'user'
);
GO

-- Insert sample users
INSERT INTO Users (first_name, last_name, email, phone_number, password, user_type) VALUES
('Amrit', 'Kariuki', 'amrit@gmail.com', '0712000001', 'password123', 'admin'),
('Kie', 'Mwende', 'kie@gmail.com', '0712000002', 'password123', 'user'),
('Terry', 'Otieno', 'terry@gmail.com', '0712000003', 'password123', 'user'),
('Joel', 'Mutua', 'joel@gmail.com', '0712000004', 'password123', 'user'),
('Faith', 'Wairimu', 'faith@gmail.com', '0712000005', 'password123', 'user');
GO



-- TODOS TABLE

IF OBJECT_ID('Todos', 'U') IS NOT NULL
    DROP TABLE Todos;
GO

CREATE TABLE Todos (
    todo_id INT IDENTITY(1,1) PRIMARY KEY,
    todo_title VARCHAR(100) NOT NULL,
    description VARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    due_date DATETIME,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
GO

-- Insert sample todos
INSERT INTO Todos (todo_title, description, due_date, user_id) VALUES
('Build Smart Home Dashboard', 'Design and implement the dashboard UI for IoT controls.', '2025-11-05', 1),
('Voice Command Integration', 'Connect ESP32 with voice control module.', '2025-11-10', 1),
('Weekly Standup', 'Prepare presentation for this week’s progress meeting.', '2025-10-30', 2),
('Fix BLE Bug', 'Debug BLE signal drop issue on ESP32.', '2025-11-01', 3),
('Redesign App UI', 'Modernize light control screen with Tailwind styling.', '2025-11-07', 4),
('Data Backup', 'Backup project database to cloud storage.', '2025-11-03', 5),
('Optimize API', 'Reduce latency on /books API endpoint.', '2025-11-06', 2),
('Add Authentication', 'Implement JWT + bcrypt-based user auth.', '2025-11-08', 3);
GO



-- COMMENTS TABLE

IF OBJECT_ID('Comments', 'U') IS NOT NULL
    DROP TABLE Comments;
GO

CREATE TABLE Comments (
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    comment_body VARCHAR(MAX) NOT NULL,
    todo_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (todo_id) REFERENCES Todos(todo_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
GO

-- Insert sample comments
INSERT INTO Comments (comment_body, todo_id, user_id) VALUES
('Dashboard UI looks dope so far!', 1, 2),
('Voice control latency improved after model tweak.', 2, 1),
('Meeting slides ready for review.', 3, 3),
('BLE bug traced to wrong UUID.', 4, 1),
('Love the new color scheme!', 5, 4),
('Backup process completed.', 6, 5),
('API optimization reduced response time by 40%.', 7, 2),
('JWT auth integrated successfully.', 8, 3),
('Consider adding dark mode toggle.', 1, 4),
('Security audit pending final check.', 8, 1);
GO



-- CLEANUP & RESEED COMMANDS (Optional)


-- Reseed identity values
DBCC CHECKIDENT ('Users', RESEED, 5);
DBCC CHECKIDENT ('Todos', RESEED, 8);
DBCC CHECKIDENT ('Comments', RESEED, 10);
GO
