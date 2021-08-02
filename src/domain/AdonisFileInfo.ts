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
    try {
      return path.parse(this.rawPath).name || this.name;
    } catch (e) {
      // console.log(e);
      return '';
    }
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
    } else if (this.rawPath) {
      const filePath = path.parse(this.rawPath);
      return filePath.dir.split(/\/|\\/mi).reduceRight((acumulator, segment, idx, segments) => {
        // current segment has any app, format App and return it with previous segment
        if (segment.includes('app') || segment.includes('App')) {
          acumulator = segment[0].toUpperCase() + segment.substring(1).toLowerCase() + '/' + acumulator;
          // continue joining all segments until have app in path
        } else if (!acumulator.includes('app') && !acumulator.includes('App')) {
          acumulator = segment + '/' + acumulator;
        }
        return acumulator;
        /* setup most rigth segment as the name of file */
      }, this.onlyName());
    } else {
      throw new Error('Invalid class file path or name');
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
