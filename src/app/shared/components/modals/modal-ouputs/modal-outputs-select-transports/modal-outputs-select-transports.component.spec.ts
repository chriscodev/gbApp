import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsSelectTransportsComponent } from './modal-outputs-select-transports.component';

describe('ModalOutputsSelectTransportsNewComponent', () => {
  let component: ModalOutputsSelectTransportsComponent;
  let fixture: ComponentFixture<ModalOutputsSelectTransportsComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ModalOutputsSelectTransportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsSelectTransportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
