// Used in the Interact Tab of a CNPC.
var x = 10368;
var y = 95;
var z = 11133;
// Coordinates of the Chest in which to copy Items from.
var rarity = 0; // 0 = N, 1 = R, 2 = SR
// 0, 1, and 2 refer to the index of the Chest where items are located.

var p = event.getPlayer();
var rift = p.getStoredData("riftCC"); // Value of whether a player has interacted with this rift.
if (rift == null){
rift = 0; // initialize as false
p.setStoredData("riftCC", rift);
}
var inv = p.getInventory();
var w = event.API.getIWorld(0);
var chest = w.getBlock(x,y,z).getContainer();
if (p != null && chest != null && rift == 0){
// Give the player a one-time Item
p.giveItem(chest.getSlot(rarity), 1);
p.sendMessage("&2A Scroll manifests...");
p.setStoredData("riftCC", 1);
}
if (rift != 0){
p.sendMessage("&2This Rift is already known to you...");
}

npc.executeCommand("tp " + p.getName() + " 10122 65 -11"); // The Rift teleports the player regardless of if they interacted previously
