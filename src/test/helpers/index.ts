import * as vscode from 'vscode';

import ClassResolverGateway from '../../gateways/ClassResolverGateway';
import DocumentWriterGateway from '../../gateways/DocumentWriterGateway';
import UserSelectAdonisClassCase from '../../use-cases/UserSelectAdonisClassCase';
import FakeFilePicker from '../../presenters/FakeFilePickerPresenter';
import { AdonisFileInfo } from '../../domain/AdonisFileInfo';

export async function importClassToFile(classLabel: string = null, fileName: string = null) {
  const opennedUri = await openExistingFile(fileName);
  const initialTextToBeRestored = await getCurrentFileString();
  const resetAllChanges = async function () {
    await vscode?.window?.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
      editBuilder.replace(
        new vscode.Range(
          // first line first character
          new vscode.Position(0, 0),
          // last line last character
          new vscode.Position(vscode?.window?.activeTextEditor?.document?.lineCount, 999)
        ),
        initialTextToBeRestored // new text to put on document
      );
    });
    await vscode?.window?.activeTextEditor?.document.save();
  };
  try {
    const fakeFilePicker = new FakeFilePicker(vscode.window.showQuickPick);
    fakeFilePicker.setFilterFunction(classLabel);
    const classResolver = new ClassResolverGateway(vscode.workspace.findFiles);

    const documentWritter = new DocumentWriterGateway(vscode?.window?.activeTextEditor);
    await new UserSelectAdonisClassCase(fakeFilePicker, classResolver, documentWritter).execute();
    await vscode?.window?.activeTextEditor?.document.save();
  } catch (error) {
    // on error revert all unecessary changes

    await resetAllChanges();
    throw error;
  }
  return resetAllChanges;
}

export async function changeConfig(settings: any) {
  const assistant = vscode.workspace.getConfiguration();
}

export async function doc(content: string, language?: string) {
  return await vscode.workspace.openTextDocument({
    language,
    content
  });
}

export async function createNewFile(content: string): Promise<vscode.TextDocument> {
  const document = doc(content);
  vscode.window.showTextDocument(await document);
  return document;
}
export async function openExistingFile(filePath: string): Promise<any> {
  const docPath = vscode.Uri.file(filePath);

  const allFoundedFiles = await vscode.workspace.findFiles('**/' + filePath, '!**/' + filePath);
  const t = allFoundedFiles[0];
  await vscode.commands.executeCommand(`vscode.open`, t);
  return t;
}

export async function openFilePicker(optionToSelect = 0) {
  await vscode.commands.executeCommand('adonis4_tools.pick_file');
}

export async function getCurrentFileString() {
  const editor = vscode?.window?.activeTextEditor;

  if (editor) {
    const document = editor.document;

    // Get the document text
    const documentText = document.getText();

    // DO SOMETHING WITH `documentText`
    return documentText;
  }
  return null;
}
