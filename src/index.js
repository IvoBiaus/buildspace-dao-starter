import React from "react";
import ReactDOM from "react-dom";
import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

import "./index.css";
import App from "./App.js";

// Chains you wanna support.
// 5 = Rinkeby.
const supportedChainIds = [5];

// Type of wallet you want to support.
// In this case, we support Metamask which is an "injected wallet".
const connectors = {
  injected: {},
};

ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <App />
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
