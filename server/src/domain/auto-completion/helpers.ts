import { workspace, TextDocument, DocumentLink, Range, Uri } from 'vscode';
/* eslint-disable @typescript-eslint/ban-ts-comment */

export function findControllers() {
	const pathCtrl = '/app/Controllers'; // initial pathController value in package.json
	// @ts-ignore
	const filePath = workspace.getWorkspaceFolder(document.uri).uri.fsPath + pathCtrl;

}