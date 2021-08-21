import { QuickPickItem } from "vscode";
import * as path from "path";
import * as lineByLine from "n-readlines";


import { AdonisFileInfo } from "../domain/AdonisFileInfo";

import ClassResolverGateway from "../gateways/ClassResolverGateway";
import DocumentWriterGateway from "../gateways/DocumentWriterGateway";
import ClassFilePickerPresenter from "../presenters/FilePickerPresenter";

const mapToQuickPickItem = (value: AdonisFileInfo) => {
  try {
    const item: QuickPickItem = {
      label: value.name,
      description: value.getUsePath(),
      detail: value.rawPath,
    };
    return item;
  } catch (error) {
    return null;
  }
};

export default class UserSelectAdonisClassCase {
  #filePicker: ClassFilePickerPresenter;
  #classesResolver: ClassResolverGateway;
  #importStatementWritter: DocumentWriterGateway;

  constructor(
    filePickerInstance: ClassFilePickerPresenter,
    classesResolver: ClassResolverGateway,
    importStatementWritter: DocumentWriterGateway
  ) {
    this.#filePicker = filePickerInstance;
    this.#classesResolver = classesResolver;
    this.#importStatementWritter = importStatementWritter;
  }

  async execute() {
    let items = await this.#classesResolver.findFilesByGlobs([
      ["**/app/**", "!**/app/**"],
      ["**/providers/**", "!**/providers/**"],
    ]);

    items = items.map(normalizeClassProviders).filter((val) => val !== null);
    const quickPickItems = items.map(mapToQuickPickItem);

    console.warn("Showing class picker", quickPickItems);

    const classPicked = await this.#filePicker.showClassPicker(quickPickItems);
    console.warn("Class picked", classPicked);
    if (classPicked) {
      const adonisInfo = items.find((val, index, arr) => {
        return val.rawPath === classPicked.detail;
      });
      this.#importStatementWritter.writeImportStatement(adonisInfo);
    }
  }
}
function normalizeClassProviders(file: AdonisFileInfo, index, allClasses: AdonisFileInfo[]): AdonisFileInfo {

  let hasRegisterFunc = null;

  let usePathFound = null;
  let requirePathFound = null;

  if (file.rawPath.includes("provider")) {
    const current = new lineByLine(file.rawPath);


    let nextLine;
    let lineNumber = 0;
    let needIterate = true;

    while (needIterate) {
      nextLine = current.next();
      needIterate = nextLine;
      const lineString = nextLine.toString('utf-8');
      // console.log("Line " + lineNumber + ":" + lineString);
      try {
        if (hasRegisterFunc == null) {
          hasRegisterFunc = /register/mi.exec(lineString);
        }
        if (hasRegisterFunc !== null && usePathFound === null) {
          const useRegex = /singleton\(['"]([\w\W]+)['"]/mi.exec(lineString);
          if (useRegex && useRegex.length > 0) {
            // get namespace as path
            usePathFound = useRegex[1];
          }
        }
        if (hasRegisterFunc !== null && usePathFound !== null && requirePathFound === null) {
          const requireRegex = /require\(['"]([\w\W]+)['"]/mi.exec(lineString);
          if (requireRegex && requireRegex.length > 0) {
            requirePathFound = requireRegex[1];
          }
        }
        if (usePathFound !== null
          && usePathFound.length > 0
          && requirePathFound !== null
          && requirePathFound.length > 0) {

          needIterate = false;

          break;
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
      lineNumber++;
    }
    file.usePath = usePathFound;
    file.rawPath = requirePathFound;
    // normalize require path when file its a provider
    if (file.rawPath && file.rawPath.includes('/app/')) {
      for (const idx in allClasses) {
        const currItem = allClasses[idx];
        if (idx != index && currItem.onlyName() === file.onlyName()) {
          file.rawPath = currItem.rawPath;
        }
      }
    }
  } else {
    file.usePath = file.getUsePath();
  }

  return file;
}

