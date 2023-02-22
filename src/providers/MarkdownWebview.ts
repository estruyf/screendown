import { ProfileImageDetails } from './../webview/models/ProfileImageDetails';
import { MessageHandlerData } from "@estruyf/vscode";
import { join } from "path";
import { commands, ExtensionContext, ExtensionMode, SaveDialogOptions, Uri, ViewColumn, Webview, WebviewPanel, window, workspace } from "vscode";
import { ExtensionService } from "../services/ExtensionService";
import { getTheme } from "../utils/getTheme";
import { ContentData } from "../models";
import { getImageToBase64 } from "../utils";


export class MarkdownWebview {
  public static panel: WebviewPanel | null = null;
  private static crntSelection: string = "";
  private static crntLangugage: string = "markdown";

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

    MarkdownWebview.panel.webview.onDidReceiveMessage(
      async (message) => {
        const { command, requestId, payload } = message;

        if (command === "getMarkdown") {
          MarkdownWebview.panel?.webview.postMessage({
            command,
            requestId,
            payload: {
              content: MarkdownWebview.crntSelection,
              language: MarkdownWebview.crntLangugage
            },
          } as MessageHandlerData<ContentData>);
        } else if (command === "getImageToBase64") {
          try {
            const base64Image = await getImageToBase64(payload);

            MarkdownWebview.panel?.webview.postMessage({
              command,
              requestId,
              payload: base64Image
            } as MessageHandlerData<string>);
          } catch (e) {
            MarkdownWebview.panel?.webview.postMessage({
              command,
              requestId,
              error: `Failed to fetch image`
            } as MessageHandlerData<string>);
          }
        } else if (command === "logError") {
          window.showErrorMessage(`Screendown: ${payload}`);
        } else if (command === "copied") {
          window.showInformationMessage("Screendown: Copied to clipboard");
        } else if (command === "getTheme") {
          const theme = getTheme(payload);

          MarkdownWebview.panel?.webview.postMessage({
            command,
            requestId,
            payload: theme
          } as MessageHandlerData<any>);
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
            await workspace.fs.writeFile(uri, Buffer.from(payload, 'base64'));

            commands.executeCommand('vscode.open', uri);
          }
        } else if (command === "getWindowState") {
          const windowState = await ext.getState('screendown.windowState', "global");

          MarkdownWebview.panel?.webview.postMessage({
            command,
            requestId,
            payload: windowState
          } as MessageHandlerData<any>);
        } else if (command === "setWindowState") {
          if (payload) {
            ext.setState('screendown.windowState', payload, "global");
          }
        } else if (command === "getWatermark") {
          const watermark = await ext.getState<string>('screendown.watermark', "global");

          MarkdownWebview.panel?.webview.postMessage({
            command,
            requestId,
            payload: watermark
          } as MessageHandlerData<string>);
        } else if (command === "setWatermark") {
          if (payload) {
            ext.setState('screendown.watermark', payload, "global");
          }
        } else if (command === "getProfileImage") {
          const profileImage = await ext.getState<ProfileImageDetails>('screendown.profileImage', "global");

          MarkdownWebview.panel?.webview.postMessage({
            command,
            requestId,
            payload: profileImage || undefined
          } as MessageHandlerData<ProfileImageDetails>);
        } else if (command === "setProfileImage") {
          if (payload) {
            ext.setState('screendown.profileImage', payload, "global");
          }
        }
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