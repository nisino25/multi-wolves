export const rules = {
  werewolf: {team: 'wolves',description: 'Each night the Werewolf can vote on a player to kill and talk with the other Werewolves. Though it is the most basic role of the wolf team, the werewolf still provides essential support to its team when played well.', winCondition: `The werewolves have to kill the Random Killer and kill all villagers.`,todo: `Choose your target`},

  // ------------------------------------------------

  villager: {team: 'villagers',description: 'You are a regular villager without any abilities. You belong to the village team.', winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`,todo: `You can't do anything at night`},

  seer: {team: 'villagers',description: 'Each night, the Seer can see the role of one player.', winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`,todo: `Choose a player to see the role ` },

  detective: {team: 'villagers',description: 'Each night, the detective selects two players. He will then see immediately if these two players are on the same team or not. If the players are on the same team', winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`,todo: `Choose two players to see if the players are on the same team `} ,

  loudmouth: {team: 'villagers',description: `The Loudmouth can select a player. That player's role will be revealed to everyone when the Loudmouth dies.`, winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`,todo: `Choose your target to reveal their role when you die`} ,
  
  sister: {team: 'villagers',description: `The sister is an ordinary villager, except it can see other players with the same role.`, winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`,todo: ``} ,

  handsomeprince: {team: 'villagers',description: `The Handsome Prince has no night actions. The first time the village try to lynch him, he survives and instead reveals his role.`, winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`,todo: ``} ,

  

  // ------------------------------------------------
  fool: {team: 'solos',description: 'The Fool has no special abilities besides talking and voting during the day.', winCondition: `The Fool wins the game if they are lynched by the village.`,todo: `You can't do anything at night`},

 
}