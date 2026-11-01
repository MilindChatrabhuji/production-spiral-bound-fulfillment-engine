/**
 * Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine
 * Package: @nexus/spiral-bound-fulfillment-engine
 * Module: engine/edge_fulfillment_gateway/print_order_webhook_and_tracking_router.ts
 *
 * Carrier tracking webhook ingestion, multi-carrier event normalization,
 * and automated physical delivery notifications for spiral-bound orders.
 */

import { CarrierTrackingEvent } from '../fulfillment_engine/types';

export interface InboundTrackingWebhookPayload {
  order_id: string;
  vendor_job_id: string;
  carrier: string;
  tracking_number: string;
  tracking_url?: string;
  event_type: 'label_created' | 'shipped' | 'out_for_delivery' | 'delivered';
  estimated_delivery?: string;
  occurred_at?: string;
}

export class PrintOrderWebhookAndTrackingRouter {
  /**
   * Normalizes inbound tracking webhook into standard CarrierTrackingEvent.
   */
  public static processWebhook(payload: InboundTrackingWebhookPayload): CarrierTrackingEvent {
    let status: 'PRINTING' | 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' = 'DISPATCHED';

    if (payload.event_type === 'label_created') {
      status = 'DISPATCHED';
    } else if (payload.event_type === 'shipped') {
      status = 'IN_TRANSIT';
    } else if (payload.event_type === 'out_for_delivery') {
      status = 'OUT_FOR_DELIVERY';
    } else if (payload.event_type === 'delivered') {
      status = 'DELIVERED';
    }

    const carrierUpper = (payload.carrier || 'FedEx').toUpperCase();
    let carrierName: 'FedEx' | 'UPS' | 'USPS' | 'DHL' | 'Delhivery' = 'FedEx';
    if (carrierUpper.includes('UPS')) carrierName = 'UPS';
    else if (carrierUpper.includes('USPS')) carrierName = 'USPS';
    else if (carrierUpper.includes('DHL')) carrierName = 'DHL';
    else if (carrierUpper.includes('DELHIVERY')) carrierName = 'Delhivery';

    const trackingUrl = payload.tracking_url || `https://tracking.example.com/track?carrier=${carrierName}&num=${payload.tracking_number}`;

    return {
      orderId: payload.order_id,
      vendorJobId: payload.vendor_job_id,
      carrierName,
      trackingNumber: payload.tracking_number,
      trackingUrl,
      shipmentStatus: status,
      estimatedDeliveryIso: payload.estimated_delivery || new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      lastUpdatedIso: payload.occurred_at || new Date().toISOString()
    };
  }

  /**
   * Formats client delivery notification.
   */
  public static formatClientDeliveryUpdate(event: CarrierTrackingEvent, bookTitle: string): string {
    return `TRACKING UPDATE: Your spiral-bound edition of "${bookTitle}" (Order #${event.orderId}) has been updated.
Current Status: ${event.shipmentStatus} via ${event.carrierName}
Tracking Number: ${event.trackingNumber}
Estimated Delivery: ${event.estimatedDeliveryIso.split('T')[0]}
Live Tracking: ${event.trackingUrl}`;
  }
}
