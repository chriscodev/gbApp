import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsViewSelectedTransportComponent } from './modal-outputs-view-selected-transport.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataService } from 'src/app/core/services/data.service';

describe('ModalOutputsViewSelectedTransportComponent', () => {
  let component: ModalOutputsViewSelectedTransportComponent;
  let fixture: ComponentFixture<ModalOutputsViewSelectedTransportComponent>;
  const mockTSID = 0;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ModalOutputsViewSelectedTransportComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule],
    providers: [DataService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOutputsViewSelectedTransportComponent);
    component = fixture.componentInstance;
    component.viewTransportObj.tsid = mockTSID;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.viewTransportObj.tsid = mockTSID;
    const dataService: DataService = TestBed.inject(DataService);
    expect(dataService).toBeTruthy();
  });
});
