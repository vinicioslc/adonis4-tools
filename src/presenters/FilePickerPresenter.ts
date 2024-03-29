import { CancellationToken, QuickPickItem, QuickPickOptions } from 'vscode';
import { IFilePicker } from './IFilePicker';

type ShowQuickPickFunction = <T extends QuickPickItem>(
  items: T[] | Thenable<T[]>,
  options?: QuickPickOptions,
  token?: CancellationToken
) => Thenable<T | undefined>

export default class FilePickerPresenter implements IFilePicker {
  private showQuickPickFunc: ShowQuickPickFunction
  constructor(showQuickPickFunction: ShowQuickPickFunction) {
    this.showQuickPickFunc = showQuickPickFunction;
  }

  async showClassPicker<T extends QuickPickItem>(
    items: T[] | Thenable<T[]>,
    token?: CancellationToken
  ): Promise<string | any> {
    console.warn('Listing all files found', items);
    return this.showQuickPickFunc(
      items,
      {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: "Select an AdonisJS class to generate use('MyClass')"
      },
      token
    );
  }
}
