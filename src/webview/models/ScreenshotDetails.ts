import { FontType } from "./FontType";

export interface ScreenshotDetails {
  preset?: string;
  
  fontSize: number;
  fontFamily: FontType | string;
  linkColor?: string;
  
  outerBackground?: string;

  innerWidth: number;
  innerPadding: number;
  innerBorder: number;
  shadow: number;

  showTitleBar: boolean;
  title?: string;
}