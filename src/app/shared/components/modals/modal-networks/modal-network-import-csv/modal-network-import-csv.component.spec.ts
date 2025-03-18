/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ModalNetworkImportCsvComponent} from './modal-network-import-csv.component';

describe('ModalNetworkImportCsvComponent', () => {
  let component: ModalNetworkImportCsvComponent;
  let fixture: ComponentFixture<ModalNetworkImportCsvComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ModalNetworkImportCsvComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNetworkImportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
