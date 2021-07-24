/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */



import { workspace, ExtensionContext, commands, window } from 'vscode';

import ClassResolverGateway from './gateways/ClassResolverGateway';
import DocumentWriterGateway from './gateways/DocumentWriterGateway';
import FilePicker from './presenters/FilePickerPresenter';
import UserSelectAdonisClassCase from './use-cases/UserSelectAdonisClassCase';



export function activate(context: ExtensionContext) {


	context.subscriptions.push(
		commands.registerCommand("adonis4_tools.pick_file", async () => {
			const picker = new FilePicker(window.showQuickPick);
			const resolver = new ClassResolverGateway(workspace.findFiles);
			const documentWritter = new DocumentWriterGateway(window.activeTextEditor);
			return await (new UserSelectAdonisClassCase(picker, resolver, documentWritter)).execute();
		})
	);
	console.log("Adonis Require Initialized");


}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): any { }


