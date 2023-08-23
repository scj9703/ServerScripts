// The following goes in the Init Tab of an NPC.
npc.setTempData("Prev", npc.getMaxHealth()); // init at max hp
npc.setCombatRegen(1000); //default in-combat regen
npc.setHealthRegen(2000); // default out-of-combat regen

// The following goes in the Damaged Tab of an NPC.
var hp = npc.getHealth();
var prev = npc.getTempData("Prev");
var newval = prev - hp; // calculate the difference in HP, aka the damage dealt by player
if (newval > 0){
  // Changes NPC stats based on the player's damage.
  npc.setCombatRegen(newval);
  npc.setHealthRegen(newval*2);
  npc.setMeleeStrength(newval);
}
npc.setTempData("Prev", hp);
