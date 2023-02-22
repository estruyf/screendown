import { TitleBarNames } from "../models";
import { Gradients } from "./Gradients";
import { Presets } from "./Presets";

export const Defaults = {
  preset: Presets[1].name,
  fontSize: 16,
  innerWidth: 100,
  innerPadding: 2,
  innerBorder: 15,
  width: 1200,
  height: 675,
  shadow: 25,
  outerBackground: Gradients[3],
  titleBarType: TitleBarNames.None,
}