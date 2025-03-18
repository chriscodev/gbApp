// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {DataService} from '../../../../core/services/data.service';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ScheduleProviderComponent} from './schedule-provider.component';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('ScheduleProviderComponent', () => {
  let component: ScheduleProviderComponent;
  let fixture: ComponentFixture<ScheduleProviderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleProviderComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [DataService, provideHttpClient(
        withInterceptorsFromDi()), provideHttpClientTesting()]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
