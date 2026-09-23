const BATCH_2 = [
  {
    slug: "english-movies-and-channels",
    explanation: `### Problem Overview
Display the name of English-language movies and the name of the broadcast channels that air them. Order results by movie name ascending.

### Relational Schema
- \`movie\`: contains \`movie_id\`, \`movie_name\`, \`language\`.
- \`movielicense\`: junction table containing broadcast rights (\`movie_id\`, \`channel_id\`, \`license_type\`).
- \`channel\`: contains TV channel listings (\`channel_id\`, \`channel_name\`).

### Step-by-Step Walkthrough
- **Step 1**: Join \`movie m\` with \`movielicense ml\` on \`m.movie_id = ml.movie_id\`.
- **Step 2**: Join \`movielicense ml\` with \`channel c\` on \`ml.channel_id = c.channel_id\`.
- **Step 3**: Filter for English titles: \`WHERE m.language = 'English'\`.
- **Step 4**: Project \`m.movie_name\` and \`c.channel_name\`, ordered by \`m.movie_name ASC\`.`,
    approach: `### SQL Approach: Three-Table Relational Join

\`\`\`sql
SELECT m.movie_name, c.channel_name
FROM movie m
JOIN movielicense ml ON m.movie_id = ml.movie_id
JOIN channel c ON ml.channel_id = c.channel_id
WHERE m.language = 'English'
ORDER BY m.movie_name ASC, c.channel_name ASC;
\`\`\`

#### Key Concept:
The junction table \`movielicense\` represents a many-to-many relationship between movies and broadcast channels.`
  },
  {
    slug: "episodes-after-6pm",
    explanation: `### Problem Overview
Display the Airing ID, Episode ID, and Channel Name for television episodes that air strictly after 6:00 PM (18:00:00).

### Schema & Predicates
- \`airing\`: contains \`airing_id\`, \`episode_id\`, \`channel_id\`, \`start_time\`.
- \`channel\`: contains \`channel_id\`, \`channel_name\`.
- Condition: \`start_time > '18:00:00'\`.

### Step-by-Step Walkthrough
- **Step 1**: Join \`airing a\` with \`channel c\` on \`a.channel_id = c.channel_id\`.
- **Step 2**: Filter where \`a.start_time > '18:00:00'\`.
- **Step 3**: Select \`a.airing_id\`, \`a.episode_id\`, and \`c.channel_name\`.`,
    approach: `### SQL Approach: Time-Based Filtered Join

\`\`\`sql
SELECT a.airing_id, a.episode_id, c.channel_name
FROM airing a
JOIN channel c ON a.channel_id = c.channel_id
WHERE a.start_time > '18:00:00'
ORDER BY a.airing_id ASC;
\`\`\`

#### Optimization:
Indexing \`airing(start_time, channel_id)\` enables a range-scan index lookup without scanning daytime airings.`
  },
  {
    slug: "visitor-enclosure-filtering",
    explanation: `### Problem Overview
Display the visitor's name, ticket type, enclosure's name, and enclosure's type for all zoo visits where:
1. The visitor's ticket type is NOT \`'Child'\`.
2. The visited enclosure's type is NOT \`'Arctic'\`.

### Schema Structure
- \`visitor\`: contains \`visitor_id\`, \`name\`, \`ticket_type\`.
- \`visit_log\`: contains \`log_id\`, \`visitor_id\`, \`enclosure_id\`.
- \`enclosure\`: contains \`enclosure_id\`, \`name\`, \`type\`.

### Step-by-Step Walkthrough
- **Step 1**: Join \`visitor v\` with \`visit_log vl\` on \`v.visitor_id = vl.visitor_id\`.
- **Step 2**: Join \`visit_log vl\` with \`enclosure e\` on \`vl.enclosure_id = e.enclosure_id\`.
- **Step 3**: Filter using inequality predicates: \`v.ticket_type <> 'Child' AND e.type <> 'Arctic'\`.
- **Step 4**: Return the visitor name, ticket type, enclosure name, and enclosure type.`,
    approach: `### SQL Approach: Relational Navigation with Inequality Constraints

\`\`\`sql
SELECT 
    v.name AS visitor_name, 
    v.ticket_type, 
    e.name AS enclosure_name, 
    e.type AS enclosure_type
FROM visitor v
JOIN visit_log vl ON v.visitor_id = vl.visitor_id
JOIN enclosure e ON vl.enclosure_id = e.enclosure_id
WHERE v.ticket_type <> 'Child' AND e.type <> 'Arctic'
ORDER BY v.name ASC;
\`\`\`

#### Key Takeaway:
SQL inequality operators (\`\`<>\`\` and \`\`!=\`\`) exclude NULL values automatically, which matches business requirements where ticket and enclosure types must be explicitly non-matching.`
  },
  {
    slug: "free-movie-rights",
    explanation: `### Problem Overview
Display the title of each movie and its duration in hours (rounded to 2 decimal places) for all movies licensed under the \`'Free'\` license tier.

### Calculations
- Movie duration is stored in minutes in \`movie.duration_mins\`.
- Conversion: \`ROUND(duration_mins / 60.0, 2)\`.
- Must divide by \`60.0\` (floating point) rather than integer \`60\` to prevent truncated integer division.

### Step-by-Step Walkthrough
- **Step 1**: Join \`movie m\` with \`movielicense ml\` on \`m.movie_id = ml.movie_id\`.
- **Step 2**: Filter for \`ml.license_type = 'Free'\`.
- **Step 3**: Calculate \`ROUND(m.duration_mins / 60.0, 2) AS duration_hours\`.`,
    approach: `### SQL Approach: Arithmetic Scaling with Decimal Conversion

\`\`\`sql
SELECT 
    m.movie_name AS title, 
    ROUND(m.duration_mins / 60.0, 2) AS duration_hours
FROM movie m
JOIN movielicense ml ON m.movie_id = ml.movie_id
WHERE ml.license_type = 'Free'
ORDER BY duration_hours DESC, title ASC;
\`\`\`

#### Common Pitfall:
In SQL engines like SQLite and PostgreSQL, dividing an integer by integer \`60\` truncates the fractional part (e.g. 150 / 60 = 2). Using \`60.0\` forces floating-point decimal precision.`
  },
  {
    slug: "player-sports-registration-count",
    explanation: `### Problem Overview
Display the first name, last name, and total number of registered sports for each player. Include players who registered for 0 sports, displaying count as 0.

### Relational Strategy
- Using an \`INNER JOIN\` would discard players who haven't registered for any sport.
- Therefore, we must use a \`LEFT JOIN\` from \`player\` to \`sport_registration\`.
- Use \`COUNT(r.sport_id)\` instead of \`COUNT(*)\` so that NULL rows from the left join evaluate to 0 rather than 1.

### Step-by-Step Walkthrough
- **Step 1**: \`FROM player p LEFT JOIN sport_registration r ON p.player_id = r.player_id\`.
- **Step 2**: \`GROUP BY p.player_id, p.first_name, p.last_name\`.
- **Step 3**: \`SELECT p.first_name, p.last_name, COUNT(r.sport_id) AS total_sports\`.`,
    approach: `### SQL Approach: LEFT JOIN Aggregation with Null-Safe COUNT

\`\`\`sql
SELECT 
    p.first_name, 
    p.last_name, 
    COUNT(r.sport_id) AS total_sports
FROM player p
LEFT JOIN sport_registration r ON p.player_id = r.player_id
GROUP BY p.player_id, p.first_name, p.last_name
ORDER BY total_sports DESC, p.last_name ASC;
\`\`\`

#### Key Concept:
\`COUNT(column_name)\` counts only non-null values, correctly returning \`0\` for players without registrations, whereas \`COUNT(*)\` counts rows and would incorrectly return \`1\`.`
  },
  {
    slug: "sql-employee-all-records",
    explanation: `### Problem Overview
Write an SQL query to retrieve and print all records and attributes from the \`EmployeeDetails\` table.

### Relational Fundamentals
- The basic syntax for selecting all columns from a relational table is \`SELECT * FROM TableName\`.
- In production data querying, selecting specific columns is preferred, but for full audit dumping, \`SELECT *\` returns the entire attribute schema.

### Step-by-Step Walkthrough
- **Step 1**: Specify \`SELECT *\` to project all defined attributes in the schema.
- **Step 2**: Specify source table \`FROM EmployeeDetails\`.
- **Step 3**: Order by primary key \`EmpId ASC\` for deterministic output order.`,
    approach: `### SQL Approach: Full Relation Scan

\`\`\`sql
SELECT * 
FROM EmployeeDetails
ORDER BY EmpId ASC;
\`\`\`

#### Query Plan & Performance:
Performs a sequential table scan across all blocks of \`EmployeeDetails\`. With no filter predicates, cost is O(N).`
  },
  {
    slug: "sql-employee-by-id",
    explanation: `### Problem Overview
Fetch and print the details of the specific employee whose \`EmpId\` is \`1\`.

### Relational Concepts
- \`EmpId\` is the primary key of \`EmployeeDetails\`.
- Equality lookups on a primary key column are guaranteed to return at most one record.

### Step-by-Step Walkthrough
- **Step 1**: Query the \`EmployeeDetails\` table.
- **Step 2**: Apply an exact equality predicate: \`WHERE EmpId = 1\`.
- **Step 3**: Return all columns for that employee.`,
    approach: `### SQL Approach: Primary Key Index Point Lookup

\`\`\`sql
SELECT * 
FROM EmployeeDetails
WHERE EmpId = 1;
\`\`\`

#### Performance:
Since \`EmpId\` is the primary key, the relational query planner performs a unique B-Tree index lookup with O(log N) or O(1) time complexity.`
  },
  {
    slug: "sql-employee-manager-and-city",
    explanation: `### Problem Overview
Retrieve all employee records where the employee's \`ManagerId\` is exactly 100 AND the employee's \`City\` is \`'Jhansi'\`.

### Compound Boolean Predicates
- In SQL, filtering on multiple simultaneous conditions requires the \`AND\` boolean conjunction.
- Both predicates must evaluate to TRUE for a row to be included in the result.

### Step-by-Step Walkthrough
- **Step 1**: Target the table: \`FROM EmployeeDetails\`.
- **Step 2**: Add compound condition: \`WHERE ManagerId = 100 AND City = 'Jhansi'\`.
- **Step 3**: Order by \`EmpId ASC\`.`,
    approach: `### SQL Approach: Compound Filter with AND Conjunction

\`\`\`sql
SELECT * 
FROM EmployeeDetails
WHERE ManagerId = 100 AND City = 'Jhansi'
ORDER BY EmpId ASC;
\`\`\`

#### Optimization:
A composite index on \`(ManagerId, City)\` allows the query engine to evaluate both conditions directly in an index seek without touching table heap pages.`
  },
  {
    slug: "sql-employee-distinct-projects",
    explanation: `### Problem Overview
Print all distinct project identifiers available in the \`EmployeeSalary\` table. Results should be ordered alphabetically.

### The DISTINCT Operator
- Multiple employees often work on the same project (e.g. \`'P1'\`, \`'P2'\`).
- The \`DISTINCT\` keyword eliminates duplicate values from the projected result set after scanning.

### Step-by-Step Walkthrough
- **Step 1**: Target column \`Project\` in \`EmployeeSalary\`.
- **Step 2**: Apply \`DISTINCT Project\` to deduplicate duplicate assignments.
- **Step 3**: Exclude NULLs if necessary: \`WHERE Project IS NOT NULL\`.
- **Step 4**: Sort alphabetically: \`ORDER BY Project ASC\`.`,
    approach: `### SQL Approach: Deduplication via DISTINCT

\`\`\`sql
SELECT DISTINCT Project
FROM EmployeeSalary
WHERE Project IS NOT NULL
ORDER BY Project ASC;
\`\`\`

#### Key Concept:
\`DISTINCT\` applies to the entire projected row tuple. Because only \`Project\` is selected, rows sharing the same project are collapsed into a single instance.`
  },
  {
    slug: "sql-employee-count-project-p1",
    explanation: `### Problem Overview
Fetch the total count of employees currently working on project \`'P1'\`.

### The COUNT Aggregate Function
- The aggregate function \`COUNT(*)\` counts all rows in the group or filtered set.
- Filtering with \`WHERE Project = 'P1'\` ensures only employees assigned to project \`'P1'\` are counted.

### Step-by-Step Walkthrough
- **Step 1**: Target \`EmployeeSalary\` table.
- **Step 2**: Filter rows: \`WHERE Project = 'P1'\`.
- **Step 3**: Count rows: \`SELECT COUNT(*) AS employee_count\`.`,
    approach: `### SQL Approach: Filtered Aggregate Counting

\`\`\`sql
SELECT COUNT(*) AS employee_count
FROM EmployeeSalary
WHERE Project = 'P1';
\`\`\`

#### Key Takeaway:
\`COUNT(*)\` counts matching table records without evaluating individual column NULL status, ensuring accurate row counts.`
  }
];

module.exports = { BATCH_2 };
