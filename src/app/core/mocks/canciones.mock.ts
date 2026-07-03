export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  track: number;
  duration: string;
  genre: string;
  format: 'FLAC' | 'MP3' | 'WAV' | 'Hi-Res';
  coverUrl: string;
  composer?: string; // NUEVO
  lyrics?: string;   // NUEVO
}

const RAW_SONGS: Song[] = [
  // --- SYSTEM OF A DOWN ---
  { id: 'soad1', title: 'ATWA', artist: 'System of a Down', album: 'Toxicity', year: 2001, track: 8, duration: '2:56', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Toxicity.jpg' },
  { id: 'soad2', title: 'Aerials', artist: 'System of a Down', album: 'Toxicity', year: 2001, track: 14, duration: '3:54', genre: 'Alt Metal', format: 'Hi-Res', coverUrl: 'assets/Albumes/Toxicity.jpg' },
  { id: 'soad3', title: 'Bounce', artist: 'System of a Down', album: 'Toxicity', year: 2001, track: 7, duration: '1:54', genre: 'Alt Metal', format: 'MP3', coverUrl: 'assets/Albumes/Toxicity.jpg' },
  { id: 'soad4', title: 'Deer Dance', artist: 'System of a Down', album: 'Toxicity', year: 2001, track: 3, duration: '2:55', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Toxicity.jpg' },
  { id: 'soad5', title: 'Lonely Day', artist: 'System of a Down', album: 'Hypnotize', year: 2005, track: 11, duration: '2:47', genre: 'Alt Metal', format: 'WAV', coverUrl: 'assets/Albumes/Hypnotyze.jpg' },
  { id: 'soad6', title: 'Radio/Video', artist: 'System of a Down', album: 'Mezmerize', year: 2005, track: 3, duration: '4:09', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Mezmerize.jpg' },
  { id: 'soad7', title: 'Dreaming', artist: 'System of a Down', album: 'Hypnotize', year: 2005, track: 2, duration: '3:59', genre: 'Alt Metal', format: 'MP3', coverUrl: 'assets/Albumes/Hypnotyze.jpg' },
  { id: 'soad8', title: 'U-Fig', artist: 'System of a Down', album: 'Hypnotize', year: 2005, track: 8, duration: '2:55', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Hypnotyze.jpg' },
  { id: 'soad9', title: 'Holy Mountains', artist: 'System of a Down', album: 'Hypnotize', year: 2005, track: 9, duration: '5:28', genre: 'Alt Metal', format: 'Hi-Res', coverUrl: 'assets/Albumes/Hypnotyze.jpg' },
  { id: 'soad10', title: 'Soldier Side', artist: 'System of a Down', album: 'Hypnotize', year: 2005, track: 12, duration: '3:40', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Hypnotyze.jpg' },
  { id: 'soad11', title: 'Cigaro', artist: 'System of a Down', album: 'Mezmerize', year: 2005, track: 4, duration: '2:11', genre: 'Alt Metal', format: 'WAV', coverUrl: 'assets/Albumes/Mezmerize.jpg' },
  { id: 'soad12', title: 'Sad Statue', artist: 'System of a Down', album: 'Mezmerize', year: 2005, track: 9, duration: '3:25', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Mezmerize.jpg' },
  { id: 'soad13', title: 'B.Y.O.B.', artist: 'System of a Down', album: 'Mezmerize', year: 2005, track: 2, duration: '4:15', genre: 'Alt Metal', format: 'Hi-Res', coverUrl: 'assets/Albumes/Mezmerize.jpg' },
  { id: 'soad14', title: 'Lost in Hollywood', artist: 'System of a Down', album: 'Mezmerize', year: 2005, track: 11, duration: '5:20', genre: 'Alt Metal', format: 'FLAC', coverUrl: 'assets/Albumes/Mezmerize.jpg' },

 // --- DAVID BOWIE ---
  { id: 'db1', title: 'Soul Love', artist: 'David Bowie', album: 'Ziggy Stardust', year: 1972, track: 2, duration: '3:34', genre: 'Glam Rock', format: 'FLAC', coverUrl: 'assets/Albumes/Ziggy stardust.jpg' },
  { id: 'db2', title: 'Moonage Daydream', artist: 'David Bowie', album: 'Ziggy Stardust', year: 1972, track: 3, duration: '4:40', genre: 'Glam Rock', format: 'Hi-Res', coverUrl: 'assets/Albumes/Ziggy stardust.jpg' },
  { id: 'db3', title: 'Star', artist: 'David Bowie', album: 'Ziggy Stardust', year: 1972, track: 7, duration: '2:47', genre: 'Glam Rock', format: 'WAV', coverUrl: 'assets/Albumes/Ziggy stardust.jpg' },
  { id: 'db4', title: 'Ziggy Stardust', artist: 'David Bowie', album: 'Ziggy Stardust', year: 1972, track: 9, duration: '3:13', genre: 'Glam Rock', format: 'FLAC', coverUrl: 'assets/Albumes/Ziggy stardust.jpg' },
  { id: 'db5', title: 'Five Years', artist: 'David Bowie', album: 'Ziggy Stardust', year: 1972, track: 1, duration: '4:42', genre: 'Glam Rock', format: 'MP3', coverUrl: 'assets/Albumes/Ziggy stardust.jpg' },
  { id: 'db6', title: 'Modern Love', artist: 'David Bowie', album: 'Let\'s Dance', year: 1983, track: 1, duration: '4:46', genre: 'Pop Rock', format: 'FLAC', coverUrl: 'assets/Albumes/Last Dance.jpg' },
  { id: 'db7', title: 'Cat People (Putting Out Fire)', artist: 'David Bowie', album: 'Let\'s Dance', year: 1983, track: 7, duration: '5:09', genre: 'Post-Punk', format: 'Hi-Res', coverUrl: 'assets/Albumes/Last Dance.jpg' },
  { id: 'db8', title: 'Criminal World', artist: 'David Bowie', album: 'Let\'s Dance', year: 1983, track: 6, duration: '4:25', genre: 'Pop Rock', format: 'WAV', coverUrl: 'assets/Albumes/Last Dance.jpg' },
  { id: 'db9', title: 'All the Madmen', artist: 'David Bowie', album: 'The Man Who Sold the World', year: 1970, track: 2, duration: '5:38', genre: 'Hard Rock', format: 'FLAC', coverUrl: 'assets/Albumes/The Man Who Sold the World.jpg' },
  { id: 'db10', title: 'The Width of a Circle', artist: 'David Bowie', album: 'The Man Who Sold the World', year: 1970, track: 1, duration: '8:05', genre: 'Hard Rock', format: 'MP3', coverUrl: 'assets/Albumes/The Man Who Sold the World.jpg' },
  { id: 'db11', title: 'The Man Who Sold the World', artist: 'David Bowie', album: 'The Man Who Sold the World', year: 1970, track: 8, duration: '3:55', genre: 'Hard Rock', format: 'FLAC', coverUrl: 'assets/Albumes/The Man Who Sold the World.jpg' },
  { id: 'db12', title: 'Station to Station', artist: 'David Bowie', album: 'Station to Station', year: 1976, track: 1, duration: '10:14', genre: 'Art Rock', format: 'Hi-Res', coverUrl: 'assets/Albumes/Station to Station.jpg' },
  { id: 'db13', title: 'Golden Years', artist: 'David Bowie', album: 'Station to Station', year: 1976, track: 2, duration: '4:00', genre: 'Art Rock', format: 'FLAC', coverUrl: 'assets/Albumes/Station to Station.jpg' },
  { id: 'db14', title: 'Stay', artist: 'David Bowie', album: 'Station to Station', year: 1976, track: 5, duration: '6:15', genre: 'Art Rock', format: 'WAV', coverUrl: 'assets/Albumes/Station to Station.jpg' },
  { id: 'db15', title: 'Wild Is the Wind', artist: 'David Bowie', album: 'Station to Station', year: 1976, track: 6, duration: '6:02', genre: 'Art Rock', format: 'FLAC', coverUrl: 'assets/Albumes/Station to Station.jpg' },

  // --- TAINY ---
  { id: 'ty1', title: '11 y Once', artist: 'Tainy', album: 'DATA', year: 2023, track: 13, duration: '2:53', genre: 'Reggaeton', format: 'Hi-Res', coverUrl: 'assets/Albumes/Data.jpg' },
  { id: 'ty2', title: 'MAÑANA', artist: 'Tainy', album: 'DATA', year: 2023, track: 15, duration: '2:58', genre: 'Reggaeton', format: 'FLAC', coverUrl: 'assets/Albumes/Data.jpg' },
  { id: 'ty3', title: 'COLMILLO', artist: 'Tainy', album: 'DATA', year: 2023, track: 10, duration: '3:18', genre: 'Reggaeton', format: 'MP3', coverUrl: 'assets/Albumes/Data.jpg' },
  { id: 'ty4', title: 'todavía', artist: 'Tainy', album: 'DATA', year: 2023, track: 18, duration: '3:19', genre: 'Reggaeton', format: 'FLAC', coverUrl: 'assets/Albumes/Data.jpg' },
  { id: 'ty5', title: 'Sci-Fi', artist: 'Tainy', album: 'DATA', year: 2023, track: 6, duration: '3:17', genre: 'Reggaeton', format: 'Hi-Res', coverUrl: 'assets/Albumes/Data.jpg' },
  { id: 'ty6', title: 'PARANORMAL', artist: 'Tainy', album: 'DATA', year: 2023, track: 19, duration: '3:19', genre: 'Reggaeton', format: 'WAV', coverUrl: 'assets/Albumes/Data.jpg' },
  { id: 'ty7', title: 'VOLVER', artist: 'Tainy', album: 'DATA', year: 2023, track: 12, duration: '2:56', genre: 'Reggaeton', format: 'FLAC', coverUrl: 'assets/Albumes/Data.jpg' },

  // --- JOJI ---
  { id: 'jj1', title: 'I\'LL SEE YOU IN 40', artist: 'Joji', album: 'BALLADS 1', year: 2018, track: 14, duration: '4:13', genre: 'R&B/Soul', format: 'FLAC', coverUrl: 'assets/Albumes/BALLADS 1.jpg' },
  { id: 'jj2', title: 'ATTENTION', artist: 'Joji', album: 'BALLADS 1', year: 2018, track: 1, duration: '2:08', genre: 'R&B/Soul', format: 'Hi-Res', coverUrl: 'assets/Albumes/BALLADS 1.jpg' },
  { id: 'jj3', title: 'YEAH RIGHT', artist: 'Joji', album: 'BALLADS 1', year: 2018, track: 8, duration: '2:54', genre: 'R&B/Soul', format: 'WAV', coverUrl: 'assets/Albumes/BALLADS 1.jpg' },
  { id: 'jj4', title: 'SLOW DANCING IN THE DARK', artist: 'Joji', album: 'BALLADS 1', year: 2018, track: 2, duration: '3:29', genre: 'R&B/Soul', format: 'FLAC', coverUrl: 'assets/Albumes/BALLADS 1.jpg' },
  { id: 'jj5', title: '777', artist: 'Joji', album: 'Nectar', year: 2020, track: 14, duration: '3:01', genre: 'Pop', format: 'MP3', coverUrl: 'assets/Albumes/Nectar.jpg' },
  { id: 'jj6', title: 'Like You Do', artist: 'Joji', album: 'Nectar', year: 2020, track: 17, duration: '4:00', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Nectar.jpg' },
  { id: 'jj7', title: 'Afterthought', artist: 'Joji', album: 'Nectar', year: 2020, track: 12, duration: '3:14', genre: 'Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Nectar.jpg' },
  { id: 'jj8', title: 'Run', artist: 'Joji', album: 'Nectar', year: 2020, track: 4, duration: '3:15', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Nectar.jpg' },
  { id: 'jj9', title: 'Gimme Love', artist: 'Joji', album: 'Nectar', year: 2020, track: 6, duration: '3:34', genre: 'Pop', format: 'WAV', coverUrl: 'assets/Albumes/Nectar.jpg' },
  { id: 'jj10', title: 'Ew', artist: 'Joji', album: 'Nectar', year: 2020, track: 1, duration: '3:27', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Nectar.jpg' },

  // --- TWENTY ONE PILOTS ---
  { id: 'top1', title: 'Overcompensate', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 1, duration: '3:56', genre: 'Alt Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top2', title: 'Next Semester', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 2, duration: '3:54', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top3', title: 'Paladin Strait', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 13, duration: '6:28', genre: 'Alt Pop', format: 'MP3', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top4', title: 'Navigating', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 10, duration: '3:43', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top5', title: 'Vignette', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 7, duration: '3:22', genre: 'Alt Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top6', title: 'Routines in the Night', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 6, duration: '3:22', genre: 'Alt Pop', format: 'WAV', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top7', title: 'At the Risk of Feeling Dumb', artist: 'Twenty One Pilots', album: 'Clancy', year: 2024, track: 12, duration: '3:23', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Clancy.jpg' },
  { id: 'top8', title: 'Shy Away', artist: 'Twenty One Pilots', album: 'Scaled and Icy', year: 2021, track: 3, duration: '2:55', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Scaled and Icy.jpg' },
  { id: 'top9', title: 'Saturday', artist: 'Twenty One Pilots', album: 'Scaled and Icy', year: 2021, track: 6, duration: '2:52', genre: 'Alt Pop', format: 'MP3', coverUrl: 'assets/Albumes/Scaled and Icy.jpg' },
  { id: 'top10', title: 'Bounce Man', artist: 'Twenty One Pilots', album: 'Scaled and Icy', year: 2021, track: 9, duration: '3:05', genre: 'Alt Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Scaled and Icy.jpg' },
  { id: 'top11', title: 'Leave the City', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 14, duration: '4:40', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top12', title: 'Cut My Lip', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 12, duration: '4:43', genre: 'Alt Pop', format: 'WAV', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top13', title: 'My Blood', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 4, duration: '3:49', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top14', title: 'Morph', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 3, duration: '4:19', genre: 'Alt Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top15', title: 'Smithereens', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 6, duration: '2:57', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Trench.jpg' },
  // Mocks para los títulos no oficiales listados:
  { id: 'top16', title: 'Robot Voices', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 15, duration: '3:10', genre: 'Alt Pop', format: 'MP3', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top17', title: 'Garbage', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 16, duration: '2:45', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top18', title: 'Drum Show', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 17, duration: '4:01', genre: 'Alt Pop', format: 'WAV', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top19', title: 'Rawfear', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 18, duration: '3:33', genre: 'Alt Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top20', title: 'Intentions', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 19, duration: '3:50', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top21', title: 'Downstairs', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 20, duration: '2:59', genre: 'Alt Pop', format: 'MP3', coverUrl: 'assets/Albumes/Trench.jpg' },
  { id: 'top22', title: 'Tally', artist: 'Twenty One Pilots', album: 'Trench', year: 2018, track: 21, duration: '3:15', genre: 'Alt Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Trench.jpg' },

  // --- THE WEEKND ---
  { id: 'wk1', title: 'Faith', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 8, duration: '4:43', genre: 'R&B', format: 'Hi-Res', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk2', title: 'Scared to Live', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 4, duration: '3:11', genre: 'R&B', format: 'FLAC', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk3', title: 'Repeat After Me (Interlude)', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 12, duration: '3:15', genre: 'R&B', format: 'WAV', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk4', title: 'After Hours', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 13, duration: '6:01', genre: 'R&B', format: 'FLAC', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk5', title: 'Alone Again', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 1, duration: '4:10', genre: 'R&B', format: 'MP3', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk6', title: 'Too Late', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 2, duration: '3:59', genre: 'R&B', format: 'FLAC', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk7', title: 'Hardest To Love', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 3, duration: '3:31', genre: 'R&B', format: 'Hi-Res', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk8', title: 'Snowchild', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 5, duration: '4:07', genre: 'R&B', format: 'FLAC', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk9', title: 'Escape from LA', artist: 'The Weeknd', album: 'After Hours', year: 2020, track: 6, duration: '5:55', genre: 'R&B', format: 'WAV', coverUrl: 'assets/Albumes/After Hours.jpg' },
  { id: 'wk10', title: 'How Do I Make You Love Me?', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 2, duration: '3:34', genre: 'Synth-Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk11', title: 'Sacrifice', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 4, duration: '3:08', genre: 'Synth-Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk12', title: 'Take My Breath', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 3, duration: '5:39', genre: 'Synth-Pop', format: 'MP3', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk13', title: 'Best Friends', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 9, duration: '2:43', genre: 'Synth-Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk14', title: 'Is There Someone Else?', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 10, duration: '3:19', genre: 'Synth-Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk15', title: 'Don\'t Break My Heart', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 12, duration: '3:25', genre: 'Synth-Pop', format: 'WAV', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk16', title: 'I Heard You\'re Married', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 13, duration: '4:23', genre: 'Synth-Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk17', title: 'Less than Zero', artist: 'The Weeknd', album: 'Dawn FM', year: 2022, track: 14, duration: '3:31', genre: 'Synth-Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Dawn FM.webp' },
  { id: 'wk18', title: 'Wake Me Up', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 1, duration: '3:50', genre: 'Synth-Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },
  { id: 'wk19', title: 'Cry for Me', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 2, duration: '4:10', genre: 'Synth-Pop', format: 'WAV', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },
  { id: 'wk20', title: 'São Paulo', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 3, duration: '3:45', genre: 'Synth-Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },
  { id: 'wk21', title: 'Open Hearts', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 4, duration: '3:30', genre: 'Synth-Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },
  { id: 'wk22', title: 'Baptized in Fear', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 5, duration: '4:05', genre: 'Synth-Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },
  { id: 'wk23', title: 'Niagara Falls', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 6, duration: '3:20', genre: 'Trap', format: 'MP3', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },
  { id: 'wk24', title: 'Timeless', artist: 'The Weeknd', album: 'Hurry Up Tomorrow', year: 2024, track: 7, duration: '3:55', genre: 'Trap', format: 'FLAC', coverUrl: 'assets/Albumes/Hurry Up Tomorrow.jpg' },

  // --- KORN ---
  { id: 'ko1', title: 'Coming Undone', artist: 'Korn', album: 'See You on the Other Side', year: 2005, track: 3, duration: '3:19', genre: 'Nu Metal', format: 'FLAC', coverUrl: 'assets/Albumes/See you on the Oder Side.jpg' },

  // --- MICHAEL JACKSON ---
  { id: 'mj1', title: 'Can\'t Let Her Get Away', artist: 'Michael Jackson', album: 'Dangerous', year: 1991, track: 6, duration: '4:58', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Dangerous.jpg' },
  { id: 'mj2', title: 'Who Is It', artist: 'Michael Jackson', album: 'Dangerous', year: 1991, track: 10, duration: '6:34', genre: 'Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Dangerous.jpg' },
  { id: 'mj3', title: 'Dangerous', artist: 'Michael Jackson', album: 'Dangerous', year: 1991, track: 14, duration: '6:57', genre: 'Pop', format: 'WAV', coverUrl: 'assets/Albumes/Dangerous.jpg' },
  { id: 'mj4', title: 'Black or White', artist: 'Michael Jackson', album: 'Dangerous', year: 1991, track: 8, duration: '4:15', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Dangerous.jpg' },
  { id: 'mj5', title: 'Remember the Time', artist: 'Michael Jackson', album: 'Dangerous', year: 1991, track: 5, duration: '3:59', genre: 'Pop', format: 'MP3', coverUrl: 'assets/Albumes/Dangerous.jpg' },
  { id: 'mj6', title: 'Why You Wanna Trip On Me', artist: 'Michael Jackson', album: 'Dangerous', year: 1991, track: 2, duration: '5:24', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Dangerous.jpg' },
  { id: 'mj7', title: 'Wanna Be Startin\' Somethin\'', artist: 'Michael Jackson', album: 'Thriller', year: 1982, track: 1, duration: '6:02', genre: 'Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/thriller.jpg' },
  { id: 'mj8', title: 'Beat It', artist: 'Michael Jackson', album: 'Thriller', year: 1982, track: 5, duration: '4:18', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/thriller.jpg' },
  { id: 'mj9', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', year: 1982, track: 6, duration: '4:54', genre: 'Pop', format: 'WAV', coverUrl: 'assets/Albumes/thriller.jpg' },
  { id: 'mj10', title: 'Human Nature', artist: 'Michael Jackson', album: 'Thriller', year: 1982, track: 7, duration: '4:06', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/thriller.jpg' },
  { id: 'mj11', title: 'The Girl Is Mine', artist: 'Michael Jackson', album: 'Thriller', year: 1982, track: 3, duration: '3:42', genre: 'Pop', format: 'MP3', coverUrl: 'assets/Albumes/thriller.jpg' },
  { id: 'mj12', title: 'Bad', artist: 'Michael Jackson', album: 'Bad', year: 1987, track: 1, duration: '4:07', genre: 'Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Bad.webp' },
  { id: 'mj13', title: 'The Way You Make Me Feel', artist: 'Michael Jackson', album: 'Bad', year: 1987, track: 2, duration: '4:57', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Bad.webp' },
  { id: 'mj14', title: 'Smooth Criminal', artist: 'Michael Jackson', album: 'Bad', year: 1987, track: 10, duration: '4:17', genre: 'Pop', format: 'WAV', coverUrl: 'assets/Albumes/Bad.webp' },
  { id: 'mj15', title: 'I Just Can\'t Stop Loving You', artist: 'Michael Jackson', album: 'Bad', year: 1987, track: 8, duration: '4:11', genre: 'Pop', format: 'FLAC', coverUrl: 'assets/Albumes/Bad.webp' },
  { id: 'mj16', title: 'Just Good Friends', artist: 'Michael Jackson', album: 'Bad', year: 1987, track: 5, duration: '4:06', genre: 'Pop', format: 'MP3', coverUrl: 'assets/Albumes/Bad.webp' },
  { id: 'mj17', title: 'Liberian Girl', artist: 'Michael Jackson', album: 'Bad', year: 1987, track: 4, duration: '3:53', genre: 'Pop', format: 'Hi-Res', coverUrl: 'assets/Albumes/Bad.webp' },
];

// Exportamos la lista ya ordenada alfabéticamente por título
export const MOCK_SONGS_SORTED = RAW_SONGS.sort((a, b) => a.title.localeCompare(b.title));