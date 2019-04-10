import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTodaysInvoiceComponent } from './view-todays-invoice.component';

describe('ViewTodaysInvoiceComponent', () => {
  let component: ViewTodaysInvoiceComponent;
  let fixture: ComponentFixture<ViewTodaysInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTodaysInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTodaysInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
