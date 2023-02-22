import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { WindowState } from '../models';

export interface IWindowStateManagerProps {
  type: string;
}

export const WindowStateManager: React.FunctionComponent<IWindowStateManagerProps> = ({ type }: React.PropsWithChildren<IWindowStateManagerProps>) => {

  const triggerUpdate = useCallback((opened: boolean) => {
    messageHandler.request<WindowState>("getWindowState").then((state) => {
      const clonedState = Object.assign({}, state) as any;
      clonedState[type] = opened;
      messageHandler.send("setWindowState", clonedState);
    });
  }, [type]);
  
  useEffect(() => {
    triggerUpdate(true);

    return () => {
      triggerUpdate(false);
    }
  }, []);
  
  return null;
};