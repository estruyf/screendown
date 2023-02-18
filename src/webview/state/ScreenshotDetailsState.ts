import { atom } from "recoil";
import { ScreenshotDetails } from '../models'

export const ScreenshotDetailsState = atom<ScreenshotDetails>({
  key: 'ScreenshotDetailsState',
  default: {
    preset: 'Twitter',
    fontSize: 13,
    fontFamily: "editor",
    innerWidth: 100,
    innerPadding: 2,
    linkColor: undefined,
    width: undefined,
    height: undefined,
    outerBackground: undefined,
  } as ScreenshotDetails
});