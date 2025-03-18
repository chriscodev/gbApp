/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ModalSpStatusComponent} from './modal-sp-status.component';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {DataService} from '../../../../../core/services/data.service';

describe('ModalSpViewschedComponent', () => {
    let component: ModalSpStatusComponent;
    let fixture: ComponentFixture<ModalSpStatusComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ModalSpStatusComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule],
            providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalSpStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
