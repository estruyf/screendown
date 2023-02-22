import { Commands } from '../constants';
import { VSCodeMessage } from '../models';
import { BaseListener } from './BaseListener';
import { commands, SaveDialogOptions, window, workspace } from 'vscode';
import { ExtensionService } from '../services/ExtensionService';
import { getImageToBase64 } from '../utils';
import { MarkdownWebview } from '../providers/MarkdownWebview';
import { MessageHandlerData } from '@estruyf/vscode';

export class FileHandlerListeners extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: VSCodeMessage) {
    super.process(msg);

    switch (msg.command) {
      case Commands.WebviewToVscode.copied:
        window.showInformationMessage("Screendown: Copied to clipboard");
        break;
      case Commands.WebviewToVscode.saveImage:
        FileHandlerListeners.saveFileToDisk(msg.payload);
        break;
      case Commands.WebviewToVscode.getImageToBase64:
        FileHandlerListeners.getImageToBase64(msg.command, msg.requestId, msg.payload);
        break;
    }
  }

  private static async getImageToBase64(command: string, requestId: string | undefined, payload: any) {
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
  }

  private static async saveFileToDisk(payload: any | undefined) {
    if (!payload) {
      return;
    }

    const options: SaveDialogOptions = {
      filters: {
        Images: ['png']
      }
    };

    const ext = ExtensionService.getInstance();
    if (ext.workspacePath) {
      options.defaultUri = ext.workspacePath;
    }

    const uri = await window.showSaveDialog(options)

    if (uri) {
      // ArrayBuffer to file
      await workspace.fs.writeFile(uri, Buffer.from(payload, 'base64'));

      commands.executeCommand('vscode.open', uri);
    }
  }
}
