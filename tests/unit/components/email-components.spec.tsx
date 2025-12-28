import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { BrandedEmailHeader, BrandedEmailFooter } from "@/components/email";
import { defaultBrand } from "@/lib/brands";

describe("Email Components", () => {
  describe("BrandedEmailHeader", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailHeader, { brand: defaultBrand })
      );
      expect(html).toBeDefined();
    });

    it("renders as table", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailHeader, { brand: defaultBrand })
      );
      expect(html).toContain("table");
    });
  });

  describe("BrandedEmailFooter", () => {
    it("renders without crashing", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailFooter, { brand: defaultBrand })
      );
      expect(html).toBeDefined();
    });

    it("renders as table", () => {
      const html = ReactDOMServer.renderToString(
        React.createElement(BrandedEmailFooter, { brand: defaultBrand })
      );
      expect(html).toContain("table");
    });
  });
});
