import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmcpTcpComponent } from './pmcp-tcp.component';

describe('PmcpTcpComponent', () => {
  let component: PmcpTcpComponent;
  let fixture: ComponentFixture<PmcpTcpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmcpTcpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmcpTcpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
