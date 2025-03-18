/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnmpComponent } from './snmp.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SnmpService } from '../../../core/services/snmp.service';
import { DataService } from '../../../core/services/data.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SnmpComponent', () => {
  let component: SnmpComponent;
  let fixture: ComponentFixture<SnmpComponent>;

  beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [SnmpComponent],
    imports: [ReactiveFormsModule],
    providers: [SnmpService, DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const Snmpservice: SnmpService = TestBed.inject(SnmpService);
    const Dataservice: DataService = TestBed.inject(DataService);
    expect(Snmpservice).toBeTruthy();
    expect(Dataservice).toBeTruthy();
  });
});
