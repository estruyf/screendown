import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProfileImageState } from '../state';
import { Image } from '.';

export interface IProfileImageProps {}

const imageBackup: { original: string, image: string }[] = [];

export const ProfileImage: React.FunctionComponent<IProfileImageProps> = ({}: React.PropsWithChildren<IProfileImageProps>) => {
  const profileImg = useRecoilValue(ProfileImageState);

  console.log('profileImg', profileImg)

  if (!profileImg?.src) {
    return null;
  }
  
  return (
    <div className='absolute left-0 bottom-0'>
      <Image 
        src={profileImg?.src}
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