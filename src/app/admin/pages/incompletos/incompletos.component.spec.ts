import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompletosComponent } from './incompletos.component';

describe('IncompletosComponent', () => {
  let component: IncompletosComponent;
  let fixture: ComponentFixture<IncompletosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncompletosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncompletosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
