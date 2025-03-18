import {ComponentFixture, TestBed} from '@angular/core/testing';

import { ModalTreeViewComponent } from './modal-tree-view.component';

describe('ModalTreeViewComponent', () => {
  let component: ModalTreeViewComponent;
  let fixture: ComponentFixture<ModalTreeViewComponent>;

  beforeEach(() => {
     TestBed.configureTestingModule({
      imports: [ModalTreeViewComponent]
    })
    .compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    });
  });
