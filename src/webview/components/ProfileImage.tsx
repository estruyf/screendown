import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { ProfileImageState } from '../state';
import { Image } from '.';
import { DndContext, useDraggable } from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import { messageHandler } from '@estruyf/vscode/dist/client';

export interface IProfileImageProps {
  watermark?: string;
  scale: number;
}

const imageBackup: { original: string, image: string }[] = [];

export const ProfileImage: React.FunctionComponent<IProfileImageProps> = ({ watermark, scale }: React.PropsWithChildren<IProfileImageProps>) => {
  const [ profileImg, setProfileImg ] = useRecoilState(ProfileImageState);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });

  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString({
      x: (transform?.x || 0)/scale,
      y: (transform?.y || 0)/scale,
      scaleX: 1,
      scaleY: 1,
    })
    // transform: CSS.Translate.toString(transform)
  };

  const position = useMemo(() => {
    if (profileImg?.xPosition && profileImg?.yPosition) {
      const posX = profileImg?.xPosition * scale;
      const posY = profileImg?.yPosition * scale;

      return {
        left: `${posX/scale}px`,
        top: `${posY/scale}px`,
      }
    } else if (!profileImg?.position || profileImg?.position === 'bottom-left') {
      return {
        left: `1em`,
        bottom: `1em`,
      };
    } else if (profileImg?.position === 'bottom-center') {
      return {
        bottom: `1em`,
      };
    } else if (profileImg?.position === 'bottom-right') {
      return {
        right: `1em`,
        bottom: `1em`,
      };
    } else if (profileImg?.position === 'top-left') {
      return {
        left: `1em`,
        top: `1em`,
      };
    } else if (profileImg?.position === 'top-center') {
      return {
        top: `1em`,
      };
    } else if (profileImg?.position === 'top-right') {
      return {
        right: `1em`,
        top: `1em`,
      };
    }

    return {}
  }, [profileImg?.position, profileImg?.padding, profileImg?.xPosition, profileImg?.yPosition, scale]);

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

  useEffect(() => {
    if (profileImg?.xPosition === undefined && profileImg?.yPosition === undefined && position) {
      const screenshotRect = document.querySelector('.screenshot')?.getBoundingClientRect();
      const handleRect = document.querySelector('#draggable')?.getBoundingClientRect();
      
      if (screenshotRect && handleRect) {
        setProfileImg((prev) => {
          const crntValue = Object.assign({}, prev);
          // Calculate the position of the image based on the screenshot box
          crntValue.xPosition = -(screenshotRect.x - handleRect.x)/scale;
          crntValue.yPosition = -(screenshotRect.y - handleRect.y)/scale;
          messageHandler.send("setProfileImage", crntValue);
          return crntValue;
        });
      }
    }
  }, [profileImg?.position, profileImg?.xPosition, profileImg?.yPosition, scale, position]);

  if (!profileImg?.src) {
    return null;
  }
  
  return (
    <button 
      id={`draggable`} 
      ref={setNodeRef} 
      className={`absolute flex items-center cursor-pointer`}
      style={{
        ...position,
        ...style,
      }}
      {...listeners}
      {...attributes}>
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
    </button>
  );
};