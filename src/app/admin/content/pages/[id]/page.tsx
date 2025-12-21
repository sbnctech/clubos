// Copyright (c) Santa Barbara Newcomers Club
// Page editor route - renders page title and block list

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageContent } from "@/lib/publishing/blocks";
import PageEditorClient from "./PageEditorClient";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export default async function PageEditorPage({ params }: RouteParams) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      content: true,
    },
  });

  if (!page) {
    notFound();
  }

  // Extract blocks from content, sorted by order field
  const content = page.content as PageContent | null;
  const blocks = content?.blocks ?? [];
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div data-test-id="page-editor-root" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "16px" }}>
        <a
          href="/admin/content/pages"
          style={{ color: "#0066cc", textDecoration: "none", fontSize: "14px" }}
        >
          &larr; Back to Pages
        </a>
      </div>

      <h1 data-test-id="page-editor-title" style={{ fontSize: "24px", margin: "0 0 8px 0" }}>
        {page.title}
      </h1>
      <p style={{ color: "#666", margin: "0 0 24px 0", fontSize: "14px" }}>
        /{page.slug} &bull; {page.status}
      </p>

      <PageEditorClient
        pageId={page.id}
        initialBlocks={sortedBlocks}
      />
    </div>
  );
}
