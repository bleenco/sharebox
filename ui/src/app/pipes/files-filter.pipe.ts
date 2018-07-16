import { Pipe, PipeTransform } from '@angular/core';
import { FileInfo } from '../services/data.service';

@Pipe({
  name: 'filesFilter',
  pure: false
})
export class FilesFilterPipe implements PipeTransform {

  transform(items: FileInfo[], showHidden: boolean): any {
    if (!items) {
      return items;
    }

    if (!showHidden) {
      items = items.filter(item => !item.filename.startsWith('.'));
    }

    return items.filter(item => !item.stat.isdir);
  }

}
