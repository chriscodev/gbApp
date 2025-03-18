import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingChangeComponent } from './pending-change.component';

describe('PendingChangeComponent', () => {
  let component: PendingChangeComponent;
  let fixture: ComponentFixture<PendingChangeComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ PendingChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
