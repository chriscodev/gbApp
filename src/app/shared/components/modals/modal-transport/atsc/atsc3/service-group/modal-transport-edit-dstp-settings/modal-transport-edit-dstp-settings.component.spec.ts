import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalTransportEditDstpSettingsComponent } from './modal-transport-edit-dstp-settings.component';

describe('ModalTransportEditDstpSettingsComponent', () => {
  let component: ModalTransportEditDstpSettingsComponent;
  let fixture: ComponentFixture<ModalTransportEditDstpSettingsComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ModalTransportEditDstpSettingsComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ModalTransportEditDstpSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
