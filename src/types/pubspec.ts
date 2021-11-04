export interface PubspecModel{
    name?:string; 
    dependencies:Record<string,any>
    // eslint-disable-next-line @typescript-eslint/naming-convention
    dev_dependencies:Record<string,any>
}