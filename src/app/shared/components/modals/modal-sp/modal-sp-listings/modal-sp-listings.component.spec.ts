// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ModalSpListingsComponent} from './modal-sp-listings.component';

describe('ModalSpRoviComponent', () => {
    let component: ModalSpListingsComponent;
    let fixture: ComponentFixture<ModalSpListingsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ModalSpListingsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalSpListingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
