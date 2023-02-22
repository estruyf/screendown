import { Commands } from '../constants';
import { VSCodeMessage } from '../models';
import { BaseListener } from './BaseListener';
import { window } from 'vscode';

export class LogHelper extends BaseListener {
  /**
   * Process the messages for the dashboard views
   * @param msg
   */
  public static process(msg: VSCodeMessage) {
    super.process(msg);

    switch (msg.command) {
      case Commands.WebviewToVscode.logError:
        window.showErrorMessage(`Screendown: ${msg.payload}`);
        break;
    }
  }
}
