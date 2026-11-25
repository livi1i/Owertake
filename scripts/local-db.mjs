import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
export function database(path = ":memory:", {os5=false} = {}) {
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
  if (os5) sqlite.exec('BEGIN IMMEDIATE;\n'+readFileSync(new URL('../drizzle/0001_os5.sql',import.meta.url),'utf8')+'\nCOMMIT;');
  return {
    sqlite,
    async batch(commands) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const result=commands.map(command=>command.execute());
        sqlite.exec('COMMIT');
        return result;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    prepare(sql) {
      return {
        bind(...p) {
          return {
            execute() { return sqlite.prepare(sql).run(...p); },
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
