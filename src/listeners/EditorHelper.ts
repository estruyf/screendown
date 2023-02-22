import { Commands } from '../constants';
import { ContentData, VSCodeMessage } from '../models';
import { BaseListener } from './BaseListener';
import { MarkdownWebview } from '../providers/MarkdownWebview';
import { MessageHandlerData } from '@estruyf/vscode';

export class EditorHelper extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: VSCodeMessage) {
    super.process(msg);

    switch (msg.command) {
      case Commands.WebviewToVscode.getMarkdown:
        MarkdownWebview.panel?.webview.postMessage({
          command: msg.command,
          requestId: msg.requestId,
          payload: {
            content: MarkdownWebview.crntSelection,
            language: MarkdownWebview.crntLangugage
          },
        } as MessageHandlerData<ContentData>);
        break;
    }
  }
}
