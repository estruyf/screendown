import * as React from "react";
import { render } from "react-dom";
import { App } from "./App";

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#root");
if (elm) {
  document.documentElement.style.setProperty('--screendown-text', 'var(--vscode-foreground)');
  document.documentElement.style.setProperty('--screendown-link', 'var(--vscode-textLink-foreground)');

  render(<App />, elm);
}

// Webpack HMR
if ((module as any).hot) (module as any).hot.accept();