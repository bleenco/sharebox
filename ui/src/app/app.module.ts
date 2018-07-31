import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { NgxUploaderModule } from 'ngx-uploader';

import { ApiService } from './services/api.service';
import { DataService } from './services/data.service';

import { AppComponent } from './app.component';
import { BrowseComponent } from './browse/browse.component';
import { HeaderComponent } from './header/header.component';
import { FilesFilterPipe } from './pipes/files-filter.pipe';
import { FoldersFilterPipe } from './pipes/folders-filter.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { LoaderComponent } from './loader/loader.component';
import { SelectboxComponent } from './widgets/selectbox/selectbox.component';

@NgModule({
  declarations: [
    AppComponent,
    BrowseComponent,
    HeaderComponent,
    FilesFilterPipe,
    FoldersFilterPipe,
    FileSizePipe,
    LoaderComponent,
    SelectboxComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgxUploaderModule
  ],
  providers: [
    ApiService,
    DataService,
    FilesFilterPipe,
    FoldersFilterPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
