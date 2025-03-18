/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {DataService} from '../../../../../../../../core/services/data.service';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModalTransportEditEsgSettingsComponent} from './modal-transport-edit-esg-settings.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ModalTransportEditEsgSettingsComponent', () => {
    let component: ModalTransportEditEsgSettingsComponent;
    let fixture: ComponentFixture<ModalTransportEditEsgSettingsComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [ModalTransportEditEsgSettingsComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalTransportEditEsgSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();

    });
});
