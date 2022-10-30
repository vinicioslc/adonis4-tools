import { IFilePicker } from './../presenters/IFilePicker';
import { QuickPickItem } from 'vscode';

import { AdonisFileInfo } from '../domain/AdonisFileInfo';

import ClassResolverGateway from '../gateways/ClassResolverGateway';
import DocumentWriterGateway from '../gateways/DocumentWriterGateway';
import ClassFilePickerPresenter from '../presenters/FilePickerPresenter';

export default class UserSelectAdonisClassCase {
  private filePicker: IFilePicker
  private classesResolver: ClassResolverGateway
  private importStatementWritter: DocumentWriterGateway

  constructor(
    filePickerInstance: IFilePicker,
    classesResolver: ClassResolverGateway,
    importStatementWritter: DocumentWriterGateway
  ) {
    this.filePicker = filePickerInstance;
    this.classesResolver = classesResolver;
    this.importStatementWritter = importStatementWritter;
  }

  async execute() {
    // get all classes info
    let availableClasses = await this.classesResolver.getAllClasses();
    availableClasses = availableClasses.filter(val => !!val && !!val.usePath);
    const quickPickItems = availableClasses.map(this.mapToQuickPickItem);

    // show class picker on interface
    const classPicked = await this.filePicker.showClassPicker(quickPickItems);
    if (classPicked) {
      const classInfo = this.getCorrectClassInfo(availableClasses, classPicked);
      console.warn('Class picked', classPicked);
      console.warn('Class info', classInfo);
      this.importStatementWritter.writeImportStatement(classInfo, availableClasses);
    }
  }

  private getCorrectClassInfo(classesInfo: AdonisFileInfo[], classPicked: any) {
    return classesInfo.find((val, index, arr) => {
      return val.rawPath === classPicked.detail;
    });
  }

  private mapToQuickPickItem(adonisClass: AdonisFileInfo): QuickPickItem {
    try {
      const item: QuickPickItem = {
        label: adonisClass.name,
        description: adonisClass.getUsePath(),
        detail: adonisClass.rawPath
      };
      if (adonisClass.isProvider) {
        item.description = adonisClass.importType.toString();
      }
      return item;
    } catch (error) {
      return null;
    }
  }
}
