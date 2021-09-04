import * as vscode from "vscode";

import * as path from 'path';

import { adonisFilePicker } from '../adonis-file-picker';
import { AdonisFileInfo as AdonisFileInfo } from "../domain/AdonisFileInfo";

export default class DocumentWriterGateway {
  #textEditor: vscode.TextEditor;
  currentRequireIndex: number;

  constructor(textEditor: vscode.TextEditor) {
    this.#textEditor = textEditor;
  }

  async writeImportStatement<T extends vscode.QuickPickItem>(fileInfo: AdonisFileInfo, allClassesFiles: AdonisFileInfo[]) {
    const constUseText = this.#generateImportText(
      fileInfo
    );
    const constTypeText = this.#generateSetTypeText(
      fileInfo
    );
    const typedefText = this.#generateTypedef(fileInfo, allClassesFiles);

    const hasUseStrict = this.#textEditor.document.lineAt(1).text.includes('strict');
    const AFTER_USE_STRICT = 2;
    const FIRST_LINE = 1;
    const INITIAL_LINE = hasUseStrict ? AFTER_USE_STRICT : FIRST_LINE;

    const lineInsertAdonisUse = this.getLineToInsertRequire(this.#textEditor.document, INITIAL_LINE, fileInfo);
    const lineInsertTypeOfConst = this.getLineToInsertType(this.#textEditor.document, lineInsertAdonisUse, fileInfo);
    const lineInsertTypedefinition = this.getLineToTypeDef(this.#textEditor.document, INITIAL_LINE, fileInfo);

    console.log("Class Data:", typedefText);
    console.log("Import Type Text:", constTypeText);
    console.log("Import Text:", constUseText);

    return this.#textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
      if (lineInsertTypedefinition) {
        editBuilder.insert(new vscode.Position(lineInsertTypedefinition, 0), typedefText);
      }
      if (lineInsertTypeOfConst) {
        editBuilder.insert(new vscode.Position(lineInsertTypeOfConst, this.#textEditor.document.lineAt(lineInsertTypeOfConst).text.length), constTypeText);
      }
      if (lineInsertAdonisUse) {
        editBuilder.insert(new vscode.Position(lineInsertAdonisUse, 0), constUseText);
      }
    });
  }
  private getLineToTypeDef(textDocument: vscode.TextDocument, INITIAL_LINE: number, classInfo: AdonisFileInfo) {

    const lineToInsert = INITIAL_LINE;
    let idxLine = 1;
    let firstLineEmpty = null;
    let firstTypedefImport = null;
    let allreadyImport = null;
    while (idxLine < textDocument.lineCount) {
      const currentLine = textDocument.lineAt(idxLine);
      if (currentLine.isEmptyOrWhitespace && !firstLineEmpty) {
        firstLineEmpty = idxLine; // line to insert is equal empty_line `-1`
      }
      if (currentLine.text.match(/typedef/mi) && !firstTypedefImport) {
        firstTypedefImport = idxLine; // line to insert is equal empty_line `-1`
      }
      const typedefRegex = '@typedef.*' + classInfo.name + '.*' + classInfo.onlyName() + ".*\\*\\/$";
      // eslint-disable-next-line no-useless-escape
      if (currentLine.text.match(RegExp(typedefRegex, "mi")) && !allreadyImport) {
        allreadyImport = idxLine; // line to insert is equal empty_line `-1`
      }
      idxLine++;
    }
    if (allreadyImport) {
      return null;
    } else {
      if (firstTypedefImport) {
        return firstTypedefImport;
      } else {
        if (firstLineEmpty) {
          return firstLineEmpty;

        }
      }
    }
    return lineToInsert;
  }

  private getLineToInsertRequire(textDocument: vscode.TextDocument, INITIAL_LINE: number, classInfo: AdonisFileInfo) {

    const lineToInsert = INITIAL_LINE;
    let idxLine = 1;
    let firstClassOrExport = null;
    const lastUseOrRequire = null;
    let firstEmtpyLine = null;
    while (lineToInsert === INITIAL_LINE && idxLine < textDocument.lineCount) {
      const currentLine = textDocument.lineAt(idxLine);
      const currentLineText = currentLine.text;

      if (currentLine.isEmptyOrWhitespace && !firstEmtpyLine) {
        firstEmtpyLine = idxLine; // line to insert is equal empty_line `-1`
      }

      const isCurrentLineUseDirective = currentLineText.includes(classInfo.usePath);
      // is this line has the current use('MyApp') statement
      if (isCurrentLineUseDirective) {
        this.currentRequireIndex = idxLine; // line to insert is equal empty_line `-1`
        return null;
      }

      if (currentLineText.match(/(class)|(export)|({\n)/mi) && !firstClassOrExport) {
        firstClassOrExport = idxLine; // line to insert is equal empty_line `-1`
      }
      idxLine++;
    }
    if (lastUseOrRequire) {
      return lastUseOrRequire;
    }
    else {
      if (firstClassOrExport) return firstClassOrExport - 1;
      else {
        if (firstEmtpyLine) return firstEmtpyLine;
      }

    }

    return lineToInsert;
  }


  private getLineToInsertType(
    textDocument: vscode.TextDocument,
    lineToInsertRequire: number,
    classInfo: AdonisFileInfo

  ) {
    let lineFound = null;

    if (lineToInsertRequire) {
      const currentLine = lineToInsertRequire - 1;
      const cRowText = textDocument.lineAt(currentLine).text;
      if (cRowText.includes(classInfo.onlyName())) return null;
      lineFound = lineToInsertRequire - 1;

    } else if (this.currentRequireIndex) {
      const currentLine = this.currentRequireIndex - 1;
      const cRowText = textDocument.lineAt(currentLine).text;
      if (cRowText.includes(classInfo.onlyName())) return null;
      lineFound = this.currentRequireIndex - 1;
    }
    return lineFound;
  }


  #generateTypedef(classInfo: AdonisFileInfo, allClassesFiles: AdonisFileInfo[]) {

    let realPath = classInfo.relativePathToFile;
    if (realPath.includes('Program Files')) {
      const filename = path.parse(realPath).name;
      const foundedRealFile = allClassesFiles.find((fileInfo) => {
        if (fileInfo.isProvider) {
          return false;
        }
        return path.parse(fileInfo.usePath).name === filename;
      });
      realPath = foundedRealFile.relativePathToFile;
    }

    const template = `/** @typedef {import('${realPath || null}')} ${classInfo.onlyName() || null}*/
`;
    return template;
  }

  #generateImportText(classInfo: AdonisFileInfo): any {

    return `const ${classInfo.onlyName() || null} = use('${classInfo.getUsePath() || null}')
`;
  }

  #generateSetTypeText(classInfo: AdonisFileInfo): any {
    return `
/** @type {${classInfo.onlyName() || null}}*/`;
  }

}
