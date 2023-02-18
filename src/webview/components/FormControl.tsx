import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { Defaults, Gradients, Presets } from '../constants';
import { HeightState, ScreenshotDetailsState, WidthState } from '../state'
import { GradientButton } from './GradientButton';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { StringField } from './StringField';

export interface IFormControlProps {
  handleResize: (width: number, height: number) => void;
}

export const FormControl: React.FunctionComponent<IFormControlProps> = ({ handleResize }: React.PropsWithChildren<IFormControlProps>) => {
  const [ screenshotDetails, setScreenshotDetails ] = useRecoilState(ScreenshotDetailsState);
  const [ width, setWidth ] = useRecoilState(WidthState);
  const [ height, setHeight ] = useRecoilState(HeightState);

  const presetDimensions = useMemo(() => {
    console.log(screenshotDetails.preset);
    if (screenshotDetails.preset) {
      const preset = Presets.find((p) => p.name.toLowerCase() === screenshotDetails.preset?.toLowerCase());

      if (preset) {
        if (preset.name !== "Custom") {
          setWidth(preset.width || Defaults.width);
          setHeight(preset.height || Defaults.height);

          handleResize(preset.width || Defaults.width, preset.height || Defaults.height);
        
          return {
            width: preset.width || Defaults.width,
            height: preset.height || Defaults.height,
          }
        }
      }
    }

    return undefined;
  }, [screenshotDetails.preset]);

  const updateWidth = useCallback((value: number) => {
    if (value) {
      handleResize(value, height || Defaults.height);

      setWidth(value);
    }
  }, [height])

  const updateHeight = useCallback((value: number) => {
    console.log(value);
    if (value) {
      handleResize(width || Defaults.width, value);

      setHeight(value);
    }
  }, [width])
  
  return (
    <div className='mb-4'>
      <div className='mb-2 space-y-4'>
        <div className='flex w-full space-x-4'>
        <SelectField
          label={`Presets`}
          value={screenshotDetails.preset || "Custom"}
          options={[...Presets.map((p) => p.name)]}
          placeholder={`Select your preset`}
          onChange={(value) => {
            setScreenshotDetails((prev) => ({ ...prev, preset: value }));
          }} />

          <NumberField 
            label={`Width`} 
            placeholder={`width`} 
            value={presetDimensions?.width ? presetDimensions.width : width || Defaults.width} 
            onChange={updateWidth}
            isDisabled={!!presetDimensions} />
            
          <NumberField 
            label={`Height`} 
            placeholder={`height`} 
            value={presetDimensions?.height ? presetDimensions.height : height || Defaults.height} 
            onChange={updateHeight}
            isDisabled={!!presetDimensions} />
        </div>

        <div className='flex w-full space-x-4'>
          <StringField
            label={`Link`}
            placeholder={`Link color (ex: #000000)`}
            value={screenshotDetails.linkColor || ""}
            onChange={(value: string) => {
              setScreenshotDetails((prev) => ({ ...prev, linkColor: value }));
            }} />

          <SelectField
            label={`Font`}
            value={screenshotDetails.fontFamily || "editor"}
            options={["ui", "editor"]}
            placeholder={`Select font`}
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, fontFamily: value }));
            }} />

          <NumberField 
            label={`Font size`} 
            placeholder={`Enter the font-size`} 
            value={screenshotDetails.fontSize || 13} 
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, fontSize: value }));
            }} />
        </div>

        <div className='flex w-full space-x-4'>
          <StringField
            label={`Outer background`}
            placeholder={`Background color (ex: #000000)`}
            value={screenshotDetails.outerBackground || ""}
            onChange={(value: string) => {
              setScreenshotDetails((prev) => ({ ...prev, outerBackground: value }));
            }} />

          <NumberField 
            label={`Inner width`} 
            placeholder={`Inner width (50-100)`} 
            value={screenshotDetails.innerWidth || 100} 
            step={5} 
            min={50} 
            max={100}
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, innerWidth: value }));
            }} />

          <NumberField 
            label={`Inner padding`} 
            placeholder={`Inner padding (1-25)`} 
            value={screenshotDetails.innerPadding || 2} 
            min={1}
            max={25}
            step={0.25} 
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, innerPadding: value }));
            }}
            isFloat />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--vscode-editor-foreground)]">
            Predefined backgrounds
          </label>
          <div className='mt-1 space-x-2'>
            {
              Gradients.map((gradient, idx) => (
                <GradientButton key={idx} value={gradient} onClick={() => {
                  setScreenshotDetails((prev) => ({ ...prev, outerBackground: gradient }));
                }} />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};