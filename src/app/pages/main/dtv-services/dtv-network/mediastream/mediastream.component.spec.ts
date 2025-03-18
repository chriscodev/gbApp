// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MediaStreamComponent} from './mediastream.component';
import {DataService} from '../../../../../core/services/data.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MediaStreamService} from '../../../../../core/services/media-stream.service';

describe('MediaStreamComponent', () => {
  let component: MediaStreamComponent;
  let fixture: ComponentFixture<MediaStreamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MediaStreamComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule],
      providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const service: MediaStreamService = TestBed.inject(MediaStreamService);
    expect(service).toBeTruthy();
    expect(service.getMediaStreams).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
