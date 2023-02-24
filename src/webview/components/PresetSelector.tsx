import { messageHandler } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Commands } from '../../constants';
import { Defaults } from '../constants';
import { usePrevious } from '../hooks';
import { ScreenshotDetails } from '../models';
import { PresetState, ScreenshotDetailsState, ScreenshotDetaisDefaultState } from '../state';
import { Button } from './Button';

export interface IPresetSelectorProps { }

export const PresetSelector: React.FunctionComponent<IPresetSelectorProps> = ({ }: React.PropsWithChildren<IPresetSelectorProps>) => {
  const [, setScreenshotDetails] = useRecoilState(ScreenshotDetailsState);
  const [preset, setPreset] = useRecoilState(PresetState);
  const prevPreset = usePrevious(preset);
  const [presets, setPresets] = useState<ScreenshotDetails[] | undefined>(undefined);

  useEffect(() => {
    if (preset && prevPreset === undefined) {
      const presetDetails = presets?.find((p) => p.name === preset);
      setScreenshotDetails(presetDetails || ScreenshotDetaisDefaultState);
    }
  }, [preset, prevPreset]);

  useEffect(() => {
    messageHandler.request<ScreenshotDetails[] | undefined>(Commands.WebviewToVscode.getPresets).then((presets) => {
      setPresets(presets || [ScreenshotDetaisDefaultState]);

      messageHandler.request<string>(Commands.WebviewToVscode.getPreset).then((preset) => {
        setPreset(preset || Defaults.name);
      });
    });
  }, []);

  if (!presets) {
    return null;
  }

  return (
    <Button
      title='Reset to default'
      onClick={() => {
        setPreset(Defaults.name);
        setScreenshotDetails(ScreenshotDetaisDefaultState);
      }}
      variant={`small`}
      disabled={preset === Defaults.name} />
  );
};