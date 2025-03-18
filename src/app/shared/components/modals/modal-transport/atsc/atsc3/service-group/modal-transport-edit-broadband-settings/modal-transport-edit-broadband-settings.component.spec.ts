import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportEditBroadbandSettingsComponent } from './modal-transport-edit-broadband-settings.component';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
describe('ModalTransportEditBroadbandSettingsComponent', () => {
  let component: ModalTransportEditBroadbandSettingsComponent;
  let fixture: ComponentFixture<ModalTransportEditBroadbandSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalTransportEditBroadbandSettingsComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportEditBroadbandSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
