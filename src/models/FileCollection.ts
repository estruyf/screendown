import { FileFormat } from './FileFormat';

export interface IFileCollection extends IExtensionCollection<IFileExtension> {
  default: IFileDefault;
}

export interface IExtensionCollection<T> {
  supported: T[];
}

export interface IFileExtension extends IExtension {
  /** @interal */
  checked?: boolean;
  /**
   * set to true if the extension represents the whole file name.
   */
  filename?: boolean;
  /**
   * collection of languages associated to the icon.
   */
  languages?: ILanguage[];
  /**
   * array of file names to generate with file extensions to associate to the icon.
   */
  filenamesGlob?: string[];
  /**
   * array of file extensions to generate with file names to associate to the icon.
   */
  extensionsGlob?: string[];
}

export interface IFileDefault {
  file?: IDefaultExtension;
  file_light?: IDefaultExtension;
}

export interface IDefaultExtension {
  /**
   * name of the icon.
   */
  icon: string;
  /**
   * format of the icon
   */
  format: FileFormat | string;
  /**
   * user customization: if false the extension won't be exported.
   */
  disabled?: boolean;
  /**
   * set this to true if you want to use a bundle icon.
   * This will override the `default` prefix with the one for files or folders.
   */
  useBundledIcon?: boolean;
}

export interface IExtension extends IDefaultExtension {
  /**
   * set of extensions associated to the icon.
   */
  extensions?: string[];
  /**
   * set it to true if the extension support light icons.
   */
  light?: boolean;
  /**
   * user customization: disables the specified extension.
   */
  overrides?: string;
  /**
   * user customization: extends the specified extension.
   */
  extends?: string;
}

export interface ILanguage {
  ids: string | string[];
  defaultExtension: string; // this is only used for exampleGenerator, so it can know which extension to use.
}