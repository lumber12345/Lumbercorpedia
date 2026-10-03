/**
 * Item database.
 *
 * Torn does not publish an official item catalogue anywhere in the game — item
 * IDs are only visible through the API (and then only if you already own the
 * item). Lumbercorpedia ships a browsable, searchable catalogue so you can look
 * up an ID, work out where an item comes from, and know what it is for.
 *
 * `id` values are taken from Torn's global item list. Entries without an id are
 * listed for reference only (usually because the item has been retired).
 */

export type ItemCategory =
  | 'Weapon'
  | 'Armor'
  | 'Drug'
  | 'Booster'
  | 'Medical'
  | 'Crime Tool'
  | 'Plushie'
  | 'Flower'
  | 'Artifact'
  | 'Collectible'
  | 'Car'
  | 'Clothing'
  | 'Electronics'
  | 'Consumable'
  | 'Tool & Material'
  | 'Property'
  | 'Miscellaneous';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'limited' | 'event';

export interface Item {
  id: number | null;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  /** Where players actually get it. */
  source: string;
  note?: string;
}

const it = (
  id: number | null,
  name: string,
  category: ItemCategory,
  rarity: Rarity,
  source: string,
  note?: string,
): Item => ({ id, name, category, rarity, source, note });

export const ITEMS: Item[] = [
  // ---------------------------------------------------------------- ARMOR
  it(32, 'Leather Vest', 'Armor', 'common', "Big Al's Gun Shop / drops"),
  it(33, 'Police Vest', 'Armor', 'common', 'Drops / city shops'),
  it(34, 'Bulletproof Vest', 'Armor', 'common', 'City shops / drops'),
  it(49, 'Full Body Armor', 'Armor', 'uncommon', 'City shops'),
  it(50, 'Outer Tactical Vest', 'Armor', 'uncommon', 'Armor caches / market'),
  it(176, 'Chain Mail', 'Armor', 'rare', 'Old mission system', 'Retired mission reward'),
  it(178, 'Flak Jacket', 'Armor', 'uncommon', 'Drops / market'),
  it(332, 'Combat Vest', 'Armor', 'uncommon', 'Crime results / market'),
  it(333, 'Liquid Body Armor', 'Armor', 'rare', 'Crime results', 'Armour set member'),
  it(334, 'Flexible Body Armor', 'Armor', 'rare', 'Crime results', 'Armour set member'),
  it(357, 'Kevlar Helmet', 'Armor', 'uncommon', 'Drops'),
  it(348, 'Hazmat Suit', 'Armor', 'uncommon', 'Crime results'),
  it(107, 'Trench Coat', 'Clothing', 'uncommon', 'City shops', 'Popular early-game stealth look'),

  // ----------------------------------------------------------------- DRUGS
  it(196, 'Cannabis', 'Drug', 'common', 'Abroad (Mexico)', 'Nerve top-up'),
  it(197, 'Ecstasy', 'Drug', 'common', 'Abroad', 'Doubles happiness'),
  it(198, 'Ketamine', 'Drug', 'common', 'Abroad / 5* Farm & Zoo job points'),
  it(199, 'LSD', 'Drug', 'common', 'Abroad'),
  it(200, 'Opium', 'Drug', 'common', 'Abroad', 'Hospital clear'),
  it(201, 'PCP', 'Drug', 'common', 'Abroad'),
  it(203, 'Shrooms', 'Drug', 'common', 'Abroad'),
  it(204, 'Speed', 'Drug', 'common', 'Abroad'),
  it(205, 'Vicodin', 'Drug', 'common', 'Abroad'),
  it(206, 'Xanax', 'Drug', 'common', 'Abroad', 'The energy standard'),
  it(66, 'Morphine', 'Medical', 'uncommon', 'Hospital / market', 'Instant hospital release'),

  // -------------------------------------------------------------- BOOSTERS
  it(361, 'Neumune Tablet', 'Booster', 'rare', 'Faction armory / market', 'Faction medical booster'),
  it(385, 'Tribulus Omanense', 'Booster', 'rare', 'Abroad / market', 'Strength booster'),
  it(386, 'Sports Sneakers', 'Booster', 'rare', 'Nikeh / market', 'Speed booster'),
  it(67, 'First Aid Kit', 'Medical', 'common', 'City shops / drops', 'Heals 50% of life'),
  it(68, 'Small First Aid Kit', 'Medical', 'common', 'City shops / drops', 'Heals 25% of life'),
  it(365, 'Box of Medical Supplies', 'Medical', 'uncommon', 'Faction armory'),
  it(370, 'Drug Pack', 'Booster', 'rare', 'Crime results / market', 'Contains a random drug'),
  it(283, 'Donator Pack', 'Booster', 'event', 'Donator house', 'Opens into a donator item'),
  it(327, 'Blank Tokens', 'Tool & Material', 'uncommon', 'Crimes / market'),
  it(328, 'Blank Credit Cards', 'Tool & Material', 'uncommon', 'Card skimming crimes'),

  // ----------------------------------------------------------- CRIME TOOLS
  it(null, 'Metal Detector', 'Crime Tool', 'uncommon', 'Market / crimes', 'Search for Cash & Shoplifting'),
  it(null, 'Cemetery Key', 'Crime Tool', 'rare', 'Market / crimes', 'Search for Cash & Shoplifting'),
  it(null, 'Glasses', 'Crime Tool', 'uncommon', 'Market', 'Search for Cash enhancer'),
  it(154, 'Laptop', 'Electronics', 'uncommon', 'City shops / drops', 'Virus coding, Bootlegging, Card Skimming'),
  it(61, 'Personal Computer', 'Electronics', 'common', 'City shops', 'Virus coding & crime tool'),
  it(44, 'Pack of Blank CDs : 100', 'Tool & Material', 'common', 'City shops', 'Bootlegging'),
  it(null, 'High-Speed Drive', 'Crime Tool', 'rare', 'Market', 'Bootlegging enhancer'),
  it(null, 'Paint Mask', 'Crime Tool', 'uncommon', 'Market', 'Graffiti enhancer'),
  it(null, 'Ladder', 'Crime Tool', 'common', 'City shops', 'Graffiti'),
  it(null, 'Wire Cutters', 'Crime Tool', 'common', 'City shops', 'Graffiti'),
  it(null, 'Mountain Bike', 'Crime Tool', 'uncommon', 'Market', 'Shoplifting enhancer'),
  it(null, 'Cut-Throat Razor', 'Crime Tool', 'uncommon', 'Market', 'Pickpocketing enhancer'),
  it(null, 'Duct Tape', 'Crime Tool', 'common', 'City shops', 'Card Skimming enhancer'),
  it(null, 'Spy Camera', 'Crime Tool', 'rare', 'Market', 'Card Skimming'),
  it(null, 'Card Skimmer', 'Crime Tool', 'rare', 'Market', 'Card Skimming'),
  it(null, 'Flashlight', 'Crime Tool', 'common', 'City shops', 'Burglary enhancer'),
  it(null, 'Jemmy', 'Crime Tool', 'uncommon', 'City shops', 'Burglary'),
  it(null, 'Window Breaker', 'Crime Tool', 'uncommon', 'City shops', 'Burglary'),
  it(null, 'Lockpicks', 'Crime Tool', 'uncommon', 'City shops', 'Burglary'),
  it(null, 'Credit Card', 'Crime Tool', 'uncommon', 'Market', 'Burglary'),
  it(null, 'Rope', 'Crime Tool', 'common', 'City shops', 'Burglary'),
  it(156, 'Skeleton Key', 'Crime Tool', 'rare', 'Market / drops', 'Burglary & other crimes'),
  it(392, 'Pepper Spray', 'Crime Tool', 'common', 'City shops', 'Self defence'),
  it(159, 'Bolt Cutters', 'Crime Tool', 'uncommon', 'City shops / drops'),
  it(402, 'Ice Pick', 'Crime Tool', 'common', 'City shops'),
  it(401, 'Lead Pipe', 'Crime Tool', 'common', 'City shops', 'Improvised melee'),
  it(394, 'Brick', 'Crime Tool', 'common', 'City shops'),
  it(256, 'Tear Gas', 'Crime Tool', 'uncommon', 'Market'),
  it(190, 'C4 Explosive', 'Crime Tool', 'rare', 'Market / crimes'),
  it(380, 'Small Explosive Device', 'Crime Tool', 'uncommon', 'Crimes'),
  it(364, 'Box of Grenades', 'Crime Tool', 'rare', 'Crimes / market'),

  // --------------------------------------------------------------- PLUSHIES
  it(186, 'Sheep Plushie', 'Plushie', 'uncommon', 'Travel / museum trade'),
  it(187, 'Teddy Bear Plushie', 'Plushie', 'uncommon', 'Travel / museum trade'),
  it(258, 'Jaguar Plushie', 'Plushie', 'rare', 'South America'),
  it(261, 'Wolverine Plushie', 'Plushie', 'rare', 'Canada'),
  it(266, 'Nessie Plushie', 'Plushie', 'rare', 'United Kingdom'),
  it(268, 'Red Fox Plushie', 'Plushie', 'uncommon', 'Travel'),
  it(269, 'Monkey Plushie', 'Plushie', 'uncommon', 'Travel'),
  it(273, 'Chamois Plushie', 'Plushie', 'rare', 'Switzerland'),
  it(274, 'Panda Plushie', 'Plushie', 'rare', 'China'),
  it(281, 'Lion Plushie', 'Plushie', 'rare', 'South Africa'),
  it(384, 'Camel Plushie', 'Plushie', 'rare', 'United Arab Emirates'),

  // ---------------------------------------------------------------- FLOWERS
  it(97, 'Bunch of Flowers', 'Flower', 'common', 'City shops'),
  it(129, 'Dozen Roses', 'Flower', 'uncommon', 'City shops / travel'),
  it(183, 'Single Red Rose', 'Flower', 'common', 'City shops'),
  it(184, 'Bunch of Black Roses', 'Flower', 'uncommon', 'City shops'),
  it(216, 'Single White Rose', 'Flower', 'common', 'City shops'),
  it(435, 'Dozen White Roses', 'Flower', 'uncommon', 'City shops'),
  it(260, 'Dahlia', 'Flower', 'rare', 'Mexico'),
  it(263, 'Crocus', 'Flower', 'common', 'United Kingdom'),
  it(264, 'Orchid', 'Flower', 'uncommon', 'China'),
  it(267, 'Heather', 'Flower', 'common', 'United Kingdom'),
  it(271, 'Ceibo Flower', 'Flower', 'rare', 'Argentina'),
  it(272, 'Edelweiss', 'Flower', 'rare', 'Switzerland'),
  it(276, 'Peony', 'Flower', 'uncommon', 'China'),
  it(277, 'Cherry Blossom', 'Flower', 'rare', 'Japan'),
  it(282, 'African Violet', 'Flower', 'uncommon', 'South Africa'),

  // -------------------------------------------------------------- ARTIFACTS
  it(259, 'Mayan Statue', 'Artifact', 'rare', 'Mexico'),
  it(265, 'Pele Charm', 'Artifact', 'rare', 'Hawaii'),
  it(275, 'Jade Buddha', 'Artifact', 'rare', 'China'),
  it(278, 'Kabuki Mask', 'Artifact', 'rare', 'Japan'),
  it(279, 'Maneki Neko', 'Artifact', 'rare', 'Japan'),
  it(280, 'Elephant Statue', 'Artifact', 'rare', 'South Africa'),
  it(450, 'Leopard Coin', 'Artifact', 'rare', 'South Africa'),
  it(451, 'Florin Coin', 'Artifact', 'rare', 'Europe'),
  it(452, 'Gold Noble Coin', 'Artifact', 'rare', 'United Kingdom'),
  it(453, 'Ganesha Sculpture', 'Artifact', 'rare', 'Museum / trade'),
  it(454, 'Vairocana Buddha Sculpture', 'Artifact', 'rare', 'Museum / trade'),
  it(455, 'Quran Script : Ibn Masud', 'Artifact', 'rare', 'United Arab Emirates'),
  it(456, 'Quran Script : Ubay Ibn Kab', 'Artifact', 'rare', 'United Arab Emirates'),
  it(457, 'Quran Script : Ali', 'Artifact', 'rare', 'United Arab Emirates'),
  it(458, 'Shabti Sculpture', 'Artifact', 'rare', 'Museum / trade'),
  it(459, 'Egyptian Amulet', 'Artifact', 'rare', 'Museum / trade'),
  it(460, 'White Senet Pawn', 'Artifact', 'rare', 'Museum / trade'),
  it(461, 'Black Senet Pawn', 'Artifact', 'rare', 'Museum / trade'),

  // ------------------------------------------------------------ COLLECTIBLES
  it(116, 'Yoda Figurine', 'Collectible', 'rare', 'Old mission system'),
  it(117, 'Trojan Horse', 'Collectible', 'rare', 'Old mission system'),
  it(118, 'Evil Doll', 'Collectible', 'rare', 'Old mission system'),
  it(119, 'Rubber Ducky of Doom', 'Collectible', 'rare', 'Old mission system'),
  it(120, 'Teppic Bear', 'Collectible', 'rare', 'Old mission system'),
  it(121, 'RockerHead Doll', 'Collectible', 'rare', 'Old mission system'),
  it(122, 'Mouser Doll', 'Collectible', 'rare', 'Old mission system'),
  it(123, 'Elite Action Man', 'Collectible', 'rare', 'Old mission system'),
  it(124, 'Toy Reactor', 'Collectible', 'rare', 'Old mission system'),
  it(125, 'Royal Doll', 'Collectible', 'rare', 'Old mission system'),
  it(126, 'Blue Dragon', 'Collectible', 'rare', 'Old mission system'),
  it(127, 'China Tea Set', 'Collectible', 'rare', 'China'),
  it(131, 'Lego Hurin', 'Collectible', 'rare', 'Old mission system'),
  it(132, 'Mystical Sphere', 'Collectible', 'rare', 'Old mission system'),
  it(133, '10 Ton Pacifier', 'Collectible', 'rare', 'Old mission system'),
  it(134, 'Horse', 'Collectible', 'rare', 'Old mission system'),
  it(135, "Uriel's Speakers", 'Collectible', 'rare', 'Old mission system'),
  it(136, 'Strife Clown', 'Collectible', 'rare', 'Old mission system'),
  it(137, 'Locked Teddy', 'Collectible', 'rare', 'Old mission system'),
  it(138, "Riddle's Bat", 'Collectible', 'rare', 'Old mission system'),
  it(142, 'Cookie Jar', 'Collectible', 'uncommon', 'Old mission system'),
  it(143, 'Vanity Mirror', 'Collectible', 'uncommon', 'Old mission system'),
  it(144, 'Banana Phone', 'Collectible', 'rare', 'Old mission system'),
  it(146, 'Yasukuni Sword', 'Collectible', 'rare', 'Japan / old missions'),
  it(147, 'Rusty Sword', 'Collectible', 'uncommon', 'Old mission system'),
  it(149, 'Lucky Dime', 'Collectible', 'uncommon', 'Old mission system'),
  it(150, 'Crystal Carousel', 'Collectible', 'rare', 'Old mission system'),
  it(152, 'Ice Sculpture', 'Collectible', 'rare', 'Old mission system'),
  it(158, 'Statue Of Aeolus', 'Collectible', 'rare', 'Old mission system'),
  it(161, 'Black Unicorn', 'Collectible', 'rare', 'Old mission system'),
  it(163, 'Official Ninja Kit', 'Collectible', 'rare', 'Old mission system'),
  it(165, 'Chocobo Flute', 'Collectible', 'rare', 'Old mission system'),
  it(170, 'Wand of Destruction', 'Collectible', 'rare', 'Old mission system'),
  it(288, 'Mr Brownstone Doll', 'Collectible', 'rare', 'Old mission system'),
  it(371, 'Dark Doll', 'Collectible', 'rare', 'Crime results'),
  it(391, 'Macana', 'Collectible', 'rare', 'Crime results'),
  it(355, 'Citrus Squeezer', 'Collectible', 'uncommon', 'Drops'),
  it(356, 'Superman Shades', 'Collectible', 'uncommon', 'Drops'),
  it(404, 'Bandana', 'Clothing', 'common', 'City shops'),
  it(406, 'Afro Comb', 'Collectible', 'uncommon', 'Drops'),
  it(413, 'Mountie Hat', 'Clothing', 'uncommon', 'Canada'),
  it(414, 'Proda Sunglasses', 'Clothing', 'uncommon', 'Drops'),
  it(415, 'Ship in a Bottle', 'Collectible', 'uncommon', 'Drops'),
  it(419, 'Small Suitcase', 'Collectible', 'uncommon', 'Drops'),
  it(420, 'Medium Suitcase', 'Collectible', 'uncommon', 'Drops'),
  it(421, 'Large Suitcase', 'Collectible', 'uncommon', 'Drops'),
  it(396, 'Business Class Ticket', 'Consumable', 'uncommon', 'Travel agency', 'Skips a travel wait'),
  it(367, 'Feathery Hotel Coupon', 'Consumable', 'uncommon', 'Travel', 'Free hotel stay'),
  it(369, 'Lottery Voucher', 'Consumable', 'uncommon', 'City shops', 'Weekly lottery entry'),
  it(368, 'Lawyer Business Card', 'Consumable', 'uncommon', 'Crimes', 'Reduces jail time'),

  // ------------------------------------------------------------------ CARS
  it(94, 'Reliant Robin', 'Car', 'common', 'Dealership / dump'),
  it(91, 'Volkswagen Beetle', 'Car', 'common', 'Dealership'),
  it(90, 'Honda Civic', 'Car', 'common', 'Dealership'),
  it(92, 'Chevrolet Cavalier', 'Car', 'common', 'Dealership'),
  it(93, 'Ford Mustang', 'Car', 'common', 'Dealership'),
  it(89, 'Honda Accord', 'Car', 'common', 'Dealership'),
  it(88, 'Honda Integra R', 'Car', 'uncommon', 'Dealership'),
  it(87, 'Audi S4', 'Car', 'uncommon', 'Dealership'),
  it(86, 'Hummer H3', 'Car', 'uncommon', 'Dealership'),
  it(85, 'Ford GT40', 'Car', 'rare', 'Dealership'),
  it(84, 'Pontiac Firebird', 'Car', 'uncommon', 'Dealership'),
  it(83, 'Dodge Charger', 'Car', 'uncommon', 'Dealership'),
  it(82, 'Chevrolet Corvette Z06', 'Car', 'rare', 'Dealership'),
  it(81, 'BMW Z8', 'Car', 'rare', 'Dealership'),
  it(80, 'BMW M5', 'Car', 'rare', 'Dealership'),
  it(79, 'Audi TT Quattro', 'Car', 'uncommon', 'Dealership'),
  it(78, 'Honda NSX', 'Car', 'rare', 'Dealership'),
  it(77, 'Toyota MR2', 'Car', 'uncommon', 'Dealership'),
  it(354, 'Motorbike', 'Car', 'uncommon', 'Drops / market'),

  // ---------------------------------------------------------- ELECTRONICS
  it(41, 'DVD Player', 'Electronics', 'common', 'City shops'),
  it(42, 'MP3 Player', 'Electronics', 'common', 'City shops'),
  it(43, 'CD Player', 'Electronics', 'common', 'City shops'),
  it(104, 'Playstation', 'Electronics', 'uncommon', 'City shops'),
  it(105, 'Xbox', 'Electronics', 'uncommon', 'City shops'),
  it(145, 'Xbox 360', 'Electronics', 'uncommon', 'City shops'),
  it(65, 'Big TV Screen', 'Electronics', 'uncommon', 'City shops'),
  it(62, 'Microwave', 'Electronics', 'common', 'City shops'),
  it(381, 'Gold Laptop', 'Electronics', 'rare', 'Crime results'),
  it(383, 'Platinum PDA', 'Electronics', 'rare', 'Crime results'),

  // ----------------------------------------------------------- CONSUMABLES
  it(35, 'Box of Chocolate Bars', 'Consumable', 'common', 'City shops', '+5 happiness'),
  it(36, 'Big Box of Chocolate Bars', 'Consumable', 'common', 'City shops', '+10 happiness'),
  it(37, 'Bag of Bon Bons', 'Consumable', 'common', 'City shops'),
  it(38, 'Box of Bon Bons', 'Consumable', 'common', 'City shops'),
  it(39, 'Box of Extra Strong Mints', 'Consumable', 'common', 'City shops'),
  it(153, 'Case of Whiskey', 'Consumable', 'uncommon', 'Drops'),
  it(155, 'Purple Frog Doll', 'Consumable', 'uncommon', 'Drops'),
  it(180, 'Bottle of Beer', 'Consumable', 'common', 'City shops'),
  it(181, 'Bottle of Champagne', 'Consumable', 'uncommon', 'City shops'),
  it(182, 'Soap on a Rope', 'Consumable', 'uncommon', 'City shops'),
  it(353, 'Bag of Cheetos', 'Consumable', 'common', 'City shops'),
  it(352, 'BBQ Smoker', 'Consumable', 'uncommon', 'Drops'),
  it(403, 'Box of Tissues', 'Consumable', 'common', 'City shops'),
  it(405, 'Loaf of Bread', 'Consumable', 'common', 'City shops'),
  it(426, 'Bottle of Tequila', 'Consumable', 'uncommon', 'Mexico'),
  it(443, 'Strawberry Milkshake', 'Consumable', 'uncommon', 'City shops'),
  it(151, 'Pixie Sticks', 'Consumable', 'uncommon', 'Drops'),
  it(310, 'Lollipop', 'Consumable', 'common', 'Event drops'),

  // ------------------------------------------------------ TOOLS & MATERIALS
  it(45, 'Hard Drive', 'Tool & Material', 'common', 'City shops'),
  it(358, 'Raw Ivory', 'Tool & Material', 'rare', 'Crimes / market'),
  it(359, 'Fine Chisel', 'Tool & Material', 'rare', 'Old mission system'),
  it(360, 'Ivory Walking Cane', 'Tool & Material', 'rare', 'Crafted from raw ivory'),
  it(326, 'Printing Paper', 'Tool & Material', 'common', 'City shops'),
  it(295, 'Oriental Log', 'Tool & Material', 'uncommon', 'City find'),
  it(296, 'Oriental Log Translation', 'Tool & Material', 'uncommon', 'Japan'),
  it(337, 'Dirty Bomb', 'Tool & Material', 'limited', 'Crafted', 'Requires Cesium-137'),
  it(336, 'Cesium-137', 'Tool & Material', 'limited', 'Rare crime reward'),

  // -------------------------------------------------------------- PROPERTY
  it(315, 'Apartment Blueprint', 'Property', 'uncommon', 'Drops / market', 'Upgrades a property'),
  it(316, 'Semi-Detached House Blueprint', 'Property', 'uncommon', 'Drops / market'),
  it(317, 'Detached House Blueprint', 'Property', 'uncommon', 'Drops / market'),
  it(318, 'Beach House Blueprint', 'Property', 'rare', 'Drops / market'),
  it(319, 'Chalet Blueprint', 'Property', 'rare', 'Drops / market'),
  it(320, 'Villa Blueprint', 'Property', 'rare', 'Drops / market'),
  it(321, 'Penthouse Blueprint', 'Property', 'rare', 'Drops / market'),
  it(322, 'Mansion Blueprint', 'Property', 'rare', 'Drops / market'),
  it(323, 'Ranch Blueprint', 'Property', 'rare', 'Drops / market'),
  it(324, 'Palace Blueprint', 'Property', 'rare', 'Drops / market'),
  it(325, 'Castle Blueprint', 'Property', 'rare', 'Drops / market'),

  // --------------------------------------------------------- MISC / EVENT
  it(69, 'Simple Virus', 'Miscellaneous', 'common', 'Coded with CMT1520'),
  it(70, 'Polymorphic Virus', 'Miscellaneous', 'uncommon', 'Coded with CMT2530'),
  it(71, 'Tunneling Virus', 'Miscellaneous', 'uncommon', 'Coded with CMT2530'),
  it(72, 'Armored Virus', 'Miscellaneous', 'rare', 'Coded with CMT2560'),
  it(73, 'Stealth Virus', 'Miscellaneous', 'rare', 'Coded with CMT2560'),
  it(103, 'Firewalk Virus', 'Miscellaneous', 'rare', 'Coded with CMT2560 (after patch #368)'),
  it(106, 'Parachute', 'Miscellaneous', 'uncommon', 'City shops'),
  it(293, 'Japanese/English Dictionary', 'Miscellaneous', 'uncommon', 'Japan'),
  it(294, 'Bottle of Sake', 'Consumable', 'uncommon', 'Japan'),
  it(297, 'YouYou Yo Yo', 'Miscellaneous', 'uncommon', 'Japan'),
  it(298, 'Monkey Cuffs', 'Miscellaneous', 'rare', 'Old mission system'),
  it(299, "Jester's Cap", 'Clothing', 'rare', 'Old mission system'),
  it(300, "Gibal's Dragonfly", 'Miscellaneous', 'limited', 'Event'),
  it(338, "Sh0rty's Surfboard", 'Miscellaneous', 'limited', 'Event'),
  it(343, 'Backstage Pass', 'Miscellaneous', 'rare', 'Event'),
  it(344, "Chemi's Magic Potion", 'Miscellaneous', 'limited', 'Event'),
  it(202, "Mr Torn Crown '07", 'Collectible', 'limited', 'Mr Torn 2007'),
  it(207, "Ms Torn Crown '07", 'Collectible', 'limited', 'Ms Torn 2007'),
  it(362, "Mr Torn Crown '08", 'Collectible', 'limited', 'Mr Torn 2008'),
  it(363, "Ms Torn Crown '08", 'Collectible', 'limited', 'Ms Torn 2008'),
  it(389, "Mr Torn Crown '09", 'Collectible', 'limited', 'Mr Torn 2009'),
  it(390, "Ms Torn Crown '09", 'Collectible', 'limited', 'Ms Torn 2009'),
];

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Weapon',
  'Armor',
  'Drug',
  'Booster',
  'Medical',
  'Crime Tool',
  'Plushie',
  'Flower',
  'Artifact',
  'Collectible',
  'Car',
  'Clothing',
  'Electronics',
  'Consumable',
  'Tool & Material',
  'Property',
  'Miscellaneous',
];

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'limited', 'event'];
