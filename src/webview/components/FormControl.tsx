import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Defaults, Gradients, Presets } from '../constants';
import { ProfileImageDetails, ProfileImagePosition, TitleBarNames, TitleBarType, WindowState } from '../models';
import { HeightState, ProfileImageState, ScreenshotDetailsState, WatermarkState, WidthState } from '../state'
import { GradientButton } from './GradientButton';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { StringField } from './StringField';
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Checkbox } from './Checkbox';
import { messageHandler, Messenger } from '@estruyf/vscode/dist/client';
import { WindowStateManager } from './WindowStateManager';

export interface IFormControlProps {
  handleResize: (width: number, height: number) => void;
}

export const FormControl: React.FunctionComponent<IFormControlProps> = ({ handleResize }: React.PropsWithChildren<IFormControlProps>) => {
  const [ screenshotDetails, setScreenshotDetails ] = useRecoilState(ScreenshotDetailsState);
  const [ width, setWidth ] = useRecoilState(WidthState);
  const [ height, setHeight ] = useRecoilState(HeightState);
  const [ windowState, setWindowState ] = useState<WindowState | undefined>(undefined);
  const [ watermark, setWatermark ] = useRecoilState(WatermarkState);
  const [ profileImg, setProfileImg ] = useRecoilState(ProfileImageState);

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

  useEffect(() => {
    messageHandler.request<WindowState>("getWindowState").then((state) => {
      setWindowState(state);
    });
    messageHandler.request<string>("getWatermark").then((watermark) => {
      setWatermark(watermark);
    });
    messageHandler.request<ProfileImageDetails>("getProfileImage").then((profileImg) => {
      setProfileImg(profileImg);
    });
  }, []);

  if (windowState === undefined) {
    return null;
  }
  
  return (
    <div className='mb-4'>
      <div className='flex flex-col justify-start items-start mb-2'>
        <Disclosure defaultOpen={windowState.imageSizeOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Image size - { screenshotDetails.preset || "Custom" } - ({width}x{height})
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full">
                <WindowStateManager type={"imageSizeOptionsIsOpen"} />
                
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
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure defaultOpen={windowState.fontOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Font options
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full">
                <WindowStateManager type={"fontOptionsIsOpen"} />

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
                    label={`Color of links`}
                    placeholder={`Link color (ex: #000000)`}
                    value={screenshotDetails.linkColor || ""}
                    onChange={(value: string) => {
                      setScreenshotDetails((prev) => ({ ...prev, linkColor: value }));
                    }} />
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure defaultOpen={windowState.elementOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Markdown/code element options
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full space-y-4">
                <WindowStateManager type={"elementOptionsIsOpen"} />

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
                </div>

                <div className='flex w-full space-x-4'>
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
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure defaultOpen={windowState.backgroundOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Background options
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full space-y-4">
                <WindowStateManager type={"backgroundOptionsIsOpen"} />

                <div className='flex w-full space-x-4'>
                  <div className='w-1/2'>
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

                  <div className='w-1/2'>
                    <StringField
                      label={`Background`}
                      placeholder={`Background color (ex: #000000)`}
                      value={getBackground()}
                      onChange={(value: string) => {
                        setScreenshotDetails((prev) => ({ ...prev, outerBackground: value }));
                      }} />
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure defaultOpen={windowState.titleBarOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Title bar options
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full space-y-4">
                <WindowStateManager  type={"titleBarOptionsIsOpen"} />

                <div className='flex w-full space-x-4'>
                  <SelectField
                    label={`Title bar`}
                    value={screenshotDetails.titleBarType}
                    options={[...Object.values(TitleBarNames)]}
                    placeholder={`Select the title bar type`}
                    onChange={(value) => {
                      setScreenshotDetails((prev) => ({ ...prev, titleBarType: value as TitleBarType }));
                    }} />

                  <StringField
                    label={`Title`}
                    placeholder={`Title for title bar`}
                    value={screenshotDetails.title || ""}
                    onChange={(value: string) => {
                      setScreenshotDetails((prev) => ({ ...prev, title: value }));
                    }} />
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure defaultOpen={windowState.codeOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Codeblock options
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full space-y-4">
                <WindowStateManager type={"codeOptionsIsOpen"} />

                <div className='flex w-full space-x-4'>
                  <Checkbox 
                    label={`Show line numbers`}
                    checked={screenshotDetails.showLineNumbers}
                    onChange={(value) => {
                      setScreenshotDetails((prev) => ({ ...prev, showLineNumbers: value }));
                    }} />
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure defaultOpen={windowState.watermarkOptionsIsOpen}>
          {({ open }) => (
            <>
              <Disclosure.Button className="config__button flex items-center">
                <ChevronRightIcon className={`h-6 w-6 ${open ? 'rotate-90 transform' : ''}`} />
                Watermark options
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full space-y-4">
                <WindowStateManager type={"watermarkOptionsIsOpen"} />

                <div className='flex w-full space-x-4'>
                  <StringField
                    label={`Watermark (will be stored)`}
                    placeholder={`Specify your watermark text`}
                    value={watermark || ""}
                    onChange={(value: string) => {
                      messageHandler.send("setWatermark", value);
                      setWatermark(value);
                    }} />

                  <StringField
                    label={`Image (will be stored)`}
                    placeholder={`Specify the URL, path of you image`}
                    value={profileImg?.src || ""}
                    onChange={(value: string) => {
                      setProfileImg((prev) => {
                        const crntValue = Object.assign({}, prev);
                        
                        if (!crntValue.position) {
                          crntValue.position = "bottom-left";
                        }
                        crntValue.src = value;

                        messageHandler.send("setProfileImage", crntValue);
                        return crntValue;
                      });
                    }} />
                </div>

                {
                  profileImg?.src && (
                    <div className='flex w-full space-x-4'>
                      <SelectField
                        label={`Position`}
                        value={profileImg.position || "bottom-left"}
                        options={["bottom-left", "bottom-right", "top-left", "top-right"]}
                        placeholder={`Select the position`}
                        onChange={(value) => {
                          setProfileImg((prev) => {
                            const crntValue = Object.assign({}, prev);
                            crntValue.position = value as ProfileImagePosition;
                            messageHandler.send("setProfileImage", crntValue);
                            return crntValue;
                          });
                        }
                      } />

                      <NumberField
                        label={`Size`}
                        placeholder={`Size of the image`}
                        value={profileImg.height || 100}
                        min={10}
                        max={100}
                        step={1}
                        isRange
                        onChange={(value) => {
                          setProfileImg((prev) => {
                            const crntValue = Object.assign({}, prev);
                            crntValue.height = value;
                            messageHandler.send("setProfileImage", crntValue);
                            return crntValue;
                          });
                        }} />
                    </div>
                  )
                }
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};