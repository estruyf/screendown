import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProfileImageState } from '../state';
import { Image } from '.';

export interface IProfileImageProps {}

const imageBackup: { original: string, image: string }[] = [];

export const ProfileImage: React.FunctionComponent<IProfileImageProps> = ({}: React.PropsWithChildren<IProfileImageProps>) => {
  const profileImg = useRecoilValue(ProfileImageState);

  const position = useMemo(() => {
    if (!profileImg?.position || profileImg?.position === 'bottom-left') {
      return `left-0 bottom-0`;
    } else if (profileImg?.position === 'bottom-right') {
      return `right-0 bottom-0`;
    } else if (profileImg?.position === 'top-left') {
      return `left-0 top-0`;
    } else if (profileImg?.position === 'top-right') {
      return `right-0 top-0`;
    }
  }, [profileImg?.position]);

  if (!profileImg?.src) {
    return null;
  }
  
  return (
    <div className={`absolute ${position} h-1/4 flex items-end`}>
      <Image 
        src={profileImg?.src}
        style={{ 
          height: `${profileImg?.height || 100}%`
        }}
        triggerUpdate={(original: string, image: string) => {
          const findImage = imageBackup.find(c => c.original === original);
          if (!findImage) {
            imageBackup.push({ original, image });
          } else {
            findImage.image = image;
          }
        }} />
    </div>
  );
};