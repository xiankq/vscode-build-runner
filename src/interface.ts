
/**
 * pubspec.yaml序列化模型
 */
export interface PubspecModel {
    name: string,
    dependencies: {
        [key: string]: string | any
    },
    dev_dependencies: {
        [key: string]: string | any
    }
}