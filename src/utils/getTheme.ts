import { readFileSync } from "fs";
import { dirname, join } from "path";
import { extensions, workspace } from "vscode";
import { Theme } from "../models";
import { parse } from "jsonc-parser";
import merge from 'lodash.merge';

export const getTheme = (themeName?: string) => {
  let crntTheme = !themeName || themeName === "default" ? workspace.getConfiguration('workbench').get('colorTheme') : themeName;

  // Get all the theme extensions
  const allExtensions = extensions.all.filter(e => {
    const pkg = e.packageJSON;
    return pkg.contributes && pkg.contributes.themes && pkg.contributes.themes.length > 0;
  });

  // Get the theme extension that matches the active theme
  const themeExtension = allExtensions.find(e => {
    const pkg = e.packageJSON;
    return pkg.contributes.themes.find((theme: Theme) => (theme.label === crntTheme || theme.id === crntTheme));
  });

  if (!themeExtension) {
    throw new Error(`Could not find theme extension for ${crntTheme}`);
  }

  // Get the theme file
  const themeFile: Theme = themeExtension.packageJSON.contributes.themes.find((theme: Theme) => (theme.label === crntTheme || theme.id === crntTheme));
  const fileContents = readFileSync(join(themeExtension.extensionPath, themeFile.path), 'utf8');

  if (!fileContents) {
    throw new Error(`Could not find theme file for ${crntTheme}`);
  }

  let textmateTheme = parse(fileContents);

  if (typeof textmateTheme.include !== 'undefined') {
    const folderName = dirname(themeFile.path);
    const fileContents = readFileSync(join(themeExtension.extensionPath, folderName, textmateTheme.include), 'utf8');
    if (fileContents) {
      const sourceTheme = parse(fileContents);
      textmateTheme = merge(sourceTheme, textmateTheme);
    }
  }

  return textmateTheme;
}