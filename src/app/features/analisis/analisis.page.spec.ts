import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalisisPage } from './analisis.page';

describe('AnalisisPage', () => {
  let component: AnalisisPage;
  let fixture: ComponentFixture<AnalisisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalisisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
