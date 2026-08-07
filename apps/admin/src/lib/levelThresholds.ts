export interface LevelInfo {
  level: number
  name: string
  reward: string
  xpToReach: number
}

// Source: XP_Points_Levels doc (Mai/Brandon). Level 1 starts at 0 XP.
export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Fledgling', reward: 'Classic Ferro', xpToReach: 0 },
  { level: 2, name: 'First Flight', reward: 'Level Up!', xpToReach: 300 },
  { level: 3, name: 'Over the Hills', reward: 'Level Up!', xpToReach: 650 },
  { level: 4, name: 'Shadow Wings', reward: 'Ninja Skin', xpToReach: 1050 },
  { level: 5, name: 'Touchdown', reward: 'Meet the Crow', xpToReach: 1500 },
  { level: 6, name: 'Camden Calling', reward: 'Level Up!', xpToReach: 2000 },
  { level: 7, name: 'Rush Hour', reward: 'Level Up!', xpToReach: 2550 },
  { level: 8, name: 'Sky Hunter', reward: 'Meet the Falcon', xpToReach: 3150 },
  { level: 9, name: 'On the Case', reward: 'Detective Skin', xpToReach: 3800 },
  { level: 10, name: 'Borough Hopper', reward: 'Level Up!', xpToReach: 4500 },
  { level: 11, name: 'Bright Feathers', reward: 'Meet the Parrot', xpToReach: 5250 },
  { level: 12, name: 'Game On', reward: 'Game Skin', xpToReach: 6050 },
  { level: 13, name: 'After Dark', reward: 'Level Up!', xpToReach: 6900 },
  { level: 14, name: 'Caped Crusader', reward: 'Superhero Skin', xpToReach: 7800 },
  { level: 15, name: "Magpie's Treasure", reward: 'Meet the Magpie', xpToReach: 8800 },
  { level: 16, name: 'Landmark', reward: 'Level Up!', xpToReach: 9850 },
  { level: 17, name: 'Midnight Mayor', reward: 'Villain Skin', xpToReach: 10950 },
  { level: 18, name: 'Dawn Chorus', reward: 'Meet the Robin', xpToReach: 12150 },
  { level: 19, name: 'City Veteran', reward: 'Level Up!', xpToReach: 13450 },
  { level: 20, name: 'High Flyer', reward: 'Meet the Hummingbird', xpToReach: 14850 },
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
