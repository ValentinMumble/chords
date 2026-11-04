import {frenchName} from '../chords';
import {SONGS} from '../songs';
import type {SongsState} from '../hooks/useSongs';
import {CapoBadge} from './CapoBadge';
import {ChordActions} from './ChordActions';
import {ChordFilters} from './ChordFilters';
import {ChordGrid} from './ChordGrid';
import {Fretboard} from './Fretboard';
import {KeyboardHint} from './KeyboardHint';
import {NextUpCard} from './NextUpCard';
import {Progression} from './Progression';
import {SongBar} from './SongBar';
import {Transport} from './Transport';
// The Songs layout shares its responsive rules (landscape columns, the stage)
// with the page frame, so its styles stay in App.module.css.
import styles from '../App.module.css';

// The Songs section: song picker, play-along transport, the current chord with
// the next one, the progression strip and the chord library.
export function SongsView({songs}: {songs: SongsState}) {
  const {song, version, meter, chord, playback} = songs;
  return (
    <>
      <SongBar songs={SONGS} songIndex={songs.songIndex} onSongChange={songs.changeSong} />
      <div className={styles.player}>
        <Transport
          playback={playback}
          pattern={version.pattern}
          pick={version.pick}
          meter={meter}
          bpm={songs.bpm}
          recommendedBpm={version.bpm}
          onBpmChange={songs.setBpm}
          sound={songs.activeSound.id}
          onSoundChange={songs.setSound}
        />
        <section className={styles.stage}>
          <div className={styles.chordHeader}>
            <div>
              <p className={styles.chordTitle}>{chord.name}</p>
              <p className={styles.chordSub}>{frenchName(chord.name)}</p>
            </div>
            {song.capo ? <CapoBadge fret={song.capo} /> : null}
            <ChordActions chord={chord} />
          </div>
          <div className={styles.chordDiagrams}>
            <div className={styles.diagramWrap} ref={songs.diagramRef}>
              <Fretboard chord={chord} />
            </div>
            <NextUpCard chordName={songs.nextChordName} />
          </div>
          <Progression bars={version.bars} meter={meter} playback={playback} onBarSelect={songs.selectBar} />
        </section>
      </div>
      <h2>Chord library</h2>
      <ChordFilters
        filter={songs.activeFilter}
        onFilterChange={songs.setFilter}
        shape={songs.activeShape}
        onShapeChange={songs.setShape}
      />
      {songs.visible.length > 0 ? (
        <ChordGrid chords={songs.visible} selected={chord.name} onSelect={songs.selectChord} />
      ) : (
        <p className={styles.emptyGrid}>No chords match these filters.</p>
      )}
      <KeyboardHint />
    </>
  );
}
