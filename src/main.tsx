import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElementId = "root";
let rootElement = document.getElementById(rootElementId);

if (!rootElement) {
  rootElement = document.createElement("div");
  rootElement.id = rootElementId;
  document.body.appendChild(rootElement);
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
