/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ModalViewScheduleComponent} from './modal-view-schedule.component';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {DataService} from '../../../../core/services/data.service';

describe('ModalViewScheduleComponent', () => {
    let component: ModalViewScheduleComponent;
    let fixture: ComponentFixture<ModalViewScheduleComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ModalViewScheduleComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule],
            providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalViewScheduleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
