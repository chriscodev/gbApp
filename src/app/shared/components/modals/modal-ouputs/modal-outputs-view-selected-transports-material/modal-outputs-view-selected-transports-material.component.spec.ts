import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalOutputsViewSelectedTransportsMaterialComponent } from './modal-outputs-view-selected-transports-material.component';

describe('ModalOutputsViewSelectedTransportsMaterialComponent', () => {
  let component: ModalOutputsViewSelectedTransportsMaterialComponent;
  let fixture: ComponentFixture<ModalOutputsViewSelectedTransportsMaterialComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ModalOutputsViewSelectedTransportsMaterialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsViewSelectedTransportsMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
