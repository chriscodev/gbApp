import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalFileUploadComponent } from './modal-file-upload.component';

describe('ModalFileUploadComponent', () => {
  let component: ModalFileUploadComponent;
  let fixture: ComponentFixture<ModalFileUploadComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalFileUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
