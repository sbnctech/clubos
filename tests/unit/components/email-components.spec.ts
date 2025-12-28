/**
 * Unit tests for email components
 *
 * Tests that branded email components render correctly using server-side rendering.
 * Uses ReactDOMServer to test React components in Node.js environment.
 */

import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import {
  BrandedEmailHeader,
  BrandedEmailFooter,
  BrandedEmailWrapper,
} from "@/components/email";
import { defaultBrand } from "@/lib/brands";

describe("Email Components", () => {
  describe("BrandedEmailHeader", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailHeader, { brand: defaultBrand })
      );
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it("renders as table for email compatibility", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailHeader, { brand: defaultBrand })
      );
      expect(html).toContain("<table");
      expect(html).toContain("</table>");
    });

    it("includes logo image", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailHeader, { brand: defaultBrand })
      );
      expect(html).toContain("<img");
      expect(html).toContain(defaultBrand.identity.logo.url);
    });

    it("uses brand colors", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailHeader, { brand: defaultBrand })
      );
      expect(html).toContain(defaultBrand.identity.colors.primary);
    });
  });

  describe("BrandedEmailFooter", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailFooter, { brand: defaultBrand })
      );
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it("renders as table for email compatibility", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailFooter, { brand: defaultBrand })
      );
      expect(html).toContain("<table");
      expect(html).toContain("</table>");
    });

    it("includes brand name", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailFooter, { brand: defaultBrand })
      );
      expect(html).toContain(defaultBrand.name);
    });
  });

  describe("BrandedEmailWrapper", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailWrapper, {
          brand: defaultBrand,
          children: React.createElement("p", null, "Test content"),
        })
      );
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it("wraps children content", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailWrapper, {
          brand: defaultBrand,
          children: React.createElement("p", null, "Test content here"),
        })
      );
      expect(html).toContain("Test content here");
    });

    it("includes header and footer", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailWrapper, {
          brand: defaultBrand,
          children: React.createElement("p", null, "Content"),
        })
      );
      // Should include logo from header
      expect(html).toContain(defaultBrand.identity.logo.url);
      // Should include brand name from footer
      expect(html).toContain(defaultBrand.name);
    });
  });
});
