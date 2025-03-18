// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import { ComponentFixture, TestBed} from '@angular/core/testing';
import {ModalTransportAtsc3TransportStreamComponent} from './modal-transport-atsc3-transport-stream.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {DataService} from '../../../../../../../core/services/data.service';

describe('ModalTransportAtsc3TransportStreamComponent', () => {
    let component: ModalTransportAtsc3TransportStreamComponent;
    let fixture: ComponentFixture<ModalTransportAtsc3TransportStreamComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [ModalTransportAtsc3TransportStreamComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalTransportAtsc3TransportStreamComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
