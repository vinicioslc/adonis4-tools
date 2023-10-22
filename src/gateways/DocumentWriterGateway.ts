import * as vscode from 'vscode';

import {
  isNil
} from 'lodash';

import * as path from 'path';

import { AdonisFileInfo as AdonisFileInfo } from '../domain/AdonisFileInfo';

export default class DocumentWriterGateway {
  private textEditor: vscode.TextEditor
  currentRequireIndex: number

  private readonly commentLineRegex = /(\/\*)(?!.*@ty)/im

  constructor(textEditor: vscode.TextEditor) {
    this.textEditor = textEditor;
  }

  async writeImportStatement(fileInfo: AdonisFileInfo, allClassesFiles: AdonisFileInfo[]) {
    const useText = this.makeDeclarationText(fileInfo);
    const typeText = this.generateTypeText(fileInfo);

    const FIRST_LINE_TEXT = this.textEditor.document.lineAt(0).text;
    const hasUseStrict = /(use strict)/gmi.test(FIRST_LINE_TEXT);

    const FIRST_LINE = 1;
    const AFTER_USE_STRICT = FIRST_LINE + 1;
    const INITIAL_LINE = hasUseStrict ? AFTER_USE_STRICT : FIRST_LINE;
    const hasImportConst = this.alreadyHasRequire(fileInfo, INITIAL_LINE, this.textEditor.document);
    let importIndex = this.getLineToPlaceDeclaration(INITIAL_LINE, this.textEditor.document) ?? INITIAL_LINE;
    // should reuse existing adonis use() statement
    if (hasImportConst) {
      importIndex = hasImportConst;
    }

    console.log('Use:', useText);
    console.log('Type:', typeText);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    function addConst(editBuilder: vscode.TextEditorEdit, textEditor) {
      if (importIndex && !hasImportConst) {
        const LINE_TEXT = textEditor.document.lineAt(importIndex).text;
        const hastTypeLine = that.getConstIdx(that.textEditor.document, FIRST_LINE, fileInfo);
        let requireText = '\r\n' + useText;
        if (!hastTypeLine) {
          requireText = '\r\n' + typeText + '\r\n' + useText;
          editBuilder.insert(
            new vscode.Position(importIndex, textEditor.document.lineAt(importIndex).text.length),
            requireText
          );
        } else if (hastTypeLine) {
          editBuilder.insert(
            new vscode.Position(hastTypeLine, textEditor.document.lineAt(hastTypeLine).text.length),
            requireText
          );
        }
      }
    }

    function addType(editBuilder: vscode.TextEditorEdit, textEditor: vscode.TextEditor) {
      const alreadyHasType = that.alreadyHasType(that.textEditor.document, importIndex, fileInfo);
      const HAS_TYPE_IMPORT = !isNil(importIndex);
      const HAS_CONSTANT = !isNil(hasImportConst);
      const WITHOUT_TYPE = isNil(alreadyHasType);
      if (WITHOUT_TYPE) {
        if (HAS_TYPE_IMPORT && HAS_CONSTANT) {
          const lineBeforeConst = importIndex - 1;
          const typeTextLine = '\r\n' + typeText;
          editBuilder.insert(new vscode.Position(lineBeforeConst, 0), typeTextLine);
        } else if (HAS_TYPE_IMPORT && !HAS_CONSTANT) {
          const typeTextLine = '\r\n' + typeText;
          editBuilder.insert(new vscode.Position(importIndex, textEditor.document.lineAt(importIndex).text.length), typeTextLine);
        }
      }
    }

    function addTypeDefinition(editBuilder: vscode.TextEditorEdit, textEditor) {
      const putTypeDefLine = that.getTypeDefLine(that.textEditor.document, INITIAL_LINE, fileInfo);
      const alreadyHasTypeDefinition = that.alreadyHasTypedefinition(that.textEditor.document, importIndex, fileInfo);
      if (isNil(alreadyHasTypeDefinition) && !isNil(putTypeDefLine)) {
        const LINE_TEXT = textEditor.document.lineAt(putTypeDefLine).text;
        const typeDefinitionText = that.generateTypedef(fileInfo, allClassesFiles);
        console.log('Typedef:', typeDefinitionText);
        editBuilder.insert(
          new vscode.Position(
            putTypeDefLine,
            LINE_TEXT.length
          ),
          '\r\n' + typeDefinitionText
        );
      }
    }
    return that.textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
      addType(editBuilder, that.textEditor);
      addConst(editBuilder, that.textEditor);
      addTypeDefinition(editBuilder, that.textEditor);
    });
  }

  private alreadyHasRequire(
    classInfo: AdonisFileInfo,
    initialScanLine = 0,
    textDocument: vscode.TextDocument
  ) {
    const classUseStatementRegex = this.generateConstRegex(classInfo);
    const isClassDefinitionLine = this.getClassDeclarationRegex();
    let idxLine = initialScanLine;
    while (idxLine < textDocument.lineCount) {
      const currentLine: vscode.TextLine = textDocument.lineAt(idxLine);
      if (classUseStatementRegex.test(currentLine.text)) {
        // allreadyFound line to insert
        return idxLine;
      }
      if (isClassDefinitionLine.test(currentLine.text)) {
        return null;
      }
      idxLine++;
    }
    return null;
  }

  private getLineToPlaceDeclaration(initialScanLine = 0, textDocument: vscode.TextDocument) {
    const classUseStatementRegex = this.getConstDeclarationRegex();
    // eslint-disable-next-line no-useless-escape
    const isClassDefinitionLine = this.getClassDeclarationRegex();
    let idxLine = initialScanLine;
    while (idxLine < textDocument.lineCount) {
      const currentLine: vscode.TextLine = textDocument.lineAt(idxLine);
      if (classUseStatementRegex.test(currentLine.text)) {
        // allreadyFound line to insert
        return idxLine;
      }
      if (isClassDefinitionLine.test(currentLine.text)) {
        return null;
      }
      idxLine++;
    }
    return null;
  }
  private getClassDeclarationRegex() {
    // eslint-disable-next-line no-useless-escape
    return /(\/[\*]{2,}\n)|(class(.*)\{)|(\/[\*]{2,}\r\n)/gim;
  }

  private getConstDeclarationRegex() {
    // eslint-disable-next-line no-control-regex, no-useless-escape
    return /(let|const)[\s\t]*([A-z0-9]+).*\=.*(\(.*\))/gim;
  }
  private getTypeDefLine(
    textDocument: vscode.TextDocument,
    INITIAL_LINE: number,
    classInfo: AdonisFileInfo
  ) {
    const lineToInsert = INITIAL_LINE;
    let idxLine = 0;
    let firstLineEmpty = null;
    let firstTypedefImport = null;
    let allreadyImport = null;
    while (idxLine < textDocument.lineCount) {
      const currentLine = textDocument.lineAt(idxLine);
      const currentText = currentLine.text;
      const alreadyHaveTypedefs = /typedef/im.test(currentText);
      const hasUseStrict = /(use strict)/gmi.test(currentText);

      if (hasUseStrict) {
        return idxLine;
      }

      if (currentLine.isEmptyOrWhitespace && !firstLineEmpty) {
        firstLineEmpty = idxLine; // line to insert is equal empty_line `-1`
      }
      if (alreadyHaveTypedefs && !firstTypedefImport) {
        firstTypedefImport = idxLine; // line to insert is equal empty_line `-1`
      }
      const currentTypedefRegex = this.generateTypedefRegex(classInfo);
      // eslint-disable-next-line no-useless-escape
      if (currentTypedefRegex.test(currentText) && !allreadyImport) {
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

  private getRequireLine(
    textDocument: vscode.TextDocument,
    INITIAL_LINE: number,
    classInfo: AdonisFileInfo
  ) {
    let lineToInsert = INITIAL_LINE;
    let idxLine = 1;
    let firstClassOrExport = null;
    let firstMultilineCommentBeforeClass = null;
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
        lineToInsert = null;
      }

      if (
        this.commentLineRegex.test(currentLineText ?? '') &&
        !firstMultilineCommentBeforeClass &&
        !firstClassOrExport
      ) {
        firstMultilineCommentBeforeClass = idxLine - 1; // line to insert is equal empty_line `-1`
      }

      if (currentLineText.match(/(class)|(export)|({\n)/im) && !firstClassOrExport) {
        firstClassOrExport = idxLine; // line to insert is equal empty_line `-1`
      }
      idxLine++;
    }
    if (lastUseOrRequire) {
      lineToInsert = lastUseOrRequire;
    } else if (firstMultilineCommentBeforeClass) {
      lineToInsert = firstMultilineCommentBeforeClass;
    } else if (firstClassOrExport) {
      lineToInsert = firstClassOrExport;
    } else if (firstEmtpyLine) {
      lineToInsert = firstEmtpyLine;
    }

    return lineToInsert;
  }
  /**
   * this function traverse all lines of file searching for a typedef declaration if it found a class declaration it stops and return null
   * @param  {vscode.TextDocument} textDocument
   * @param  {number} lineOfConstRequire
   * @param  {AdonisFileInfo} classInfo
   */
  private alreadyHasTypedefinition(
    textDocument: vscode.TextDocument,
    lineOfConstRequire: number,
    classInfo: AdonisFileInfo
  ) {
    const classUseStatementRegex = this.generateTypedefRegex(classInfo);
    const isClassDefinitionLine = this.getClassDeclarationRegex();

    let idxLine = 0;
    while (idxLine < textDocument.lineCount) {
      const currentLine: vscode.TextLine = textDocument.lineAt(idxLine);
      if (classUseStatementRegex.test(currentLine.text)) {
        // allreadyFound line to insert
        return idxLine;
      }
      if (isClassDefinitionLine.test(currentLine.text)) {
        return null;
      }
      idxLine++;
    }
    return null;
  }
  private alreadyHasType(
    textDocument: vscode.TextDocument,
    lineOfConstRequire: number,
    classInfo: AdonisFileInfo
  ) {
    const classUseStatementRegex = this.generateTypeRegex(classInfo);
    const isClassDefinitionLine = this.getClassDeclarationRegex();

    let idxLine = 0;
    while (idxLine < textDocument.lineCount) {
      const currentLine: vscode.TextLine = textDocument.lineAt(idxLine);
      if (classUseStatementRegex.test(currentLine.text)) {
        // allreadyFound line to insert
        return idxLine;
      }
      if (isClassDefinitionLine.test(currentLine.text)) {
        return null;
      }
      idxLine++;
    }
    return null;
  }

  private getConstIdx(
    textDocument: vscode.TextDocument,
    lineOfConstRequire: number,
    classInfo: AdonisFileInfo
  ) {
    const isClassDefinitionLine = /(^class[\s\t]+)/im;
    const typeStatementRegex = this.generateTypeRegex(classInfo);
    const someConstImport = this.getConstDeclarationRegex();
    let lineIdx = 0;
    while (lineIdx < textDocument.lineCount) {
      const text = textDocument.lineAt(lineIdx).text;
      if (someConstImport.test(text)) {
        return lineIdx;
      }
      if (typeStatementRegex.test(text)) {
        // allreadyFound line to insert
        return lineIdx;
      }
      if (isClassDefinitionLine.test(text)) {
        return lineIdx - 1;
      }
      lineIdx += 1;
    }
    return null;
  }

  private generateTypedef(classInfo: AdonisFileInfo, allClassesFiles: AdonisFileInfo[]) {
    let importPath = classInfo.requireRelativeToFile;
    // is a provider file
    if (importPath.includes('Program Files')) {
      const filename = path.parse(importPath).name;
      const foundedRealFile = allClassesFiles.find(fileInfo => {
        if (fileInfo.isProvider) {
          return false;
        }
        return path.parse(fileInfo.usePath).name === filename;
      });
      importPath = foundedRealFile.requireRelativeToFile;
    }
    let importSuffix = '';
    if (importPath && importPath.includes('Models')) {
      importSuffix = 'typeof ';
    }
    const template = `/** @typedef {${importSuffix}import('${importPath || null}')} ${classInfo.onlyName || null
      } */`;
    return template;
  }

  private generateConstRegex(classInfo: AdonisFileInfo): RegExp {
    return RegExp(
      // eslint-disable-next-line no-useless-escape
      `((const|let)(.*${classInfo?.onlyName ?? null}.*=.*use\\(\\'.*${classInfo.onlyName}.*\\'.*\\)))`,
      'mi'
    );
  }

  private generateTypedefRegex(classInfo: AdonisFileInfo): RegExp {
    return RegExp(
      // eslint-disable-next-line no-useless-escape
      `(.*@typedef.*\\{.*\\/${classInfo.onlyName}.*\\s${classInfo.onlyName}\\s)`,
      'mi'
    );
  }

  private generateTypeRegex(classInfo: AdonisFileInfo): RegExp {
    return RegExp(
      // eslint-disable-next-line no-useless-escape
      `[\/*\s]*@type.*[\{\s]+${classInfo.onlyName}[\}\s]+.*\\*\/`,
      'mi'
    );
  }

  private makeDeclarationText(classInfo: AdonisFileInfo): any {
    let declarationName = classInfo.onlyName ?? null;
    if (classInfo.isProvider) {
      declarationName = classInfo.relativePathName;
    }
    return `const ${declarationName} = use('${classInfo.getUsePath() || null}')`;
  }
  private generateTypeText(classInfo: AdonisFileInfo): any {
    return `/** @type {${classInfo.onlyName || null}} */`;
  }
}
