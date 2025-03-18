import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportSelectMediaStreamComponent } from './modal-transport-select-media-stream.component';

describe('ModalTransportSelectMediaStreamComponent', () => {
  let component: ModalTransportSelectMediaStreamComponent;
  let fixture: ComponentFixture<ModalTransportSelectMediaStreamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportSelectMediaStreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportSelectMediaStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
