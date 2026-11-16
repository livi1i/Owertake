import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
export function database(path = ":memory:") {
  if (path !== ":memory:") mkdirSync(".local", { recursive: true });
  const sqlite = new DatabaseSync(path);
  sqlite.exec("PRAGMA foreign_keys=ON");
  if (
    !sqlite.prepare("SELECT name FROM sqlite_master WHERE name='users'").get()
  )
    sqlite.exec(
      readFileSync(
        new URL("../drizzle/0000_initial.sql", import.meta.url),
        "utf8",
      ),
    );
  return {
    sqlite,
    prepare(sql) {
      return {
        bind(...p) {
          return {
            async first() {
              return sqlite.prepare(sql).get(...p) || null;
            },
            async all() {
              return { results: sqlite.prepare(sql).all(...p) };
            },
            async run() {
              return sqlite.prepare(sql).run(...p);
            },
          };
        },
      };
    },
  };
}
