import { QuickPickItem } from 'vscode';
import * as path from 'path';


export class AdonisFileInfo {
	name: string;
	rawPath: string;
	usePath: string;

	constructor(name, rawPath, useName) {
		this.name = name;
		this.rawPath = rawPath;
		this.usePath = useName;
		return this;
	}


	onlyName() {
		return path.parse(this.rawPath).name || this.name;
	}

	/**
	 * Tranform Adonis Files from full path `/home/repo/app/services/service.js` to an
	 * relative to path like `../../services/service.js`
	 * @param  {} relativeTo
	 */
	getRelativePathToFolder(relativeTo) {
		return path.normalize(path.relative(relativeTo, this.rawPath)
			.substring(3))
			.split("\\")
			.join("/");
	}

	/**
	 * Build and return the adonis use() path like `App\Services\Http`
	 */
	getUsePath() {
		// when its a provider returns the saved namespace
		// TODO: Remove this check from here all the data must be normalized before show to user
		// after user select option the extension must use only the data from quickpicker
		if (this.name && /provider/mi.test(this.name)) {
			return this.usePath;
		} else {
			const filePath = path.parse(this.rawPath);
			return filePath.dir.split(/\/|\\/mi).reduceRight((previous, current, index) => {
				// current segment has any app, format App and return it with previous segment 
				if (current.includes('app') || current.includes('App')) {
					previous = current[0].toUpperCase() + current.substring(1).toLowerCase() + '/' + previous;
					// continue joining all segments until have app in path 
				} else if (!previous.includes('app') && !previous.includes('App')) {
					previous = current + '/' + previous;
				}
				return previous;
			}, this.onlyName());
		}
	}

	static fromQuickPickItem(item: QuickPickItem): AdonisFileInfo {
		return new AdonisFileInfo(
			item.label,
			item.detail,
			item.description,
		);
	}
}
