/**
 * Weapon dataset.
 *
 * Every weapon is generated in Torn with an accuracy and damage value that
 * rolls inside the range shown (e.g. a 9mm Uzi rolls 43.00-48.00 accuracy).
 * Lumbercorpedia stores the *range* and computes the mid-roll for comparisons,
 * which is what you want when picking a loadout rather than trading a specific
 * gun.
 *
 * Source: torn wiki "Weapon" page (primary / secondary / melee stat tables plus
 * the ammo tables). Values verified against that page.
 */

export type WeaponSlot = 'Primary' | 'Secondary' | 'Melee';
export type WeaponType =
  | 'Rifle'
  | 'Machine Gun'
  | 'SMG'
  | 'Shotgun'
  | 'Heavy Artillery'
  | 'Pistol'
  | 'Clubbing'
  | 'Slashing'
  | 'Piercing'
  | 'Mechanical';

export interface Weapon {
  name: string;
  slot: WeaponSlot;
  type: WeaponType;
  /** [min, max] damage roll. `null` when the wiki has no published figures yet. */
  damage: [number, number] | null;
  /** [min, max] accuracy roll. */
  accuracy: [number, number] | null;
  stealth: number;
  source: string;
  caliber?: string;
  clip?: number;
  /** Ammo table rate of fire, shots per attack. */
  rof?: [number, number];
  /** Special ammo types the weapon accepts. */
  specialAmmo?: string;
  /** Item id from Torn's global item list, when known. */
  itemId?: number;
}

const w = (
  name: string,
  slot: WeaponSlot,
  type: WeaponType,
  damage: [number, number] | null,
  accuracy: [number, number] | null,
  stealth: number,
  source: string,
  extra: Partial<Weapon> = {},
): Weapon => ({ name, slot, type, damage, accuracy, stealth, source, ...extra });

export const WEAPONS: Weapon[] = [
  // ------------------------------------------------------------- PRIMARY
  w('9mm Uzi', 'Primary', 'SMG', [65, 70], [43, 48], 3.4, 'Mexico', { itemId: 108, caliber: '9mm', clip: 30 }),
  w('AK-47', 'Primary', 'Rifle', [56, 61], [52, 57], 2.7, 'Mexico', { itemId: 26, caliber: '7.62mm', clip: 30 }),
  w('AK74U', 'Primary', 'SMG', [46, 51], [41, 46], 3.5, 'City Find', { caliber: '5.45mm', clip: 30 }),
  w('ArmaLite M-15A4', 'Primary', 'Rifle', [68, 73], [57, 62], 3.0, 'Mexico', { itemId: 399, caliber: '5.56mm', clip: 30 }),
  w("Benelli M1 Tactical", 'Primary', 'Shotgun', [39, 44], [65, 70], 2.8, "Big Al's Gun Shop", { itemId: 23, caliber: '12 Gauge', clip: 7 }),
  w('Benelli M4 Super', 'Primary', 'Shotgun', [59, 64], [55, 60], 2.8, "Big Al's Gun Shop", { itemId: 28, caliber: '12 Gauge', clip: 7 }),
  w('Bushmaster Carbon 15', 'Primary', 'SMG', [50, 55], [57, 62], 2.8, 'Hawaii', { itemId: 241, caliber: '.223', clip: 30 }),
  w('Dual Bushmasters', 'Primary', 'SMG', [76, 81], [47, 52], 1.6, 'Auction House', { caliber: '.223', clip: 60 }),
  w('Dual MP5s', 'Primary', 'SMG', [78, 83], [46, 51], 1.7, 'Auction House', { caliber: '9mm', clip: 60 }),
  w('Dual P90s', 'Primary', 'SMG', [77, 82], [45, 50], 2.1, 'Auction House', { caliber: '5.7mm', clip: 100 }),
  w('Dual TMPs', 'Primary', 'SMG', [79, 84], [40, 45], 1.9, 'Auction House', { caliber: '9mm', clip: 60 }),
  w('Dual Uzis', 'Primary', 'SMG', [80, 85], [36, 41], 2.2, 'Auction House', { caliber: '9mm', clip: 60 }),
  w('Egg Propelled Launcher', 'Primary', 'Heavy Artillery', [64, 69], [24, 29], 3.8, 'Easter Bunny loot', { itemId: 100, caliber: 'Egg', clip: 1 }),
  w('Enfield SA-80', 'Primary', 'Rifle', [63, 68], [55, 60], 3.0, 'United Kingdom', { itemId: 219, caliber: '5.56mm', clip: 30 }),
  w('Gold Plated AK-47', 'Primary', 'Rifle', [75, 80], [62, 67], 2.7, 'United Arab Emirates', { itemId: 382, caliber: '7.62mm', clip: 30 }),
  w('Heckler & Koch SL8', 'Primary', 'Rifle', [60, 65], [46, 51], 2.5, 'Mexico', { itemId: 231, caliber: '5.56mm', clip: 30 }),
  w('Ithaca 37', 'Primary', 'Shotgun', [49, 54], [62, 67], 2.4, 'Canada', { itemId: 252, caliber: '12 Gauge', clip: 7 }),
  w('Jackhammer', 'Primary', 'Shotgun', [69, 74], [52, 57], 2.1, 'Switzerland', { itemId: 223, caliber: '12 Gauge', clip: 10 }),
  w('M16 A2 Rifle', 'Primary', 'Rifle', [61, 66], [47, 52], 2.9, "Big Al's Gun Shop", { itemId: 29, caliber: '5.56mm', clip: 30 }),
  w('M249 SAW', 'Primary', 'Machine Gun', [67, 72], [41, 46], 2.0, 'Mexico', { itemId: 31, caliber: '5.56mm', clip: 200 }),
  w('M4A1 Colt Carbine', 'Primary', 'Rifle', [55, 60], [47, 52], 2.8, "Big Al's Gun Shop", { itemId: 27, caliber: '5.56mm', clip: 30 }),
  w('Mag 7', 'Primary', 'Shotgun', [56, 61], [62, 67], 2.7, 'South Africa', { itemId: 225, caliber: '12 Gauge', clip: 7 }),
  w('Minigun', 'Primary', 'Machine Gun', [72, 77], [28, 33], 1.3, 'Mexico', { itemId: 63, caliber: '7.62mm', clip: 500, rof: [10, 20] }),
  w('MP 40', 'Primary', 'SMG', [37, 42], [41, 46], 2.8, 'City Find', { caliber: '9mm', clip: 32 }),
  w('MP5 Navy', 'Primary', 'SMG', [45, 50], [51, 56], 3.1, "Big Al's Gun Shop", { itemId: 24, caliber: '9mm', clip: 30 }),

  // ----------------------------------------------------------- SECONDARY
  w('Type 98 Anti Tank', 'Secondary', 'Heavy Artillery', [78, 83], [25, 30], 1.3, 'Hawaii', { itemId: 240, caliber: 'Warhead', clip: 1, rof: [1, 1], specialAmmo: 'PI, IN' }),
  w('Beretta 92FS', 'Secondary', 'Pistol', [48, 53], [51, 56], 4.5, 'Small Arms Cache', { itemId: 17, caliber: '9mm', clip: 20, rof: [3, 6], specialAmmo: 'HP, TR, PI, IN' }),
  w('Beretta M9', 'Secondary', 'Pistol', [36, 41], [54, 59], 4.5, "Big Al's Gun Shop", { itemId: 15, caliber: '9mm', clip: 17, rof: [4, 5], specialAmmo: 'HP, TR, PI, IN' }),
  w('Beretta Pico', 'Secondary', 'Pistol', [54, 59], [53, 58], 4.9, 'Leslie loot', { caliber: '.380', clip: 6, rof: [1, 2], specialAmmo: 'HP, TR, PI, IN' }),
  w('Blowgun', 'Secondary', 'Piercing', [15, 20], [39, 44], 6.6, 'China', { itemId: 244, caliber: 'Dart', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('Blunderbuss', 'Secondary', 'Shotgun', [46, 51], [24, 29], 3.2, 'City Find', { caliber: '12 Gauge', clip: 1, rof: [1, 1], specialAmmo: 'HP, TR, PI, IN' }),
  w('BT MP9', 'Secondary', 'SMG', [61, 66], [55, 60], 3.4, 'Japan', { itemId: 233, caliber: '9mm', clip: 30, rof: [2, 25], specialAmmo: 'HP, TR, PI, IN' }),
  w('China Lake', 'Secondary', 'Heavy Artillery', null, null, 1.5, 'Heavy Arms Cache', { caliber: '40mm Grenade', clip: 3, rof: [1, 1], specialAmmo: 'None' }),
  w('Cobra Derringer', 'Secondary', 'Pistol', [61, 66], [53, 58], 4.5, 'Mexico', { itemId: 177, caliber: '.45', clip: 2, rof: [1, 2], specialAmmo: 'HP, TR, PI, IN' }),
  w('Crossbow', 'Secondary', 'Piercing', [35, 40], [63, 68], 4.6, 'United Kingdom', { itemId: 218, caliber: 'Bolt', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('Desert Eagle', 'Secondary', 'Pistol', [59, 64], [36, 41], 4.3, 'Mexico', { itemId: 20, caliber: '.44', clip: 8, rof: [2, 3], specialAmmo: 'HP' }),
  w('Dual 92G Berettas', 'Secondary', 'Pistol', [64, 69], [30, 35], 3.2, 'City Find', { itemId: 21, caliber: '9mm', clip: 46, rof: [5, 15], specialAmmo: 'HP, TR, PI, IN' }),
  w('Fiveseven', 'Secondary', 'Pistol', [52, 57], [49, 54], 4.9, "Big Al's Gun Shop", { itemId: 18, caliber: '5.7mm', clip: 20, rof: [6, 7], specialAmmo: 'HP, TR, PI, IN' }),
  w('Flamethrower', 'Secondary', 'Heavy Artillery', [67, 72], [39, 44], 1.1, 'Argentina', { itemId: 255, caliber: 'Litre of Fuel', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('Flare Gun', 'Secondary', 'Pistol', [18, 23], [22, 27], 4.8, 'Mexico', { itemId: 230, caliber: 'Flare', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('Glock 17', 'Secondary', 'Pistol', [28, 33], [53, 58], 4.5, "Big Al's Gun Shop", { itemId: 12, caliber: '9mm', clip: 20, rof: [3, 6], specialAmmo: 'HP, TR, PI, IN' }),
  w('Harpoon', 'Secondary', 'Piercing', [47, 52], [63, 68], 5.0, 'Cayman Islands', { caliber: 'Bolt', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('Homemade Pocket Shotgun', 'Secondary', 'Shotgun', [63, 68], [60, 65], 2.4, 'DUKE loot', { caliber: '12 Gauge', clip: 1, rof: [1, 1], specialAmmo: 'HP, TR, PI, IN' }),
  w('Lorcin 380', 'Secondary', 'Pistol', [27, 32], [41, 46], 4.8, 'Canada', { itemId: 253, caliber: '.380', clip: 6, rof: [1, 5], specialAmmo: 'HP, TR, PI, IN' }),
  w('Luger', 'Secondary', 'Pistol', [35, 40], [48, 53], 4.7, 'City Find', { caliber: '9mm', clip: 8, rof: [1, 3], specialAmmo: 'HP, TR, PI, IN' }),
  w('Magnum', 'Secondary', 'Pistol', [55, 60], [38, 43], 3.8, "Big Al's Gun Shop", { itemId: 19, caliber: '.44', clip: 6, rof: [1, 2], specialAmmo: 'HP' }),
  w('Milkor MGL', 'Secondary', 'Heavy Artillery', [74, 79], [39, 44], 1.4, 'Heavy Arms Cache', { caliber: '40mm Grenade', clip: 6, rof: [1, 1], specialAmmo: 'None' }),
  w('MP5k', 'Secondary', 'SMG', [42, 47], [52, 57], 3.1, 'City Find', { caliber: '9mm', clip: 15, rof: [5, 7], specialAmmo: 'HP, TR, PI, IN' }),
  w('Pink Mac-10', 'Secondary', 'SMG', [74, 79], [45, 50], 3.1, 'United Arab Emirates', { itemId: 388, caliber: '9mm', clip: 120, rof: [10, 15], specialAmmo: 'HP, TR, PI, IN' }),
  w('Qsz-92', 'Secondary', 'Pistol', [62, 67], [53, 58], 4.6, 'China', { itemId: 248, caliber: '9mm', clip: 15, rof: [2, 12], specialAmmo: 'HP, TR, PI, IN' }),
  w('Raven MP25', 'Secondary', 'Pistol', [29, 34], [52, 57], 4.9, "Big Al's Gun Shop", { itemId: 13, caliber: '.25', clip: 6, rof: [3, 5], specialAmmo: 'HP, TR, PI, IN' }),
  w('RPG Launcher', 'Secondary', 'Heavy Artillery', [77, 82], [39, 44], 0.8, 'City Find', { itemId: 109, caliber: 'RPG', clip: 1, rof: [1, 1], specialAmmo: 'PI, IN' }),
  w('Ruger 57', 'Secondary', 'Pistol', [32, 37], [56, 61], 4.9, "Big Al's Gun Shop", { caliber: '5.7mm', clip: 20, rof: [3, 4], specialAmmo: 'HP, TR, PI, IN' }),
  w('S&W M29', 'Secondary', 'Pistol', [47, 52], [52, 57], 4.0, 'Mission Shop', { itemId: 254, caliber: '.44', clip: 6, rof: [2, 5], specialAmmo: 'HP' }),
  w('S&W Revolver', 'Secondary', 'Pistol', [42, 47], [54, 59], 3.9, 'City Find', { itemId: 189, caliber: '.44', clip: 6, rof: [1, 2], specialAmmo: 'HP' }),
  w('Skorpion', 'Secondary', 'SMG', [40, 45], [54, 59], 3.1, 'City Find', { caliber: '9mm', clip: 20, rof: [3, 5], specialAmmo: 'HP, TR, PI, IN' }),
  w('Slingshot', 'Secondary', 'Clubbing', [14, 18], [54, 59], 7.1, 'City Find', { itemId: 393, caliber: 'Stone', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('SMAW Launcher', 'Secondary', 'Heavy Artillery', null, null, 1.1, 'Heavy Arms Cache', { caliber: 'Warhead', clip: 1, rof: [1, 1], specialAmmo: 'PI, IN' }),
  w('Springfield 1911', 'Secondary', 'Pistol', [33, 38], [57, 62], 4.6, 'Mexico', { itemId: 99, caliber: '.45', clip: 8, rof: [2, 3], specialAmmo: 'HP, TR, PI, IN' }),
  w('Taser', 'Secondary', 'Mechanical', [1, 5], [54, 59], 6.1, 'Mexico', { itemId: 175, caliber: 'Taser Cartridge', clip: 2, rof: [1, 1], specialAmmo: 'None' }),
  w('Taurus', 'Secondary', 'Pistol', [30, 35], [57, 62], 4.5, 'Hawaii', { itemId: 243, caliber: '9mm', clip: 13, rof: [1, 12], specialAmmo: 'HP, TR, PI, IN' }),
  w('TMP', 'Secondary', 'SMG', [38, 43], [45, 50], 3.3, 'City Find', { caliber: '9mm', clip: 15, rof: [3, 6], specialAmmo: 'HP, TR, PI, IN' }),
  w('Tranquilizer Gun', 'Secondary', 'Piercing', [15, 20], [45, 50], 7.2, 'Coming Soon', { caliber: 'Dart', clip: 1, rof: [1, 1], specialAmmo: 'None' }),
  w('USP', 'Secondary', 'Pistol', [44, 49], [58, 63], 4.5, "Big Al's Gun Shop", { itemId: 16, caliber: '9mm', clip: 15, rof: [4, 5], specialAmmo: 'HP, TR, PI, IN' }),

  // -------------------------------------------------------------- MELEE
  w('Axe', 'Melee', 'Clubbing', [34, 39], [52, 57], 5.9, 'Mexico', { itemId: 8 }),
  w('Baseball Bat', 'Melee', 'Clubbing', [16, 21], [57, 62], 6.6, "Big Al's Gun Shop", { itemId: 2 }),
  w('Blood Spattered Sickle', 'Melee', 'Slashing', [36, 41], [55, 60], 6.1, 'Halloween 2010'),
  w('Bone Saw', 'Melee', 'Slashing', [54, 58], [52, 56], 6.3, 'Crime result'),
  w('Bo Staff', 'Melee', 'Clubbing', [13, 18], [55, 60], 5.6, 'China', { itemId: 245 }),
  w('Bread Knife', 'Melee', 'Slashing', [41, 43], [65, 70], 7.6, 'Jimmy loot'),
  w('Bug Swatter', 'Melee', 'Slashing', [5, 10], [59, 64], 7.8, 'Bug Bounty Program'),
  w('Butterfly Knife', 'Melee', 'Piercing', [24, 29], [55, 60], 8.3, "Big Al's Gun Shop", { itemId: 173 }),
  w('Cattle Prod', 'Melee', 'Mechanical', [1, 6], [59, 64], 6.6, 'Crime result'),
  w('Chain Whip', 'Melee', 'Slashing', [31, 36], [52, 57], 4.9, 'Japan', { itemId: 234 }),
  w('Chainsaw', 'Melee', 'Mechanical', [61, 66], [23, 28], 3.0, "Big Al's Gun Shop", { itemId: 10 }),
  w('Claymore Sword', 'Melee', 'Slashing', [57, 62], [49, 54], 4.3, 'United Kingdom', { itemId: 217 }),
  w('Cleaver', 'Melee', 'Slashing', [51, 56], [56, 61], 6.6, 'City Find'),
  w('Cricket Bat', 'Melee', 'Clubbing', [18, 23], [42, 47], 6.9, 'United Kingdom', { itemId: 438 }),
  w('Crowbar', 'Melee', 'Clubbing', [20, 25], [52, 57], 6.6, "Big Al's Gun Shop", { itemId: 3 }),
  w('Dagger', 'Melee', 'Piercing', [28, 33], [60, 65], 7.8, "Big Al's Gun Shop", { itemId: 7 }),
  w("Devil's Pitchfork", 'Melee', 'Piercing', [61, 66], [41, 46], 5.0, 'Halloween 2011'),
  w('Diamond Bladed Knife', 'Melee', 'Piercing', [60, 65], [62, 67], 7.1, 'Cayman Islands'),
  w('Diamond Icicle', 'Melee', 'Piercing', [45, 50], [48, 53], 7.6, 'Christmas 2011'),
  w('Dual Axes', 'Melee', 'Clubbing', [70, 75], [54, 59], 4.1, 'Old mission system', { itemId: 289 }),
  w('Dual Hammers', 'Melee', 'Clubbing', [70, 75], [54, 59], 4.5, 'Old mission system', { itemId: 290 }),
  w('Dual Samurai Swords', 'Melee', 'Slashing', [70, 75], [54, 59], 3.6, 'Old mission system', { itemId: 292 }),
  w('Dual Scimitars', 'Melee', 'Slashing', [70, 75], [54, 59], 4.3, 'Old mission system', { itemId: 291 }),
  w("Duke's Hammer", 'Melee', 'Clubbing', [18, 18], [55, 55], 7.6, "Duke's mission"),
  w('Fine Chisel', 'Melee', 'Piercing', [16, 21], [50, 55], 8.0, 'Old mission system', { itemId: 359 }),
  w('Flail', 'Melee', 'Clubbing', [71, 76], [28, 33], 5.8, 'United Kingdom', { itemId: 397 }),
  w('Frying Pan', 'Melee', 'Clubbing', [19, 24], [43, 48], 6.0, 'United Kingdom', { itemId: 439 }),
  w('Golden Broomstick', 'Melee', 'Clubbing', [60, 65], [48, 53], 5.8, 'Halloween 2011'),
  w('Golf Club', 'Melee', 'Clubbing', [29, 32], [59, 63], 6.2, 'Crime result'),
  w('Guandao', 'Melee', 'Slashing', [63, 68], [35, 40], 5.0, 'China', { itemId: 400 }),
  w('Hammer', 'Melee', 'Clubbing', [17, 22], [55, 60], 7.6, "Big Al's Gun Shop", { itemId: 1 }),

  // Unarmed options are real loadout choices in Torn, so they belong in the table.
  w('Fists (unarmed)', 'Melee', 'Clubbing', [10, 10], [50, 50], 10.0, 'Always available', {
    specialAmmo: 'None',
  }),
  w('Kick (unarmed)', 'Melee', 'Clubbing', [30, 30], [40.71, 40.71], 10.0, 'Unlocked by DEF2720 (Kick Boxing)', {
    specialAmmo: 'None',
  }),
];

/** Mid-roll helpers — comparisons in the UI use the average of min/max. */
export const midDamage = (weapon: Weapon): number | null =>
  weapon.damage ? (weapon.damage[0] + weapon.damage[1]) / 2 : null;

export const midAccuracy = (weapon: Weapon): number | null =>
  weapon.accuracy ? (weapon.accuracy[0] + weapon.accuracy[1]) / 2 : null;

export const midRof = (weapon: Weapon): number => (weapon.rof ? (weapon.rof[0] + weapon.rof[1]) / 2 : 1);

/**
 * A deliberately simple, transparent "expected damage per attack" score:
 * mid damage × mid accuracy × mid rate of fire.
 *
 * It is NOT a combat simulator — it ignores range, ammo cost, stealth, charms,
 * weapon experience, education and the target's armour. It exists so that
 * loadouts can be ranked consistently instead of by vibes.
 */
export function loadoutScore(weapon: Weapon): number | null {
  const dmg = midDamage(weapon);
  const acc = midAccuracy(weapon);
  if (dmg === null || acc === null) return null;
  return dmg * acc * midRof(weapon);
}

export const WEAPON_TYPES: WeaponType[] = [
  'Rifle',
  'Machine Gun',
  'SMG',
  'Shotgun',
  'Heavy Artillery',
  'Pistol',
  'Clubbing',
  'Slashing',
  'Piercing',
  'Mechanical',
];

export const WEAPON_SLOTS: WeaponSlot[] = ['Primary', 'Secondary', 'Melee'];
