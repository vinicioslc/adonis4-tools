'use strict';

import {
  workspace,
  Position,
  Range,
  CancellationToken,
  DocumentLink,
  DocumentLinkProvider,
  TextDocument,
  Uri,
  ProviderResult,
  commands
} from 'vscode';

import * as util from '../util';

export class LinkProvider implements DocumentLinkProvider {
  /**
   * provideDocumentLinks
   */
  public provideDocumentLinks(
    document: TextDocument,
    token: CancellationToken
  ): ProviderResult<DocumentLink[]> {
    const documentLinks = [];
    let index = 0;
    const reg = /(['"])[^'"]*\1/g;
    while (index < document.lineCount) {
      const line = document.lineAt(index);
      const result = line.text.match(reg);
      if (result !== null) {
        for (const item of result) {
          const splitted = item.replace(/"|'/g, '').split('.');
          if (splitted.length !== 2) {
            //Search for the Controller keyword in the string name
            if (splitted[0].includes('Controller')) {
              //In this case, because there is no method definition in routes
              //we send it to the index method by default
              splitted[1] = 'index';
            } else {
              continue;
            }
          }

          const filePath = util.getFilePath(splitted[0], document);

          if (filePath !== null) {
            const start = new Position(line.lineNumber, line.text.indexOf(item) + 1);
            const end = start.translate(0, item.length - 2);
            const documentLink = new util.AdonisJSControllerLink(
              new Range(start, end),
              filePath,
              splitted[0],
              splitted[1]
            );
            documentLinks.push(documentLink);
          }
        }
      }
      index++;
    }
    return documentLinks;
  }

  /**
   * resolveDocumentLink
   */
  public resolveDocumentLink(
    link: util.AdonisJSControllerLink,
    token: CancellationToken
  ): ProviderResult<DocumentLink> {
    const lineNum = util.getLineNumber(link.funcName, link.filePath);
    let filePath = link.filePath;
    if (lineNum !== -1) {
      filePath += '#' + lineNum;
    }

    link.target = Uri.parse('file:' + filePath);
    return link;
  }
}
