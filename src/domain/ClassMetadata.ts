import { QuickPickItem } from 'vscode';
import * as path from 'path';


export class ClassMetaInfo {
	name: string;
	path: string;
	type: string;

	constructor(name, path, type) {
		this.name = name;
		this.path = path;
		this.type = type || 'class';
		return this;
	}


	onlyName() {
		return path.parse(this.path).name || this.name;
	}

	/**
	 * Tranform Adonis Files from full path `/home/repo/app/services/service.js` to an
	 * relative to path like `../../services/service.js`
	 * @param  {} relativeTo
	 */
	getRelativePathToFolder(relativeTo) {
		return path.normalize(path.relative(relativeTo, this.path).substring(3));
	}

	/**
	 * Build and return the adonis use() path like `App\Services\Http`
	 */
	getAdonisRegisteredPath() {
		const finded = path.parse(this.path);

		return finded.dir.split(/\/|\\/mi).reduceRight((previous, current, index) => {
			// current segment has any app, format App and return it with previous segment 
			if (current.includes('app') || current.includes('App')) {
				previous = current[0].toUpperCase() + current.substring(1).toLowerCase() + '/' + previous;
				// continue joining all segments until have app in path 
			} else if (!previous.includes('app') && !previous.includes('App')) {
				previous = current + '/' + previous;
			}
			return previous;
		}, finded.name);

	}

	static fromQuickPickItem(item: QuickPickItem): ClassMetaInfo {
		return new ClassMetaInfo(
			item.label,
			item.detail,
			item.description
		);
	}
}
