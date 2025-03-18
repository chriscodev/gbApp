import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DtvNetworkComponent } from './dtv-network.component';

describe('DtvNetworkComponent', () => {
  let component: DtvNetworkComponent;
  let fixture: ComponentFixture<DtvNetworkComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DtvNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DtvNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
