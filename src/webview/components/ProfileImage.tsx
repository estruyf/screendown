import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProfileImageState } from '../state';
import { Image } from '.';

export interface IProfileImageProps {
  watermark?: string;
}

const imageBackup: { original: string, image: string }[] = [];

export const ProfileImage: React.FunctionComponent<IProfileImageProps> = ({ watermark }: React.PropsWithChildren<IProfileImageProps>) => {
  const profileImg = useRecoilValue(ProfileImageState);

  const position = useMemo(() => {
    if (!profileImg?.position || profileImg?.position === 'bottom-left') {
      return {
        left: `${profileImg?.padding || 0}em`,
        bottom: `${profileImg?.padding || 0}em`,
      };
    } else if (profileImg?.position === 'bottom-center') {
      return {
        bottom: `${profileImg?.padding || 0}em`,
      };
    } else if (profileImg?.position === 'bottom-right') {
      return {
        right: `${profileImg?.padding || 0}em`,
        bottom: `${profileImg?.padding || 0}em`,
      };
    } else if (profileImg?.position === 'top-left') {
      return {
        left: `${profileImg?.padding || 0}em`,
        top: `${profileImg?.padding || 0}em`,
      };
    } else if (profileImg?.position === 'top-center') {
      return {
        top: `${profileImg?.padding || 0}em`,
      };
    } else if (profileImg?.position === 'top-right') {
      return {
        right: `${profileImg?.padding || 0}em`,
        top: `${profileImg?.padding || 0}em`,
      };
    }
  }, [profileImg?.position, profileImg?.padding]);

  const watermarkElement = useMemo(() => {
    if (!watermark) {
      return null;
    }

    let margin = 'ml-4';
    if (profileImg?.position === 'top-left' || profileImg?.position === 'bottom-left') {
      margin = 'ml-4';
    } else if (profileImg?.position === 'top-right' || profileImg?.position === 'bottom-right') {
      margin = 'mr-4';
    }

    return (
      <div 
        className={`${margin} h-full flex flex-col justify-center text-2xl font-bold text-white z-50`} 
        style={{ 
          textShadow: "1px 1px 2px black, 0 0 1em black, 0 0 0.2em black" 
        }}>
        {watermark.split('\\n').map((c, i) => <div key={i}>{c}</div>)}
      </div>
    )
  }, [watermark, profileImg?.position]);

  if (!profileImg?.src) {
    return null;
  }
  
  return (
    <div className={`absolute flex items-center`} style={{
      ...position,
    }}>
      {
        (watermark && (
          profileImg?.position === "top-right" || 
          profileImg?.position === "bottom-right"
        )) && (
          <>{watermarkElement}</>
        )
      }

      <Image 
        src={profileImg?.src}
        style={{ 
          height: `${profileImg?.height || 100}px`,
          borderRadius: profileImg.radius ? `${profileImg.radius}%` : undefined,
        }}
        triggerUpdate={(original: string, image: string) => {
          const findImage = imageBackup.find(c => c.original === original);
          if (!findImage) {
            imageBackup.push({ original, image });
          } else {
            findImage.image = image;
          }
        }} />

        {
          (watermark && (
            profileImg?.position === "top-center" ||
            profileImg?.position === "top-left" || 
            profileImg?.position === "bottom-center" ||
            profileImg?.position === "bottom-left"
          )) && (
            <>{watermarkElement}</>
          )
        }
    </div>
  );
};