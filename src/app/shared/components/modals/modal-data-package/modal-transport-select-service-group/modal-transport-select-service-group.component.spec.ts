import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalTransportSelectServiceGroupComponent } from './modal-transport-select-service-group.component';

describe('ModalTransportSelectServiceGroupComponent', () => {
  let component: ModalTransportSelectServiceGroupComponent;
  let fixture: ComponentFixture<ModalTransportSelectServiceGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportSelectServiceGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportSelectServiceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
