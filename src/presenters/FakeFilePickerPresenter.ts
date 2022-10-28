import { CancellationToken, QuickPickItem, QuickPickOptions } from 'vscode';

type ShowQuickPickFunction = <T extends QuickPickItem>(
  items: T[] | Thenable<T[]>,
  options?: QuickPickOptions,
  token?: CancellationToken
) => Thenable<T | undefined>

export default class FakeFilePicker {
  private showQuickPickFunc: ShowQuickPickFunction
  constructor(showQuickPickFunction: ShowQuickPickFunction) {
    this.showQuickPickFunc = showQuickPickFunction;
  }

  public setFilterFunction(fileLabelToPick = null) {
    this.searchString = fileLabelToPick;
  }
  searchString: any
  async showClassPicker<T extends QuickPickItem>(
    items: T[] | Thenable<T[]>,
    token?: CancellationToken
  ): Promise<string | any> {
    console.warn('Picking', this.searchString);
    return (await items).find(value => {
      return value.label === this.searchString;
    });
  }
}
