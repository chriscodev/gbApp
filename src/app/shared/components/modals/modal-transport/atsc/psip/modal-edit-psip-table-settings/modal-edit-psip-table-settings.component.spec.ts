import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalEditPsipTableSettingsComponent } from './modal-edit-psip-table-settings.component';
describe('ModalEditPsipTableSettingsComponent', () => {
  let component: ModalEditPsipTableSettingsComponent;
  let fixture: ComponentFixture<ModalEditPsipTableSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEditPsipTableSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditPsipTableSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
