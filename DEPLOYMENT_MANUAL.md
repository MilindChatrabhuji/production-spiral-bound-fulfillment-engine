# EDGE DEPLOYMENT MANUAL: PHYSICAL SPIRAL-BOUND BOOK FULFILLMENT ENGINE

**Package:** `@nexus/spiral-bound-fulfillment-engine`  
**Platform:** Cloudflare Workers Edge Network + Cloudflare D1 Database  
**Runtime:** V8 JavaScript / TypeScript Isolated Workers  

---

## 1. PREREQUISITES & ENVIRONMENT SETUP

1. **Node.js Environment:** Ensure Node.js v18.0.0 or higher is installed.
2. **Cloudflare Wrangler CLI:**
   ```bash
   npm install -g wrangler
   wrangler whoami
   ```
3. **Cloudflare D1 Database Provisioning:**
   ```bash
   npx wrangler d1 create nexus_fulfillment_production_db
   ```
   Update `engine/edge_fulfillment_gateway/wrangler.toml` with your database id.

---

## 2. DATABASE SCHEMA MIGRATION

Execute the SQL schema to create print titles, imposition manifests, orders, and tracking tables:
```bash
cd engine/edge_fulfillment_gateway
npx wrangler d1 execute nexus_fulfillment_production_db --file=../../monetization_fulfillment_kit/schema.sql
```

Verify tables created:
```bash
npx wrangler d1 execute nexus_fulfillment_production_db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 3. EDGE WORKER COMPILATION & DEPLOYMENT

Deploy the edge gateway directly to the Cloudflare global network:
```bash
cd engine/edge_fulfillment_gateway
npx wrangler deploy
```

Expected Deployment Output:
```text
Total Upload: ~14 KiB / gzip: ~4.5 KiB
Uploaded spiral-bound-fulfillment-gateway (2.2 sec)
Deployed spiral-bound-fulfillment-gateway triggers (1.9 sec)
  https://spiral-bound-fulfillment-gateway.example.workers.dev
```

---

## 4. ENDPOINT VERIFICATION TESTS

### 4.1 Health Check Test
```bash
curl -s https://spiral-bound-fulfillment-gateway.example.workers.dev/health
```
Expected response:
```json
{
  "status": "HEALTHY",
  "service": "Production Spiral-Bound Book Fulfillment Gateway",
  "version": "1.0.0",
  "catalogId": "WAY-87-PRODUCT-89"
}
```

### 4.2 Imposition Calculation Test
```bash
curl -X POST https://spiral-bound-fulfillment-gateway.example.workers.dev/api/v1/fulfillment/imposition/calculate \
  -H "Content-Type: application/json" \
  -d '{"bookTitle":"Clinical Oncology Protocol","totalPageCount":184,"innerGutterMarginInches":0.50}'
```

### 4.3 Inbound Carrier Tracking Test
```bash
curl -X POST https://spiral-bound-fulfillment-gateway.example.workers.dev/api/v1/fulfillment/tracking/webhook \
  -H "Content-Type: application/json" \
  -d '{"order_id":"ORD-9912","vendor_job_id":"LULU-4412","carrier":"FedEx","tracking_number":"794829104821","event_type":"shipped"}'
```

---
*Manual compiled by Nexus Engineering Team. 100% Zero-Defect Standard.*
