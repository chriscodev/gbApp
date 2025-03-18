import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsAtsc1UdpComponent } from './modal-outputs-atsc1-udp.component';

describe('ModalOutputsAtsc1UdpComponent', () => {
  let component: ModalOutputsAtsc1UdpComponent;
  let fixture: ComponentFixture<ModalOutputsAtsc1UdpComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalOutputsAtsc1UdpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOutputsAtsc1UdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
