/**
 * Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine
 * Package: @nexus/spiral-bound-fulfillment-engine
 * Module: engine/edge_fulfillment_gateway/worker.ts
 *
 * Cloudflare Workers Edge Gateway for Physical Spiral-Bound Book Fulfillment,
 * Imposition Validation, Multi-Vendor POD Routing, and Carrier Tracking.
 */

import { DigitalToPrintImpositionAndLayoutEngine } from '../fulfillment_engine/digital_to_print_imposition_and_layout_engine';
import { AutomatedLuluPrintifyRoutingBroker } from '../fulfillment_engine/automated_lulu_printify_routing_broker';
import { ClinicalTextbookAndAnatomyBinderValidator } from '../fulfillment_engine/clinical_textbook_and_anatomy_binder_validator';
import { PrintOrderWebhookAndTrackingRouter, InboundTrackingWebhookPayload } from './print_order_webhook_and_tracking_router';
import { DynamicShippingRateAndMarginCalculator, LandedPrintCostInput } from './dynamic_shipping_rate_and_margin_calculator';
import { SpiralBindingSpecification, PrintOrderPayload, ClinicalProtocolBinderSpec } from '../fulfillment_engine/types';

export interface Env {
  DB?: any; // Cloudflare D1 Database binding
  ENVIRONMENT?: string;
  VENDOR_WEBHOOK_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Carrier-Token',
      'Content-Type': 'application/json'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    try {
      // 1. Health Check Endpoint
      if (url.pathname === '/health' || url.pathname === '/api/v1/health') {
        return new Response(
          JSON.stringify({
            status: 'HEALTHY',
            service: 'Production Spiral-Bound Book Fulfillment Gateway',
            version: '1.0.0',
            catalogId: 'WAY-87-PRODUCT-89',
            edgePoP: 'Cloudflare Edge Global Network',
            timestamp: new Date().toISOString()
          }),
          { headers: corsHeaders, status: 200 }
        );
      }

      // 2. Imposition & Gutter Calculation Endpoint
      if (url.pathname === '/api/v1/fulfillment/imposition/calculate' && method === 'POST') {
        const spec = (await request.json()) as SpiralBindingSpecification;
        const manifest = DigitalToPrintImpositionAndLayoutEngine.generateBookImpositionManifest(spec);

        return new Response(JSON.stringify({ status: 'SUCCESS', impositionManifest: manifest }), {
          headers: corsHeaders,
          status: 200
        });
      }

      // 3. Multi-Vendor POD Routing Quote Endpoint
      if (url.pathname === '/api/v1/fulfillment/routing/quote' && method === 'POST') {
        const body: any = await request.json();
        const order = body.order as PrintOrderPayload;
        const pageCount = body.pageCount || 184;

        const quotes = AutomatedLuluPrintifyRoutingBroker.quoteAllVendors(order, pageCount);
        const decision = AutomatedLuluPrintifyRoutingBroker.routeAndDispatchOrder(order, pageCount);

        return new Response(JSON.stringify({ status: 'SUCCESS', quotes, selectedRoute: decision }), {
          headers: corsHeaders,
          status: 200
        });
      }

      // 4. Inbound Carrier Tracking Webhook Endpoint
      if (url.pathname === '/api/v1/fulfillment/tracking/webhook' && method === 'POST') {
        const payload = (await request.json()) as InboundTrackingWebhookPayload;
        const trackingEvent = PrintOrderWebhookAndTrackingRouter.processWebhook(payload);
        const notification = PrintOrderWebhookAndTrackingRouter.formatClientDeliveryUpdate(
          trackingEvent,
          'Clinical Oncology Protocol & Lab Reference Manual'
        );

        return new Response(JSON.stringify({ status: 'SUCCESS', trackingEvent, notificationText: notification }), {
          headers: corsHeaders,
          status: 200
        });
      }

      // 5. Landed Print Cost & Margins Calculation Endpoint
      if (url.pathname === '/api/v1/fulfillment/economics/calculate' && method === 'POST') {
        const input = (await request.json()) as LandedPrintCostInput;
        const economics = DynamicShippingRateAndMarginCalculator.calculateLandedCost(input);

        return new Response(JSON.stringify({ status: 'SUCCESS', economics }), {
          headers: corsHeaders,
          status: 200
        });
      }

      // 6. Clinical Protocol Binder Validation Endpoint
      if (url.pathname === '/api/v1/fulfillment/clinical/validate' && method === 'POST') {
        const body: any = await request.json();
        const clinicalSpec = body.clinicalSpec as ClinicalProtocolBinderSpec;
        const bindingSpec = body.bindingSpec as SpiralBindingSpecification;

        const audit = ClinicalTextbookAndAnatomyBinderValidator.validateClinicalBinder(clinicalSpec, bindingSpec);

        return new Response(JSON.stringify({ status: 'SUCCESS', clinicalAudit: audit }), {
          headers: corsHeaders,
          status: 200
        });
      }

      return new Response(
        JSON.stringify({
          error: 'Endpoint not found',
          availableEndpoints: [
            '/health',
            '/api/v1/fulfillment/imposition/calculate',
            '/api/v1/fulfillment/routing/quote',
            '/api/v1/fulfillment/tracking/webhook',
            '/api/v1/fulfillment/economics/calculate',
            '/api/v1/fulfillment/clinical/validate'
          ]
        }),
        { headers: corsHeaders, status: 404 }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: 'Internal edge gateway error', details: err.message }), {
        headers: corsHeaders,
        status: 500
      });
    }
  }
};
