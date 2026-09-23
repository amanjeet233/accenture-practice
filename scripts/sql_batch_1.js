const { prisma } = require("../src/lib/prisma.ts");

const BATCH_1 = [
  {
    slug: "second-highest-salary-with-ties",
    explanation: `### Problem Overview
We need to find the second highest salary from the \`Employee\` table. If there is no second highest salary (for example, if all employees have the same salary or only one record exists), the query must return \`NULL\`.

### Key Relational Considerations
1. **Handling Ties**: Multiple employees may share the same highest salary. Therefore, we must consider DISTINCT salary values rather than row counts.
2. **Handling Missing Values**: If there is no second distinct salary, SQL scalar subqueries naturally evaluate to \`NULL\`, which satisfies the specification without requiring complex fallback CASE logic.

### Step-by-Step Logic
- **Step 1**: Find the maximum salary across all records: \`SELECT MAX(salary) FROM Employee\`.
- **Step 2**: Filter out the maximum salary from consideration using \`salary < (SELECT MAX(salary) FROM Employee)\`.
- **Step 3**: Take the maximum of the remaining values using \`SELECT MAX(salary) AS SecondHighestSalary\`. This guarantees that ties in the highest salary do not incorrectly become the second highest salary.

### Edge Cases Handled
- When only 1 distinct salary exists in the table, the outer \`MAX()\` evaluates over an empty filtered set and returns \`NULL\`.
- High efficiency: leverages index on \`salary\` if present for two fast B-tree index lookups.`,
    approach: `### SQL Approach: Scalar Subquery with Maximum Exclusion

\`\`\`sql
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (
    SELECT MAX(salary)
    FROM Employee
);
\`\`\`

#### Step-by-Step Breakdown:
1. \`SELECT MAX(salary) FROM Employee\`: Identifies the top salary in the organization.
2. \`WHERE salary < (...)\`: Restricts the dataset to only salaries strictly smaller than the maximum.
3. \`SELECT MAX(salary)\`: Retrieves the highest salary among the filtered sub-population, which represents the 2nd highest salary overall.

#### Complexity & Optimization:
- **Time Complexity**: O(N) full scan without index, or O(log N) with B-Tree index on \`salary\`.
- **Space Complexity**: O(1) in-memory scalar evaluation.`
  },
  {
    slug: "find-duplicate-emails-or-records",
    explanation: `### Problem Overview
Identify all records or names that appear more than once in the \`Employees\` table.

### Relational Logic
1. **Grouping**: In SQL, detecting occurrences greater than 1 requires grouping records by the target column (\`name\` or \`email\`) using \`GROUP BY\`.
2. **Aggregate Filtering**: The \`WHERE\` clause cannot filter aggregate function results like \`COUNT(*)\`. We must use the \`HAVING\` clause, which operates after row grouping has completed.

### Step-by-Step Walkthrough
- **Step 1**: Group all employees by their \`name\`: \`GROUP BY name\`.
- **Step 2**: Count the total frequency in each group using \`COUNT(*)\`.
- **Step 3**: Filter out unique records using \`HAVING COUNT(*) > 1\`. Only groups with 2 or more occurrences will pass this filter.
- **Step 4**: Return the duplicate name and its occurrence frequency.`,
    approach: `### SQL Approach: GROUP BY with HAVING Aggregate Filter

\`\`\`sql
SELECT name, COUNT(*) AS occurrence_count
FROM Employees
GROUP BY name
HAVING COUNT(*) > 1;
\`\`\`

#### Step-by-Step Breakdown:
1. \`GROUP BY name\`: Partitions table rows into distinct buckets based on employee names.
2. \`HAVING COUNT(*) > 1\`: Evaluates each bucket's size and discards buckets with only 1 entry.
3. \`SELECT name, COUNT(*) AS occurrence_count\`: Projects the duplicate name alongside its exact frequency count.

#### Complexity & Optimization:
- **Time Complexity**: O(N log N) using hash aggregation or sort-based aggregation.
- **Index Optimization**: A composite or single-column index on \`name\` avoids a sort pass.`
  },
  {
    slug: "employees-earning-more-than-managers",
    explanation: `### Problem Overview
Find all employees who earn strictly more than their direct manager.

### Relational Schema Analysis
- Table \`Employees\` contains both individual employee records and their managers via the foreign key \`manager_id\` referencing \`Employees.id\`.
- Because both employee and manager reside in the same table, we must perform a **Self-Join**.

### Step-by-Step Walkthrough
- **Step 1 (Self-Join)**: Join \`Employees\` aliased as \`e\` (representing the employee) with \`Employees\` aliased as \`m\` (representing the manager) on \`e.manager_id = m.id\`.
- **Step 2 (Salary Predicate)**: Filter where \`e.salary > m.salary\`.
- **Step 3 (Projection)**: Select the employee's name as \`Employee\`. Employees without a manager (\`manager_id IS NULL\`) are automatically excluded by the \`INNER JOIN\`.`,
    approach: `### SQL Approach: Self-Join on Hierarchical Relationship

\`\`\`sql
SELECT e.name AS Employee
FROM Employees e
JOIN Employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;
\`\`\`

#### Step-by-Step Breakdown:
1. \`Employees e JOIN Employees m ON e.manager_id = m.id\`: Pairs each employee with their respective direct manager.
2. \`WHERE e.salary > m.salary\`: Applies a comparison condition between employee salary and manager salary.
3. \`SELECT e.name AS Employee\`: Renames the output attribute to match standardized reporting requirements.

#### Complexity:
- **Time Complexity**: O(N) when \`manager_id\` and \`id\` are indexed.
- **Edge Cases**: Handles top-level executives (NULL \`manager_id\`) by discarding them via the inner join.`
  },
  {
    slug: "customers-who-never-order",
    explanation: `### Problem Overview
Find all customers who have never placed an order in the database.

### Relational Concepts
- Table \`Customers\` stores registered customer profiles (\`id\`, \`name\`).
- Table \`Orders\` stores orders placed, linking to customers via \`customerId\`.
- Customers who never ordered are those whose IDs never appear in the \`Orders\` table.

### Step-by-Step Walkthrough
There are two common industry patterns:
1. **LEFT JOIN with NULL filter (Anti-Join)**:
   - Perform a \`LEFT JOIN\` from \`Customers\` to \`Orders\` on \`Customers.id = Orders.customerId\`.
   - Customers with orders will have valid order records.
   - Customers with NO orders will have \`Orders.id IS NULL\`.
   - Filter with \`WHERE Orders.id IS NULL\`.
2. **Subquery with NOT IN / NOT EXISTS**:
   - \`WHERE id NOT IN (SELECT customerId FROM Orders WHERE customerId IS NOT NULL)\`.

The LEFT JOIN pattern is the most portable and often best optimized across relational database engines.`,
    approach: `### SQL Approach: LEFT JOIN Anti-Join Pattern

\`\`\`sql
SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customerId
WHERE o.id IS NULL;
\`\`\`

#### Alternative (NOT IN Subquery):
\`\`\`sql
SELECT name AS Customers
FROM Customers
WHERE id NOT IN (
    SELECT customerId FROM Orders WHERE customerId IS NOT NULL
);
\`\`\`

#### Complexity & Optimization:
- **Time Complexity**: O(N + M) where N = customers, M = orders with index on \`Orders.customerId\`.
- **Anti-Join Efficiency**: Eliminates hash table lookups once a match is found.`
  },
  {
    slug: "support-ticket-sla-resolution-metrics",
    explanation: `### Problem Overview
Calculate the total number of support tickets resolved and the average resolution time in minutes for each support agent category, but only for tickets meeting SLA constraints.

### Schema & Business Logic
- \`Tickets\`: contains \`agent_id\`, \`category\`, \`created_at\`, \`resolved_at\`, and \`status\`.
- Only tickets with \`status = 'RESOLVED'\` should be considered.
- Resolution time in minutes is computed as: \`(julianday(resolved_at) - julianday(created_at)) * 24 * 60\`.

### Step-by-Step Walkthrough
- **Step 1**: Filter for resolved tickets where resolution timestamps are populated.
- **Step 2**: Group by \`category\`.
- **Step 3**: Compute \`COUNT(*)\` as total resolved tickets and \`ROUND(AVG(resolution_minutes), 2)\` as average SLA resolution time.
- **Step 4**: Order results by total resolved descending.`,
    approach: `### SQL Approach: Filtered Aggregation with Date Arithmetic

\`\`\`sql
SELECT 
    category,
    COUNT(*) AS total_resolved,
    ROUND(AVG((julianday(resolved_at) - julianday(created_at)) * 1440), 2) AS avg_resolution_mins
FROM Tickets
WHERE status = 'RESOLVED' AND resolved_at IS NOT NULL
GROUP BY category
ORDER BY total_resolved DESC, category ASC;
\`\`\`

#### Step-by-Step Breakdown:
1. \`WHERE status = 'RESOLVED'\`: Ensures only completed tickets are evaluated.
2. \`(julianday(resolved_at) - julianday(created_at)) * 1440\`: Translates day differences into minutes (24 hours * 60 mins = 1440).
3. \`ROUND(AVG(...), 2)\`: Delivers standardized 2-decimal financial precision.
4. \`ORDER BY total_resolved DESC\`: Ranks categories by resolution volume.`
  },
  {
    slug: "action-movie-high-rating-watchers-over-25",
    explanation: `### Problem Overview
Report distinct user names and movie titles satisfying three compound criteria:
1. The movie genre is \`'Action'\`.
2. The movie rating is at least 4.5.
3. The user watching the movie is strictly older than 25 years.

### Multi-Table Schema Analysis
- \`Users\`: contains \`id\`, \`name\`, \`age\`.
- \`Movies\`: contains \`id\`, \`title\`, \`genre\`, \`rating\`.
- \`WatchHistory\`: junction table connecting \`user_id\` and \`movie_id\`.

### Step-by-Step Walkthrough
- **Step 1**: Join \`Users u\` with \`WatchHistory w\` on \`u.id = w.user_id\`.
- **Step 2**: Join with \`Movies m\` on \`w.movie_id = m.id\`.
- **Step 3**: Apply compound predicates in the \`WHERE\` clause:
  - \`u.age > 25\`
  - \`m.genre = 'Action'\`
  - \`m.rating >= 4.5\`
- **Step 4**: Use \`DISTINCT\` to prevent duplicate rows if a user watched the same title multiple times.`,
    approach: `### SQL Approach: Multi-Table Relational Join with Compound Predicates

\`\`\`sql
SELECT DISTINCT u.name AS user_name, m.title AS movie_title
FROM Users u
JOIN WatchHistory w ON u.id = w.user_id
JOIN Movies m ON w.movie_id = m.id
WHERE u.age > 25
  AND m.genre = 'Action'
  AND m.rating >= 4.5
ORDER BY u.name ASC, m.title ASC;
\`\`\`

#### Step-by-Step Breakdown:
1. \`JOIN WatchHistory w ON u.id = w.user_id\`: Connects user demographic profiles to watch activities.
2. \`JOIN Movies m ON w.movie_id = m.id\`: Links watch events to movie metadata.
3. \`WHERE u.age > 25 AND m.genre = 'Action' AND m.rating >= 4.5\`: Filters out non-matching demographic and catalog entries.
4. \`DISTINCT\`: Guarantees idempotency across repeat watch events.`
  },
  {
    slug: "heavy-watch-time-streaming-titles",
    explanation: `### Problem Overview
Report all movie titles in genre \`'Action'\` or \`'Thriller'\` that have heavy streaming engagement:
1. More than 2 total watch sessions (\`COUNT(w.id) > 2\`).
2. Over 200 total watch time minutes (\`SUM(w.watch_time_minutes) > 200\`).

### Relational Strategy
- Join \`Movies\` and \`WatchHistory\`.
- Filter genre in the \`WHERE\` clause before grouping.
- Group by \`m.id\`, \`m.title\`, \`m.genre\`.
- Use \`HAVING\` with multi-metric aggregate constraints (\`COUNT\` and \`SUM\`).`,
    approach: `### SQL Approach: Multi-Metric Aggregation with Group Filtering

\`\`\`sql
SELECT 
    m.title, 
    m.genre, 
    SUM(w.watch_time_minutes) AS total_minutes
FROM Movies m
JOIN WatchHistory w ON m.id = w.movie_id
WHERE m.genre IN ('Action', 'Thriller')
GROUP BY m.id, m.title, m.genre
HAVING COUNT(w.id) > 2 AND SUM(w.watch_time_minutes) > 200
ORDER BY total_minutes DESC;
\`\`\`

#### Step-by-Step Breakdown:
1. \`WHERE m.genre IN ('Action', 'Thriller')\`: Filters catalog genres before calculating aggregations, minimizing memory usage.
2. \`GROUP BY m.id, m.title, m.genre\`: Aggregates streaming logs per individual title.
3. \`HAVING COUNT(w.id) > 2 AND SUM(w.watch_time_minutes) > 200\`: Enforces engagement thresholds.
4. \`ORDER BY total_minutes DESC\`: Sorts highest engagement content first.`
  },
  {
    slug: "sql-users-not-raised-support-request",
    explanation: `### Problem Overview
Find all users in the system who have never raised a support request. Return the user ID and user name, ordered by user ID.

### Schema Understanding
- \`Users\`: contains \`user_id\`, \`user_name\`, \`email\`.
- \`SupportRequests\`: contains \`request_id\`, \`user_id\`, \`issue_description\`.

### Step-by-Step Walkthrough
- **Step 1**: Use a \`LEFT JOIN\` from \`Users u\` to \`SupportRequests s\` on \`u.user_id = s.user_id\`.
- **Step 2**: For users who never submitted a ticket, columns from \`SupportRequests\` will be \`NULL\`.
- **Step 3**: Filter with \`WHERE s.request_id IS NULL\`.
- **Step 4**: Project \`u.user_id\` and \`u.user_name\` and order by \`u.user_id ASC\`.`,
    approach: `### SQL Approach: Anti-Join via LEFT JOIN ... IS NULL

\`\`\`sql
SELECT u.user_id, u.user_name
FROM Users u
LEFT JOIN SupportRequests s ON u.user_id = s.user_id
WHERE s.request_id IS NULL
ORDER BY u.user_id ASC;
\`\`\`

#### Key Concept:
An anti-join identifies rows in the primary table that have zero corresponding matches in the secondary table. It is significantly faster than correlated \`NOT EXISTS\` subqueries on unindexed tables.`
  },
  {
    slug: "products-in-transit-hub",
    explanation: `### Problem Overview
Find the product ID and product name for all products whose current delivery status is \`'In Transit Hub'\`.

### 3-Table Relational Schema
- \`Product\`: \`product_id\`, \`product_name\`, \`price\`.
- \`OrderItem\`: \`order_item_id\`, \`order_id\`, \`product_id\`.
- \`Delivery\`: \`delivery_id\`, \`order_id\`, \`delivery_status\`.

### Step-by-Step Walkthrough
- **Step 1**: Join \`Product p\` to \`OrderItem oi\` on \`p.product_id = oi.product_id\`.
- **Step 2**: Join \`OrderItem oi\` to \`Delivery d\` on \`oi.order_id = d.order_id\`.
- **Step 3**: Filter on \`d.delivery_status = 'In Transit Hub'\`.
- **Step 4**: Return distinct \`p.product_id\`, \`p.product_name\`.`,
    approach: `### SQL Approach: 3-Table Normalized Relational Navigation

\`\`\`sql
SELECT DISTINCT p.product_id, p.product_name
FROM Product p
JOIN OrderItem oi ON p.product_id = oi.product_id
JOIN Delivery d ON oi.order_id = d.order_id
WHERE d.delivery_status = 'In Transit Hub'
ORDER BY p.product_id ASC;
\`\`\`

#### Step-by-Step Breakdown:
1. Links catalog items through customer order line-items to logistics fulfillment status.
2. \`DISTINCT\` ensures products ordered across multiple transit shipments are reported only once.`
  },
  {
    slug: "student-course-schedule-instructors",
    explanation: `### Problem Overview
Display distinct instructor's last name, first name, and the schedule start time for courses that start strictly after 10:00 AM (\`'10:00:00'\`).

### Multi-Table Relationships
- \`Instructor\`: contains instructor bio and credentials (\`instructor_id\`, \`first_name\`, \`last_name\`).
- \`Section\`: links instructors to courses (\`section_id\`, \`instructor_id\`, \`schedule_id\`).
- \`Schedule\`: contains time slots and room assignments (\`schedule_id\`, \`start_time\`).

### Step-by-Step Walkthrough
- **Step 1**: Join \`Instructor i\` with \`Section sec\` on \`i.instructor_id = sec.instructor_id\`.
- **Step 2**: Join with \`Schedule sch\` on \`sec.schedule_id = sch.schedule_id\`.
- **Step 3**: Filter where \`sch.start_time > '10:00:00'\`.
- **Step 4**: Return \`DISTINCT i.last_name, i.first_name, sch.start_time\` ordered alphabetically.`,
    approach: `### SQL Approach: Multi-Table Relational Navigation with Time Comparison

\`\`\`sql
SELECT DISTINCT 
    i.last_name, 
    i.first_name, 
    sch.start_time
FROM Instructor i
JOIN Section sec ON i.instructor_id = sec.instructor_id
JOIN Schedule sch ON sec.schedule_id = sch.schedule_id
WHERE sch.start_time > '10:00:00'
ORDER BY i.last_name ASC, i.first_name ASC;
\`\`\`

#### Key Takeaway:
SQL standard time formats (\`'HH:MM:SS'\`) allow direct lexicographical string comparisons when properly padded with leading zeros.`
  }
];

module.exports = { BATCH_1 };
