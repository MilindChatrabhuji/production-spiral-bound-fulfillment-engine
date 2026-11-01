/**
 * Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine
 * Package: @nexus/spiral-bound-fulfillment-engine
 * Module: monetization_fulfillment_kit/automated_dual_currency_fulfillment_invoicing_engine.ts
 *
 * Automated dual-currency invoicing, domestic UPI settlement generator,
 * and international PayPal retainer billing engine.
 */

export interface InvoiceItem {
  sku: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  unitPriceInr: number;
}

export interface FulfillmentInvoiceDetails {
  invoiceNumber: string;
  clientOrganizationName: string;
  clientEmail: string;
  currency: 'USD' | 'INR' | 'DUAL';
  items: InvoiceItem[];
  subtotalUsd: number;
  subtotalInr: number;
  taxGstUsd: number;
  taxGstInr: number;
  totalUsd: number;
  totalInr: number;
  paymentUpiUri: string;
  paymentPaypalUrl: string;
  issueDateIso: string;
  dueDateIso: string;
  notes: string;
}

export class AutomatedDualCurrencyFulfillmentInvoicingEngine {
  public static readonly STANDARD_CATALOG = {
    SINGLE_PACK_USD: 9.0,
    SINGLE_PACK_INR: 750.0,
    MASTER_SUITE_USD: 19.0,
    MASTER_SUITE_INR: 1599.0,
    RETAINER_TIER1_USD: 500.0,
    RETAINER_TIER1_INR: 41500.0,
    RETAINER_TIER2_USD: 1500.0,
    RETAINER_TIER2_INR: 124500.0,
    RETAINER_TIER3_USD: 3000.0,
    RETAINER_TIER3_INR: 249000.0,
    UPI_VPA: 'milind.chatrabhuji@okhdfcbank',
    PAYPAL_RECEIVER: 'milind.chatrabhuji@gmail.com'
  };

  /**
   * Generates a commercial pro-forma invoice for single pack, master suite, or monthly retainers.
   */
  public static generateInvoice(
    clientOrganizationName: string,
    clientEmail: string,
    tier: 'SINGLE_PACK' | 'MASTER_SUITE' | 'RETAINER_500' | 'RETAINER_1500' | 'RETAINER_3000',
    preferredCurrency: 'USD' | 'INR' | 'DUAL' = 'DUAL'
  ): FulfillmentInvoiceDetails {
    const invNumber = `INV-POD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const items: InvoiceItem[] = [];

    if (tier === 'SINGLE_PACK') {
      items.push({
        sku: 'POD-MOD-01',
        description: 'Physical Spiral-Bound Imposition & Gutter Engine (Single Pack)',
        quantity: 1,
        unitPriceUsd: this.STANDARD_CATALOG.SINGLE_PACK_USD,
        unitPriceInr: this.STANDARD_CATALOG.SINGLE_PACK_INR
      });
    } else if (tier === 'MASTER_SUITE') {
      items.push({
        sku: 'POD-SUITE-FULL',
        description: 'Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine (Master Suite)',
        quantity: 1,
        unitPriceUsd: this.STANDARD_CATALOG.MASTER_SUITE_USD,
        unitPriceInr: this.STANDARD_CATALOG.MASTER_SUITE_INR
      });
    } else if (tier === 'RETAINER_500') {
      items.push({
        sku: 'RET-POD-500',
        description: 'Print Setup Sprint Monthly Retainer ($500/month)',
        quantity: 1,
        unitPriceUsd: this.STANDARD_CATALOG.RETAINER_TIER1_USD,
        unitPriceInr: this.STANDARD_CATALOG.RETAINER_TIER1_INR
      });
    } else if (tier === 'RETAINER_1500') {
      items.push({
        sku: 'RET-POD-1500',
        description: 'Managed Physical Workbook Operations Retainer ($1,500/month)',
        quantity: 1,
        unitPriceUsd: this.STANDARD_CATALOG.RETAINER_TIER2_USD,
        unitPriceInr: this.STANDARD_CATALOG.RETAINER_TIER2_INR
      });
    } else {
      items.push({
        sku: 'RET-POD-3000',
        description: 'Enterprise Institutional Book Fulfillment Retainer ($3,000/month)',
        quantity: 1,
        unitPriceUsd: this.STANDARD_CATALOG.RETAINER_TIER3_USD,
        unitPriceInr: this.STANDARD_CATALOG.RETAINER_TIER3_INR
      });
    }

    const subtotalUsd = items.reduce((sum, item) => sum + item.unitPriceUsd * item.quantity, 0);
    const subtotalInr = items.reduce((sum, item) => sum + item.unitPriceInr * item.quantity, 0);

    const upiUri = `upi://pay?pa=${this.STANDARD_CATALOG.UPI_VPA}&pn=Dr_Milind_Chatrabhuji&am=${subtotalInr.toFixed(2)}&cu=INR&tn=${invNumber}`;

    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
      this.STANDARD_CATALOG.PAYPAL_RECEIVER
    )}&item_name=${encodeURIComponent(items[0].description)}&amount=${subtotalUsd.toFixed(2)}&currency_code=USD&invoice=${invNumber}`;

    return {
      invoiceNumber: invNumber,
      clientOrganizationName,
      clientEmail,
      currency: preferredCurrency,
      items,
      subtotalUsd,
      subtotalInr,
      taxGstUsd: 0.0, // Zero-rated export under GST LUT
      taxGstInr: 0.0,
      totalUsd: subtotalUsd,
      totalInr: subtotalInr,
      paymentUpiUri: upiUri,
      paymentPaypalUrl: paypalUrl,
      issueDateIso: new Date().toISOString(),
      dueDateIso: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      notes: 'GST LUT zero-rated export of software & publishing operations services. 100% reprint defect warranty.'
    };
  }

  /**
   * Formats invoice as clean text document.
   */
  public static renderTextInvoice(inv: FulfillmentInvoiceDetails): string {
    const rows = inv.items
      .map(
        i =>
          `* ${i.sku} - ${i.description} | Qty: ${i.quantity} | $${i.unitPriceUsd.toFixed(2)} USD (Rs ${i.unitPriceInr.toLocaleString('en-IN')})`
      )
      .join('\n');

    return `===============================================================
OFFICIAL PRO-FORMA INVOICE :: NEXUS PUBLISHING PRINT OPERATIONS
===============================================================
Invoice No: ${inv.invoiceNumber}
Date: ${inv.issueDateIso.split('T')[0]} | Due Date: ${inv.dueDateIso.split('T')[0]}
Client: ${inv.clientOrganizationName} (${inv.clientEmail})

ITEMS:
${rows}

TOTAL PAYABLE:
* USD Settlement: $${inv.totalUsd.toFixed(2)} USD
* INR Settlement: Rs ${inv.totalInr.toLocaleString('en-IN')} INR

SETTLEMENT CHANNELS:
- Domestic (India UPI): ${inv.paymentUpiUri}
- International (PayPal): ${inv.paymentPaypalUrl}

Beneficiary: Dr. Milind Chatrabhuji
===============================================================`;
  }
}
