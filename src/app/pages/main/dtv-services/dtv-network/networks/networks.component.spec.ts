import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworksComponent } from './networks.component';

describe('NetworksNewComponent', () => {
  let component: NetworksComponent;
  let fixture: ComponentFixture<NetworksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NetworksComponent]
    });
    fixture = TestBed.createComponent(NetworksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
