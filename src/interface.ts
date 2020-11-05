/*
 * @Author: XianKaiQun
 * @LastEditors: XianKaiQun
 * @Date: 2020-11-05 08:44:59
 * @LastEditTime: 2020-11-05 09:05:04
 */

/**
 * pubspec.yaml序列化模型
 */
export interface PubspecObject {
    name: string,
    dependencies: {
        [key: string]: string | any
    },
    dev_dependencies: {
        [key: string]: string | any
    }
}