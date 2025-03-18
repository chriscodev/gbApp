/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import { ComponentFixture, TestBed} from '@angular/core/testing';
import {ModalNetworksAtscServiceComponent} from './modal-networks-atsc-service.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {DataService} from '../../../../../core/services/data.service';

describe('ModalNetworksAtscServiceComponent', () => {
  let component: ModalNetworksAtscServiceComponent;
  let fixture: ComponentFixture<ModalNetworksAtscServiceComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
    declarations: [ModalNetworksAtscServiceComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNetworksAtscServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
