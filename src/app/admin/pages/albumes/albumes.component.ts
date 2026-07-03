import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CancionesService } from '../../../core/services/canciones.service';
import { Song } from '../../../core/mocks/canciones.mock';
import { EditModalComponent } from '../../components/edit-modal/edit-modal.component';

export interface AlbumItem {
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  localTrackCount: number;
}

export interface TrackDisplay {
  trackNumber: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  format: string;
  coverUrl: string;
  isLocal: boolean;
  localSongData?: Song;
}

@Component({
  selector: 'app-albumes',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, EditModalComponent],
  templateUrl: './albumes.component.html',
  styleUrls: ['./albumes.component.css']
})
export class AlbumesComponent implements OnInit {
  allSongs: Song[] = [];
  
  viewMode: 'grid' | 'albumDetail' = 'grid';
  albumesToDisplay: AlbumItem[] = [];
  selectedAlbum: { info: AlbumItem; tracks: TrackDisplay[] } | null = null;
  
  showMissingTracks = true;

  songToEdit: Song | null = null;
  isClosingEditModal = false;

  // --- CATÁLOGO DISCOGRÁFICO OFICIAL PARA AUDITORÍA DE PISTAS ---
  readonly OFFICIAL_ALBUM_TRACKS: { [albumTitle: string]: { trackNumber: number; title: string; duration: string }[] } = {
    'BALLADS 1': [
      { trackNumber: 1, title: 'ATTENTION', duration: '2:08' },
      { trackNumber: 2, title: 'SLOW DANCING IN THE DARK', duration: '3:29' },
      { trackNumber: 3, title: 'TEST DRIVE', duration: '2:59' },
      { trackNumber: 4, title: 'WANTED U', duration: '4:11' },
      { trackNumber: 5, title: 'CAN\'T GET OVER YOU', duration: '1:47' },
      { trackNumber: 6, title: 'YEAH RIGHT', duration: '2:54' },
      { trackNumber: 7, title: 'WHY AM I STILL IN LA', duration: '3:19' },
      { trackNumber: 8, title: 'NO FUN', duration: '2:48' },
      { trackNumber: 9, title: 'COME THRU', duration: '2:33' },
      { trackNumber: 10, title: 'R.I.P.', duration: '2:38' },
      { trackNumber: 11, title: 'XNXX', duration: '2:07' },
      { trackNumber: 12, title: 'I\'LL SEE YOU IN 40', duration: '4:13' }
    ],
    'The Rise and Fall of Ziggy Stardust and the Spiders from Mars': [
      { trackNumber: 1, title: 'Five Years', duration: '4:42' }, { trackNumber: 2, title: 'Soul Love', duration: '3:34' },
      { trackNumber: 3, title: 'Moonage Daydream', duration: '4:40' }, { trackNumber: 4, title: 'Starman', duration: '4:14' },
      { trackNumber: 5, title: 'It Ain\'t Easy', duration: '2:58' }, { trackNumber: 6, title: 'Lady Stardust', duration: '3:22' },
      { trackNumber: 7, title: 'Star', duration: '2:47' }, { trackNumber: 8, title: 'Hang On to Yourself', duration: '2:40' },
      { trackNumber: 9, title: 'Ziggy Stardust', duration: '3:13' }, { trackNumber: 10, title: 'Suffragette City', duration: '3:25' },
      { trackNumber: 11, title: 'Rock \'n\' Roll Suicide', duration: '2:58' }
    ],
    'After Hours': [
      { trackNumber: 1, title: 'Alone Again', duration: '4:10' }, { trackNumber: 2, title: 'Too Late', duration: '3:59' },
      { trackNumber: 3, title: 'Hardest To Love', duration: '3:31' }, { trackNumber: 4, title: 'Scared To Live', duration: '3:11' },
      { trackNumber: 5, title: 'Snowchild', duration: '4:07' }, { trackNumber: 6, title: 'Escape From LA', duration: '5:55' },
      { trackNumber: 7, title: 'Heartless', duration: '3:18' }, { trackNumber: 8, title: 'Faith', duration: '4:43' },
      { trackNumber: 9, title: 'Blinding Lights', duration: '3:20' }, { trackNumber: 10, title: 'In Your Eyes', duration: '3:57' },
      { trackNumber: 11, title: 'Save Your Tears', duration: '3:35' }, { trackNumber: 12, title: 'After Hours', duration: '6:01' }
    ],
    'Toxicity': [
      { trackNumber: 1, title: 'Prison Song', duration: '3:21' }, { trackNumber: 2, title: 'Needles', duration: '3:13' },
      { trackNumber: 3, title: 'Deer Dance', duration: '2:55' }, { trackNumber: 4, title: 'Jet Pilot', duration: '2:06' },
      { trackNumber: 5, title: 'X', duration: '1:58' }, { trackNumber: 6, title: 'Chop Suey!', duration: '3:30' },
      { trackNumber: 7, title: 'Bounce', duration: '1:54' }, { trackNumber: 8, title: 'Forest', duration: '4:00' },
      { trackNumber: 9, title: 'ATWA', duration: '2:56' }, { trackNumber: 10, title: 'Science', duration: '2:43' },
      { trackNumber: 11, title: 'Shimmy', duration: '1:51' }, { trackNumber: 12, title: 'Toxicity', duration: '3:39' },
      { trackNumber: 13, title: 'Psycho', duration: '3:45' }, { trackNumber: 14, title: 'Aerials', duration: '3:54' }
    ],
    'Nectar': [
      { trackNumber: 1, title: 'Ew', duration: '3:27' }, { trackNumber: 2, title: 'MODUS', duration: '3:27' },
      { trackNumber: 3, title: 'Tick Tock', duration: '2:12' }, { trackNumber: 4, title: 'Daylight', duration: '2:43' },
      { trackNumber: 5, title: 'Upgrade', duration: '1:29' }, { trackNumber: 6, title: 'Gimme Love', duration: '3:34' },
      { trackNumber: 7, title: 'Run', duration: '3:15' }, { trackNumber: 8, title: 'Sanctuary', duration: '3:00' },
      { trackNumber: 9, title: 'High Hopes', duration: '3:02' }, { trackNumber: 10, title: 'NITROUS', duration: '2:11' },
      { trackNumber: 11, title: 'Normal People', duration: '2:46' }, { trackNumber: 12, title: 'Afterthought', duration: '3:14' },
      { trackNumber: 13, title: 'Mr. Hollywood', duration: '3:22' }, { trackNumber: 14, title: '777', duration: '3:01' }
    ],
    'Clancy': [
      { trackNumber: 1, title: 'Overcompensate', duration: '3:56' }, { trackNumber: 2, title: 'Next Semester', duration: '3:54' },
      { trackNumber: 3, title: 'Backslide', duration: '3:00' }, { trackNumber: 4, title: 'Midwest Indigo', duration: '3:16' },
      { trackNumber: 5, title: 'Routines in the Night', duration: '3:22' }, { trackNumber: 6, title: 'Vignette', duration: '3:22' },
      { trackNumber: 7, title: 'The Craving', duration: '2:54' }, { trackNumber: 8, title: 'Lavish', duration: '2:38' },
      { trackNumber: 9, title: 'Navigating', duration: '3:43' }, { trackNumber: 10, title: 'Snap Back', duration: '3:30' },
      { trackNumber: 11, title: 'Oldies Station', duration: '3:48' }, { trackNumber: 12, title: 'At the Risk of Feeling Dumb', duration: '3:23' }
    ]
  };

  constructor(private cancionesService: CancionesService) {}

  ngOnInit(): void {
    this.cancionesService.getAllSongs().subscribe(songs => {
      this.allSongs = songs;
      this.extractAlbums();
    });
  }

  extractAlbums() {
    const albumMap = new Map<string, AlbumItem>();
    
    this.allSongs.forEach(song => {
      const albumTitle = song.album || 'Álbum Desconocido';
      if (!albumMap.has(albumTitle)) {
        albumMap.set(albumTitle, {
          title: albumTitle,
          artist: song.artist || 'Artista Desconocido',
          year: song.year || 2020,
          coverUrl: song.coverUrl,
          localTrackCount: 1
        });
      } else {
        albumMap.get(albumTitle)!.localTrackCount++;
      }
    });

    this.albumesToDisplay = Array.from(albumMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  }

  openAlbum(album: AlbumItem) {
    const localTracks = this.allSongs.filter(s => s.album === album.title);
    const officialCatalog = this.OFFICIAL_ALBUM_TRACKS[album.title];

    if (officialCatalog && officialCatalog.length > 0) {
      // Cruzamos información para generar el tracklist oficial de 1 a N
      const reconciled: TrackDisplay[] = officialCatalog.map(official => {
        const found = localTracks.find(local => 
          local.title.toLowerCase().trim() === official.title.toLowerCase().trim() ||
          local.title.toLowerCase().includes(official.title.toLowerCase())
        );
        return {
          trackNumber: official.trackNumber,
          title: official.title,
          artist: album.artist,
          album: album.title,
          duration: official.duration,
          format: found ? found.format : '—',
          coverUrl: found ? found.coverUrl : album.coverUrl,
          isLocal: !!found,
          localSongData: found
        };
      }).sort((a, b) => a.trackNumber - b.trackNumber);

      this.selectedAlbum = { info: album, tracks: reconciled };
    } else {
      // Si no tenemos catálogo oficial en memoria, mostramos las pistas locales exactas
      const localOnly: TrackDisplay[] = localTracks.map((s, idx) => ({
        trackNumber: s.track || idx + 1,
        title: s.title,
        artist: s.artist,
        album: s.album,
        duration: s.duration,
        format: s.format,
        coverUrl: s.coverUrl,
        isLocal: true,
        localSongData: s
      })).sort((a, b) => a.trackNumber - b.trackNumber);

      this.selectedAlbum = { info: album, tracks: localOnly };
    }

    this.viewMode = 'albumDetail';
  }

  backToGrid() {
    this.viewMode = 'grid';
    this.selectedAlbum = null;
  }

  openSongEdit(song?: Song) {
    if (song) this.songToEdit = song;
  }

  closeEditModal() {
    this.isClosingEditModal = true;
    setTimeout(() => { this.songToEdit = null; this.isClosingEditModal = false; }, 250);
  }

  saveChanges(updatedSong: Song) {
    if (this.songToEdit) {
      Object.assign(this.songToEdit, updatedSong);
      this.closeEditModal();
    }
  }
}