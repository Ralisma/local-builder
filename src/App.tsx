import React from "react";
// Change: Import from @puckeditor/core instead of @measured/puck
import { Puck } from "@puckeditor/core";
// Change: The CSS path has also changed to index.css
import "@puckeditor/core/index.css";
import { config } from "./puck.config";
import { saveProject } from "./generator";

export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <Puck
        config={config}
        data={{ content: [], root: {} }}
        onPublish={async (data) => {
          // Exports the current design as the Home page
          await saveProject([{ path: "/", name: "Home", data }]);
        }}
      />
    </div>
  );
}