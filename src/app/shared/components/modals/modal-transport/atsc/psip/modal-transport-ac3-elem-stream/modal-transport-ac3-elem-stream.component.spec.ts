import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportAc3ElemStreamComponent } from './modal-transport-ac3-elem-stream.component';

describe('ModalTransportAc3ElemStreamComponent', () => {
  let component: ModalTransportAc3ElemStreamComponent;
  let fixture: ComponentFixture<ModalTransportAc3ElemStreamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportAc3ElemStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportAc3ElemStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
