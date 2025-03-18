import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDynamicTbTranslateComponent } from './modal-dynamic-tb-translate.component';

describe('ModalDynamicTbTranslateComponent', () => {
  let component: ModalDynamicTbTranslateComponent;
  let fixture: ComponentFixture<ModalDynamicTbTranslateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDynamicTbTranslateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDynamicTbTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
