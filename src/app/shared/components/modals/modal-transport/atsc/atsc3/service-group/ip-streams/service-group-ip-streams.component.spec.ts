// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ServiceGroupIpStreamsComponent} from './service-group-ip-streams.component';

describe('IpStreamsComponent', () => {
    let component: ServiceGroupIpStreamsComponent;
    let fixture: ComponentFixture<ServiceGroupIpStreamsComponent>;

    beforeEach( () => {
        TestBed.configureTestingModule({
            imports: [ServiceGroupIpStreamsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ServiceGroupIpStreamsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
