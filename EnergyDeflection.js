// Used in the Damaged Tab of a CNPC.
var MAX = npc.getMaxHealth();
var HP = npc.getHealth();

var hpWhereKiCanBeUsed = MAX*0.5; 
if (event.getType() == "causeEnExplosion" || event.getType() == "EnergyAttack"){
if (HP > hpWhereKiCanBeUsed){
var p = event.getSource();
var perc = (hpWhereKiCanBeUsed/MAX)*100;
p.sendMessage("&7Deflected! Ki is only effective under &a" + perc + "&7% HP!");
npc.executeCommand("playsound jinryuudragonbc:DBC4.block " + p.getName() + " " + npc.x + " " + npc.y + " " + npc.z + " 1 1 1");
event.setCancelled(true);
}
}
