import { NgModule } from '@angular/core';


import { MatButtonModule, MatDialogModule, MatTableModule, MatCheckboxModule } from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatDialogModule,
  MatTableModule,
  MatCheckboxModule
];

@NgModule({
  imports: materialModules,
  exports: materialModules
})
export class MaterialModule {}
