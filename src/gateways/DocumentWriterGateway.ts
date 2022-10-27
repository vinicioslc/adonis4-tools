import * as vscode from 'vscode';
import * as path from 'path';

import { AdonisFileInfo as AdonisFileInfo } from '../domain/AdonisFileInfo';

export default class DocumentWriterGateway {
  #textEditor: vscode.TextEditor
  currentRequireIndex: number

  private readonly commentLineRegex = /(\/\*)(?!.*@ty)/im

  constructor(textEditor: vscode.TextEditor) {
    this.#textEditor = textEditor;
  }

  async writeImportStatement(fileInfo: AdonisFileInfo, allClassesFiles: AdonisFileInfo[]) {
    const constUseText = this.makeDeclarationText(fileInfo);
    const constTypeText = this.generateSetTypeText(fileInfo);
    const typedefText = this.#generateTypedef(fileInfo, allClassesFiles);

    const hasUseStrict = this.#textEditor.document.lineAt(1).text.includes('strict');
    const AFTER_USE_STRICT = 2;
    const FIRST_LINE = 1;
    const INITIAL_LINE = hasUseStrict ? AFTER_USE_STRICT : FIRST_LINE;
    const hasAdonisUse = this.hasUseStatement(fileInfo, INITIAL_LINE, this.#textEditor.document);
    let lineInsertAdonisUse = INITIAL_LINE;
    // should reuse existing adonis use() statement
    if (hasAdonisUse) {
      lineInsertAdonisUse = hasAdonisUse;
    } else {
      lineInsertAdonisUse = this.getLineToInsertRequire(
        this.#textEditor.document,
        INITIAL_LINE,
        fileInfo
      );
    }
    const lineInsertDeclarationType = this.getLineToInsertType(
      this.#textEditor.document,
      lineInsertAdonisUse,
      fileInfo
    );
    const lineInsertTypedefinition = this.getLineToTypeDef(
      this.#textEditor.document,
      INITIAL_LINE,
      fileInfo
    );

    console.log('Class Data:', typedefText);
    console.log('Import Type Text:', constTypeText);
    console.log('Import Text:', constUseText);

    return this.#textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
      if (lineInsertTypedefinition) {
        editBuilder.insert(new vscode.Position(lineInsertTypedefinition, 0), '\r\n' + typedefText);
      }
      if (lineInsertDeclarationType) {
        editBuilder.insert(
          new vscode.Position(
            lineInsertDeclarationType,
            this.#textEditor.document.lineAt(lineInsertDeclarationType).text.length
          ),
          '\r\n' + constTypeText
        );
      }
      if (!hasAdonisUse && lineInsertAdonisUse) {
        editBuilder.insert(new vscode.Position(lineInsertAdonisUse, 0), constUseText + '\r\n');
      }
    });
  }

  private hasUseStatement(
    classInfo: AdonisFileInfo,
    initialScanLine = 0,
    textDocument: vscode.TextDocument
  ) {
    const classUseStatementRegex = this.generateUseRegex(classInfo);
    const isClassDefinitionLine = /class(.*)\{/im;
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

  private getLineToTypeDef(
    textDocument: vscode.TextDocument,
    INITIAL_LINE: number,
    classInfo: AdonisFileInfo
  ) {
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
      if (currentLine.text.match(/typedef/im) && !firstTypedefImport) {
        firstTypedefImport = idxLine; // line to insert is equal empty_line `-1`
      }
      const typedefRegex = '@typedef.*' + classInfo.name + '.*' + classInfo.onlyName + '.*\\*\\/$';
      // eslint-disable-next-line no-useless-escape
      if (currentLine.text.match(RegExp(typedefRegex, 'mi')) && !allreadyImport) {
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

  private getLineToInsertRequire(
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

  private getLineToInsertType(
    textDocument: vscode.TextDocument,
    lineToInsertRequire: number,
    classInfo: AdonisFileInfo
  ) {
    let lineFound = null;

    if (lineToInsertRequire) {
      const currentLine = lineToInsertRequire - 1;
      const cRowText = textDocument.lineAt(currentLine).text;
      if (cRowText.includes(classInfo.onlyName)) return null;
      lineFound = lineToInsertRequire - 1;
    } else if (this.currentRequireIndex) {
      const currentLine = this.currentRequireIndex - 1;
      const cRowText = textDocument.lineAt(currentLine).text;
      if (cRowText.includes(classInfo.onlyName)) return null;
      lineFound = this.currentRequireIndex - 1;
    }
    return lineFound;
  }

  #generateTypedef(classInfo: AdonisFileInfo, allClassesFiles: AdonisFileInfo[]) {
    let realPath = classInfo.relativePathToFile;
    // is a provider file
    if (realPath.includes('Program Files')) {
      const filename = path.parse(realPath).name;
      const foundedRealFile = allClassesFiles.find(fileInfo => {
        if (fileInfo.isProvider) {
          return false;
        }
        return path.parse(fileInfo.usePath).name === filename;
      });
      realPath = foundedRealFile.relativePathToFile;
    }
    let stringTypeOf = '';
    if (realPath && realPath.includes('Models')) {
      stringTypeOf = 'typeof ';
    }
    if (realPath && realPath.split(path.sep).length <= 1) {
      realPath = '.' + path.posix.sep + realPath;
    }
    const template = `/** @typedef {${stringTypeOf}import('${realPath || null}')} ${
      classInfo.onlyName || null
    }*/
`;
    return template;
  }

  private makeDeclarationText(classInfo: AdonisFileInfo): any {
    let declarationName = classInfo.onlyName ?? null;
    if (classInfo.isProvider) {
      declarationName = classInfo.relativePathName;
    }
    return `const ${declarationName} = use('${classInfo.getUsePath() || null}')`;
  }

  private generateUseRegex(classInfo: AdonisFileInfo): RegExp {
    return RegExp(
      // eslint-disable-next-line no-useless-escape
      `(const|let) ${classInfo?.onlyName ?? null} = use\\('${
        classInfo?.getUsePath()?.split('\\/')?.join('/') ?? null
      }'\\)`,
      'mi'
    );
  }

  private generateSetTypeText(classInfo: AdonisFileInfo): any {
    return `
/** @type {${classInfo.onlyName || null}}*/`;
  }
}
