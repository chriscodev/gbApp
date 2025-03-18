import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalNetworksTransportLinkProgramComponent } from './modal-networks-transport-link-program.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
describe('ModalNetworksTransportLinkProgramComponent', () => {
  let component: ModalNetworksTransportLinkProgramComponent;
  let fixture: ComponentFixture<ModalNetworksTransportLinkProgramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalNetworksTransportLinkProgramComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNetworksTransportLinkProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
