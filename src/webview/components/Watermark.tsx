import { DndContext } from '@dnd-kit/core';
import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ProfileImageState, WatermarkState } from '../state';
import { ProfileImage } from './ProfileImage';

export interface IWatermarkProps {
  scale: number;
}

export const Watermark: React.FunctionComponent<IWatermarkProps> = ({ scale }: React.PropsWithChildren<IWatermarkProps>) => {
  const watermark = useRecoilValue(WatermarkState);
  const [ profileImg, setProfileImg ] = useRecoilState(ProfileImageState);

  if (!watermark && !profileImg?.src) {
    return null;
  }

  if (!profileImg?.src) {
    return (
      <div className='w-full text-xl font-bold text-white z-50'>
        <div className='mt-2 pr-1 flex items-end justify-end'>
          <div className='inline-flex flex-col' style={{ 
            textShadow: "1px 1px 2px black, 0 0 1em black, 0 0 0.2em black" 
          }}>
            {watermark?.toString()?.split(`\\n`).map((c, i) => <div key={i}>{c}</div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext 
      onDragEnd={(event) => {
        setProfileImg((prev) => {
          const crntValue = Object.assign({}, prev);
          crntValue.xPosition = (crntValue.xPosition || 0) + event.delta.x/scale;
          crntValue.yPosition = (crntValue.yPosition || 0) + event.delta.y/scale;
          
          messageHandler.send("setProfileImage", crntValue);
          return crntValue;
        });
      }}
    >
      <ProfileImage watermark={watermark} scale={scale} />
    </DndContext>
  );
};