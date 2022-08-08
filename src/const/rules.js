export const rules = {
  werewolf: {team: 'wolves',description: 'Each night the Werewolf can vote on a player to kill and talk with the other Werewolves. Though it is the most basic role of the wolf team, the werewolf still provides essential support to its team when played well.', winCondition: `The werewolves have to kill the Random Killer and kill all villagers.`},

  // ------------------------------------------------

  villager: {team: 'villagers',description: 'You are a regular villager without any abilities. You belong to the village team.', winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`},

  seer: {team: 'villagers',description: 'Each night, the Seer can see the role of one player.', winCondition: `They win when all Werewolves and Solo Killers are dead, but fools do not have to be dead.`},

  // ------------------------------------------------
  fool: {team: 'solos',description: 'The Fool has no special abilities besides talking and voting during the day.', winCondition: `The Fool wins the game if they are lynched by the village.`},

 
}