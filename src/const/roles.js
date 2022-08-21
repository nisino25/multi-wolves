export const roles = {
  wolves: [
    {team: 'wolves', name: 'werewolf', canMoveAtNight: true, default: true, doneWihtNightAction: false, }
  ],

  villagers:[
    {team: 'villagers', name: 'villager', canMoveAtNight: false, default: true, doneWihtNightAction: false, },
    {team: 'villagers', name: 'seer', canMoveAtNight: true, default: true, doneWihtNightAction: false,},
    {team: 'villagers', name: 'detective', canMoveAtNight: true, default: true, doneWihtNightAction: false,},
    {team: 'villagers', name: 'loudmouth', canMoveAtNight: true, default: true, doneWihtNightAction: false,},
    {team: 'villagers', name: 'sister', canMoveAtNight: false, default: true, doneWihtNightAction: false,},
    {team: 'villagers', name: 'handsomeprince', canMoveAtNight: false, default: true, doneWihtNightAction: false,},

  ],

  solos:[
    {team: 'solo', name: 'fool', canMoveAtNight: false, default: true, doneWihtNightAction: false,},
    // {team: 'solo', name: 'serial killer', canMoveAtNight: true, default: false, doneWihtNightAction: false, },
  ],
}