// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TreeGridModule} from '@syncfusion/ej2-angular-treegrid';
import {GridAllModule} from '@syncfusion/ej2-angular-grids';
import 'reflect-metadata';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MainModule } from './pages/main/main.module';
import {MatTreeModule} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';


@NgModule({ declarations: [AppComponent],
    exports: [
        MatTableModule,
        MatDialogModule,
        MatTabsModule,
        MatTreeModule,
        MatButtonModule,
        MatIcon,
        MatFormFieldModule,
        MatPaginatorModule,
        MatSelectModule,
        MatInputModule,
        BrowserModule,
        BrowserAnimationsModule,
        MatSliderModule,
        FormsModule,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        TreeGridModule,
        GridAllModule,
        MatTableModule,
        MatDialogModule,
        MatTreeModule,
        MatButtonModule,
        MatIcon,
        MatSelectModule,
        MatPaginatorModule,
        MatInputModule,
        MatTabsModule,
        MatSelectModule,
        MatSliderModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        MainModule], providers: [
        {
            provide: '',
            useValue: { baseUrl: 'https://jsonplaceholder.typicode.com' },
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {
}
