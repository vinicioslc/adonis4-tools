import * as vscode from "vscode";
import { ClassMetaInfo as ClassMetaInfo } from "../domain/ClassMetadata";

export default class DocumentWriterGateway {
	#textEditor: vscode.TextEditor;

	constructor(textEditor: vscode.TextEditor) {
		this.#textEditor = textEditor;
	}

	async writeImportStatement<T extends vscode.QuickPickItem>(classMetadata: T) {
		console.warn("Writing ClassData", classMetadata);
		const importText = this.#generateImportText(
			ClassMetaInfo.fromQuickPickItem(classMetadata)
		);

		console.warn("GENERATED TEXT", importText);

		const isUseStrictFile: boolean = this.#textEditor.document.lineAt(1).text.includes('use-strict');
		const lineToInsert = this.getLineToInsert(this.#textEditor.document, isUseStrictFile);


		this.#textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
			// to avoid 'use-strict' area
			editBuilder.insert(new vscode.Position(lineToInsert, 0), importText);
		});
	}

	private getLineToInsert(textDocument: vscode.TextDocument, isUseStrictFile: boolean) {
		const AFTER_USE_STRICT = 2;
		const FIRST_LINE = 1;
		const INITIAL_LINE = isUseStrictFile ? AFTER_USE_STRICT : FIRST_LINE;
		let lineToInsert = INITIAL_LINE;
		let idxLine = 1;
		while (lineToInsert === INITIAL_LINE && idxLine < textDocument.lineCount) {
			if (textDocument.lineAt(idxLine).isEmptyOrWhitespace) {
				lineToInsert = idxLine; // line to insert is equal empty_line `-1`
			} else if (textDocument.lineAt(idxLine).text.match(/class/mi) || textDocument.lineAt(idxLine).text.match(/export/mi)) {
				lineToInsert = idxLine; // line to insert is equal empty_line `-1`
			}
			idxLine++;
		}
		return lineToInsert;
	}

	#generateImportText(classInfo: ClassMetaInfo): any {
		const realRelativePath = classInfo
			.getRelativePathToFolder(this.#textEditor.document.uri.fsPath)
			.split("\\")
			.join("/");
		const usePath = classInfo.getAdonisRegisteredPath();

		const template = `
/** @typedef {import('${realRelativePath}')} ${classInfo.onlyName()}*/
/** @type {${classInfo.onlyName()}}*/
const ${classInfo.onlyName()} = use('${usePath}')
`;
		return template;
	}
}
