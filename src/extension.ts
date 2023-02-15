// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { join } from "path";
import * as vscode from "vscode";
import { ExtensionContext, ExtensionMode, Uri, Webview } from "vscode";
import { MessageHandlerData } from "@estruyf/vscode";

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand(
    "vscode-react-webview-starter.clipboard",
    async () => {
      const clipboard = vscode.env.clipboard;
      const clipboardText = await clipboard.readText();
      console.log(clipboardText);
    }
  );

  let disposable = vscode.commands.registerCommand(
    "vscode-react-webview-starter.openWebview",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "react-webview",
        "React Webview",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      panel.webview.onDidReceiveMessage(
        (message) => {
          const { command, requestId, payload } = message;

          if (command === "getMarkdown") {
            // Get the selected text
            const editor = vscode.window.activeTextEditor;
            const selection = editor?.selection;
            const text = editor?.document.getText(selection);

            panel.webview.postMessage({
              command,
              requestId,
              payload: text,
            } as MessageHandlerData<string>);
          }
        },
        undefined,
        context.subscriptions
      );

      panel.webview.html = getWebviewContent(context, panel.webview);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

const getWebviewContent = (context: ExtensionContext, webview: Webview) => {
  const jsFile = "webview.js";
  const localServerUrl = "http://localhost:9000";

  let scriptUrl = null;
  let cssUrl = null;

  const isProduction = context.extensionMode === ExtensionMode.Production;
  if (isProduction) {
    scriptUrl = webview
      .asWebviewUri(Uri.file(join(context.extensionPath, "dist", jsFile)))
      .toString();
  } else {
    scriptUrl = `${localServerUrl}/${jsFile}`;
  }

  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ""}
	</head>
	<body>
		<div id="root"></div>

		<script src="${scriptUrl}" />
	</body>
	</html>`;
};
