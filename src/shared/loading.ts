import * as vsc from "vscode";

/**
 * loading实例控制器
 */
export interface LoadingInstance {
  unique: any;
  progress: vsc.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
  }>;
  hide: () => void;
}

export class LoadingService {
  private constructor() {}
  private static _i?: LoadingService;
  static get i() {
    return (this._i ??= new LoadingService());
  }
  private instances: LoadingInstance[] = [];

  /**
   * 新建一个loading实例
   * @param unique
   * @param options
   * @returns
   */
  async create(
    unique: any,
    options: vsc.ProgressOptions
  ): Promise<LoadingInstance> {
    const exist = this.find(unique);
    if (exist) {
      return exist;
    }
    return new Promise<LoadingInstance>((resolve) => {
      vsc.window.withProgress(options, async (progress) => {
        let _hide: (() => void) | undefined;
        const instance: LoadingInstance = {
          unique,
          progress,
          hide: () => {
            _hide?.();
            const index = this.instances.findIndex((e) => e.unique === unique);
            this.instances.splice(index, 1);
          },
        };
        this.instances.push(instance);
        return new Promise<void>((hide) => {
          _hide = hide;
          resolve(instance);
        });
      });
    });
  }

  /**
   * 根据唯一值查询是否存在loading实例
   * @param unique
   * @returns
   */
  find(unique: any) {
    return this.instances.find((e) => e, unique === unique);
  }
}
