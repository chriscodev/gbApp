import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalEditPsiSettingsComponent } from './modal-edit-psi-settings.component';

describe('ModalEditPsiSettingsComponent', () => {
  let component: ModalEditPsiSettingsComponent;
  let fixture: ComponentFixture<ModalEditPsiSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEditPsiSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditPsiSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
