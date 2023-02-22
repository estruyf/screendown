import { EditorHelper } from './../listeners/EditorHelper';
import { LogHelper } from './../listeners/LogHelper';
import { ThemeListeners } from './../listeners/ThemeListeners';
import { FileHandlerListeners } from './../listeners/FileHandlerListeners';
import { MessageHandlerData } from '@estruyf/vscode';
import { join } from 'path';
import { ExtensionContext, ExtensionMode, Uri, ViewColumn, Webview, WebviewPanel, window, workspace } from 'vscode';
import { ExtensionService } from '../services/ExtensionService';
import { ContentData } from '../models';
import { StateListener } from '../listeners/StateListener';


export class MarkdownWebview {
  public static panel: WebviewPanel | null = null;
  public static isDisposed: boolean = true;
  public static crntSelection: string = "";
  public static crntLangugage: string = "markdown";

  public static reveal() {
    MarkdownWebview.getSelection();

    if (MarkdownWebview.panel) {
      MarkdownWebview.panel.reveal();
      MarkdownWebview.triggerSelectionUpdate();
    } else {
      MarkdownWebview.open();
    }
  }

  public static dispose() {
    MarkdownWebview.panel?.dispose();
  }

  public static triggerSelectionUpdate() {
    MarkdownWebview.getSelection();

    MarkdownWebview.panel?.webview.postMessage({
      command: "setMarkdown",
      payload: {
        content: MarkdownWebview.crntSelection,
        language: MarkdownWebview.crntLangugage
      },
    } as MessageHandlerData<ContentData>);
  }

  public static async open() {
    const ext = ExtensionService.getInstance();
    
    MarkdownWebview.panel = window.createWebviewPanel(
      "screendown-view",
      "Screendown",
      ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    MarkdownWebview.isDisposed = false;

    MarkdownWebview.panel.webview.onDidReceiveMessage(
      async (message) => {
        EditorHelper.process(message);
        FileHandlerListeners.process(message);
        LogHelper.process(message);
        StateListener.process(message);
        ThemeListeners.process(message);
      },
      undefined,
      ext.context.subscriptions
    );

    MarkdownWebview.panel.iconPath = {
      dark: Uri.file(join(ext.extensionPath, 'assets/icon.svg')),
      light: Uri.file(join(ext.extensionPath, 'assets/icon.svg')),
    }

    MarkdownWebview.panel.onDidDispose(async () => {
      MarkdownWebview.panel = null;
      MarkdownWebview.isDisposed = true;
    });

    MarkdownWebview.panel.webview.html = MarkdownWebview.getWebviewContent(ext.context, MarkdownWebview.panel.webview);
  }

  private static getSelection() {
    // Get the selected text
    const editor = window.activeTextEditor;
    const selection = editor?.selection;
    const text = editor?.document.getText(selection);

    if (text) {
      MarkdownWebview.crntSelection = text;
      MarkdownWebview.crntLangugage = editor?.document.languageId ?? "markdown";
    }
  }


  private static getWebviewContent(context: ExtensionContext, webview: Webview) {
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

    const workspaceFolder = workspace.workspaceFolders?.[0];
    const workspacePath = workspaceFolder?.uri.fsPath;
    const webviewUrl = workspacePath ? webview.asWebviewUri(Uri.file(workspacePath)) : "";
    const extUrl = workspacePath ? webview.asWebviewUri(Uri.file(context.extensionPath)) : "";
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ""}
    </head>
    <body>
      <div data-webview-url="${webviewUrl}" data-ext-url="${extUrl}" id="root"></div>
  
      <script src="${scriptUrl}" />
    </body>
    </html>`;
  };
}