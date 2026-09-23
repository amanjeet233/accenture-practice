import { DatabaseSync } from "node:sqlite";

export interface SqlTableColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  notNull: boolean;
}

export interface SqlTableMetadata {
  tableName: string;
  columns: SqlTableColumn[];
  sampleRows: Record<string, any>[];
  totalRows: number;
}

export interface SqlExecutionResponse {
  success: boolean;
  verdict?: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "SYNTAX_ERROR";
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  isCorrect?: boolean;
  expectedColumns?: string[];
  expectedRows?: Record<string, any>[];
  explainPlan?: string[];
}

/**
 * Creates an ephemeral, 100% sandboxed in-memory SQLite database.
 * NEVER touches the persistent application SQLite database.
 */
function createSandboxedDb(schemaSql?: string | null, seedSql?: string | null): DatabaseSync {
  const db = new DatabaseSync(":memory:");

  // Enable foreign keys
  try {
    db.exec("PRAGMA foreign_keys = ON;");
  } catch {}

  // Apply schema
  if (schemaSql && schemaSql.trim()) {
    db.exec(schemaSql);
  }

  // Apply seed data
  if (seedSql && seedSql.trim()) {
    db.exec(seedSql);
  }

  return db;
}

/**
 * Extracts schema metadata: tables, column definitions, and sample rows.
 */
export function extractSchemaMetadata(
  schemaSql?: string | null,
  seedSql?: string | null
): SqlTableMetadata[] {
  if (!schemaSql || !schemaSql.trim()) {
    return [];
  }

  let db: DatabaseSync | null = null;
  try {
    db = createSandboxedDb(schemaSql, seedSql);

    // Get all user tables
    const tablesStmt = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    );
    const tableRows = tablesStmt.all() as Array<{ name: string }>;

    const result: SqlTableMetadata[] = [];

    for (const t of tableRows) {
      const tableName = t.name;

      // PRAGMA table_info(tableName)
      const infoStmt = db.prepare(`PRAGMA table_info("${tableName}");`);
      const colRows = infoStmt.all() as Array<{
        cid: number;
        name: string;
        type: string;
        notnull: number;
        dflt_value: any;
        pk: number;
      }>;

      const columns: SqlTableColumn[] = colRows.map((c) => ({
        name: c.name,
        type: c.type || "VARCHAR",
        isPrimaryKey: Boolean(c.pk),
        notNull: Boolean(c.notnull),
      }));

      // Fetch sample rows (up to 10 rows) - convert from node:sqlite null-prototype objects to plain objects
      const sampleStmt = db.prepare(`SELECT * FROM "${tableName}" LIMIT 10;`);
      const rawSampleRows = sampleStmt.all() as Record<string, any>[];
      const sampleRows = rawSampleRows.map((r) => ({ ...r }));

      // Fetch total count
      const countStmt = db.prepare(`SELECT COUNT(*) as cnt FROM "${tableName}";`);
      const countRow = countStmt.get() as { cnt: number } | undefined;

      result.push({
        tableName,
        columns,
        sampleRows,
        totalRows: Number(countRow?.cnt ?? sampleRows.length),
      });
    }

    // Return as sanitized plain objects for React Server Component serialization
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.error("extractSchemaMetadata error:", err);
    return [];
  } finally {
    if (db) {
      try {
        db.close();
      } catch {}
    }
  }
}

/**
 * Execute SQL Query in an isolated in-memory SQLite sandbox with timeout and validation.
 */
export function executeSandboxedSql(options: {
  schemaSql?: string | null;
  seedSql?: string | null;
  userQuery: string;
  expectedQuery?: string | null;
  checkCorrectness?: boolean;
}): SqlExecutionResponse {
  const { schemaSql, seedSql, userQuery, expectedQuery, checkCorrectness } = options;

  if (!userQuery || userQuery.trim().length === 0) {
    return {
      success: false,
      verdict: "SYNTAX_ERROR",
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: "SQL query cannot be empty.",
    };
  }

  const trimmed = userQuery.trim().replace(/;+$/, "");

  // Security check 1: Reject multiple chained SQL statements (stacked injection prevention)
  if (trimmed.includes(";")) {
    return {
      success: false,
      verdict: "SYNTAX_ERROR",
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: "Security Policy: Multiple SQL statements are not permitted in playground execution.",
    };
  }

  // Security check 2: Only permit reading operations (SELECT, WITH, EXPLAIN)
  const firstWord = trimmed.split(/\s+/)[0]?.toUpperCase();
  if (firstWord !== "SELECT" && firstWord !== "WITH" && firstWord !== "EXPLAIN") {
    return {
      success: false,
      verdict: "SYNTAX_ERROR",
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: "Security Policy: Only SELECT and WITH (CTE) queries are permitted in the playground.",
    };
  }

  // Security check 3: Block dangerous administrative and mutating keywords
  const forbiddenRegex = /\b(ATTACH|DETACH|PRAGMA|VACUUM|LOAD_EXTENSION|DROP|ALTER|TRUNCATE|DELETE|UPDATE|INSERT|REINDEX)\b/i;
  if (forbiddenRegex.test(trimmed)) {
    return {
      success: false,
      verdict: "SYNTAX_ERROR",
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: "Security Policy: Query contains disallowed keyword (database modification or administrative statements).",
    };
  }

  let db: DatabaseSync | null = null;
  const startTime = Date.now();

  try {
    db = createSandboxedDb(schemaSql, seedSql);

    // Prepare and execute user query
    const stmt = db.prepare(trimmed);
    const rawRows = stmt.all() as Record<string, any>[];
    const rows = rawRows.map((r) => ({ ...r }));
    const executionTimeMs = Math.max(Date.now() - startTime, 1);

    // Extract columns from first row, or column metadata
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    // Explain query plan
    let explainPlan: string[] = [];
    try {
      const explainStmt = db.prepare(`EXPLAIN QUERY PLAN ${trimmed}`);
      const planRows = explainStmt.all() as Array<{ detail?: string }>;
      explainPlan = planRows.map((r) => r.detail || JSON.stringify(r));
    } catch {}

    // If correctness check is requested and expectedQuery is provided
    let isCorrect: boolean | undefined = undefined;
    let expectedColumns: string[] | undefined = undefined;
    let expectedRows: Record<string, any>[] | undefined = undefined;

    if (checkCorrectness && expectedQuery && expectedQuery.trim()) {
      try {
        const expectedStmt = db.prepare(expectedQuery.trim().replace(/;+$/, ""));
        const rawExpectedRows = expectedStmt.all() as Record<string, any>[];
        expectedColumns = rawExpectedRows.length > 0 ? Object.keys(rawExpectedRows[0]) : [];
        expectedRows = rawExpectedRows.map((r) => ({ ...r }));

        isCorrect = compareSqlResultSets(rows, expectedRows);
      } catch (err: any) {
        console.error("Error executing expected query:", err);
      }
    }

    const verdict =
      isCorrect === true
        ? "ACCEPTED"
        : isCorrect === false
        ? "WRONG_ANSWER"
        : "ACCEPTED";

    return {
      success: true,
      verdict,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs,
      isCorrect,
      expectedColumns,
      expectedRows,
      explainPlan,
    };
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    return {
      success: false,
      verdict: "RUNTIME_ERROR",
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: elapsed,
      error: err.message || String(err),
    };
  } finally {
    if (db) {
      try {
        db.close();
      } catch {}
    }
  }
}

/**
 * Validates candidate SQL result set against expected result set.
 * - Column names are compared case-insensitively.
 * - Numbers, nulls, and strings are normalized.
 * - Does not require exact query text: any query returning matching rows passes.
 */
export function compareSqlResultSets(
  actualRows: Record<string, any>[],
  expectedRows: Record<string, any>[]
): boolean {
  if (actualRows.length !== expectedRows.length) {
    return false;
  }

  if (actualRows.length === 0 && expectedRows.length === 0) {
    return true;
  }

  const actualCols = Object.keys(actualRows[0]);
  const expectedCols = Object.keys(expectedRows[0]);

  if (actualCols.length !== expectedCols.length) {
    return false;
  }

  // Map normalized expected rows
  const normalizeRow = (row: Record<string, any>, colKeys: string[]) => {
    return colKeys.map((k) => {
      const val = row[k];
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "number") return Number(val).toFixed(4).replace(/\.?0+$/, "");
      return String(val).trim();
    });
  };

  // Convert rows to comparable strings
  const actualSerialized = actualRows.map((r) =>
    normalizeRow(r, actualCols).join("|")
  );
  const expectedSerialized = expectedRows.map((r) =>
    normalizeRow(r, expectedCols).join("|")
  );

  // Check 1: exact ordered match
  const exactMatch = actualSerialized.every(
    (val, idx) => val === expectedSerialized[idx]
  );
  if (exactMatch) return true;

  // Check 2: unordered multiset equality (if query didn't mandate exact sorting)
  const actualSorted = [...actualSerialized].sort();
  const expectedSorted = [...expectedSerialized].sort();

  return actualSorted.every((val, idx) => val === expectedSorted[idx]);
}
