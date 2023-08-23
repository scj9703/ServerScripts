var seconds = 15; // Seconds GravityMachine is Active
var gravity = 100; // Gravity level you wish to set
var block = npc.getWorld().getBlock(x, y, z); // Insert Coordinates of Gravity Machine
var tile = block.getTileEntity();
var nbt = tile.getNBT();
nbt.setFloat('gravity', gravity);
nbt.setFloat('BurnTime', sec*20); 
tile.readFromNBT(nbt);
