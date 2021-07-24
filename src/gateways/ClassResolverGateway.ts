import { CancellationToken, GlobPattern, Uri } from 'vscode';
import * as path from 'path';
import { ClassMetaInfo as ClassMetaInfo } from '../domain/ClassMetadata';


type FindFiles = (include: GlobPattern, exclude?: GlobPattern | null, maxResults?: number, token?: CancellationToken) => Thenable<Uri[]>

const filterSegmentsTrash: any = (val) => {
	return val.length > 2 && val != 'Http' && val != 'Ws';
};
function classifySymbolType(path) {
	let found = 'class';
	const pathSegments = path.split(RegExp('(\\\\|\\/)+', 'gmi')).filter(filterSegmentsTrash);
	found = pathSegments[pathSegments.length - 2];
	return found;
}

export default class ClassResolverGateway {
	#findFilesFunc: FindFiles;
	constructor(findFilesFunc: FindFiles) {
		this.#findFilesFunc = findFilesFunc;
	}

	async findClasses(include: GlobPattern, exclude?: GlobPattern): Promise<ClassMetaInfo[]> {
		return (await this.#findFilesFunc(include, exclude)).map(val => {
			return new ClassMetaInfo(path.basename(val.fsPath), val.fsPath, classifySymbolType(val.fsPath));
		});
	}

}