/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {HeaderComponent} from './header.component';
import {ApiService} from '../../../core/services/api.service';
import {DataService} from '../../../core/services/data.service';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
    declarations: [HeaderComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [ApiService, DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
    }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
        expect(component).toBeTruthy();
        const apiService: ApiService = TestBed.inject(ApiService);
        expect(apiService).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});

