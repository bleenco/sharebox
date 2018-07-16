import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ApiService } from './services/api.service';
import { DataService } from './services/data.service';

import { AppComponent } from './app.component';
import { BrowseComponent } from './browse/browse.component';
import { HeaderComponent } from './header/header.component';
import { FilesFilterPipe } from './pipes/files-filter.pipe';
import { FoldersFilterPipe } from './pipes/folders-filter.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';

@NgModule({
  declarations: [
    AppComponent,
    BrowseComponent,
    HeaderComponent,
    FilesFilterPipe,
    FoldersFilterPipe,
    FileSizePipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    ApiService,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
