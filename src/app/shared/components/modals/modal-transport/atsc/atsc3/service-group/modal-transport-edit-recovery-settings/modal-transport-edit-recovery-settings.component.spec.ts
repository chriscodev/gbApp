import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportEditRecoverySettingsComponent } from './modal-transport-edit-recovery-settings.component';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
describe('ModalTransportEditRecoverySettingsComponent', () => {
  let component: ModalTransportEditRecoverySettingsComponent;
  let fixture: ComponentFixture<ModalTransportEditRecoverySettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalTransportEditRecoverySettingsComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportEditRecoverySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
