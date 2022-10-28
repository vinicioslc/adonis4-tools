import * as lineByLine from 'n-readlines';
import * as path from 'path';
import * as vscode from 'vscode';
import { CancellationToken, GlobPattern, Uri } from 'vscode';
import { AdonisFileInfo as AdonisFileInfo, ProviderType } from '../domain/AdonisFileInfo';

type FindFiles = (
  include: GlobPattern,
  exclude?: GlobPattern | null,
  maxResults?: number,
  token?: CancellationToken
) => Thenable<Uri[]>

const filterSegmentsTrash: any = val => {
  return val.length > 2 && val != 'Http' && val != 'Ws';
};

function classifySymbolType(path) {
  let found = 'class';
  const pathSegments = path.split(RegExp('(\\\\|\\/)+', 'gmi')).filter(filterSegmentsTrash);
  found = pathSegments[pathSegments.length - 2];
  return found;
}

export default class ClassResolverGateway {
  appClassPath: string[] = ['**/app/**/*.js', '!**/app/**/*.js']
  appClassesPath = ['**/providers/**/*.js', '!**/providers/**/*.js']
  #findFilesFunc: FindFiles
  constructor(findFilesFunc: FindFiles) {
    this.#findFilesFunc = findFilesFunc;
  }

  async getAllClasses(): Promise<AdonisFileInfo[]> {
    const classes = await this.#findAndMapClasses();
    const providers = await this.#findAndMapProviders(classes);
    return [...providers, ...classes];
  }

  async #findFilesByGlobs(
    include: GlobPattern | GlobPattern[][] | string[],
    exclude?: GlobPattern | null
  ): Promise<AdonisFileInfo[]> {
    const allFiles = [];
    if (Array.isArray(include)) {
      for (const idx in include) {
        if (include[idx]) {
          allFiles.push(...(await this.#searchFilesByGlob(include[idx][0], include[idx][1])));
        }
      }
    } else {
      allFiles.push(...(await this.#searchFilesByGlob(include, exclude)));
    }
    return allFiles;
  }

  async #searchFilesByGlob(include: GlobPattern, exclude: GlobPattern): Promise<AdonisFileInfo[]> {
    return (await this.#findFilesFunc(include, exclude)).map(val => {
      return new AdonisFileInfo(
        path.basename(val.fsPath),
        val.fsPath,
        classifySymbolType(val.fsPath)
      );
    });
  }

  async #findAndMapClasses() {
    return (await this.#findFilesByGlobs([this.appClassPath])).map((file: AdonisFileInfo) => {
      file.usePath = file.getUsePath();
      file.requireRelativeToFile = path
        .normalize(
          path
            .relative(vscode.window.activeTextEditor.document.uri.fsPath, file.rawPath)
            .substring(3)
        )
        .split('\\')
        .join('/');
      return file;
    });
  }

  async #findAndMapProviders(allClassesFiles: AdonisFileInfo[]) {
    return (await this.#findFilesByGlobs([this.appClassesPath])).map((file: AdonisFileInfo) => {
      let hasRegisterFunc = null;

      let usePathFound = null;
      let requirePathFound = null;
      const current = new lineByLine(file.rawPath);

      let nextLine;
      let lineNumber = 0;
      let needIterate = true;

      while (needIterate) {
        nextLine = current.next();
        needIterate = nextLine;
        const lineString = nextLine.toString('utf-8');
        // console.log("Line " + lineNumber + ":" + lineString);
        try {
          if (hasRegisterFunc == null) {
            hasRegisterFunc = /register/im.exec(lineString);
          }
          if (hasRegisterFunc !== null && usePathFound === null) {
            const sigletonRegex = /singleton\(['"]([\w\W]+)['"]/im.exec(lineString);
            if (sigletonRegex && sigletonRegex.length >= 1) {
              // get namespace as path
              file.providerType = ProviderType.Singleton;
              usePathFound = sigletonRegex[1];
            }
            const bindableRegex = /bind\(['"]([\w\W]+)['"]/im.exec(lineString);
            if (bindableRegex && bindableRegex.length >= 1) {
              // get namespace as path
              file.providerType = ProviderType.Bind;
              usePathFound = bindableRegex[1];
            }
          }
          if (hasRegisterFunc !== null && usePathFound !== null && requirePathFound === null) {
            const requireRegex = /((require)|(app\.use))\(['"]([\w\W]+)['"]/im.exec(lineString);
            if (requireRegex && requireRegex.length > 0) {
              const reqPathFound = requireRegex[4];
              // transform '<absolute>\\sample-project\\providers\\VirtualSealsProvider.js'
              // with '<absolute>\\sample-project\\providers\\VirtualSealsProvider.js'
              // into '<absolute>\\sample-project\\providers\\VirtualSealsProvider.js'
              requirePathFound = path.normalize(
                path.join(path.parse(file.rawPath).dir, reqPathFound)
              );
            }
          }
          if (
            usePathFound !== null &&
            usePathFound.length > 0 &&
            requirePathFound !== null &&
            requirePathFound.length > 0
          ) {
            needIterate = false;

            break;
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
        lineNumber++;
      }
      const currentFilePath = vscode.window.activeTextEditor.document.fileName;
      file.usePath = usePathFound;
      if (requirePathFound) {
        const servicePath = path.normalize(requirePathFound);
        file.requireRelativeToFile = path
          .normalize(path.relative(path.parse(currentFilePath).dir, servicePath))
          .split('\\')
          .join('/');
      } else {
        console.log('Not found', requirePathFound);
        const normalized = path.normalize(file.rawPath);
        file.requireRelativeToFile = path
          .normalize(path.relative(currentFilePath, normalized))
          .split('\\')
          .join('/');
      }

      // normalize require path when file its a provider
      if (file.rawPath && file.rawPath.includes('/app/')) {
        for (const classIndex in allClassesFiles) {
          const currItem = allClassesFiles[classIndex];
          if (currItem.onlyName === file.onlyName) {
            file.rawPath = path.relative(currentFilePath, currItem.rawPath);
          }
        }
        if (!file.rawPath) {
          console.log('Not Found', file);
        }
      }

      return file;
    });
  }
}
