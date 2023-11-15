import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Providers from "./Providers.tsx";
// import "./lib_import.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
