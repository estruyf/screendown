import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Defaults, Gradients, Presets } from '../constants';
import { ProfileImageDetails, ProfileImagePosition, ScreenshotDetails, TitleBarNames, TitleBarType, WindowState } from '../models';
import { HeightState, PresetState, ProfileImageState, ScreenshotDetailsState, ScreenshotDetaisDefaultState, WatermarkState, WidthState } from '../state'
import { GradientButton } from './GradientButton';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { StringField } from './StringField';
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Checkbox } from './Checkbox';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { WindowStateManager } from './WindowStateManager';
import { Toggle } from './Toggle';

export interface IFormControlProps {
  handleResize: (width: number, height: number, retry?: boolean) => void;
}

export const FormControl: React.FunctionComponent<IFormControlProps> = ({ handleResize }: React.PropsWithChildren<IFormControlProps>) => {
  const [screenshotDetails, setScreenshotDetails] = useRecoilState(ScreenshotDetailsState);
  const [width, setWidth] = useRecoilState(WidthState);
  const [height, setHeight] = useRecoilState(HeightState);
  const [windowState, setWindowState] = useState<WindowState | undefined>(undefined);
  const [watermark, setWatermark] = useRecoilState(WatermarkState);
  const [profileImg, setProfileImg] = useRecoilState(ProfileImageState);
  const [, setPreset] = useRecoilState(PresetState);

  const presetDimensions = useMemo(() => {
    if (screenshotDetails?.preset) {
      const preset = Presets.find((p) => p.name.toLowerCase() === screenshotDetails.preset?.toLowerCase());

      if (preset) {
        let crntWidth = preset.width || Defaults.width;
        let crntHeight = preset.height || Defaults.height;

        if (preset.name === "Custom") {
          crntWidth = screenshotDetails.width || Defaults.width;
          crntHeight = screenshotDetails.height || Defaults.height;
        }

        setWidth(crntWidth);
        setHeight(crntHeight);

        handleResize(crntWidth, crntHeight, true);

        return {
          width: crntWidth,
          height: crntHeight,
        }
      }
    }

    return undefined;
  }, [screenshotDetails?.preset, screenshotDetails?.width, screenshotDetails?.height]);

  const updateWidth = useCallback((value: number) => {
    if (value) {
      handleResize(value, height || Defaults.height);

      setWidth(value);
      updateScreenshotDetails({ width: value });
    }
  }, [height])

  const updateHeight = useCallback((value: number) => {
    if (value) {
      handleResize(width || Defaults.width, value);

      setHeight(value);
      updateScreenshotDetails({ height: value });
    }
  }, [width])

  const getBackground = useCallback(() => {
    if (screenshotDetails?.outerBackground && Gradients.includes(screenshotDetails.outerBackground)) {
      return "";
    }

    return screenshotDetails?.outerBackground || "";
  }, [screenshotDetails?.outerBackground])

  const updateScreenshotDetails = useCallback((value: Partial<ScreenshotDetails>) => {
    setScreenshotDetails(prev => {
      const prevValue = Object.assign({}, prev || ScreenshotDetaisDefaultState);
      prevValue.name = "Custom";

      // Check if the image dimensions are set
      if (value.preset) {
        // Set the width and height values, or remove them if known preset
        if (value.preset === "Custom") {
          prevValue.width = width || Defaults.width;
          prevValue.height = height || Defaults.height;
        } else if (value.preset !== "Custom") {
          delete prevValue.width;
          delete prevValue.height;
        }
      }

      return Object.assign(prevValue, value);
    });
    setPreset("Custom");
  }, [width, height, setProfileImg]);

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

  if (windowState === undefined || screenshotDetails === undefined) {
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
                Image size - {screenshotDetails.preset || "Custom"} - ({width}x{height})
              </Disclosure.Button>
              <Disclosure.Panel className="config__panel w-full">
                <WindowStateManager type={"imageSizeOptionsIsOpen"} />

                <div className='flex w-full space-x-4'>
                  <SelectField
                    label={`Dimensions`}
                    value={screenshotDetails.preset || "Custom"}
                    options={[...Presets.map((p) => p.name)]}
                    placeholder={`Select your preset`}
                    onChange={(value) => {
                      // Reset the watermark image position
                      setProfileImg((prev) => {
                        const crntValue = Object.assign({}, prev);
                        crntValue.xPosition = undefined;
                        crntValue.yPosition = undefined;
                        return crntValue;
                      });
                      updateScreenshotDetails({ preset: value });
                    }} />

                  <NumberField
                    label={`Width`}
                    placeholder={`width`}
                    value={presetDimensions?.width ? presetDimensions.width : width || Defaults.width}
                    onChange={updateWidth}
                    isDisabled={screenshotDetails.preset !== "Custom"} />

                  <NumberField
                    label={`Height`}
                    placeholder={`height`}
                    value={presetDimensions?.height ? presetDimensions.height : height || Defaults.height}
                    onChange={updateHeight}
                    isDisabled={screenshotDetails.preset !== "Custom"} />
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
                      updateScreenshotDetails({ fontFamily: value });
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
                      updateScreenshotDetails({ fontSize: value });
                    }} />

                  <StringField
                    label={`Color of links`}
                    placeholder={`Link color (ex: #000000)`}
                    value={screenshotDetails.linkColor || ""}
                    onChange={(value: string) => {
                      updateScreenshotDetails({ linkColor: value });
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
                      updateScreenshotDetails({ innerWidth: value });
                    }} />

                  <NumberField
                    label={`Inset`}
                    placeholder={`Inner padding (1-25)`}
                    value={screenshotDetails.innerPadding || Defaults.innerPadding}
                    min={1}
                    max={25}
                    step={0.25}
                    onChange={(value) => {
                      updateScreenshotDetails({ innerPadding: value });
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
                      updateScreenshotDetails({ innerBorder: value });
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
                      updateScreenshotDetails({ shadow: value });
                    }} />
                </div>

                <div className='flex w-full space-x-4'>
                  <NumberField
                    label={`Rotation`}
                    placeholder={`Set the rotation (-10 - 10)`}
                    value={(screenshotDetails.rotation < -10 || screenshotDetails.rotation > 10) ? Defaults.rotation : screenshotDetails.rotation}
                    min={-10}
                    max={10}
                    step={0.5}
                    isRange
                    isFloat
                    onChange={(value) => {
                      updateScreenshotDetails({ rotation: value });
                    }} />

                  <NumberField
                    label={`Scale`}
                    placeholder={`Set the scaling`}
                    value={(screenshotDetails.scale < 0.4 || screenshotDetails.scale > 1.6) ? Defaults.scale : screenshotDetails.scale}
                    min={0.4}
                    max={1.6}
                    step={0.01}
                    isRange
                    isFloat
                    onChange={(value) => {
                      updateScreenshotDetails({ scale: value });
                    }} />
                </div>

                <div className='flex w-full space-x-4'>
                  <NumberField
                    label={`Move horizontally`}
                    placeholder={`Move horizontally (-50% - 50%)`}
                    value={(screenshotDetails.translateX < -50 || screenshotDetails.translateX > 50) ? Defaults.translateX : screenshotDetails.translateX}
                    min={-50}
                    max={50}
                    step={1}
                    isRange
                    onChange={(value) => {
                      updateScreenshotDetails({ translateX: value });
                    }} />

                  <NumberField
                    label={`Move vertically`}
                    placeholder={`Move vertically (-50% - 50%)`}
                    value={(screenshotDetails.translateY < -50 || screenshotDetails.translateY > 50) ? Defaults.translateY : screenshotDetails.translateY}
                    min={-50}
                    max={50}
                    step={1}
                    isRange
                    onChange={(value) => {
                      updateScreenshotDetails({ translateY: value });
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
                            updateScreenshotDetails({ outerBackground: gradient });
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
                        updateScreenshotDetails({ outerBackground: value });
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
                <WindowStateManager type={"titleBarOptionsIsOpen"} />

                <div className='flex w-full space-x-4'>
                  <SelectField
                    label={`Title bar`}
                    value={screenshotDetails.titleBarType}
                    options={[...Object.values(TitleBarNames)]}
                    placeholder={`Select the title bar type`}
                    onChange={(value) => {
                      updateScreenshotDetails({ titleBarType: value as TitleBarType });
                    }} />

                  <StringField
                    label={`Title`}
                    placeholder={`Title for title bar`}
                    value={screenshotDetails.title || ""}
                    onChange={(value: string) => {
                      updateScreenshotDetails({ title: value });
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
                      updateScreenshotDetails({ showLineNumbers: value });
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
                  <Toggle
                    label={`Show watermark`}
                    enabled={screenshotDetails.showWatermark}
                    onChange={(value) => {
                      updateScreenshotDetails({ showWatermark: value });
                    }} />
                </div>

                <div className='flex w-full space-x-4'>
                  <StringField
                    label={`Watermark (will be stored)`}
                    placeholder={`Specify your watermark text`}
                    value={watermark || ""}
                    onChange={(value: string) => {
                      messageHandler.send("setWatermark", value);
                      setWatermark(value);
                    }} />
                </div>

                <div className={`flex space-x-4 ${profileImg?.src ? 'w-full' : 'w-1/2'}`}>
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

                  {
                    profileImg?.src && (
                      <SelectField
                        label={`Position (image is draggable)`}
                        value={profileImg.position || "bottom-left"}
                        options={["bottom-left", "bottom-center", "bottom-right", "top-left", "top-center", "top-right"]}
                        placeholder={`Select the position`}
                        onChange={(value) => {
                          setProfileImg((prev) => {
                            const crntValue = Object.assign({}, prev);
                            crntValue.position = value as ProfileImagePosition;
                            crntValue.xPosition = undefined;
                            crntValue.yPosition = undefined;
                            messageHandler.send("setProfileImage", crntValue);
                            return crntValue;
                          });
                        }
                        } />
                    )
                  }
                </div>

                {
                  profileImg?.src && (
                    <>
                      <div className='flex space-x-4 w-full'>
                        <NumberField
                          label={`Size`}
                          placeholder={`Size of the image`}
                          value={profileImg.height || 100}
                          min={10}
                          max={200}
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

                        <NumberField
                          label={`Image radius`}
                          placeholder={`Radius of the image`}
                          value={profileImg.radius || 0}
                          min={0}
                          max={50}
                          step={1}
                          isRange
                          onChange={(value) => {
                            setProfileImg((prev) => {
                              const crntValue = Object.assign({}, prev);
                              crntValue.radius = value;
                              messageHandler.send("setProfileImage", crntValue);
                              return crntValue;
                            });
                          }} />
                      </div>
                    </>
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