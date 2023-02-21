import * as React from 'react';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { useEffect, useState } from 'react';

export interface IImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  triggerUpdate: (original: string, image: string) => void;
}

export const Image: React.FunctionComponent<IImageProps> = ({ src, triggerUpdate, ...props }: React.PropsWithChildren<IImageProps>) => {
  const [ image, setImage ] = useState('');
  
  useEffect(() => {
    if (src) {
      messageHandler.request<string>('getImageToBase64', src).then((base64Img: string) => {
        if (base64Img) {
          setImage(base64Img);
          triggerUpdate(src, base64Img);
        }
      });
    }
  }, [src]);

  if (!image) {
    return null;
  }

  return <img src={image} {...props} />;
};