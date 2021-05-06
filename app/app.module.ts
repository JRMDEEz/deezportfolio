import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { APP_BASE_HREF } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalUploadComponent } from './views/modals/upload/upload.component';
import { MaterialModule } from './material.module';
@NgModule({
  declarations: [AppComponent, ModalUploadComponent],
  bootstrap: [AppComponent],
  imports: [
    MaterialModule,
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    BsDropdownModule.forRoot(),
    ModalUploadComponent
  ],
  entryComponents: [ModalUploadComponent],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
})
export class AppModule {}
