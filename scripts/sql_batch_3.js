const BATCH_3 = [
  {
    slug: "sql-employee-salary-max-min-avg",
    explanation: `### Problem Overview
Find the maximum, minimum, and average salary from the \`EmployeeSalary\` table. The average should be rounded to 2 decimal places.

### Aggregate Functions in SQL
- \`MAX(column)\`: Finds the highest numerical value in the set.
- \`MIN(column)\`: Finds the lowest numerical value in the set.
- \`AVG(column)\`: Calculates the arithmetic mean across all non-null values.
- \`ROUND(value, decimals)\`: Formats numerical decimals.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeSalary\`.
- **Step 2**: Calculate \`MAX(Salary) AS MaxSalary\`.
- **Step 3**: Calculate \`MIN(Salary) AS MinSalary\`.
- **Step 4**: Calculate \`ROUND(AVG(Salary), 2) AS AvgSalary\`.`,
    approach: `### SQL Approach: Multi-Metric Scalar Aggregation

\`\`\`sql
SELECT 
    MAX(Salary) AS MaxSalary,
    MIN(Salary) AS MinSalary,
    ROUND(AVG(Salary), 2) AS AvgSalary
FROM EmployeeSalary;
\`\`\`

#### Key Concept:
Aggregate functions without a \`GROUP BY\` clause operate over the entire table and return exactly one summary row.`
  },
  {
    slug: "sql-employee-salary-between-9000-15000",
    explanation: `### Problem Overview
Find the employee ID and salary of all employees whose base salary is between 9,000 and 15,000 (inclusive). Order by salary descending.

### The BETWEEN Operator
- In SQL, \`BETWEEN val1 AND val2\` is **inclusive** on both boundaries: equivalent to \`Salary >= 9000 AND Salary <= 15000\`.
- Highly readable and leverages index range scans.

### Step-by-Step Walkthrough
- **Step 1**: Query \`EmployeeSalary\`.
- **Step 2**: Apply range predicate: \`WHERE Salary BETWEEN 9000 AND 15000\`.
- **Step 3**: Project \`EmpId, Salary\`.
- **Step 4**: Sort by \`Salary DESC, EmpId ASC\`.`,
    approach: `### SQL Approach: Range Scan with BETWEEN Operator

\`\`\`sql
SELECT EmpId, Salary
FROM EmployeeSalary
WHERE Salary BETWEEN 9000 AND 15000
ORDER BY Salary DESC, EmpId ASC;
\`\`\`

#### Boundary Verification:
Values of exactly 9,000 and 15,000 are included in the result set because \`BETWEEN\` is inclusive in ANSI SQL.`
  },
  {
    slug: "sql-employee-city-or-manager",
    explanation: `### Problem Overview
Retrieve all employee IDs who live in \`'Jhansi'\` OR whose direct manager ID is \`100\`. Order by employee ID.

### The OR Boolean Operator
- In contrast to \`AND\`, the \`OR\` operator includes a record if **either** condition evaluates to true (or both).

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeDetails\`.
- **Step 2**: Apply disjunctive condition: \`WHERE City = 'Jhansi' OR ManagerId = 100\`.
- **Step 3**: Return \`EmpId\` ordered by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Disjunctive Filtering with OR Conjunction

\`\`\`sql
SELECT EmpId
FROM EmployeeDetails
WHERE City = 'Jhansi' OR ManagerId = 100
ORDER BY EmpId ASC;
\`\`\`

#### Optimization Note:
Relational query planners can optimize \`OR\` conditions by utilizing bitmap index scans or index unions if separate indexes exist on \`City\` and \`ManagerId\`.`
  },
  {
    slug: "sql-employee-projects-other-than-p2",
    explanation: `### Problem Overview
Fetch all employee IDs who work on projects other than project \`'P2'\`. Order results by employee ID.

### Relational Inequality Operators
- In SQL, inequality is represented by either \`\`<>\`\` (ANSI standard) or \`\`!=\`\` (widely supported).
- Both return rows where the column value is explicitly not equal to \`'P2'\`.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeSalary\`.
- **Step 2**: Filter: \`WHERE Project <> 'P2'\`.
- **Step 3**: Return \`EmpId\` ordered by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Inequality Filtering

\`\`\`sql
SELECT EmpId
FROM EmployeeSalary
WHERE Project <> 'P2'
ORDER BY EmpId ASC;
\`\`\`

#### Crucial Note on NULLs:
In SQL ternary logic, if \`Project\` is NULL, \`NULL <> 'P2'\` evaluates to UNKNOWN (not true). If employees without projects should be included, use \`WHERE Project <> 'P2' OR Project IS NULL\`.`
  },
  {
    slug: "sql-employee-total-salary-variable",
    explanation: `### Problem Overview
Calculate the total compensation (\`TotalSalary\`) for each employee by summing their base \`Salary\` and discretionary \`Variable\` bonus.

### Column Arithmetic & NULL Handling
- In SQL, adding columns directly: \`Salary + Variable\`.
- If \`Variable\` can be NULL, standard addition produces NULL.
- We use \`COALESCE(Variable, 0)\` to treat NULL bonuses as 0.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeSalary\`.
- **Step 2**: Project \`EmpId\` and computed expression \`Salary + COALESCE(Variable, 0) AS TotalSalary\`.
- **Step 3**: Order by \`TotalSalary DESC\`.`,
    approach: `### SQL Approach: Computed Column with Null-Coalesced Addition

\`\`\`sql
SELECT 
    EmpId, 
    (Salary + COALESCE(Variable, 0)) AS TotalSalary
FROM EmployeeSalary
ORDER BY TotalSalary DESC;
\`\`\`

#### Key Concept:
\`COALESCE(expression, fallback)\` returns the first non-null argument, protecting against accidental NULL propagation in arithmetic calculations.`
  },
  {
    slug: "sql-employee-name-second-letter-a",
    explanation: `### Problem Overview
Display the full names of all employees where the second character of their \`FullName\` is lowercase \`'a'\` or uppercase \`'A'\`.

### Pattern Matching Wildcards in SQL (LIKE)
- \`_\` (underscore): Matches exactly one arbitrary character.
- \`%\` (percent): Matches zero or more arbitrary characters.
- \`_a%\`: Matches any string where the 1st character is anything, the 2nd character is \`'a'\`, and subsequent characters can be anything.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeDetails\`.
- **Step 2**: Apply pattern match: \`WHERE FullName LIKE '_a%' OR FullName LIKE '_A%'\` (or case-insensitive LIKE).
- **Step 3**: Project \`FullName\` ordered alphabetically.`,
    approach: `### SQL Approach: Single-Character Wildcard Pattern Matching

\`\`\`sql
SELECT FullName
FROM EmployeeDetails
WHERE FullName LIKE '_a%' OR FullName LIKE '_A%'
ORDER BY FullName ASC;
\`\`\`

#### Pattern Breakdown:
- Position 1: \`_\` matches any character.
- Position 2: \`a\` or \`A\` matches letter A.
- Position 3+: \`%\` matches any remaining characters.`
  },
  {
    slug: "sql-employee-union-emp-ids",
    explanation: `### Problem Overview
Fetch all employee IDs present in either the \`EmployeeDetails\` table OR the \`EmployeeSalary\` table, without duplicates.

### Set Operations: UNION vs UNION ALL
- \`UNION\`: Combines the result sets of two queries and automatically strips duplicate rows through a sort/hash pass.
- \`UNION ALL\`: Combines the result sets without deduplication.
- Since we need distinct IDs present in either table, \`UNION\` is the exact relational operator.

### Step-by-Step Walkthrough
- **Step 1**: Select \`EmpId FROM EmployeeDetails\`.
- **Step 2**: Apply \`UNION\`.
- **Step 3**: Select \`EmpId FROM EmployeeSalary\`.
- **Step 4**: Order the combined set: \`ORDER BY EmpId ASC\`.`,
    approach: `### SQL Approach: Relational Set UNION

\`\`\`sql
SELECT EmpId FROM EmployeeDetails
UNION
SELECT EmpId FROM EmployeeSalary
ORDER BY EmpId ASC;
\`\`\`

#### Relational Algebra:
Implements set union \\( A \\cup B \\). Automatically deduplicates employees who exist in both tables.`
  },
  {
    slug: "sql-employee-intersect-emp-ids",
    explanation: `### Problem Overview
Fetch all employee IDs that are present in BOTH \`EmployeeDetails\` AND \`EmployeeSalary\`.

### Set Operations: INTERSECT and INNER JOIN
- \`INTERSECT\`: Returns rows that appear in both query result sets.
- Can also be implemented using an \`INNER JOIN\` on \`EmpId\` or \`WHERE EmpId IN (SELECT EmpId FROM EmployeeSalary)\`.

### Step-by-Step Walkthrough
- **Step 1**: Query \`EmpId FROM EmployeeDetails\`.
- **Step 2**: Intersect with \`EmpId FROM EmployeeSalary\`.
- **Step 3**: Order by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Relational Set INTERSECT

\`\`\`sql
SELECT EmpId FROM EmployeeDetails
INTERSECT
SELECT EmpId FROM EmployeeSalary
ORDER BY EmpId ASC;
\`\`\`

#### Alternative via INNER JOIN:
\`\`\`sql
SELECT DISTINCT d.EmpId
FROM EmployeeDetails d
JOIN EmployeeSalary s ON d.EmpId = s.EmpId
ORDER BY d.EmpId ASC;
\`\`\`

#### Relational Algebra:
Implements set intersection \\( A \\cap B \\), finding active employees with registered salary records.`
  },
  {
    slug: "sql-employee-replace-spaces",
    explanation: `### Problem Overview
Retrieve all employee full names and replace every whitespace character with a hyphen (\`'-'\`).

### The REPLACE String Scalar Function
- Syntax: \`REPLACE(string, search_pattern, replacement)\`.
- Replaces all occurrences of \`search_pattern\` within the target text string.

### Step-by-Step Walkthrough
- **Step 1**: Target \`FullName\` in \`EmployeeDetails\`.
- **Step 2**: Transform: \`REPLACE(FullName, ' ', '-') AS HyphenatedName\`.
- **Step 3**: Order by \`EmpId ASC\`.`,
    approach: `### SQL Approach: String Transformation with REPLACE

\`\`\`sql
SELECT REPLACE(FullName, ' ', '-') AS HyphenatedName
FROM EmployeeDetails
ORDER BY EmpId ASC;
\`\`\`

#### Example Transformation:
- Input: \`'Praful Sharma'\`
- Output: \`'Praful-Sharma'\``
  },
  {
    slug: "sql-employee-concat-empid-manager",
    explanation: `### Problem Overview
Display both the \`EmpId\` and \`ManagerId\` concatenated together with an underscore separator (\`'EmpId_ManagerId'\`) as a single combined column named \`Emp_Manager_Code\`.

### String Concatenation in SQL
- ANSI SQL and SQLite use the pipe operator \`||\` for string concatenation: \`EmpId || '_' || ManagerId\`.
- In MySQL / SQL Server, \`CONCAT(EmpId, '_', ManagerId)\` is used.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeDetails\`.
- **Step 2**: Concatenate columns with separator: \`EmpId || '_' || COALESCE(ManagerId, 'NA') AS Emp_Manager_Code\`.
- **Step 3**: Order by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Column Concatenation with String Operator

\`\`\`sql
SELECT EmpId || '_' || COALESCE(ManagerId, 'None') AS Emp_Manager_Code
FROM EmployeeDetails
ORDER BY EmpId ASC;
\`\`\`

#### Example Output:
- EmpId 1 with ManagerId 2 -> \`'1_2'\`
- EmpId 2 with ManagerId NULL -> \`'2_None'\``
  }
];

module.exports = { BATCH_3 };
