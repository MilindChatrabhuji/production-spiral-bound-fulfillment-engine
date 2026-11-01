/**
 * Production Printed Digital Product Physical Spiral-Bound Fulfillment Engine
 * Package: @nexus/spiral-bound-fulfillment-engine
 * Module: engine/fulfillment_engine/digital_to_print_imposition_and_layout_engine.ts
 *
 * Imposition calculator, alternating gutter margin offset synthesizer,
 * and coil punch safety zone verification for physical spiral binding.
 */

import { SpiralBindingSpecification, ImpositionPageResult } from './types';

export class DigitalToPrintImpositionAndLayoutEngine {
  /**
   * Calculates the optimal coil diameter in millimeters based on page count and paper caliper.
   */
  public static calculateRecommendedCoilDiameter(pageCount: number, isHeavyStock: boolean = false): number {
    const pagesPerSheet = 2; // Duplex printing
    const sheets = Math.ceil(pageCount / pagesPerSheet);
    const caliperMmPerSheet = isHeavyStock ? 0.14 : 0.10; // 80# text vs 60# text
    const bookBlockThicknessMm = sheets * caliperMmPerSheet;

    // Add 4mm clearance for effortless 360-degree flat turning
    const minimumCoilDiameter = bookBlockThicknessMm + 4.0;

    if (minimumCoilDiameter <= 8) return 8;
    if (minimumCoilDiameter <= 10) return 10;
    if (minimumCoilDiameter <= 12) return 12;
    if (minimumCoilDiameter <= 14) return 14;
    if (minimumCoilDiameter <= 16) return 16;
    if (minimumCoilDiameter <= 20) return 20;
    if (minimumCoilDiameter <= 25) return 25;
    return 32;
  }

  /**
   * Imposes alternating gutter margins across every page in the document.
   * Odd pages (recto / right-facing): Inner binding gutter is on the LEFT.
   * Even pages (verso / left-facing): Inner binding gutter is on the RIGHT.
   */
  public static calculatePageImposition(
    spec: SpiralBindingSpecification,
    pageNumber: number,
    contentWidthInches: number
  ): ImpositionPageResult {
    const isOdd = pageNumber % 2 !== 0;
    const isLeftFacing = !isOdd;

    const gutterMargin = Math.max(spec.innerGutterMarginInches, 0.50); // Minimum 0.5" binding zone
    const outerMargin = Math.max(spec.outerMarginInches, 0.50);

    const leftOffset = isOdd ? gutterMargin : outerMargin;
    const rightOffset = isOdd ? outerMargin : gutterMargin;

    const effectivePrintableWidth = spec.trimSizeWidthInches - (leftOffset + rightOffset);
    const isPunchClear = contentWidthInches <= effectivePrintableWidth;

    return {
      pageNumber,
      isLeftFacingPage: isLeftFacing,
      leftMarginOffsetInches: Number(leftOffset.toFixed(2)),
      rightMarginOffsetInches: Number(rightOffset.toFixed(2)),
      punchHoleSafetyZoneClear: isPunchClear,
      effectivePrintableWidthInches: Number(effectivePrintableWidth.toFixed(2)),
      impositionStatus: isPunchClear ? 'VALID' : 'WARNING_GUTTER_INTRUSION'
    };
  }

  /**
   * Generates a complete book imposition validation summary.
   */
  public static generateBookImpositionManifest(spec: SpiralBindingSpecification): {
    totalSheets: number;
    recommendedCoilDiameterMm: number;
    gutterMarginInches: number;
    pagesEvaluatedCount: number;
    allPagesPunchClear: boolean;
    impositionMatrix: ImpositionPageResult[];
  } {
    const recommendedCoil = this.calculateRecommendedCoilDiameter(
      spec.totalPageCount,
      spec.interiorPaperStock.includes('80#') || spec.interiorPaperStock.includes('100#')
    );

    const matrix: ImpositionPageResult[] = [];
    let allClear = true;

    for (let p = 1; p <= spec.totalPageCount; p++) {
      const result = this.calculatePageImposition(spec, p, 7.25);
      matrix.push(result);
      if (!result.punchHoleSafetyZoneClear) {
        allClear = false;
      }
    }

    return {
      totalSheets: Math.ceil(spec.totalPageCount / 2),
      recommendedCoilDiameterMm: recommendedCoil,
      gutterMarginInches: spec.innerGutterMarginInches,
      pagesEvaluatedCount: spec.totalPageCount,
      allPagesPunchClear: allClear,
      impositionMatrix: matrix.slice(0, 8) // First 8 pages sample in manifest
    };
  }
}
