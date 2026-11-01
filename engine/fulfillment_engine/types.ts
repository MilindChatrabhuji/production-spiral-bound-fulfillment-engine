/**
 * Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine
 * Package: @nexus/spiral-bound-fulfillment-engine
 * Module: engine/fulfillment_engine/types.ts
 *
 * Strict Compliance:
 * - RFC 2606 Sample Domains only (.example.com)
 * - 100% Modern Evidence-Based Clinical Medicine & Scientific Trial Protocols
 * - Strictly Zero Alternative Remedy or Non-Evidence Based References
 */

export type CoilBindingType = 'Plastic Spiral Coil' | 'Twin-Loop Wire-O' | 'Color Coil 4:1 Pitch' | 'Comb Binding';

export type PaperStockWeight = '60# Uncoated Text' | '70# Premium White Text' | '80# Opaque Satin Text' | '100# Gloss Text' | 'Synthetic Waterproof Teslin';

export type CoverStockType = '10mil Frosted Poly Cover' | '100# Gloss Cover with Matte Lamination' | '120# Heavy Cardstock' | 'Clear Acetate Front / Vinyl Back';

export interface SpiralBindingSpecification {
  bookTitle: string;
  author: string;
  totalPageCount: number; // e.g., 184 pages
  trimSizeWidthInches: number; // e.g., 8.5
  trimSizeHeightInches: number; // e.g., 11.0 (Letter) or 6.0 x 9.0 (Digest)
  bindingType: CoilBindingType;
  coilDiameterMm: number; // e.g., 12mm, 16mm, 22mm depending on page count
  coilColor: 'Black' | 'White' | 'Silver' | 'Navy Blue';
  innerGutterMarginInches: number; // Mandatory >= 0.5 inches (36pt) for coil punch clear zone
  outerMarginInches: number; // >= 0.5 inches
  topMarginInches: number;
  bottomMarginInches: number;
  interiorPaperStock: PaperStockWeight;
  coverFinish: CoverStockType;
  bleedInches: number; // e.g., 0.125 inches (9pt)
  isLayingFlatRequired: boolean; // True for clinical trial & lab workbooks (360-degree rotation)
}

export interface ImpositionPageResult {
  pageNumber: number;
  isLeftFacingPage: boolean;
  leftMarginOffsetInches: number;
  rightMarginOffsetInches: number;
  punchHoleSafetyZoneClear: boolean;
  effectivePrintableWidthInches: number;
  impositionStatus: 'VALID' | 'WARNING_GUTTER_INTRUSION' | 'INVALID';
}

export interface PrintOrderPayload {
  orderId: string;
  sku: string;
  title: string;
  quantity: number;
  pdfInteriorUrl: string;
  pdfCoverUrl: string;
  shippingAddress: {
    recipientName: string;
    streetAddress: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    countryCode: string; // ISO 3166-1 alpha-2, e.g. 'US', 'IN', 'GB', 'DE'
    phone?: string;
  };
  fulfillmentVendorPreference: 'Lulu Direct' | 'Printify' | 'RegionalPODHub';
  carrierServiceLevel: 'STANDARD_GROUND' | 'EXPEDITED' | 'OVERNIGHT';
}

export interface VendorRoutingQuote {
  vendorName: 'Lulu Direct' | 'Printify' | 'RegionalPODHub';
  basePrintUnitCostUsd: number;
  estimatedShippingCostUsd: number;
  estimatedProductionDays: number;
  estimatedTransitDays: number;
  totalLandedCostUsd: number;
  isCoilBindingSupported: boolean;
  vendorApiEndpoint: string;
}

export interface CarrierTrackingEvent {
  orderId: string;
  vendorJobId: string;
  carrierName: 'FedEx' | 'UPS' | 'USPS' | 'DHL' | 'Delhivery';
  trackingNumber: string;
  trackingUrl: string;
  shipmentStatus: 'PRINTING' | 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  estimatedDeliveryIso: string;
  lastUpdatedIso: string;
}

export interface ClinicalProtocolBinderSpec {
  protocolIdentifier: string; // e.g. 'CLIN-SOP-2026-ONCOLOGY'
  studyTitle: string;
  therapeuticArea: string; // e.g. 'Oncology', 'Cardiovascular Medicine', 'Genomics'
  sponsorInstitution: string;
  irbApprovalNumber: string;
  evidenceBaseCitations: string[]; // PubMed / DOI peer-reviewed studies
  isWaterproofSpillResistantRequired: boolean;
  disclaimerNotice: string;
}
