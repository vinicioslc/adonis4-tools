import { CancellationToken, GlobPattern, Uri } from "vscode";
import { AdonisFileInfo as AdonisFileInfo } from "../domain/AdonisFileInfo";
import * as path from "path";

type FindFiles = (
	include: GlobPattern,
	exclude?: GlobPattern | null,
	maxResults?: number,
	token?: CancellationToken
) => Thenable<Uri[]>;

const filterSegmentsTrash: any = (val) => {
	return val.length > 2 && val != "Http" && val != "Ws";
};

function classifySymbolType(path) {
	let found = "class";
	const pathSegments = path
		.split(RegExp("(\\\\|\\/)+", "gmi"))
		.filter(filterSegmentsTrash);
	found = pathSegments[pathSegments.length - 2];
	return found;
}

export default class ClassResolverGateway {
	#findFilesFunc: FindFiles;
	constructor(findFilesFunc: FindFiles) {
		this.#findFilesFunc = findFilesFunc;
	}

	async findFilesByGlobs(
		include: GlobPattern | GlobPattern[][],
		exclude?: GlobPattern | null
	): Promise<AdonisFileInfo[]> {
		const allFiles = [];
		if (Array.isArray(include)) {
			for (const idx in include) {
				if (include[idx]) {
					allFiles.push(
						...(await this.searchFilesByGlob(include[idx][0], include[idx][1]))
					);
				}
			}
		} else {
			allFiles.push(...(await this.searchFilesByGlob(include, exclude)));
		}
		return allFiles;
	}

	private async searchFilesByGlob(
		include: GlobPattern,
		exclude: GlobPattern
	): Promise<AdonisFileInfo[]> {
		return (await this.#findFilesFunc(include, exclude)).map((val) => {
			return new AdonisFileInfo(
				path.basename(val.fsPath),
				val.fsPath,
				classifySymbolType(val.fsPath)
			);
		});
	}
}