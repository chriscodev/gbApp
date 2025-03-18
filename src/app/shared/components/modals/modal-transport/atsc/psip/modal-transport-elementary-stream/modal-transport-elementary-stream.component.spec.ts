import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportElementaryStreamComponent } from './modal-transport-elementary-stream.component';

describe('ModalTransportElementaryStreamComponent', () => {
  let component: ModalTransportElementaryStreamComponent;
  let fixture: ComponentFixture<ModalTransportElementaryStreamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportElementaryStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportElementaryStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
