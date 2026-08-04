export interface LevelInfo {
  level: number
  name: string
  reward: string
  xpToReach: number
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Fledgling', reward: 'Classic Ferro', xpToReach: 0 },
  { level: 2, name: 'First Flight', reward: 'Level Up!', xpToReach: 300 },
  { level: 3, name: 'Over the Hills', reward: 'Level Up!', xpToReach: 350 },
  { level: 4, name: 'Shadow Wings', reward: 'Ninja Skin', xpToReach: 400 },
  { level: 5, name: 'Touchdown', reward: 'Meet the Crow', xpToReach: 450 },
  { level: 6, name: 'Camden Calling', reward: 'Level Up!', xpToReach: 500 },
  { level: 7, name: 'Rush Hour', reward: 'Level Up!', xpToReach: 550 },
  { level: 8, name: 'Sky Hunter', reward: 'Meet the Falcon', xpToReach: 600 },
  { level: 9, name: 'On the Case', reward: 'Detective Skin', xpToReach: 650 },
  { level: 10, name: 'Borough Hopper', reward: 'Level Up!', xpToReach: 700 },
  { level: 11, name: 'Bright Feathers', reward: 'Meet the Parrot', xpToReach: 750 },
  { level: 12, name: 'Game On', reward: 'Game Skin', xpToReach: 800 },
  { level: 13, name: 'After Dark', reward: 'Level Up!', xpToReach: 850 },
  { level: 14, name: 'Caped Crusader', reward: 'Superhero Skin', xpToReach: 900 },
  { level: 15, name: "Magpie's Treasure", reward: 'Meet the Magpie', xpToReach: 1000 },
  { level: 16, name: 'Landmark', reward: 'Level Up!', xpToReach: 1050 },
  { level: 17, name: 'Midnight Mayor', reward: 'Villain Skin', xpToReach: 1100 },
  { level: 18, name: 'Dawn Chorus', reward: 'Meet the Robin', xpToReach: 1200 },
  { level: 19, name: 'City Veteran', reward: 'Level Up!', xpToReach: 1300 },
  { level: 20, name: 'High Flyer', reward: 'Meet the Hummingbird', xpToReach: 1400 },
]

export interface LevelProgress {
  current: LevelInfo
  next: LevelInfo | null
  xpIntoLevel: number
  xpForNextLevel: number | null
  progressPercent: number
}

export function getLevelProgress(xp: number): LevelProgress {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpToReach) {
      current = lvl
    } else {
      break
    }
  }

  const currentIndex = LEVELS.findIndex((l) => l.level === current.level)
  const next = currentIndex >= 0 && currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null

  const xpIntoLevel = xp - current.xpToReach
  const xpForNextLevel = next ? next.xpToReach - current.xpToReach : null
  const progressPercent = xpForNextLevel ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100

  return { current, next, xpIntoLevel, xpForNextLevel, progressPercent }
}
