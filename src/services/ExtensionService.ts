import { ConfigurationTarget, ExtensionContext, ExtensionMode, Uri, workspace, window, commands } from "vscode";

export class ExtensionService {
  private static instance: ExtensionService;
  
  private constructor(private ctx: ExtensionContext) {}

  /**
   * Creates the singleton instance for the panel
   * @param extPath 
   */
  public static getInstance(ctx?: ExtensionContext): ExtensionService {
    if (!ExtensionService.instance && ctx) {
      ExtensionService.instance = new ExtensionService(ctx);
    }

    return ExtensionService.instance;
  }

  /**
   * Retrieves the name of the extension
   */
  public get name(): string {
    return this.ctx.extension.packageJSON.name;
  }

  /**
   * Retrieves the displayName of the extension
   */
  public get displayName(): string {
    return this.ctx.extension.packageJSON.displayName || this.ctx.extension.packageJSON.name;
  }

  /**
   * Check if the extension is in production/development mode
   */
   public get isProductionMode(): boolean {
    return this.ctx.extensionMode === ExtensionMode.Production;
  }

  /**
   * Retrieves the path to the extension
   */
  public get extensionPath(): string {
    return this.ctx.extensionUri.fsPath;
  }

  /**
   * Retrieves the path to the extension
   */
  public get context(): ExtensionContext {
    return this.ctx;
  }

  /**
   * Retrieves the version of the extension
   */
  public get version(): string {
    return this.ctx.extension.packageJSON.version;
  }

  /**
   * Retrieves the mode in which the extension is running
   */
  public get mode(): ExtensionMode {
    return this.ctx.extensionMode;
  }

  /**
   * Retrieve the current workspace path
   */
  public get workspacePath(): Uri | null {
    const wsFolders = workspace.workspaceFolders;
    if (wsFolders && wsFolders.length > 0) {
      return wsFolders[0].uri;
    }
    return null;
  }

  /**
   * Generate a only once used ID
   * @returns 
   */
  public getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  /**
   * Get state
   * @param propKey 
   * @param type 
   * @returns 
   */
  public async getState<T>(propKey: string, type: "workspace" | "global" = "global"): Promise<T | undefined> {
    if (type === "global") {
      return await this.ctx.globalState.get(propKey);
    } else {
      return await this.ctx.workspaceState.get(propKey);
    }
  }

  /**
   * Store value in the state
   * @param propKey 
   * @param propValue 
   * @param type 
   */
  public async setState<T>(propKey: string, propValue: T, type: "workspace" | "global" = "global", setState: boolean = false): Promise<void> {
    if (type === "global") {
      await this.ctx.globalState.update(propKey, propValue);
    } else {
      await this.ctx.workspaceState.update(propKey, propValue);
    }
  }

  /**
   * Retrieve a setting from the configuration
   * @param propKey 
   * @returns 
   */
  public getSetting<T>(propKey: string): T | undefined {
    const config = workspace.getConfiguration("rapidapi");
    return config.get<T>(propKey);
  }

  /**
   * Update a setting
   * @param propKey 
   * @returns 
   */
  public setSetting(propKey: string, data: any, target?: ConfigurationTarget) {
    const config = workspace.getConfiguration("rapidapi");
    return config.update(propKey, data, target);
  }
}
