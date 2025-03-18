import { DataService } from '../../../core/services/data.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificateRequestComponent } from './certificate-request.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
describe('CertificateRequestComponent', () => {
  let component: CertificateRequestComponent;
  let fixture: ComponentFixture<CertificateRequestComponent>;

  beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [CertificateRequestComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });


});
