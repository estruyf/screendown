import { MessageHandlerData } from "@estruyf/vscode";
import { join } from "path";
import { ExtensionContext, ExtensionMode, SaveDialogOptions, Uri, ViewColumn, Webview, WebviewPanel, window, workspace } from "vscode";
import { ExtensionService } from "../services/ExtensionService";


export class MarkdownWebview {
  public static panel: WebviewPanel | null = null;
  private static crntSelection: string = "";

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
      payload: MarkdownWebview.crntSelection,
    } as MessageHandlerData<string>);
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

    MarkdownWebview.panel.webview.onDidReceiveMessage(
      async (message) => {
        const { command, requestId, payload } = message;

        if (command === "getMarkdown") {
          MarkdownWebview.panel?.webview.postMessage({
            command,
            requestId,
            payload: MarkdownWebview.crntSelection,
          } as MessageHandlerData<string>);
        } else if (command === "saveImage") {
          const options: SaveDialogOptions = {
            filters: {
              Images: ['png']
            }
          };

          if (ext.workspacePath) {
            options.defaultUri = ext.workspacePath;
          }

          const uri = await window.showSaveDialog(options)

          if (uri) {
            // ArrayBuffer to file
            workspace.fs.writeFile(uri, Buffer.from(payload, 'base64'));
          }
        }
      },
      undefined,
      ext.context.subscriptions
    );

    MarkdownWebview.panel.onDidDispose(async () => {
      MarkdownWebview.panel = null;
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
  
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ""}
      <meta http-equiv="Content-Security-Policy" content="img-src vscode-resource: data: https:; script-src https: http:; style-src 'unsafe-inline' https: http:;" />
    </head>
    <body>
      <div id="root"></div>
  
      <script src="${scriptUrl}" />
    </body>
    </html>`;
  };
}