/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from '../../../../../core/services/data.service';
import {ModalOutputsTransportSelectComponent} from './modal-outputs-transport-select.component';

describe('ModalOutputsTransportSelectNewComponent', () => {
    let component: ModalOutputsTransportSelectComponent;
    let fixture: ComponentFixture<ModalOutputsTransportSelectComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
    declarations: [ModalOutputsTransportSelectComponent],
    imports: [],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalOutputsTransportSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const Dataservice: DataService = TestBed.inject(DataService);
        expect(Dataservice).toBeTruthy();
    });
});
