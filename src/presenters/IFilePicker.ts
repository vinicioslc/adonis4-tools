import { CancellationToken, QuickPickItem } from 'vscode';

export interface IFilePicker {
  showClassPicker<T extends QuickPickItem>(
    items: T[] | Thenable<T[]>,
    token?: CancellationToken
  ): Promise<string | any>;
}
