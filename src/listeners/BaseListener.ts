import { Commands } from "../constants";
import { VSCodeMessage } from "../models";
import { MarkdownWebview } from "../providers/MarkdownWebview";


export abstract class BaseListener {
  public static process(msg: VSCodeMessage) {}

  /**
   * Send a message to the webview
   * @param command
   * @param data
   */
  public static sendMsg(command: typeof Commands.VscodeToWebview, data: any) {
    if (MarkdownWebview.isDisposed) {
      return;
    }

    if (MarkdownWebview.panel) {
      MarkdownWebview.panel.webview.postMessage({
        command,
        payload: data
      });
    }
  }
}
