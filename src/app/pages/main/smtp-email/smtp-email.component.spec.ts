
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmtpEmailComponent } from './smtp-email.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from '../../../core/services/data.service';

describe('SmtpEmailComponent', () => {
  let component: SmtpEmailComponent;
  let fixture: ComponentFixture<SmtpEmailComponent>;

  beforeEach((() => {
        TestBed.configureTestingModule({
    declarations: [SmtpEmailComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
            .compileComponents();
    }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmtpEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
        expect(component).toBeTruthy();
        const dataService: DataService = TestBed.inject(DataService);
        expect(dataService).toBeTruthy();
    });
});
