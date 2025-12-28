/**
 * Unit tests for brand components
 *
 * Tests that brand components render correctly using server-side rendering.
 * Uses ReactDOMServer to test React components in Node.js environment.
 */

import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { ClubOSLogo, ClubOSBug, ClubOSWordmark } from "@/components/brand";

describe("Brand Components", () => {
  describe("ClubOSLogo", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(React.createElement(ClubOSLogo));
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it("accepts size prop", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(ClubOSLogo, { size: "lg" })
      );
      expect(html).toBeDefined();
    });

    it("accepts variant prop", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(ClubOSLogo, { variant: "white" })
      );
      expect(html).toBeDefined();
    });

    it("renders all sizes", () => {
      const sizes = ["sm", "md", "lg", "xl"] as const;
      for (const size of sizes) {
        const html = ReactDOMServer.renderToString(
          React.createElement(ClubOSLogo, { size })
        );
        expect(html).toBeDefined();
      }
    });

    it("renders all variants", () => {
      const variants = ["color", "white", "black"] as const;
      for (const variant of variants) {
        const html = ReactDOMServer.renderToString(
          React.createElement(ClubOSLogo, { variant })
        );
        expect(html).toBeDefined();
      }
    });
  });

  describe("ClubOSBug", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(React.createElement(ClubOSBug));
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it("renders as SVG", () => {
      const html = ReactDOMServer.renderToString(React.createElement(ClubOSBug));
      expect(html).toContain("<svg");
      expect(html).toContain("</svg>");
    });

    it("accepts size prop", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(ClubOSBug, { size: 32 })
      );
      expect(html).toContain('width="32"');
      expect(html).toContain('height="32"');
    });

    it("accepts variant prop", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(ClubOSBug, { variant: "white" })
      );
      expect(html).toContain("#FFFFFF");
    });

    it("has accessible label", () => {
      const html = ReactDOMServer.renderToString(React.createElement(ClubOSBug));
      expect(html).toContain('aria-label="ClubOS"');
      expect(html).toContain('role="img"');
    });

    it("renders all valid sizes", () => {
      const sizes = [16, 24, 32, 48, 64] as const;
      for (const size of sizes) {
        const html = ReactDOMServer.renderToString(
          React.createElement(ClubOSBug, { size })
        );
        expect(html).toContain(`width="${size}"`);
      }
    });
  });

  describe("ClubOSWordmark", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(React.createElement(ClubOSWordmark));
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it("renders ClubOS text", () => {
      const html = ReactDOMServer.renderToString(React.createElement(ClubOSWordmark));
      expect(html).toContain("Club");
      expect(html).toContain("OS");
    });
  });
});
