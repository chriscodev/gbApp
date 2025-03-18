import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportVp1EmbeddersComponent } from './modal-transport-vp1-embedders.component';

describe('ModalTransportVp1EmbeddersComponent', () => {
  let component: ModalTransportVp1EmbeddersComponent;
  let fixture: ComponentFixture<ModalTransportVp1EmbeddersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportVp1EmbeddersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportVp1EmbeddersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
