// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ServiceGroupSettingsComponent} from './service-group-settings.component';

describe('SettingsComponent', () => {
    let component: ServiceGroupSettingsComponent;
    let fixture: ComponentFixture<ServiceGroupSettingsComponent>;

    beforeEach( () => {
        TestBed.configureTestingModule({
            imports: [ServiceGroupSettingsComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ServiceGroupSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
