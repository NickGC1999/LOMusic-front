import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificadosComponent } from './modificados.component';

describe('ModificadosComponent', () => {
  let component: ModificadosComponent;
  let fixture: ComponentFixture<ModificadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
