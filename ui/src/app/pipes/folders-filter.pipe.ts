import { Pipe, PipeTransform } from '@angular/core';
import { FileInfo } from '../services/data.service';

@Pipe({
  name: 'foldersFilter',
  pure: false
})
export class FoldersFilterPipe implements PipeTransform {

  transform(items: FileInfo[], showHidden: boolean): any {
    if (!items) {
      return items;
    }

    if (!showHidden) {
      items = items.filter(item => !item.filename.startsWith('.'));
    }

    return items.filter(item => !!item.stat.isdir);
  }

}
