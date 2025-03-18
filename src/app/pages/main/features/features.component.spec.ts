
// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import { ComponentFixture, TestBed} from '@angular/core/testing';
import {DataService} from 'src/app/core/services/data.service';
import {FeaturesComponent} from './features.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('FeaturesComponent', () => {
    let component: FeaturesComponent;
    let fixture: ComponentFixture<FeaturesComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [FeaturesComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FeaturesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
