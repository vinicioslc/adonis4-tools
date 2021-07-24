import * as vscode from 'vscode';
import * as path from 'path';



export async function adonisFilePicker() {

	const allFoundedFiles = await vscode.workspace.findFiles(
		'**/app/**',
		'!**/app/**',
	);

	console.warn("FOUNDED ADONIS FILES ", allFoundedFiles);

	const showSelectionWindow = items => vscode.window
		.showQuickPick(items, {
			placeHolder: "Select Adonis Instance",
			matchOnDescription: true,
			matchOnDetail: true
		});

	console.warn(
		'filename',
		vscode.window.activeTextEditor.document.fileName
	);
	console.warn("selected", allFoundedFiles[0].fsPath);



	// get relative path for import 
	const relativeFoundPath = path.relative(vscode.window.activeTextEditor.document.fileName, allFoundedFiles[0].fsPath).substring(3);
	console.warn("relative", relativeFoundPath);


	const selectorPath = showSelectionWindow(allFoundedFiles);

	return selectorPath;
}
