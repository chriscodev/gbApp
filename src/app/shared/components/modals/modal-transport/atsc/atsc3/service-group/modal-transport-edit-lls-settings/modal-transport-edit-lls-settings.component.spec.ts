
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportEditLlsSettingsComponent } from './modal-transport-edit-lls-settings.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
describe('ModalTransportEditLlsSettingsComponent', () => {
  let component: ModalTransportEditLlsSettingsComponent;
  let fixture: ComponentFixture<ModalTransportEditLlsSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalTransportEditLlsSettingsComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportEditLlsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
