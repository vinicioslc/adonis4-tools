import { QuickPickItem, } from 'vscode';
import { ClassMetaInfo } from '../domain/ClassMetadata';

import ClassResolverGateway from '../gateways/ClassResolverGateway';
import DocumentWriterGateway from '../gateways/DocumentWriterGateway';
import FilePickerPresenter from '../presenters/FilePickerPresenter';



const mapToQuickPickItem = (value: ClassMetaInfo) => {
	const item: QuickPickItem = {
		label: value.name,
		description: value.type,
		detail: value.path,
	};
	return item;
};


export default class ListAdonisClasses {
	#filePicker: FilePickerPresenter;
	#classesResolver: ClassResolverGateway;
	#importStatementWritter: DocumentWriterGateway;


	constructor(filePickerInstance: FilePickerPresenter, classesResolver: ClassResolverGateway, importStatementWritter: DocumentWriterGateway) {
		this.#filePicker = filePickerInstance;
		this.#classesResolver = classesResolver;
		this.#importStatementWritter = importStatementWritter;
	}

	async execute() {


		const items = await this.#classesResolver.findClasses(
			'**/app/**',
			'!**/app/**');

		const quickPickItems = items.map(mapToQuickPickItem);
		console.warn("Showing class picker", quickPickItems);

		const classPicked = await this.#filePicker.showClassPicker(quickPickItems);
		console.warn("Class picked", classPicked);

		if (classPicked) {
			this.#importStatementWritter.writeImportStatement(classPicked);
		}
	}
}
