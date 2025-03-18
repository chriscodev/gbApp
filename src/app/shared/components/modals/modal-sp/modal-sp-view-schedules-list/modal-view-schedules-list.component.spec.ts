import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalViewSchedulesListComponent } from './modal-view-schedules-list.component';

describe('ModalViewSchedulesListComponent', () => {
  let component: ModalViewSchedulesListComponent;
  let fixture: ComponentFixture<ModalViewSchedulesListComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ModalViewSchedulesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalViewSchedulesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
