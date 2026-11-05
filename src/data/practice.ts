import {aForest} from './exercises/aForest';
import {chromatic, dexterity, peterGunn} from './exercises/drills';
import {dust} from './exercises/dust';
import {legato} from './exercises/legato';
import {missYou} from './exercises/missYou';
import {polly} from './exercises/polly';
import {shesLostControl} from './exercises/shesLostControl';
import {someday} from './exercises/someday';
import {stairway} from './exercises/stairway';
import type {PracticeCard} from './exercises/types';

export type {PracticeCard, PracticeTab} from './exercises/types';

// The Practice page, newest first. Cards and the side index both come from this
// list, so adding or reordering a song is one line here.
export const PRACTICE: PracticeCard[] = [
  shesLostControl,
  someday,
  polly,
  missYou,
  dust,
  stairway,
  aForest,
  legato,
  dexterity,
  chromatic,
  peterGunn,
];
