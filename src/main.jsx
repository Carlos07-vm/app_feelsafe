import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./App.css";
import "./styles/global.css";
import "./styles/theme.css";

import { AppProvider } from "./context/AppContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);