/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */



import { workspace, ExtensionContext, commands, window } from 'vscode';

import ClassResolverGateway from './gateways/ClassResolverGateway';
import DocumentWriterGateway from './gateways/DocumentWriterGateway';
import FilePickerPresenter from './presenters/FilePickerPresenter';
import UserSelectAdonisClassCase from './use-cases/UserSelectAdonisClassCase';


let allreadyGettingFiles = false;
export function activate(context: ExtensionContext) {


  context.subscriptions.push(
    commands.registerCommand("adonis4_tools.pick_file", async () => {
      if (!allreadyGettingFiles) {
        try {
          allreadyGettingFiles = true;

          const picker = new FilePickerPresenter(window.showQuickPick);
          const classResolver = new ClassResolverGateway(workspace.findFiles);
          const documentWritter = new DocumentWriterGateway(window.activeTextEditor);
          await (new UserSelectAdonisClassCase(picker, classResolver, documentWritter)).execute();
          allreadyGettingFiles = false;
        } catch (error) {
          allreadyGettingFiles = false;
          throw error;
        }
      }
    })
  );
  console.log("Adonis Require Initialized");
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): any { }


