import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { Defaults, Gradients, Presets } from '../constants';
import { TitleBarNames, TitleBarType } from '../models';
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
    if (value) {
      handleResize(width || Defaults.width, value);

      setHeight(value);
    }
  }, [width])

  const getBackground = useCallback(() => {
    if (screenshotDetails.outerBackground && Gradients.includes(screenshotDetails.outerBackground)) {
      return "";
    }

    return screenshotDetails.outerBackground || "";
  }, [screenshotDetails.outerBackground])
  
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
            value={screenshotDetails.fontSize || Defaults.fontSize} 
            min={5}
            max={72}
            step={1}
            isRange
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, fontSize: value }));
            }} />

          <StringField
            label={`Link`}
            placeholder={`Link color (ex: #000000)`}
            value={screenshotDetails.linkColor || ""}
            onChange={(value: string) => {
              setScreenshotDetails((prev) => ({ ...prev, linkColor: value }));
            }} />

          <StringField
            label={`Background`}
            placeholder={`Background color (ex: #000000)`}
            value={getBackground()}
            onChange={(value: string) => {
              setScreenshotDetails((prev) => ({ ...prev, outerBackground: value }));
            }} />
        </div>

        <div className='flex w-full space-x-4'>
          <NumberField 
            label={`Element width`} 
            placeholder={`Inner width (50-100)`} 
            value={screenshotDetails.innerWidth || Defaults.innerWidth} 
            step={5} 
            min={50} 
            max={100}
            isRange
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, innerWidth: value }));
            }} />

          <NumberField 
            label={`Inset`} 
            placeholder={`Inner padding (1-25)`} 
            value={screenshotDetails.innerPadding || Defaults.innerPadding} 
            min={1}
            max={25}
            step={0.25} 
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, innerPadding: value }));
            }}
            isRange
            isFloat />

          <NumberField 
            label={`Border radius`} 
            placeholder={`Set the border radius (1-25)`} 
            value={screenshotDetails.innerBorder < 0 ? Defaults.innerBorder : screenshotDetails.innerBorder} 
            min={0}
            max={50}
            step={5}
            isRange
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, innerBorder: value }));
            }} />

          <NumberField 
            label={`Shadow`} 
            placeholder={`Set the shadow (0-100)`} 
            value={screenshotDetails.shadow < 0 ? Defaults.shadow : screenshotDetails.shadow} 
            min={0}
            max={100}
            step={1}
            isRange
            onChange={(value) => {
              setScreenshotDetails((prev) => ({ ...prev, shadow: value }));
            }} />
        </div>

        <div className='flex space-x-8 items-center justify-between'>
          <div className='flex space-x-4 items-center'>
            <div className='shrink-0'>
              <SelectField
                label={`Title bar`}
                value={screenshotDetails.titleBarType}
                options={[...Object.values(TitleBarNames)]}
                placeholder={`Select the title bar type`}
                onChange={(value) => {
                  setScreenshotDetails((prev) => ({ ...prev, titleBarType: value as TitleBarType }));
                }} />
              
            </div>

            {
              screenshotDetails.titleBarType !== TitleBarNames.None && (
                <StringField
                  label={`Title`}
                  placeholder={`Title for title bar`}
                  value={screenshotDetails.title || ""}
                  onChange={(value: string) => {
                    setScreenshotDetails((prev) => ({ ...prev, title: value }));
                  }} />
              )
            }
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
    </div>
  );
};