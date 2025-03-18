// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ActivityLogComponent} from './activity-log.component';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivityLogService} from '../../../core/services/activity-log.service';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('ActivityLogComponent', () => {
  let component: ActivityLogComponent;
  let fixture: ComponentFixture<ActivityLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityLogComponent],
      imports: [],
      providers: [ActivityLogService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const actService: ActivityLogService = TestBed.inject(ActivityLogService);
    expect(actService).toBeTruthy();
  });
});
