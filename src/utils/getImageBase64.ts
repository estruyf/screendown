import { existsSync, readFileSync } from "fs";
import fetch from "node-fetch";
import { join } from "path";
import { Uri, workspace } from "vscode";
import imageType from "image-type";

export const getImageToBase64 = async (fileUrl: string) => {
  if (!fileUrl) {
    return "";
  }

  if (fileUrl.startsWith("data:")) {
    return fileUrl;
  }

  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    // Fetch the image and convert to base64
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');

    const type = response.headers.get('content-type');

    return `data:${type};base64,${base64}`;
  }

  try {
    const wsPath = workspace.workspaceFolders![0].uri.fsPath || "";
    const uri = Uri.parse(join(wsPath, fileUrl));
    const file = await workspace.fs.readFile(uri);
    if (file) {
      const type = imageType(file);
      return `data:${type};base64,${Buffer.from(file).toString('base64')}`;
    }
  } catch (e) {
    console.log((e as Error).message);
  }

  if (existsSync(fileUrl)) {
    const file = readFileSync(fileUrl);
    if (file) {
      const type = imageType(file);
      return `data:${type};base64,${Buffer.from(file).toString('base64')}`;
    }
  }

  return "";
}