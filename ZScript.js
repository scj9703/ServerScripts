// Z-Script - Used to make NPC set-up and scripting easier for the CustomNPC+ Minecraft Mod.
//
// Player entity documentation, contains all functions, player.getName() etc.
// https://kamkeel.github.io/CustomNPC-Plus/noppes/npcs/api/entity/IPlayer.html
//
// DBCPlayer documentation, contains all functions, dbc.setKi() etc.
// https://kamkeel.github.io/CustomNPC-Plus/noppes/npcs/api/entity/IDBCPlayer.html
//
// CustomNPC (entity) documentation, n.reset() etc.
// https://kamkeel.github.io/CustomNPC-Plus/noppes/npcs/api/entity/ICustomNpc.html
//
// For basic NPC setup, change the info in the init() function.

// This code runs when an NPC is loaded or reset.
function init(e){
    ///// SCRIPTING VARIABLES /////
    var n = e.npc; // the npc
    var ti = n.getTimers(); // npc's timers
    var homeX = n.getHomeX(); // x coordinate of where the NPC spawns, etc
    var homeY = n.getHomeY();
    var homeZ = n.getHomeZ();
    ///// NPC SETUP /////
    // WARNING: IT IS RECOMMENDED TO COMMENT OUT MUCH OF THIS SECTION AFTER YOU FINISH MAKING YOUR NPC.
    // OTHERWISE, IF WE CHANGE NPCS IN MASS, THIS NPC WILL HAVE TROUBLE UPDATING.
    n.setName("Saibaman"); // NPC name
    //n.setTitle("Raditz-Level Enemy"); // Text appearing under NPC Name
    //n.setSkinUrl("MySkin.com/redCrewmate"); // Skin URL
    n.setRespawnTime(20); // Respawn time, default 20 seconds
    n.setSize(5); // Size of NPC, default 5
    n.setMaxHealth(100000000); // Max HP value   
    n.setCombatRegen(1); // Regen when player fights enemy
    n.setHealthRegen(2); // Regen when out of combat (Passive Regen)
    //n.setMeleeStrength(1); // Scripted Damage - Typically not recommended
    setPluginDamage(n, 1); // Plug-In Damage - Recommended
    n.setMeleeSpeed(20); // melee speed, 20 = 1s, default 20
    n.setSpeed(5); // Movement speed, default 5
    n.setKnockbackResistance(0); // Default 0% KB-Resistance; -100 to 100, anything else may crash
    ///// PROJECTILES /////
    n.setRangedRange(30); // Can use ranged attack on players within default 30 blocks, etc.
    n.setRangedSpeed(20); // How fast projectiles travel
    //n.setRangedStrength(1); // Strength of projectiles (independent of scripted melee damage!)
    n.setAccuracy(100); // How accurate projectiles are, 1-100 or it may crash, default 100%
    n.setBurstCount(3); // Fires the attack 3 times, etc.
    n.setShotCount(5); // Fires 5 projectiles at once, etc.
    n.setFireRate(5); // Rate of fire, smaller number = faster
    ///// TIMER /////
    // ti.forceStart(1, 19, false);
    // 1 = ID of the timer, 19 = 1 second (it would be 20 but it starts at 0), false = it doesn't repeat
    // The Timer with ID 1 will call the timer() function after 1 second. 
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Continue your Script below this line
}

// This code runs roughly 1-3 times a second, depending on lag.
function tick(e){
    ///// SCRIPTING VARIABLES /////
    var n = e.npc; // the npc
    var ti = n.getTimers(); // npc's timers
    var homeX = n.getHomeX(); // x coordinate of where the NPC spawns, etc
    var homeY = n.getHomeY();
    var homeZ = n.getHomeZ();
    var hp = n.getHealth(); // NPC's hp
    var maxHp = n.getMaxHealth(); // NPC's max hp
    var t = n.getAttackTarget(); // NPC's target
    // This runs only if the NPC's target is a PLAYER
    if (t != null && t.getType() == 1){
        ///// PLAYER VARIABLES /////
        var name = t.getName(); // IGN of Player fighting this NPC
        var playerX = t.getX(); // Player's X coordinate, etc.
        var playerY = t.getY();
        var playerZ = t.getZ();
        ///// DBC VARIABLES /////
        var dbc = t.getDBCPlayer();
        var playerHp = dbc.getBody(); // DBC HP
        var playerStamina = dbc.getStamina(); // DBC Stam
        var playerKi = dbc.getKi(); // DBC Ki
        var playerForm = dbc.getForm(); // Racial form of player
        var nonRacialForm = dbc.getForm2(); // Other forms like Kaioken/UI
    }
}

// This code runs when something damages the NPC.
function damaged(e){
    ///// SCRIPTING VARIABLES /////
    var n = e.npc; // the npc
    var ti = n.getTimers(); // npc's timers
    var homeX = n.getHomeX(); // x coordinate of where the NPC spawns, etc
    var homeY = n.getHomeY();
    var homeZ = n.getHomeZ();
    var hp = n.getHealth(); // NPC's hp
    var maxHp = n.getMaxHealth(); // NPC's max hp
    var t = e.getSource(); // Whatever damaged the NPC
    // This runs only if a PLAYER damaged the NPC
    if (t != null && t.getType() == 1){
        ///// PLAYER VARIABLES /////
        var name = t.getName(); // IGN of Player fighting this NPC
        var playerX = t.getX(); // Player's X coordinate, etc.
        var playerY = t.getY();
        var playerZ = t.getZ();
        ///// DBC VARIABLES /////
        var dbc = t.getDBCPlayer();
        var playerHp = dbc.getBody(); // DBC HP
        var playerStamina = dbc.getStamina(); // DBC Stam
        var playerKi = dbc.getKi(); // DBC Ki
        var playerForm = dbc.getForm(); // Racial form of player
        var nonRacialForm = dbc.getForm2(); // Other forms like Kaioken/UI
    }
}

// This code runs when the NPC attacks something.
function attack(e){
    ///// SCRIPTING VARIABLES /////
    var n = e.npc; // the npc
    var ti = n.getTimers(); // npc's timers
    var homeX = n.getHomeX(); // x coordinate of where the NPC spawns, etc
    var homeY = n.getHomeY();
    var homeZ = n.getHomeZ();
    var hp = n.getHealth(); // NPC's hp
    var maxHp = n.getMaxHealth(); // NPC's max hp
    var t = n.getAttackTarget(); // NPC's target
    // This runs only if the NPC's target is a PLAYER
    if (t != null && t.getType() == 1){
        ///// PLAYER VARIABLES /////
        var name = t.getName(); // IGN of Player fighting this NPC
        var playerX = t.getX(); // Player's X coordinate, etc.
        var playerY = t.getY();
        var playerZ = t.getZ();
        ///// DBC VARIABLES /////
        var dbc = t.getDBCPlayer();
        var playerHp = dbc.getBody(); // DBC HP
        var playerStamina = dbc.getStamina(); // DBC Stam
        var playerKi = dbc.getKi(); // DBC Ki
        var playerForm = dbc.getForm(); // Racial form of player
        var nonRacialForm = dbc.getForm2(); // Other forms like Kaioken/UI
    }
}

// This code runs when a player right-clicks the NPC.
function interact(e){
    ///// SCRIPTING VARIABLES /////
    var n = e.npc; // the npc
    var ti = n.getTimers(); // npc's timers
    var homeX = n.getHomeX(); // x coordinate of where the NPC spawns, etc
    var homeY = n.getHomeY();
    var homeZ = n.getHomeZ();
    var hp = n.getHealth(); // NPC's hp
    var maxHp = n.getMaxHealth(); // NPC's max hp
    var t = e.getPlayer(); // Player who interacted with this NPC.
    ///// PLAYER VARIABLES /////
    var name = t.getName(); // IGN of Player right-clicking this NPC.
    var playerX = t.getX(); // Player's X coordinate, etc.
    var playerY = t.getY();
    var playerZ = t.getZ();
    ///// DBC VARIABLES /////
    var dbc = t.getDBCPlayer();
    var playerHp = dbc.getBody(); // DBC HP
    var playerStamina = dbc.getStamina(); // DBC Stam
    var playerKi = dbc.getKi(); // DBC Ki
    var playerForm = dbc.getForm(); // Racial form of player
    var nonRacialForm = dbc.getForm2(); // Other forms like Kaioken/UI
}

// This code runs when a timer is up.
function timer(e){
    var n = e.npc; // the npc
    var ti = n.getTimers(); // npc's timers
    var id = e.getId(); // timer's unique id
    if (id == 1){
        // Do stuff if the timer with ID 1 is up
        // n.say("Hello world!");
    }
}

// This does the same thing as /setentity (damage)
function setPluginDamage(npc, amount) {
    var nbt = npc.getAllNbt();
    nbt.setInteger("damage", amount)
    npc.setNbt(nbt);
}
