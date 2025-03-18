import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsSelectTransportTypeComponent } from './modal-outputs-select-transport-type.component';

describe('ModalOutputsSelectTransportTypeComponent', () => {
  let component: ModalOutputsSelectTransportTypeComponent;
  let fixture: ComponentFixture<ModalOutputsSelectTransportTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsSelectTransportTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsSelectTransportTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
