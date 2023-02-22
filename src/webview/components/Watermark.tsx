import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { ProfileImageState, WatermarkState } from '../state';
import { ProfileImage } from './ProfileImage';

export interface IWatermarkProps { }

export const Watermark: React.FunctionComponent<IWatermarkProps> = (props: React.PropsWithChildren<IWatermarkProps>) => {
  const watermark = useRecoilValue(WatermarkState);
  const profileImg = useRecoilValue(ProfileImageState);

  if (!watermark && !profileImg?.src) {
    return null;
  }

  if (!profileImg?.src) {
    return (
      <div className='w-full text-xl font-bold text-white z-50'>
        <div className='mt-2 pr-1 flex items-end justify-end'>
          <span style={{ 
            textShadow: "1px 1px 2px black, 0 0 1em black, 0 0 0.2em black" 
          }}>
            {watermark}
          </span>
        </div>
      </div>
    );
  }

  return (
    <ProfileImage watermark={watermark} />
  );
};