// Goes in the Killed Tab of NPCs eligible to give "mastery points" to a Player.
// Mastery points increase a player's power and decreases negative side effects when using a transformation.
// Prototype of a script that gives mastery from all NPCs, and later a plug-in.
var reward = 1; // x levels of mastery should be awarded
var chance = 0.5; // % chance to gain mastery
var min = 100; // minimum lvl to be eligible to gain mastery
var max = 250; // maximum lvl to be eligible to gain mastery

// Get the stats of the player from the Dragon Block C mod.
var p = event.getSource().getMCEntity(); 
var nbt = p.getEntityData().func_74775_l("PlayerPersisted"); 
var str = nbt.func_74762_e("jrmcStrI");
var dex = nbt.func_74762_e("jrmcDexI"); 
var con = nbt.func_74762_e("jrmcCnsI"); 
var wil = nbt.func_74762_e("jrmcWilI"); 
var mnd = nbt.func_74762_e("jrmcIntI"); 
var spi = nbt.func_74762_e("jrmcCncI");
// Calculate player's level.
var level = ((str+dex+con+wil+mnd+spi)/5)-11;

if (Math.random() <= chance && level >= min && level< max){
  npc.executeCommand("/jrmcformmastery " + event.getSource().getName() + " add current " + reward);
  event.getSource().sendMessage("You have gained " + reward + " mastery.");
}
else{
  if (level < min){
    event.getSource().sendMessage("You aren't strong enough to get Mastery from this NPC! Needed level: " + min);
  }
  if (level >= max){
    event.getSource().sendMessage("You're too strong to gain mastery from this NPC. Seek training elsewhere...");
  }
}
