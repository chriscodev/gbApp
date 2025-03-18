// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import { ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SwUpdateComponent} from './sw-update.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SwUpdateComponent', () => {
    let component: SwUpdateComponent;
    let fixture: ComponentFixture<SwUpdateComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [SwUpdateComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SwUpdateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
