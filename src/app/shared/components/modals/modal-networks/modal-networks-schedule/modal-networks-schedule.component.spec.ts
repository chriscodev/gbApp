// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ModalNetworksScheduleComponent} from './modal-networks-schedule.component';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('ModalNetworksScheduleComponent', () => {
  let component: ModalNetworksScheduleComponent;
  let fixture: ComponentFixture<ModalNetworksScheduleComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ModalNetworksScheduleComponent],
      imports: [],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNetworksScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
