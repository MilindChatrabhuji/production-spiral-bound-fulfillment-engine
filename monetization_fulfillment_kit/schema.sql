-- Cloudflare D1 SQL Schema for Printed Digital Product Spiral-Bound Fulfillment Engine
-- Package: @nexus/spiral-bound-fulfillment-engine
-- Version: 1.0.0

-- 1. Print Titles Catalog
CREATE TABLE IF NOT EXISTS print_titles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  total_page_count INTEGER NOT NULL,
  binding_type TEXT NOT NULL, -- Plastic Spiral Coil / Twin-Loop Wire-O
  coil_diameter_mm INTEGER NOT NULL,
  paper_stock TEXT NOT NULL,
  cover_stock TEXT NOT NULL,
  inner_gutter_margin_inches REAL DEFAULT 0.50,
  pdf_interior_url TEXT,
  pdf_cover_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Imposition Manifests
CREATE TABLE IF NOT EXISTS imposition_manifests (
  id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL,
  total_sheets INTEGER NOT NULL,
  recommended_coil_diameter_mm INTEGER NOT NULL,
  all_pages_punch_clear INTEGER DEFAULT 1,
  manifest_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (title_id) REFERENCES print_titles(id)
);

-- 3. Print Orders & Routing
CREATE TABLE IF NOT EXISTS pod_orders (
  id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL, -- Lulu Direct / Printify / RegionalPODHub
  vendor_job_id TEXT,
  quantity INTEGER NOT NULL,
  unit_print_cost_usd REAL NOT NULL,
  shipping_cost_usd REAL NOT NULL,
  total_landed_cost_usd REAL NOT NULL,
  destination_country TEXT NOT NULL,
  fulfillment_status TEXT DEFAULT 'QUEUED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (title_id) REFERENCES print_titles(id)
);

-- 4. Carrier Tracking Logs
CREATE TABLE IF NOT EXISTS carrier_tracking_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  carrier_name TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  tracking_url TEXT,
  shipment_status TEXT NOT NULL, -- PRINTING / DISPATCHED / IN_TRANSIT / DELIVERED
  estimated_delivery TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES pod_orders(id)
);

-- 5. Clinical Protocol Binder Audits
CREATE TABLE IF NOT EXISTS clinical_protocol_binders (
  id TEXT PRIMARY KEY,
  protocol_identifier TEXT NOT NULL,
  study_title TEXT NOT NULL,
  therapeutic_area TEXT NOT NULL,
  compliance_score_percent INTEGER NOT NULL,
  is_approved_print INTEGER DEFAULT 1,
  waterproof_teslin_required INTEGER DEFAULT 0,
  evidence_citations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fulfillment Retainers
CREATE TABLE IF NOT EXISTS fulfillment_retainer_subscriptions (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  tier_name TEXT NOT NULL, -- SPRINT ($500), MANAGED ($1,500), ENTERPRISE ($3,000)
  monthly_rate_usd REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_title ON pod_orders(title_id);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON carrier_tracking_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_protocol_id ON clinical_protocol_binders(protocol_identifier);
