
/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalSpTestconnectionComponent } from './modal-sp-testconnection.component';
import {  provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule,  } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {DataService} from '../../../../../core/services/data.service';

describe('ModalSpTestconnectionComponent', () => {
  let component: ModalSpTestconnectionComponent;
  let fixture: ComponentFixture<ModalSpTestconnectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalSpTestconnectionComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpTestconnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
