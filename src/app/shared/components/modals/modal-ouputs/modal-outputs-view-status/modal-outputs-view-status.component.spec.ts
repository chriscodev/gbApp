import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsViewStatusComponent } from './modal-outputs-view-status.component';

describe('ModalOutputsViewStatusNewComponent', () => {
  let component: ModalOutputsViewStatusComponent;
  let fixture: ComponentFixture<ModalOutputsViewStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalOutputsViewStatusComponent]
    });
    fixture = TestBed.createComponent(ModalOutputsViewStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
