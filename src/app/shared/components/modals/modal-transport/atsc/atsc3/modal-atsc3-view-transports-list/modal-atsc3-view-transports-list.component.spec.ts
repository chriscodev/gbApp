import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAtsc3ViewTransportsListComponent } from './modal-atsc3-view-transports-list.component';

describe('ModalAtsc3ViewTransportsListComponent', () => {
  let component: ModalAtsc3ViewTransportsListComponent;
  let fixture: ComponentFixture<ModalAtsc3ViewTransportsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAtsc3ViewTransportsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAtsc3ViewTransportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
