# Chords 🎸

A guitar chord visualizer and practice tool. Live at [chords.vumble.dev](https://chords.vumble.dev).

Built with Vite, React, and TypeScript.

## Screenshots

**Songs:** play along with a chord progression, with the strum pattern, tempo and a next-up chord.

![Songs tab on desktop](docs/screenshots/songs-desktop.png)

**Practice:** tabs for riffs and exercises, with finger colours, a rhythm lane and a play button with adjustable tempo.

![Practice tab on desktop, dark mode](docs/screenshots/practice-desktop.png)

**Scales and Tuner on a phone:** scale boxes with French note names, and a microphone tuner with a cents meter.

|                                        Scales                                         |                                                         Tuner                                                          |
| :-----------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------: |
| <img src="docs/screenshots/scales-phone.png" alt="Scales tab on a phone" width="300"> | <img src="docs/screenshots/tuner-phone.png" alt="Tuner tab on a phone, showing an A string 24 cents flat" width="300"> |

**Landscape on a phone:** the Practice index on the left jumps straight to a card.

![Practice tab in phone landscape with the jump index](docs/screenshots/practice-landscape.png)

## Features

**Songs**

- 11 songs grouped by difficulty, each with its own tempo, strum pattern (including two-bar patterns) or fingerpicking, 6/8 where needed, and a capo badge
- Looping play-along: the chord diagram follows the current bar, a next-up card shows the coming chord, and a sweeping marker follows the strum pattern
- Drag across the bar chips to loop a section; drag the metronome to change tempo
- Chord library of 32 chords (open majors and minors, barre shapes, 7ths, sus and add chords) with filters, finger-coloured diagrams, open/muted string markers and barre indicators
- French chord names (Do, Ré, Mi…) next to the English ones

**Practice**

- Tabs for riffs and exercises: Someday, Polly, Miss You, Dust in the Wind, Stairway to Heaven, A Forest, Peter Gunn, plus chromatic, staircase and dexterity drills
- Finger colours on every note, a rhythm lane with beamed note values, and play/stop with an adjustable tempo per tab
- Cards fold away and remember it; in phone landscape, an index on the side jumps straight to a card

**Scales**

- Minor and major pentatonic, major, natural minor and blues, in any key, shown one box position at a time with French note names
- Slide the box along the neck, tap a note to hear it, or play the whole scale

**Tuner**

- Microphone tuner: picks the nearest string, shows how many cents sharp or flat you are, and tells you to tighten or loosen
- Tap a string to lock onto it and hear its reference note; a level meter shows the mic is hearing you

**Gear**

- Your guitars and amp with specs, prices, and how old the strings are

**Everywhere**

- Real guitar sound via [soundfont-player](https://github.com/danigb/soundfont-player) with 8 sounds (steel and nylon acoustic, clean, jazz, muted, overdriven and distorted electric, harmonics) and a Web Audio fallback while samples load
- iOS look in light and dark mode (follows the system), built for iPhone in portrait and landscape, with a home screen icon
- Keyboard shortcuts: `←` / `→` to change chord (or jump bars while a song plays), `space` to play or pause, `s` to strum, `a` for an arpeggio
- Choices are saved in the browser (chord, song, tempo, sound, folded cards, scale), so they survive a reload

## Development

```sh
npm install
npm run dev     # dev server on :5180
npm run build   # type-check + production build to dist/
npm test        # vitest (pure logic: chord names, barres, note math)
```

## Deployment

Deployed on Vercel (framework preset: Vite). Pushes to `main` auto-deploy via the Vercel git integration.
