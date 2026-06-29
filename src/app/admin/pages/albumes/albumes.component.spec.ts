import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumesComponent } from './albumes.component';

describe('AlbumesComponent', () => {
  let component: AlbumesComponent;
  let fixture: ComponentFixture<AlbumesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlbumesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
