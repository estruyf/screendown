import * as React from "react";
import { render } from "react-dom";
import { App } from "./App";
import { RecoilRoot } from "recoil";

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector("#root");
if (elm) {
  document.documentElement.style.setProperty('--screendown-text', 'var(--vscode-foreground)');
  document.documentElement.style.setProperty('--screendown-link', 'var(--vscode-textLink-foreground)');

  const webviewUrl = elm.getAttribute("data-webview-url") || "";

  render(<RecoilRoot><App webviewUrl={webviewUrl} /></RecoilRoot>, elm);
}

// Webpack HMR
if ((module as any).hot) (module as any).hot.accept();