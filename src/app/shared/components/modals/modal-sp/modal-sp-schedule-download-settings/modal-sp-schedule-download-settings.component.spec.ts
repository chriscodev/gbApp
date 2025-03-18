import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalSpScheduleDownloadSettingsComponent } from './modal-sp-schedule-download-settings.component';
describe('ModalSpScheduleDownloadSettingsComponent', () => {
  let component: ModalSpScheduleDownloadSettingsComponent;
  let fixture: ComponentFixture<ModalSpScheduleDownloadSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSpScheduleDownloadSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpScheduleDownloadSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
