import { ExtensionService } from './services/ExtensionService';
import * as vscode from "vscode";
import { MarkdownWebview } from "./providers/MarkdownWebview";

export function activate(context: vscode.ExtensionContext) {
  ExtensionService.getInstance(context);

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
