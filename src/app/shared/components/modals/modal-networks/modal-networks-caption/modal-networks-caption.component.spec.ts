import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNetworksCaptionComponent } from './modal-networks-caption.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';
describe('ModalNetworksCaptionComponent', () => {
  let component: ModalNetworksCaptionComponent;
  let fixture: ComponentFixture<ModalNetworksCaptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalNetworksCaptionComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNetworksCaptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
