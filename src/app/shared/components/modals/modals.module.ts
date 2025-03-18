// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {ModalFooterAddDeleteFileComponent} from './modal-footer-add-delete-file/modal-footer-add-delete-file.component';
import {SlideTabComponent} from 'src/app/shared/components/slide-tab/slide-tab.component';
import {MatSliderModule} from '@angular/material/slider';
import {ModalDynamicTbTranslateComponent} from './modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {NavSliderComponent} from '../nav-slider/nav-slider.component';
import {NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalSimpleTableComponent} from './modal-simple-table/modal-simple-table.component';
import {MatSortModule} from '@angular/material/sort';

@NgModule({

  declarations: [ModalDynamicTbTranslateComponent, ModalFooterAddDeleteFileComponent, SlideTabComponent, NavSliderComponent, ModalSimpleTableComponent],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatSliderModule,
    NgbNavModule,
    MatSortModule
  ],

  exports: [ModalDynamicTbTranslateComponent, ModalFooterAddDeleteFileComponent, SlideTabComponent, NavSliderComponent, ModalSimpleTableComponent],

})
export class ModalsModule {
}
