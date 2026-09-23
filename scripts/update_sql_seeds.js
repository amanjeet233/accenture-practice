const { prisma } = require("../src/lib/prisma.ts");

async function updateSeeds() {
  // 1. find-duplicate-emails-or-records
  await prisma.question.update({
    where: { slug: "find-duplicate-emails-or-records" },
    data: {
      sqlSeedData: `
INSERT INTO Departments VALUES (1, 'IT'), (2, 'HR'), (3, 'Finance');
INSERT INTO Employees VALUES 
(1, 'Alice', 90000, 1, NULL),
(2, 'Bob', 80000, 1, 1),
(3, 'Charlie', 70000, 1, 1),
(4, 'Diana', 95000, 2, NULL),
(5, 'Evan', 60000, 2, 4),
(6, 'Fiona', 90000, 1, 1),
(7, 'Alice', 92000, 1, 1);
`.trim(),
    },
  });

  // 2. employees-earning-more-than-managers
  await prisma.question.update({
    where: { slug: "employees-earning-more-than-managers" },
    data: {
      sqlSeedData: `
INSERT INTO Departments VALUES (1, 'IT'), (2, 'HR'), (3, 'Finance');
INSERT INTO Employees VALUES 
(1, 'Alice', 90000, 1, NULL),
(2, 'Bob', 80000, 1, 1),
(3, 'Charlie', 70000, 1, 1),
(4, 'Diana', 95000, 2, NULL),
(5, 'Evan', 60000, 2, 4),
(6, 'Fiona', 105000, 1, 1);
`.trim(),
    },
  });

  // 3. heavy-watch-time-streaming-titles
  await prisma.question.update({
    where: { slug: "heavy-watch-time-streaming-titles" },
    data: {
      sqlSeedData: `
INSERT INTO Users VALUES (1, 'Alex', 28), (2, 'Brian', 22), (3, 'Chloe', 35), (4, 'Dan', 40);
INSERT INTO Movies VALUES 
(1, 'Inception', 'Action', 4.8),
(2, 'The Dark Knight', 'Action', 4.9),
(3, 'Interstellar', 'Sci-Fi', 4.7),
(4, 'Shutter Island', 'Thriller', 4.2),
(5, 'Extraction', 'Action', 3.8);
INSERT INTO WatchHistory VALUES 
(1, 1, 1, 95, '2024-06-01'),
(2, 1, 1, 120, '2024-06-02'),
(3, 2, 1, 110, '2024-06-03'),
(4, 3, 1, 100, '2024-06-04'),
(5, 4, 1, 105, '2024-06-05'),
(6, 1, 1, 115, '2024-06-06'),
(7, 2, 2, 130, '2024-06-07'),
(8, 3, 2, 140, '2024-06-08'),
(9, 4, 2, 125, '2024-06-09'),
(10, 1, 2, 110, '2024-06-10'),
(11, 2, 2, 95, '2024-06-11'),
(12, 3, 2, 105, '2024-06-12');
`.trim(),
    },
  });

  // 4. sql-employee-who-are-managers
  await prisma.question.update({
    where: { slug: "sql-employee-who-are-managers" },
    data: {
      sqlSeedData: `
INSERT INTO EmployeeDetails VALUES 
(1, 'Praful Sharma', 2, '2019-01-31', 'Jhansi'),
(2, 'Manglam Sen', NULL, '2023-01-30', 'Kolkata'),
(3, 'Mohit Agarwal', 2, '2022-11-27', 'New Delhi'),
(4, 'Sonia Verma', 3, '2021-08-15', 'Jhansi'),
(5, 'Rohit Roy', 3, '2022-03-12', 'Mumbai');

INSERT INTO EmployeeSalary VALUES 
(1, 'P1', 8000, 400),
(2, 'P2', 10000, 1000),
(3, 'P2', 7000, 1000),
(4, 'P1', 12000, 0),
(5, 'P3', 14000, 1500);
`.trim(),
    },
  });

  console.log("ALL SEEDS UPDATED SUCCESSFULLY!");
}

updateSeeds().catch(console.error);
