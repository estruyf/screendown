import { Defaults } from './../constants/Defaults';
import { atom } from "recoil";

export const WidthState = atom<number>({
  key: 'WidthState',
  default: Defaults.width
});