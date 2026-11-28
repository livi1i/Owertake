CREATE TABLE IF NOT EXISTS os5_maintenance_plans (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES os5_projects(id),
  title TEXT NOT NULL,
  monthly_minutes INTEGER NOT NULL CHECK (monthly_minutes BETWEEN 1 AND 44640),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS os5_maintenance_project ON os5_maintenance_plans(project_id);

CREATE TABLE IF NOT EXISTS os5_maintenance_work (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES os5_maintenance_plans(id),
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  worked_on TEXT NOT NULL,
  minutes INTEGER NOT NULL CHECK (minutes BETWEEN 1 AND 1440),
  note TEXT NOT NULL,
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS os5_maintenance_period ON os5_maintenance_work(plan_id,worked_on);
