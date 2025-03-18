import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalSpSelectxsltComponent } from './modal-sp-selectxslt.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
describe('ModalSpSelectxsltComponent', () => {
  let component: ModalSpSelectxsltComponent;
  let fixture: ComponentFixture<ModalSpSelectxsltComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalSpSelectxsltComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpSelectxsltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.get(DataService);
    expect(dataService).toBeTruthy();
  });
});
