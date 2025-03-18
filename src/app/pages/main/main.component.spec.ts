/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersService } from '../../core/services/user.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
    declarations: [MainComponent],
    imports: [ReactiveFormsModule,
        FormsModule],
    providers: [UsersService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const uService: UsersService = TestBed.inject(UsersService);
    expect(uService).toBeTruthy();
  });
});
