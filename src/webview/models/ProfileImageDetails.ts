export type ProfileImagePosition = "top-left" | 
"top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ProfileImageDetails {
  src?: string;
  position?: ProfileImagePosition;
  height?: number;
  radius?: number;
  padding?: number;
  xPosition?: number;
  yPosition?: number;
}