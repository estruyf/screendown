import { Defaults } from './../constants/Defaults';
import { atom } from "recoil";

export const HeightState = atom<number>({
  key: 'HeightState',
  default: Defaults.height
});