import { QuickPickItem } from "vscode";


import { AdonisFileInfo } from "../domain/AdonisFileInfo";

import ClassResolverGateway from "../gateways/ClassResolverGateway";
import DocumentWriterGateway from "../gateways/DocumentWriterGateway";
import ClassFilePickerPresenter from "../presenters/FilePickerPresenter";

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
    let classesInfo = await this.#classesResolver.getAllClasses();

    classesInfo = classesInfo.filter((val) => !!val && !!val.usePath);
    const quickPickItems = classesInfo.map(this.#mapToQuickPickItem);

    console.warn("Showing class picker", quickPickItems);

    const classPicked = await this.#filePicker.showClassPicker(quickPickItems);
    console.warn("Class picked", classPicked);
    if (classPicked) {
      const adonisInfo = classesInfo.find((val, index, arr) => {
        return val.rawPath === classPicked.detail;
      });
      this.#importStatementWritter.writeImportStatement(adonisInfo, classesInfo);
    }
  }

  #mapToQuickPickItem(adonisClass: AdonisFileInfo) {
    try {
      const item: QuickPickItem = {
        label: adonisClass.name,
        description: adonisClass.getUsePath(),
        detail: adonisClass.rawPath,
      };
      if (adonisClass.isProvider) {
        item.description = adonisClass.providerType.toString();
      }
      return item;
    } catch (error) {
      return null;
    }
  }

}
