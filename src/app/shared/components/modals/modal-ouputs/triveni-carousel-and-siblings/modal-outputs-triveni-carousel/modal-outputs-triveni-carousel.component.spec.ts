/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TransportService} from '../../../../../../core/services/transport.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {DataService} from 'src/app/core/services/data.service';
import {ModalOutputsTriveniCarouselComponent} from './modal-outputs-triveni-carousel.component';

describe('ModalOutputsTriveniCarouselNewComponent', () => {
    let component: ModalOutputsTriveniCarouselComponent;
    let fixture: ComponentFixture<ModalOutputsTriveniCarouselComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [ModalOutputsTriveniCarouselComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [TransportService, DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalOutputsTriveniCarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const transService: TransportService = TestBed.inject(TransportService);
        expect(transService).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
