import { StateKeys } from './../constants/StateKeys';
import { MessageHandlerData } from '@estruyf/vscode';
import { Commands } from '../constants';
import { VSCodeMessage } from '../models';
import { MarkdownWebview } from '../providers/MarkdownWebview';
import { ExtensionService } from '../services/ExtensionService';
import { BaseListener } from './BaseListener';
import { ScreenshotDetails } from '../webview/models';

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
      case Commands.WebviewToVscode.getPresets:
        StateListener.getState(msg.command, StateKeys.presets, [], msg.requestId);
        break;
      case Commands.WebviewToVscode.getPreset:
        StateListener.getState(msg.command, StateKeys.preset, undefined, msg.requestId);
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
      case Commands.WebviewToVscode.setPresets:
        StateListener.setPresets(msg.payload, StateKeys.presets);
        break;
      case Commands.WebviewToVscode.setPreset:
        StateListener.setState(msg.payload, StateKeys.preset);
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

  private static async setPresets(payload: ScreenshotDetails, stateId: string) {
    if (!payload) {
      return;
    }

    const ext = ExtensionService.getInstance();
    let stateData = await ext.getState<ScreenshotDetails[]>(stateId, "global");

    if (!stateData) {
      stateData = [];
    }
    
    const index = stateData.findIndex((preset) => preset.name === payload.name);
    if (index > -1) {
      stateData[index] = payload;
    } else {
      stateData.push(payload);
    }

    ext.setState(stateId, stateData, "global");
  }
}
