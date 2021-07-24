import { Position, QuickPickItem, TextEditor, TextEditorEdit, window } from 'vscode';
import {
	ClassMetaInfo as ClassMetaInfo
} from '../domain/ClassMetadata';


export default class ImportStatementWritter {

	#textEditor: TextEditor;

	constructor(textEditor: TextEditor) {
		this.#textEditor = textEditor;
	}


	async writeImportStatement<T extends QuickPickItem>(classMetadata: T) {
		console.warn("Writing ClassData", classMetadata);
		const importText = this.#generateImportText(ClassMetaInfo.fromQuickPickItem(classMetadata));

		console.warn("GENERATED TEXT", importText);

		this.#textEditor.edit((editBuilder: TextEditorEdit) => {
			editBuilder.insert(new Position(0, 0), importText);

		});

	}

	#generateImportText(classInfo: ClassMetaInfo): any {
		const realRelativePath = classInfo.getRelativePathToFolder(this.#textEditor.document.uri.fsPath).split('\\').join('/');
		const usePath = classInfo.getAdonisRegisteredPath();


		const template = `
/** @typedef {import('${realRelativePath}')} ${classInfo.onlyName()}*/
/** @type {${classInfo.onlyName()}}*/
const ${classInfo.onlyName()} = use('${usePath}')

`;
		return template;

	}
}