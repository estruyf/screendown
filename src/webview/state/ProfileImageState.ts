import { atom } from "recoil";
import { ProfileImageDetails } from "../models";

export const ProfileImageState = atom<ProfileImageDetails | undefined>({
  key: 'ProfileImageState',
  default: {
    src: undefined,
    position: "bottom-left"
  }
});