// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/** @ts-ignore */
import * as ReadLines from 'n-readlines';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import { CompletionItemKind } from 'vscode-languageserver/node';
import { TextDocumentIdentifier, Position } from 'vscode-languageserver-types';

function findClassNameInFile(path: string) {
	return findPatternInFile(path, /class\s.*{/im);
}

function findPatternInFile(filePath: string, pattern: RegExp) {
	const file = new ReadLines(filePath);
	let lineNum = 0;
	let line: any;
	// eslint-disable-next-line no-cond-assign
	while ((line = file.next())) {
		lineNum++;
		line = line.toString();
		if (pattern.test(line)) {
			return lineNum;
		}
	}
	return -1;
}


class AutoCompletionManager {
	#rootFolder = '/'
	#foldersForCompletion: any = ['/app/Services/', '/app/Models/']
	setRootFolder(rootPath: string) {
		this.#rootFolder = rootPath;
	}

	#getServiceCompletion(): any {
		return;
	}

	#getAllFilesCompletion(): any {
		const classList: any[] = [];

		for (const currentFolder of this.#foldersForCompletion) {
			let folderEntries: any[] = readdirSync(path.join(this.#rootFolder, currentFolder));
			folderEntries = folderEntries.map(this.folderEntriesToSugestions(currentFolder));
			classList.push(...folderEntries);
		}

		return classList;
	}

	folderEntriesToSugestions(currentFolder: string) {
		return (file: string) => {
			const filePath: string = path.join(this.#rootFolder, currentFolder, file);
			return {
				position: findClassNameInFile(filePath),
				name: removeExtension(file),
				fileName: file
			};
		};
	}
	findCompletions(textDocument: TextDocumentIdentifier, position: Position): any[] {
		let completions: any[] = [];
		console.warn('document', fileURLToPath(textDocument.uri));
		console.warn('position', position);
		const allFilesCompletion = this.#getAllFilesCompletion();

		completions = allFilesCompletion.map((entry: { position: string, name: string }) => {
			return {
				label: entry.name,
				kind: CompletionItemKind.Class,
				data: {
					position: entry.position
				}
			};
		});

		return completions;
	}
	private controllersCompletion: [] = []
	//more singleton logic

	public updateControllersCOmpletion(controllersFound: []) {
		this.controllersCompletion = controllersFound;
	}

	public getControllersCOmpletion() {
		return this.controllersCompletion;
	}
}
class AutoCompletion {
	private static _instance: any
	public static get instance() {
		if (!AutoCompletion._instance) {
			AutoCompletion._instance = new AutoCompletionManager();
		}

		return <AutoCompletionManager>AutoCompletion._instance;
	}
}

export default AutoCompletion.instance;
function removeExtension(fileName: string) {
	return fileName.substring(0, fileName.indexOf('.') || undefined);
}

