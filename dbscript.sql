CREATE DATABASE [TaskLinkDB]
GO

USE [TaskLinkDB]
GO

-- Users Table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(255) NOT NULL UNIQUE,
    [Password] NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    CreatedAt DATETIME DEFAULT GETDATE(),
	CheckTime INT DEFAULT 0,
    Streak INT DEFAULT 0
);

-- Task Lists Table
CREATE TABLE TaskLists (
    ListID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ListName NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Reapeat Table
CREATE TABLE [Repeat] (
	RepeatID INT IDENTITY(1,1) PRIMARY KEY,
	RepeatName NVARCHAR(255) NOT NULL,
	Unit NVARCHAR(255) NOT NULL,
	Duration INT
)

-- Tasks Table
CREATE TABLE Tasks (
    TaskID INT IDENTITY(1,1) PRIMARY KEY,
    ListID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Note NVARCHAR(MAX),
    DueDate DATETIME,
	RepeatID INT,
    [Priority] NVARCHAR(50) CHECK (Priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    [Status] NVARCHAR(50) CHECK (Status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ListID) REFERENCES TaskLists(ListID) ON DELETE CASCADE
);
GO

-- Insert Users
INSERT INTO Users (Username, [Password], Email)
VALUES 
('xuanphi', '123', 'xuanphi@gmail.com'),
('congthanh', '123', 'thanhphamcnt@gmail.com');
GO

-- Insert Task Lists
INSERT INTO TaskLists (UserID, ListName)
VALUES 
(1, 'My Task'),
(1, 'Work Tasks'),
(1, 'Personal Tasks'),
(2, 'My Task'),
(2, 'Shopping List');
GO

INSERT INTO [Repeat] (RepeatName, Unit, Duration)
VALUES
('Never', 'None', 0),
('Daily', 'Day', 1),
('Weekly', 'Day', 7),
('Biweekly', 'Day', 14),
('Monthly', 'Month', 1),
('Every 3 Months', 'Month', 3),
('Every 6 Months', 'Month', 6),
('Yearly', 'Year', 1);
GO

-- Insert Tasks
INSERT INTO Tasks (ListID, Title, Note, DueDate, RepeatID, [Priority], [Status])
VALUES 
(2, 'Finish report', 'Complete the quarterly report', '2024-11-10', 1, 'High', 'In Progress'),
(2, 'Team meeting', 'Discuss project updates', '2024-11-05', 2, 'Medium', 'Pending'),
(3, 'Buy groceries', 'Purchase items for the week', '2024-11-05', 3, 'Low', 'Pending'),
(5, 'Buy milk', 'Get 2 liters of milk', '2024-11-05', 4, 'Medium', 'Completed');
GO