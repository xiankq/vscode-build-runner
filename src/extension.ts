// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { OutputService } from "./shared/output";
import { ProcessService } from "./shared/process";
import { getProjectInfos } from "./tree";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = async (context: vscode.ExtensionContext) => {
  console.log("dart build_runner activate");
  const res = await getProjectInfos();
  console.log(res);

  const unique = "";
  const title = "";
  if (ProcessService.I.find(unique)) {
    //TODO 已存在
  } else {
    const output = OutputService.I.create(unique, title, () => {
      ProcessService.I.kill(process);
    });
    const process = await ProcessService.I.create(
      unique,
      vscode.Uri.parse("./"),
      [],
      (type, value) => {
        switch (type) {
          case "exit":
            output.unActivate();
            break;
          default:
            output.write(value);
            break;
        }
      }
    );
  }
};

// this method is called when your extension is deactivated
export function deactivate() {}
