import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MainRoutingModule } from './main-routing.module';
import { BnNgIdleService } from 'bn-ng-idle';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DateTimeComponent } from './date-time/date-time.component';
import { Page404Component } from './page404/page404.component';

@NgModule({ bootstrap: [],
    declarations: [
        Page404Component,
        DateTimeComponent
    ],
    exports: [], imports: [CommonModule,
        MainRoutingModule,
        ReactiveFormsModule,
        FormsModule], providers: [BnNgIdleService, provideHttpClient(withInterceptorsFromDi())] })
export class MainModule { }
