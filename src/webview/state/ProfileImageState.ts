import { atom } from "recoil";
import { ProfileImageDetails } from "../models";

export const ProfileImageState = atom<ProfileImageDetails | undefined>({
  key: 'ProfileImageState',
  default: {
    src: undefined,
    position: "bottom-left",
    height: 50,
    radius: 0,
    padding: 0,
    xPosition: 0,
    yPosition: 0,
  }
});