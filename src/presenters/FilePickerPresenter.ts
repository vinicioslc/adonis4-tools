import { CancellationToken, QuickPickItem, QuickPickOptions } from 'vscode';


type ShowQuickPickFunction = <T extends QuickPickItem>(items: T[] | Thenable<T[]>, options?: QuickPickOptions, token?: CancellationToken) => Thenable<T | undefined>;

export default class FilePicker {
	#showQuickPickFunc: ShowQuickPickFunction;
	constructor(showQuickPickFunction: ShowQuickPickFunction) {
		this.#showQuickPickFunc = showQuickPickFunction;
	}

	async showClassPicker<T extends QuickPickItem>(items: T[] | Thenable<T[]>, token?: CancellationToken): Promise<string | any> {
		return this.#showQuickPickFunc(items, {
			matchOnDescription: true,
			matchOnDetail: true,
			placeHolder: "Select an AdonisJS class to use() it"
		}, token);
	}
}
