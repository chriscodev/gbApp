import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsUdpRouteSelectComponent } from './modal-outputs-udp-route-select.component';

describe('ModalOutputsUdpRouteSelectComponent', () => {
  let component: ModalOutputsUdpRouteSelectComponent;
  let fixture: ComponentFixture<ModalOutputsUdpRouteSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalOutputsUdpRouteSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOutputsUdpRouteSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
