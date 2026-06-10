/**
 * @file declarations.d.ts
 * @description TypeScript module declarations for third-party libraries that lack built-in type definitions.
 *
 * @module Types
 * @author CarbonLens Team
 */

declare module 'dom-to-image-more' {
  const domToImage: {
    toPng(node: HTMLElement, options?: Record<string, unknown>): Promise<string>;
    toJpeg(node: HTMLElement, options?: Record<string, unknown>): Promise<string>;
    toSvg(node: HTMLElement, options?: Record<string, unknown>): Promise<string>;
    toBlob(node: HTMLElement, options?: Record<string, unknown>): Promise<Blob>;
    toPixelData(node: HTMLElement, options?: Record<string, unknown>): Promise<Uint8ClampedArray>;
  };
  export default domToImage;
}
