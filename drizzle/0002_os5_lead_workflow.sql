CREATE TABLE IF NOT EXISTS os5_lead_workflow (
  lead_id TEXT PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  responsible_id TEXT REFERENCES users(id),
  stage TEXT NOT NULL CHECK(stage IN ('new','contact','qualified','closed')),
  version INTEGER NOT NULL CHECK(version >= 1)
);

CREATE INDEX IF NOT EXISTS os5_lead_responsible ON os5_lead_workflow(responsible_id);

CREATE TRIGGER IF NOT EXISTS os5_lead_staff_insert BEFORE INSERT ON os5_lead_workflow
WHEN NEW.responsible_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM users WHERE id=NEW.responsible_id AND role IN ('admin','manager')
)
BEGIN SELECT RAISE(ABORT,'os5_lead_staff_required'); END;

CREATE TRIGGER IF NOT EXISTS os5_lead_staff_update BEFORE UPDATE OF responsible_id ON os5_lead_workflow
WHEN NEW.responsible_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM users WHERE id=NEW.responsible_id AND role IN ('admin','manager')
)
BEGIN SELECT RAISE(ABORT,'os5_lead_staff_required'); END;

CREATE TRIGGER IF NOT EXISTS os5_lead_role_guard BEFORE UPDATE OF role ON users
WHEN NEW.role NOT IN ('admin','manager') AND EXISTS (
  SELECT 1 FROM os5_lead_workflow WHERE responsible_id=OLD.id
)
BEGIN SELECT RAISE(ABORT,'os5_lead_staff_required'); END;
