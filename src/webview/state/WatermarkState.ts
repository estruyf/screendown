import { atom } from "recoil";

export const WatermarkState = atom<string | undefined>({
  key: 'WatermarkState',
  default: undefined
});