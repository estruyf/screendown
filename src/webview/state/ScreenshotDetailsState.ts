import { Defaults } from './../constants/Defaults';
import { atom } from "recoil";
import { ScreenshotDetails } from '../models'

export const ScreenshotDetailsState = atom<ScreenshotDetails>({
  key: 'ScreenshotDetailsState',
  default: {
    preset: 'Twitter',
    fontSize: Defaults.fontSize,
    fontFamily: "editor",
    innerWidth: Defaults.innerWidth,
    innerPadding: Defaults.innerPadding,
    innerBorder: Defaults.innerBorder,
    shadow: Defaults.shadow,
    linkColor: undefined,
    width: undefined,
    height: undefined,
    outerBackground: Defaults.outerBackground,
  } as ScreenshotDetails
});