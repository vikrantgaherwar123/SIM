import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysInvoiceComponent } from './todays-invoice.component';

describe('TodaysInvoiceComponent', () => {
  let component: TodaysInvoiceComponent;
  let fixture: ComponentFixture<TodaysInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodaysInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodaysInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
