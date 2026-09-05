import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// These tests characterize the invariants the migration bootstrap (plan
// 001-db-baseline-migration) relies on. They read the journal and SQL files
// directly and need no database — the live DB matrix (fresh, legacy-shaped,
// already-migrated) is covered manually, not here.

const drizzleDir = path.join(import.meta.dirname, "../../drizzle");
const journalPath = path.join(drizzleDir, "meta/_journal.json");

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

const journal = JSON.parse(readFileSync(journalPath, "utf8")) as {
  entries: JournalEntry[];
};

function readMigrationSql(tag: string): string {
  return readFileSync(path.join(drizzleDir, `${tag}.sql`), "utf8");
}

describe("drizzle migration journal", () => {
  it("has strictly increasing `when` values", () => {
    const whens = journal.entries.map((entry) => entry.when);
    const isSorted = whens.reduce(
      (acc, when) => ({ ok: acc.ok && when > acc.prev, prev: when }),
      { ok: true, prev: Number.NEGATIVE_INFINITY },
    ).ok;
    expect(isSorted).toBe(true);
  });

  it("has a matching .sql file for every entry, and vice versa", () => {
    const sqlFiles = readdirSync(drizzleDir)
      .filter((name) => name.endsWith(".sql"))
      .map((name) => name.replace(/\.sql$/, ""));
    const journalTags = journal.entries.map((entry) => entry.tag);

    expect(sqlFiles.sort()).toEqual([...journalTags].sort());
  });
});

describe("0000_baseline_auth_schema.sql", () => {
  const [firstEntry] = journal.entries;
  if (!firstEntry) {
    throw new Error("journal has no entries");
  }
  const sql = readMigrationSql(firstEntry.tag);

  it("guards on the absence of a `user` table with exactly one PL/pgSQL block", () => {
    const guardMatches =
      sql.match(/to_regclass\('public\.user'\) IS NULL/g) ?? [];
    expect(guardMatches).toHaveLength(1);

    const dollarMatches = sql.match(/\$\$/g) ?? [];
    expect(dollarMatches).toHaveLength(2);
  });

  it("does not create or reference the task table", () => {
    expect(sql).not.toContain('"task"');
  });
});
