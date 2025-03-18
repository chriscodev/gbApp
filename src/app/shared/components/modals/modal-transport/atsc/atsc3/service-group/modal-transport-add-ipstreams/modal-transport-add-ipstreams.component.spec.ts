// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import { ComponentFixture, TestBed} from '@angular/core/testing';
import {ModalTransportAddIPStreamsComponent} from './modal-transport-add-ipstreams.component';

describe('ModalTransportAddIpstreamsComponent', () => {
    let component: ModalTransportAddIPStreamsComponent;
    let fixture: ComponentFixture<ModalTransportAddIPStreamsComponent>;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [ModalTransportAddIPStreamsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalTransportAddIPStreamsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
