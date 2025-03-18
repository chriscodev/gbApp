/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalServiceExportListComponent} from './modal-service-export-list.component';

describe('ModalExportServicesComponent', () => {
  let component: ModalServiceExportListComponent;
  let fixture: ComponentFixture<ModalServiceExportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalServiceExportListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ModalServiceExportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
