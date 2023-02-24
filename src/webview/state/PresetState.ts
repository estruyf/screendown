import { atom } from "recoil";

export const PresetState = atom<string>({
  key: 'PresetState',
  default: undefined
});