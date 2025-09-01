export interface PubspecModel{
    name?:string; 
    dependencies:Record<string,any>
     
    dev_dependencies:Record<string,any>
}