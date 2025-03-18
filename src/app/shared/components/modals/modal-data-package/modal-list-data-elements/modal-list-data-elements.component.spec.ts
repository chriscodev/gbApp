import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalListDataElementsComponent } from './modal-list-data-elements.component';

describe('ModalListDataElementsComponent', () => {
  let component: ModalListDataElementsComponent;
  let fixture: ComponentFixture<ModalListDataElementsComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalListDataElementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalListDataElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
