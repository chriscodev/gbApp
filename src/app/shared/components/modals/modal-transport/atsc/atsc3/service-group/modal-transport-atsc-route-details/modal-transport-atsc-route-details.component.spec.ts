import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportAtscRouteDetailsComponent } from './modal-transport-atsc-route-details.component';

describe('ModalTransportAtscRouteDetailsComponent', () => {
  let component: ModalTransportAtscRouteDetailsComponent;
  let fixture: ComponentFixture<ModalTransportAtscRouteDetailsComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportAtscRouteDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportAtscRouteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
