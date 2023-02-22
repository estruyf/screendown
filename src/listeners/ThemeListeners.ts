import { StateKeys } from './../constants/StateKeys';
import { MessageHandlerData } from '@estruyf/vscode';
import { Commands } from '../constants';
import { VSCodeMessage } from '../models';
import { BaseListener } from './BaseListener';
import { commands, SaveDialogOptions, window, workspace } from 'vscode';
import { ExtensionService } from '../services/ExtensionService';
import { getTheme } from '../utils';
import { MarkdownWebview } from '../providers/MarkdownWebview';

export class ThemeListeners extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: VSCodeMessage) {
    super.process(msg);

    switch (msg.command) {
      case Commands.WebviewToVscode.getTheme:
        ThemeListeners.getCurrentTheme(msg.command, msg.requestId, msg.payload);
        break;
    }
  }

  private static async getCurrentTheme(command: string, requestId?: string, payload?: string) {
    if (!payload) {
      return;
    }

    const theme = getTheme(payload);

    MarkdownWebview.panel?.webview.postMessage({
      command,
      requestId,
      payload: theme
    } as MessageHandlerData<any>);
  }
}
