import { ExtensionService } from './services/ExtensionService';
import * as vscode from "vscode";
import { MarkdownWebview } from "./providers/MarkdownWebview";

export function activate(context: vscode.ExtensionContext) {
  ExtensionService.getInstance(context);

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
      MarkdownWebview.reveal();
    }
  );

  vscode.window.onDidChangeTextEditorSelection(e => {
    if (e.selections.length > 0 && MarkdownWebview.panel) {
      MarkdownWebview.triggerSelectionUpdate();
    }
  })

  context.subscriptions.push(disposable);
}


export function deactivate() {}
