import * as vscode from 'vscode';
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
    const constUseText = this.makeDeclarationText(fileInfo);
    const typeText = this.generateTypeText(fileInfo);
    const typedefText = this.generateTypedef(fileInfo, allClassesFiles);

    const hasUseStrict = this.textEditor.document.lineAt(1).text.includes('strict');

    const FIRST_LINE = 1;
    const AFTER_USE_STRICT = FIRST_LINE + 1;
    const INITIAL_LINE = hasUseStrict ? AFTER_USE_STRICT : FIRST_LINE;
    const hasAdonisUse = this.hasUseStatement(fileInfo, INITIAL_LINE, this.textEditor.document);
    let useLine = INITIAL_LINE;
    // should reuse existing adonis use() statement
    if (hasAdonisUse) {
      useLine = hasAdonisUse;
    } else {
      useLine = this.getLineToPlaceDeclaration(INITIAL_LINE, this.textEditor.document);
    }
    const hasTypeDef = this.hasTypeDef(this.textEditor.document, useLine, fileInfo);
    const hasTypeLine = this.hasTypeLine(this.textEditor.document, FIRST_LINE, fileInfo);
    const putTypedefLine = this.getTypeDefLine(this.textEditor.document, INITIAL_LINE, fileInfo);

    console.log('Typedef:', typedefText);
    console.log('Type:', typeText);
    console.log('Const:', constUseText);

    return this.textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
      if (!hasTypeDef && putTypedefLine) {
        editBuilder.insert(
          new vscode.Position(
            putTypedefLine,
            this.textEditor.document.lineAt(putTypedefLine).text.length
          ),
          '\r\n' + typedefText
        );
      }
      if (!hasAdonisUse && useLine) {
        let requireText = '\r\n' + constUseText;
        if (!hasTypeLine) {
          requireText = '\r\n' + typeText + '\r\n' + constUseText;
        }
        editBuilder.insert(
          new vscode.Position(useLine, this.textEditor.document.lineAt(useLine).text.length),
          requireText
        );
      }
      if (useLine && !hasTypeLine && hasAdonisUse) {
        const lineBeforeConst = useLine;
        const typeTextLine = typeText + '\r\n';
        editBuilder.insert(new vscode.Position(lineBeforeConst, 0), typeTextLine);
      }
    });
  }

  private hasUseStatement(
    classInfo: AdonisFileInfo,
    initialScanLine = 0,
    textDocument: vscode.TextDocument
  ) {
    const classUseStatementRegex = this.generateUseRegex(classInfo);
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
    return /(let|const)[\s\t]*([A-z0-9]+)[\s\t]*\=[\s\t]*/gim;
  }
  private getTypeDefLine(
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
      const typedefRegex = this.generateTypedefRegex(classInfo);
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
  private hasTypeDef(
    textDocument: vscode.TextDocument,
    lineOfConstRequire: number,
    classInfo: AdonisFileInfo
  ) {
    const classUseStatementRegex = this.generateTypedefRegex(classInfo);
    const isClassDefinitionLine = this.getClassDeclarationRegex();

    let idxLine = lineOfConstRequire;
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

  private hasTypeLine(
    textDocument: vscode.TextDocument,
    lineOfConstRequire: number,
    classInfo: AdonisFileInfo
  ) {
    const typeStatementRegex = this.generateTypeRegex(classInfo);
    const isClassDefinitionLine = /class(.*)\{/im;
    let idxLine = lineOfConstRequire;
    while (idxLine < textDocument.lineCount) {
      const currentLine: vscode.TextLine = textDocument.lineAt(idxLine);
      if (typeStatementRegex.test(currentLine.text)) {
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
    const template = `/** @typedef {${importSuffix}import('${importPath || null}')} ${
      classInfo.onlyName || null
    }*/`;
    return template;
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

  private generateTypedefRegex(classInfo: AdonisFileInfo): RegExp {
    return RegExp(
      // eslint-disable-next-line no-useless-escape
      `[\/*\s]*@typedef.*${classInfo.name}.*${classInfo.onlyName}.*\\*\/`,
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
    return `/** @type {${classInfo.onlyName || null}}*/`;
  }
}
