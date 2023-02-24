import { Commands } from './../../constants/Commands';
import { Defaults } from './../constants/Defaults';
import { atom } from "recoil";
import { ScreenshotDetails } from '../models'
import { messageHandler } from '@estruyf/vscode/dist/client';

export const ScreenshotDetaisDefaultState = {
  name: Defaults.name,
  preset: Defaults.preset,
  fontSize: Defaults.fontSize,
  fontFamily: "editor",
  innerWidth: Defaults.innerWidth,
  innerPadding: Defaults.innerPadding,
  innerBorder: Defaults.innerBorder,
  shadow: Defaults.shadow,
  outerBackground: Defaults.outerBackground,
  titleBarType: Defaults.titleBarType,
  showLineNumbers: Defaults.showLineNumbers,
  showWatermark: Defaults.showWatermark,
  title: undefined,
  linkColor: undefined,
  width: undefined,
  height: undefined,
} as ScreenshotDetails;

export const ScreenshotDetailsState = atom<ScreenshotDetails | undefined>({
  key: 'ScreenshotDetailsState',
  default: undefined,
  effects: [
    ({onSet}) => {
      onSet(data => {
        if (data) {
          if (!data.name) {
            data.name = "Custom";
          }

          messageHandler.send(Commands.WebviewToVscode.setPresets, data)
          messageHandler.send(Commands.WebviewToVscode.setPreset, data.name)
        }
      });
    },
  ],
});