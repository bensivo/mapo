import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvaspageComponent } from './canvaspage.component';

describe('CanvaspageComponent', () => {
  let component: CanvaspageComponent;
  let fixture: ComponentFixture<CanvaspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvaspageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CanvaspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
