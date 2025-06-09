import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  AllEnterpriseModule,
  LicenseManager,
  ModuleRegistry,
} from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllEnterpriseModule]);

LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
