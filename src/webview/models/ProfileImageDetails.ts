export type ProfileImagePosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ProfileImageDetails {
  src?: string;
  position?: ProfileImagePosition;
  height?: number;
}