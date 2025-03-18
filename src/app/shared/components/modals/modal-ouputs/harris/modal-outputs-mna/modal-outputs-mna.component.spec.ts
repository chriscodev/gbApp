import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsMnaComponent } from './modal-outputs-mna.component';

describe('ModalOutputsMnaComponent', () => {
  let component: ModalOutputsMnaComponent;
  let fixture: ComponentFixture<ModalOutputsMnaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsMnaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsMnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
