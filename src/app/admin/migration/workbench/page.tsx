/**
 * Migration Workbench Page
 *
 * Side-by-side view for reviewing and editing migrated content.
 *
 * Charter: P6 (human-first UI)
 */

import { Suspense } from "react";
import { WorkbenchClient } from "./WorkbenchClient";

export const metadata = {
  title: "Migration Workbench - Admin",
};

export default function MigrationWorkbenchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-gray-500">Loading workbench...</div>
          </div>
        }
      >
        <WorkbenchClient />
      </Suspense>
    </div>
  );
}
