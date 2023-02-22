import { StateKeys } from './../constants/StateKeys';
import { MessageHandlerData } from '@estruyf/vscode';
import { Commands } from '../constants';
import { VSCodeMessage } from '../models';
import { MarkdownWebview } from '../providers/MarkdownWebview';
import { ExtensionService } from '../services/ExtensionService';
import { BaseListener } from './BaseListener';

export class StateListener extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: VSCodeMessage) {
    super.process(msg);

    switch (msg.command) {
      case Commands.WebviewToVscode.getWindowState:
        StateListener.getState(msg.command, StateKeys.windowState, {}, msg.requestId);
        break;
      case Commands.WebviewToVscode.getWatermark:
        StateListener.getState(msg.command, StateKeys.watermark, undefined, msg.requestId);
        break;
      case Commands.WebviewToVscode.getProfileImage:
        StateListener.getState(msg.command, StateKeys.profileImage, undefined, msg.requestId);
        break;

      case Commands.WebviewToVscode.setWindowState:
        StateListener.setState(msg.payload, StateKeys.windowState);
        break;
      case Commands.WebviewToVscode.setWatermark:
        StateListener.setState(msg.payload, StateKeys.watermark);
        break;
      case Commands.WebviewToVscode.setProfileImage:
        StateListener.setState(msg.payload, StateKeys.profileImage);
        break;
    }
  }

  private static async getState(command: string, stateId: string, defaultValue: any, requestId?: string,) {
    if (!requestId) {
      return;
    }

    const ext = ExtensionService.getInstance();
    const stateData = await ext.getState(stateId, "global");

    MarkdownWebview.panel?.webview.postMessage({
      command,
      requestId,
      payload: stateData || defaultValue
    } as MessageHandlerData<any>);
  }

  private static setState(payload: any, stateId: string) {
    if (!payload) {
      return;
    }

    const ext = ExtensionService.getInstance();
    ext.setState(stateId, payload, "global");
  }
}
