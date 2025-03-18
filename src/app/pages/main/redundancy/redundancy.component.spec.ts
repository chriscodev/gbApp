import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedundancyComponent } from './redundancy.component';

describe('RedundancyComponent', () => {
  let component: RedundancyComponent;
  let fixture: ComponentFixture<RedundancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedundancyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedundancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
