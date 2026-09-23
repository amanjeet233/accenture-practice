const BATCH_4 = [
  {
    slug: "sql-employee-upper-name-lower-city",
    explanation: `### Problem Overview
Transform string attributes by converting employee full names to uppercase and their home cities to lowercase from \`EmployeeDetails\`.

### SQL String Scalar Functions
- \`UPPER(str)\`: Converts all alphabetical characters in \`str\` to uppercase.
- \`LOWER(str)\`: Converts all alphabetical characters in \`str\` to lowercase.
- Aliases: Use \`AS upper_name\` and \`AS lower_city\` to format output headers.

### Step-by-Step Walkthrough
- **Step 1**: Target the \`EmployeeDetails\` table.
- **Step 2**: Apply \`UPPER(FullName) AS upper_name\`.
- **Step 3**: Apply \`LOWER(City) AS lower_city\`.
- **Step 4**: Sort deterministically by \`EmpId ASC\`.`,
    approach: `### SQL Approach: String Formatting Functions

\`\`\`sql
SELECT 
    UPPER(FullName) AS upper_name, 
    LOWER(City) AS lower_city 
FROM EmployeeDetails 
ORDER BY EmpId;
\`\`\`

#### Key Concept:
String scalar functions do not modify table data on disk; they apply row-level transformations dynamically during query projection.`
  },
  {
    slug: "sql-employee-project-wise-count",
    explanation: `### Problem Overview
Determine the headcount allocated to each distinct project in \`EmployeeSalary\`. Order results by employee count in descending order.

### Aggregation with GROUP BY
- \`GROUP BY Project\`: Collapses all records sharing the same project code into a single group.
- \`COUNT(*)\`: Evaluates the total number of records per group.
- Tie-breaking: Use secondary sort \`Project ASC\` for deterministic ordering when counts match.

### Step-by-Step Walkthrough
- **Step 1**: Target table \`EmployeeSalary\`.
- **Step 2**: Group rows by \`Project\`.
- **Step 3**: Count employees using \`COUNT(*) AS employee_count\`.
- **Step 4**: Sort by \`employee_count DESC, Project ASC\`.`,
    approach: `### SQL Approach: Grouped Aggregation & Sorting

\`\`\`sql
SELECT 
    Project, 
    COUNT(*) AS employee_count 
FROM EmployeeSalary 
GROUP BY Project 
ORDER BY employee_count DESC, Project ASC;
\`\`\`

#### Performance Tip:
An index on \`(Project)\` allows the database engine to perform an index scan for grouping without a full table sort.`
  },
  {
    slug: "sql-employee-who-are-managers",
    explanation: `### Problem Overview
Identify employees in \`EmployeeDetails\` who manage other employees (i.e. their \`EmpId\` appears as a \`ManagerId\` for one or more team members).

### Subquery / Semi-Join Logic
- Employees who are managers have their ID referenced in the \`ManagerId\` column of other rows.
- Filter out \`NULL\` manager IDs to prevent unexpected boolean logic in SQL subqueries.
- Use \`IN (SELECT DISTINCT ManagerId FROM ... WHERE ManagerId IS NOT NULL)\` or an \`EXISTS\` semi-join.

### Step-by-Step Walkthrough
- **Step 1**: Extract the unique manager IDs: \`SELECT DISTINCT ManagerId FROM EmployeeDetails WHERE ManagerId IS NOT NULL\`.
- **Step 2**: In outer query, select all columns from \`EmployeeDetails\` where \`EmpId\` matches any id in that subquery.
- **Step 3**: Sort results by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Uncorrelated Subquery (Semi-Join)

\`\`\`sql
SELECT * 
FROM EmployeeDetails 
WHERE EmpId IN (
    SELECT DISTINCT ManagerId 
    FROM EmployeeDetails 
    WHERE ManagerId IS NOT NULL
)
ORDER BY EmpId;
\`\`\`

#### Alternative Pattern (Correlated EXISTS):
\`\`\`sql
SELECT * 
FROM EmployeeDetails e1
WHERE EXISTS (
    SELECT 1 
    FROM EmployeeDetails e2 
    WHERE e2.ManagerId = e1.EmpId
);
\`\`\``
  },
  {
    slug: "sql-employee-odd-rows",
    explanation: `### Problem Overview
Fetch all odd-numbered records from \`EmployeeDetails\` based on \`EmpId % 2 != 0\`.

### Modulo Arithmetic in SQL
- The modulo operator (\`%\`) computes the remainder after integer division.
- Odd numbers divided by 2 yield a remainder of 1 (or \`!= 0\`).
- If row positions are required instead of primary key IDs, window function \`ROW_NUMBER() OVER (ORDER BY EmpId)\` can be used.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeDetails\`.
- **Step 2**: Add filter predicate \`WHERE EmpId % 2 != 0\`.
- **Step 3**: Order rows by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Integer Modulo Filtering

\`\`\`sql
SELECT * 
FROM EmployeeDetails 
WHERE EmpId % 2 != 0 
ORDER BY EmpId;
\`\`\`

#### Row Number Alternative (ANSI SQL):
\`\`\`sql
WITH Ranked AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY EmpId) AS rn
    FROM EmployeeDetails
)
SELECT EmpId, FullName, ManagerId, DateOfJoining, City
FROM Ranked
WHERE rn % 2 != 0;
\`\`\``
  },
  {
    slug: "sql-employee-even-rows",
    explanation: `### Problem Overview
Fetch all even-numbered records from \`EmployeeDetails\` based on \`EmpId % 2 = 0\`.

### Modulo Arithmetic in SQL
- \`EmpId % 2 = 0\` tests whether \`EmpId\` is evenly divisible by 2.
- Used frequently in interview questions to assess understanding of mathematical expressions and filtering predicates in SQL.

### Step-by-Step Walkthrough
- **Step 1**: Query \`EmployeeDetails\`.
- **Step 2**: Add filter condition: \`WHERE EmpId % 2 = 0\`.
- **Step 3**: Sort ascending by \`EmpId\`.`,
    approach: `### SQL Approach: Even Modulo Filtering

\`\`\`sql
SELECT * 
FROM EmployeeDetails 
WHERE EmpId % 2 = 0 
ORDER BY EmpId;
\`\`\`

#### Verification:
Ensures records with IDs like 102, 104, 106 are selected while odd IDs (101, 103, 105) are filtered out.`
  },
  {
    slug: "sql-employee-third-highest-salary",
    explanation: `### Problem Overview
Find the 3rd highest salary from \`EmployeeSalary\` without using pagination keywords like \`TOP\`, \`LIMIT\`, or \`OFFSET\`.

### Correlated Subquery Technique
- To find the N-th highest distinct value without \`LIMIT\`:
  For a candidate salary \`S1.Salary\`, count how many distinct salaries in the table are strictly greater than it.
- For the 1st highest salary: exactly 0 salaries are greater.
- For the 2nd highest salary: exactly 1 salary is greater.
- For the **3rd highest salary**: exactly **2** distinct salaries are greater.
- Condition: \`WHERE 2 = (SELECT COUNT(DISTINCT S2.Salary) FROM EmployeeSalary S2 WHERE S2.Salary > S1.Salary)\`.

### Step-by-Step Walkthrough
- **Step 1**: Alias outer query table as \`S1\`.
- **Step 2**: For each candidate \`S1.Salary\`, run correlated subquery on \`S2\`.
- **Step 3**: Subquery filters \`S2.Salary > S1.Salary\` and computes \`COUNT(DISTINCT S2.Salary)\`.
- **Step 4**: Filter outer query to rows where this count equals \`2\`.
- **Step 5**: Select \`DISTINCT Salary\`.`,
    approach: `### SQL Approach: Correlated Subquery Without LIMIT

\`\`\`sql
SELECT DISTINCT Salary 
FROM EmployeeSalary S1 
WHERE 2 = (
    SELECT COUNT(DISTINCT S2.Salary) 
    FROM EmployeeSalary S2 
    WHERE S2.Salary > S1.Salary
);
\`\`\`

#### Modern Alternative (DENSE_RANK Window Function):
\`\`\`sql
WITH RankedSalaries AS (
    SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) as rnk
    FROM EmployeeSalary
)
SELECT DISTINCT Salary 
FROM RankedSalaries 
WHERE rnk = 3;
\`\`\``
  },
  {
    slug: "sql-employee-total-salary-by-project",
    explanation: `### Problem Overview
Calculate the total salary budget/expenditure for each project from \`EmployeeSalary\`. Order results by total expenditure in descending order.

### Summation by Category
- \`SUM(Salary)\`: Computes the numerical sum of salaries allocated to each project.
- \`GROUP BY Project\`: Aggregates records by project identifier.
- Order by \`total_salary DESC\` to place the highest expenditure projects at the top.

### Step-by-Step Walkthrough
- **Step 1**: Target table \`EmployeeSalary\`.
- **Step 2**: Group by column \`Project\`.
- **Step 3**: Aggregate with \`SUM(Salary) AS total_salary\`.
- **Step 4**: Sort with \`ORDER BY total_salary DESC\`.`,
    approach: `### SQL Approach: Grouped Aggregation with SUM

\`\`\`sql
SELECT 
    Project, 
    SUM(Salary) AS total_salary 
FROM EmployeeSalary 
GROUP BY Project 
ORDER BY total_salary DESC;
\`\`\`

#### Handling NULLs:
If any employee has an unassigned project (\`NULL\`), SQL groups all nulls together into one group. To exclude unassigned projects, append \`WHERE Project IS NOT NULL\` before the \`GROUP BY\` clause.`
  },
  {
    slug: "sql-employee-paid-above-average",
    explanation: `### Problem Overview
Retrieve the employee details (\`EmpId\`, \`FullName\`, and \`Salary\`) for employees who earn strictly more than the overall average company salary.

### Subquery Comparison
- Outer query needs to inspect both identity (\`EmployeeDetails\`) and compensation (\`EmployeeSalary\`).
- A scalar subquery \`(SELECT AVG(Salary) FROM EmployeeSalary)\` computes the organization-wide average.
- Join the two tables on \`EmpId\` and apply the condition \`Salary > (SELECT AVG(Salary) ...)\`.

### Step-by-Step Walkthrough
- **Step 1**: Join \`EmployeeDetails ed\` with \`EmployeeSalary es\` on \`ed.EmpId = es.EmpId\`.
- **Step 2**: Calculate global average salary in subquery: \`SELECT AVG(Salary) FROM EmployeeSalary\`.
- **Step 3**: Filter with \`WHERE es.Salary > (SELECT AVG(Salary) FROM EmployeeSalary)\`.
- **Step 4**: Select \`ed.EmpId, ed.FullName, es.Salary\` and sort by \`ed.EmpId ASC\`.`,
    approach: `### SQL Approach: Inner Join with Scalar Subquery Filter

\`\`\`sql
SELECT 
    ed.EmpId, 
    ed.FullName, 
    es.Salary 
FROM EmployeeDetails ed 
JOIN EmployeeSalary es ON ed.EmpId = es.EmpId 
WHERE es.Salary > (
    SELECT AVG(Salary) 
    FROM EmployeeSalary
) 
ORDER BY ed.EmpId;
\`\`\`

#### Key Concept:
The scalar subquery executes once (or gets optimized by the query planner into a scalar constant) and filters the joined dataset.`
  },
  {
    slug: "sql-employee-average-salary-by-project",
    explanation: `### Problem Overview
Calculate the average salary for each project from \`EmployeeSalary\`, rounded to 2 decimal places. Order the results alphabetically by project name.

### Aggregation and Rounding
- \`AVG(Salary)\`: Computes the arithmetic mean of salaries within each project group.
- \`ROUND(..., 2)\`: Truncates/rounds the floating point result to 2 decimal precision.
- \`GROUP BY Project\`: Partitions employee salaries by project name.

### Step-by-Step Walkthrough
- **Step 1**: Query \`EmployeeSalary\`.
- **Step 2**: Group by \`Project\`.
- **Step 3**: Compute \`ROUND(AVG(Salary), 2) AS avg_salary\`.
- **Step 4**: Sort by \`Project ASC\`.`,
    approach: `### SQL Approach: Grouped Mean Aggregation

\`\`\`sql
SELECT 
    Project, 
    ROUND(AVG(Salary), 2) AS avg_salary 
FROM EmployeeSalary 
GROUP BY Project 
ORDER BY Project;
\`\`\`

#### Edge Cases:
Projects with only 1 employee return that single employee's salary as the average. Non-numerical salary fields would produce a runtime error, so ensure the column type is numeric/integer.`
  },
  {
    slug: "sql-employee-name-char-length",
    explanation: `### Problem Overview
Display the employee ID, full name, and total character length of the full name from \`EmployeeDetails\`.

### The LENGTH / LEN Function
- ANSI SQL and SQLite support \`LENGTH(string)\`, which returns the number of characters in the string, including whitespace characters.
- In T-SQL / SQL Server, \`LEN(string)\` is used instead.
- Column alias: \`AS name_length\`.

### Step-by-Step Walkthrough
- **Step 1**: Target table \`EmployeeDetails\`.
- **Step 2**: Select \`EmpId\` and \`FullName\`.
- **Step 3**: Calculate \`LENGTH(FullName) AS name_length\`.
- **Step 4**: Sort deterministically by \`EmpId ASC\`.`,
    approach: `### SQL Approach: String Character Length Calculation

\`\`\`sql
SELECT 
    EmpId, 
    FullName, 
    LENGTH(FullName) AS name_length 
FROM EmployeeDetails 
ORDER BY EmpId;
\`\`\`

#### Note on Spaces:
\`LENGTH('John Doe')\` yields \`8\` because the single space between first and last name counts as 1 character.`
  },
  {
    slug: "sql-employee-even-salary",
    explanation: `### Problem Overview
Find all employee IDs and their respective salaries where the salary amount is an even number (\`Salary % 2 = 0\`).

### Even Value Evaluation
- Use modulo operator: \`Salary % 2 = 0\` evaluates whether dividing salary by 2 leaves no remainder.
- An even integer ends in 0, 2, 4, 6, or 8.

### Step-by-Step Walkthrough
- **Step 1**: Target table \`EmployeeSalary\`.
- **Step 2**: Apply predicate: \`WHERE Salary % 2 = 0\`.
- **Step 3**: Project \`EmpId, Salary\`.
- **Step 4**: Order results by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Modulo Operator on Numeric Columns

\`\`\`sql
SELECT 
    EmpId, 
    Salary 
FROM EmployeeSalary 
WHERE Salary % 2 = 0 
ORDER BY EmpId;
\`\`\`

#### Practical Use:
Modulo conditions are frequently used in database partitioning (hash partitioning) and batch distribution algorithms.`
  }
];

module.exports = { BATCH_4 };
