import { Injectable } from '@angular/core';

@Injectable()
export class ModalHelperService {

  isAllSelected(selection, dataSource) {
    const numSelected = selection.selected.length;
    const numRows = dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(selection, dataSource) {
    this.isAllSelected(selection, dataSource)
    ? selection.clear()
    : dataSource.data.forEach(row => selection.select(row));
  }

  filter() {
    console.log('filtering ....');
  }
  
  sort() {
    console.log('sorting ....');
  }

  save() {
    console.log('Saving....');
  }
}