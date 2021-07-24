import { QuickPickItem, } from 'vscode';
import { ClassMetaInfo } from '../domain/ClassMetadata';

import ClassResolverGateway from '../gateways/ClassResolverGateway';
import ImportStatementWritter from '../gateways/ImportWritterGateway';
import FilePickerPresenter from '../presenters/FilePickerPresenter';



const mapToQuickPickItem = (value: ClassMetaInfo) => {
	return {
		label: value.onlyName,
		description: value.type || "module",
		detail: value.path,
		fsPath: value.path,
		dirPath: value.path
	} as QuickPickItem;
};


export default class ListAdonisClasses {
	#filePicker: FilePickerPresenter;
	#classesResolver: ClassResolverGateway;
	#importStatementWritter: ImportStatementWritter;


	constructor(filePickerInstance: FilePickerPresenter, classesResolver: ClassResolverGateway, importStatementWritter: ImportStatementWritter) {
		this.#filePicker = filePickerInstance;
		this.#classesResolver = classesResolver;
		this.#importStatementWritter = importStatementWritter;
	}

	async execute() {

		const items = await this.#classesResolver.findClasses(
			'**/app/**',
			'!**/app/**');

		const quickPickItems = items.map(mapToQuickPickItem);
		const classPicked = await this.#filePicker.showClassPicker(quickPickItems);

		if (classPicked) {
			this.#importStatementWritter.writeImportStatement(classPicked);
		}
	}
}
