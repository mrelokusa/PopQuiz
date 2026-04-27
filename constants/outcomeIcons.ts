import {
  Crown, Skull, Ghost, Bot, Cat, Dog, Bird, Fish, Rabbit, Rat,
  Heart, Flame, Zap, Star, Sparkles, Sun, Moon, Cloud, Mountain, Anchor,
  Eye, Smile, Brain, Drama, Music, Book, Coffee, Pizza, Camera, Gamepad2,
  Rocket, Trophy, Target, Compass, Hammer, Scissors, Key, Gem,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface OutcomeIconDef {
  /** Stable string written to the DB. Never rename — change label instead. */
  name: string;
  /** Human-readable label shown in the picker. */
  label: string;
  Component: LucideIcon;
}

// Curated set of outcome icons. The DB stores the `name`; the renderer looks
// it up here. Add new icons at the end so older quizzes keep working.
export const OUTCOME_ICONS: OutcomeIconDef[] = [
  { name: 'crown',     label: 'Crown',     Component: Crown },
  { name: 'skull',     label: 'Skull',     Component: Skull },
  { name: 'ghost',     label: 'Ghost',     Component: Ghost },
  { name: 'bot',       label: 'Bot',       Component: Bot },
  { name: 'cat',       label: 'Cat',       Component: Cat },
  { name: 'dog',       label: 'Dog',       Component: Dog },
  { name: 'bird',      label: 'Bird',      Component: Bird },
  { name: 'fish',      label: 'Fish',      Component: Fish },
  { name: 'rabbit',    label: 'Rabbit',    Component: Rabbit },
  { name: 'rat',       label: 'Rat',       Component: Rat },
  { name: 'heart',     label: 'Heart',     Component: Heart },
  { name: 'flame',     label: 'Flame',     Component: Flame },
  { name: 'zap',       label: 'Bolt',      Component: Zap },
  { name: 'star',      label: 'Star',      Component: Star },
  { name: 'sparkles',  label: 'Sparkles',  Component: Sparkles },
  { name: 'sun',       label: 'Sun',       Component: Sun },
  { name: 'moon',      label: 'Moon',      Component: Moon },
  { name: 'cloud',     label: 'Cloud',     Component: Cloud },
  { name: 'mountain',  label: 'Mountain',  Component: Mountain },
  { name: 'anchor',    label: 'Anchor',    Component: Anchor },
  { name: 'eye',       label: 'Eye',       Component: Eye },
  { name: 'smile',     label: 'Smile',     Component: Smile },
  { name: 'brain',     label: 'Brain',     Component: Brain },
  { name: 'drama',     label: 'Drama',     Component: Drama },
  { name: 'music',     label: 'Music',     Component: Music },
  { name: 'book',      label: 'Book',      Component: Book },
  { name: 'coffee',    label: 'Coffee',    Component: Coffee },
  { name: 'pizza',     label: 'Pizza',     Component: Pizza },
  { name: 'camera',    label: 'Camera',    Component: Camera },
  { name: 'gamepad',   label: 'Gamepad',   Component: Gamepad2 },
  { name: 'rocket',    label: 'Rocket',    Component: Rocket },
  { name: 'trophy',    label: 'Trophy',    Component: Trophy },
  { name: 'target',    label: 'Target',    Component: Target },
  { name: 'compass',   label: 'Compass',   Component: Compass },
  { name: 'hammer',    label: 'Hammer',    Component: Hammer },
  { name: 'scissors',  label: 'Scissors',  Component: Scissors },
  { name: 'key',       label: 'Key',       Component: Key },
  { name: 'gem',       label: 'Gem',       Component: Gem },
];

// Lookup by name for the renderer.
const ICON_BY_NAME: Record<string, OutcomeIconDef> = OUTCOME_ICONS.reduce(
  (acc, icon) => ({ ...acc, [icon.name]: icon }),
  {}
);

// Backward-compat: legacy outcomes stored emojis instead of icon names.
// Map the most common ones to their nearest icon. Anything not listed
// falls through to the default (HelpCircle).
const EMOJI_TO_ICON: Record<string, string> = {
  '👑': 'crown',
  '💀': 'skull',
  '👻': 'ghost',
  '🤖': 'bot',
  '🐱': 'cat',
  '🐶': 'dog',
  '🐰': 'rabbit',
  '🐭': 'rat',
  '❤️': 'heart',
  '🔥': 'flame',
  '⚡': 'zap',
  '⭐': 'star',
  '✨': 'sparkles',
  '☀️': 'sun',
  '🌙': 'moon',
  '☁️': 'cloud',
  '⛰️': 'mountain',
  '👁️': 'eye',
  '🧠': 'brain',
  '🎭': 'drama',
  '🎵': 'music',
  '📚': 'book',
  '☕': 'coffee',
  '🍕': 'pizza',
  '📷': 'camera',
  '🎮': 'gamepad',
  '🚀': 'rocket',
  '🏆': 'trophy',
  '🎯': 'target',
  '🔑': 'key',
  '💎': 'gem',
  // Seed data quirks
  '👔': 'crown',
  '👓': 'eye',
  '💅': 'sparkles',
  '🥨': 'coffee',
  '🅰️': 'star',
  '🅱️': 'gem',
};

export const resolveOutcomeIcon = (stored: string | undefined): OutcomeIconDef => {
  if (!stored) return { name: 'help', label: 'Unknown', Component: HelpCircle };
  if (ICON_BY_NAME[stored]) return ICON_BY_NAME[stored];
  if (EMOJI_TO_ICON[stored]) return ICON_BY_NAME[EMOJI_TO_ICON[stored]];
  return { name: 'help', label: 'Unknown', Component: HelpCircle };
};

// Lightweight name list for the AI prompt.
export const OUTCOME_ICON_NAMES = OUTCOME_ICONS.map((i) => i.name);
