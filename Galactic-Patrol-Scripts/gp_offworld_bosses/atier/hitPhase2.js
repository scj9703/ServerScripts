// hitPhase1.js - script for Phase 1 of A-Tier Hit boss fight
// Additional Setup Needed: Must have an aura that is just a purple outline, toggled off.
// AUTHOR: Mighty

////////////////////////////// VARIABLES
var speed = 2; // NPC speed, feel free to toggle
var dashSpeed = 2; // Speed of dash used in backstep and dashAtPlayer
var counterRange = 15; // cannot be hit at this range or beyond, in blocks; Toggle as necessary

var stance1 = "HitStance1"; //hands in pockets
var stance2 = "Hit_Stance2"; //Initial fighting stance
var stance3 = "HitStance3"; //Improved fighting stance, not used in Phase 1

var ARENA_CENTER = [-9745, 97, -11551]; // Editing this not advised

// 0.01 = 1% of player health
var LIGHT_DAMAGE = 0.33; // dmg value of light attack
var MEDIUM_DAMAGE = 0.5; // dmg value of medium attack
var HEAVY_DAMAGE = 0.75; // dmg value of heavy attack
var DEFENSE_PENETRATION = 0.2; // % of damage taken when blocking

///////////////////////////////// TIMER IDS
var WAIT_FOR_PLAYER_TO_APPROACH = 0;
var LIGHT_TIMESKIP = 1;
var MEDIUM_TIMESKIP = 2;
var HEAVY_TIMESKIP = 3;
var STOP_TELEGRAPH = 4;
var REMOVE_TEXT_FROM_SCREEN = 5;

// Wait for player to get near, dash towards them, begin cycle
// Cycle goes:
// Telegraph -> Medium
var COMBO_ONE_TELEGRAPH = 10;
var COMBO_ONE_ATTACK = 11;
// Dash -> Telegraph -> Medium
var COMBO_TWO_DASH = 20;
var COMBO_TWO_TELEGRAPH = 21;
var COMBO_TWO_ATTACK = 22;
// Telegraph -> Teleport -> Medium -> Medium -> x5 Light
var COMBO_THREE_TELEGRAPH = 30;
var COMBO_THREE_TELEPORT = 31;
var COMBO_THREE_ATTACK = 32;
var COMBO_THREE_ATTACK_2 = 33;
// Back-step -> Medium
var COMBO_FOUR_BACKSTEP = 40;
var COMBO_FOUR_TELEGRAPH = 41;
var COMBO_FOUR_ATTACK = 42;
// Teleport to arena's center -> Telegraph -> Heavy
var COMBO_FIVE_TELEPORT = 50; 
var COMBO_FIVE_TELEGRAPH = 51; 
var COMBO_FIVE_ATTACK = 52; 
// Telegraph -> Light x5
var COMBO_SIX_TELEGRAPH = 60;
var COMBO_SIX_ATTACK = 61;
// Telegraph -> Medium -> Heavy
var COMBO_SEVEN_TELEGRAPH = 70;
var COMBO_SEVEN_ATTACK = 71;
var COMBO_SEVEN_ATTACK_2 = 72;
// Repeat

////////////////////////// Helper functions

// Put text on the middle of the Player's screen.
// Param player - the player whose screen to modify
// Param text - the text to display
// Param color - the color of the text (hexadecimal)
// Param size - the font size of the text
// Param speakID - the ID of the overlay to be displayed
function speak(player, text, color, size, speakID) 
{ // Place speech overlay on player's screen
    var speechOverlay = API.createCustomOverlay(speakID); // Create overlay with id
    var x = 480 - Math.floor((text.length) * 2.5) * size; // Calculate centre position
    var y = 246 - Math.floor(size * 6.5);
    speechOverlay.addLabel(1, text, x, y, 0, 0, color); // Add label in the middle of the screen with the given color
    speechOverlay.getComponent(1).setScale(size); // Resize the label
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}

// Remove text from the middle of the Player's screen.
// Param player - the player whose screen to modify
// Param speakID - the ID of the overlay to be removed
function cancelSpeak(player, speakID) 
{ // Remove text from player screen
    var speechOverlay = API.createCustomOverlay(speakID); // Create overlay with overwriting id
    player.showCustomOverlay(speechOverlay); // Place overriding overlay on player's screen
    speechOverlay.update(player); // Update to reflect this
}

// Helper function for making animations easy
// Param e: any NPC event
// Param animationName: string name of desired animation
function doAnimation(e, animationName)
{
    var anim = API.getAnimations().get(animationName)
    var animData = e.npc.getAnimationData()
    animData.setEnabled(true)
    animData.setAnimation(anim)
    animData.updateClient()
}

// Teleports the NPC to the Player. 
// Could be used on other NPCs too with some minor edits.
// Param npc: the NPC to teleport
// Param player: the player to teleport to 
function teleportToPlayer(npc, player)
{
    if (player != null && player.getType() == 1)
    {
        var playerPos = player.getPosition();
        npc.setPosition(playerPos);
    } 
}

// Helper function for turning NPC's aura on.
// Param npc: the NPC to turn aura on for
function auraOn(npc)
{
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.toggleAura(true);
    npc.updateClient();

}

// Helper function for turning NPC's aura off.
// Param npc: the NPC to turn aura off for
function auraOff(npc)
{
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.toggleAura(false);
    npc.updateClient();
}

// Make npc backstep but move towards center if it hits a wall.
// Param e - Any NPC event
function backstep(e)
{ 
    var npc = e.npc;
    var target = npc.getAttackTarget();
    if(target != null) {
        var targetLookVector = target.getLookVector();
    
        if(npc.world.rayCastBlock([npc.x, npc.y, npc.z], [targetLookVector.XD, 0, targetLookVector.ZD], dashSpeed * 6, true, false, false) != null) 
        { // Raycast to check if block in path
            // Backstep to middle
            var angle = getDirection(npc, ARENA_CENTER[0], ARENA_CENTER[2]);
            var x = -Math.cos(angle) * dashSpeed; 
            var z = -Math.sin(angle) * dashSpeed;
        } else 
        { // Backstep away from player
            var angle = getDirection(npc, target.getX(), target.getZ());
            var x = Math.cos(angle) * dashSpeed; 
            var z = Math.sin(angle) * dashSpeed;
        }
        npc.setMotion(x, 0.5, z); // Set slightly above 0 for more distance.
    }
}

// Sets player's lock-on target to null.
// Param player - the player to break lock-on for
function breakLockon(player)
{
    // break lockon 
    var target = player;
    if (target != null && target.getType() == 1) 
    {
        target.getDBCPlayer().setLockOnTarget(null); 
    }

}

// Dash towards the player. Technically also works on other NPCs.
// Param e - Any NPC event
// Param target - the player (or NPC) to dash towards
function dashAtPlayer(e, target) 
{ 
    var npc = e.npc;
    if(target != null) {
    
        var angle = getDirection(npc, target.x, target.z);
        var x = -Math.cos(angle) * dashSpeed; 
        var z = -Math.sin(angle) * dashSpeed;
        npc.setMotion(x, 0.2, z);
    }
}

// Get the direction to a set of coordinates. AUTHOR: Riken
// Param npc - the NPC to get the direction from
// Param x - the x-coordinate to get the direction to
// Param z - the z-coordinate to get the direction to
function getDirection(npc, x, z) 
{ 
    return Math.atan2(npc.getZ()-z, npc.getX()-x)
}

/////////////////////////////// FUNCTIONS

// telegraph time-skip attack
// Param e - Any NPC event
// Param animationName - string name of desired animation
function telegraph(e, animationName)
{
    var npc = e.npc;
    auraOn(npc);
    doAnimation(e, animationName); 
    npc.setSpeed(0);
}

// Damage the player via time-skip.
// Param e - Any NPC event
// Param timeSkipDamage - the damage to be dealt; 0.01 = 1%, etc.
// Param isAnimated - boolean for whether Hit should use a punch animation
// Param target - the player to be damaged
function timeSkipAttack(e, timeSkipDamage, isAnimated, target)
{
    var npc = e.npc;
    var world = npc.getWorld();

    if (isAnimated)
    {
        var rng = Math.random();
        if (rng < 0.5) doAnimation(e, "Punch_Left");
        else doAnimation(e, "Punch_Right");
    }

    // if target is player
    if (target != null && target.getType() == 1)
    {
        // Teleport to player if they are > 5 blocks away. This keeps the fight close-quarters,
        // and also handles the awkward case where Hit can "punch" the player despite being far away.
        var nearbyEntities = npc.getSurroundingEntities(5, 1); // Range 5, search Player type
        if (nearbyEntities.length < 1) teleportToPlayer(npc, target); // teleport if too far away

        world.playSoundAtEntity(target,"jinryuudragonbc:DBC4.timeskip",100,1) // plays time skip sfx
        world.spawnParticle("portal", target.getPosition(), 4, 2, 4, 1, 500); // purple particles burst from player
        var dbcPlayer = target.getDBCPlayer();
        if (dbcPlayer != null)
        {
            var playerMaxBody = dbcPlayer.getMaxBody();
            var playerCurrentBody = dbcPlayer.getBody();
            if (dbcPlayer.isBlocking())
            {
                // deal reduced damage if blocking
                var damage = (playerMaxBody * timeSkipDamage * DEFENSE_PENETRATION); // the damage the player takes
                dbcPlayer.setBody(playerCurrentBody - damage);
            }
            else
            {
                // deal full damage if not blocking
                var damage = playerMaxBody * timeSkipDamage;
                dbcPlayer.setBody(playerCurrentBody - damage);
            }
        }
    }
}

// Makes Hit time-skip to player if they are too far away
// Param e: The NPC damaged event
function longRangeCounterattack(e)
{
    
    var npc = e.npc;
    var source = e.getSource();
    if (source != null && source.getType() == 1)
    {
        // Step 1: Detect if incoming attack is >= 15 blocks away
        var nearbyEntities = npc.getSurroundingEntities(counterRange, 1);
        for (var i = 0; i < nearbyEntities.length; i++)
        {
            var entity = nearbyEntities[i];
            if (entity.getName() == source.getName())
            {
                // if the attack was < 15 blocks away, do nothing
                return;
            }
        }
        // Step 2: Teleport Hit to player
        breakLockon(source);
        var playerPos = source.getPosition();
        npc.setPosition(playerPos);        
        // Step 3: Tell player they need to get closer to Hit next time
        speak(source, "You need to get closer to Hit next time!", "00ff00", 4, 111);
        npc.getTimers().forceStart(REMOVE_TEXT_FROM_SCREEN, 60, false);
        // Step 4: Damage player via time-skip
        timeSkipAttack(e, HEAVY_DAMAGE, true, source);
        // Step 5: Cancel damage
        e.setCancelled(true);
    }  
}

// Turn off telegraph-aura and return speed to normal.
// Param e - Any NPC event
function timeSkipEnd(e)
{
    var npc = e.npc;
    auraOff(npc);
    npc.setSpeed(speed);
}



/////////////////////////////////////////////////////////////////////////// HOOKS

function damaged(e)
{
    longRangeCounterattack(e);
}

function init(e)
{
    doAnimation(e, stance3);
    e.npc.getTimers().clear();
}

// For debug purposes. Move the timer to init for the real thing
function interact(e)
{
    e.npc.say("Fight is starting");
    e.npc.getTimers().forceStart(COMBO_ONE_TELEGRAPH, 1, false);
}

function timer(e)
{
    var npc = e.npc;
    var target = npc.getAttackTarget();
    var id = e.id;
    switch(id)
    {
        case WAIT_FOR_PLAYER_TO_APPROACH:
            var nearbyPlayers = npc.getSurroundingEntities(15, 1); // Range 15, search Player type
            if (nearbyPlayers.length > 0)
            {
                // Just pick any nearby player, it'd be rare that 2 are ever that close anyway
                var p = nearbyPlayers[0];
                dashAtPlayer(e, p);
                npc.getTimers().forceStart(COMBO_ONE_TELEGRAPH, 20, false);
            }
            else
            {
                npc.getTimers().forceStart(WAIT_FOR_PLAYER_TO_APPROACH, 10, false);
            }
            break;
        case LIGHT_TIMESKIP:
            timeSkipAttack(e, LIGHT_DAMAGE, true, target);
            break;
        case MEDIUM_TIMESKIP:
            timeSkipAttack(e, MEDIUM_DAMAGE, true, target);
            break;
        case HEAVY_TIMESKIP:
            timeSkipAttack(e, HEAVY_DAMAGE, true, target);
            break;
        case STOP_TELEGRAPH:
            timeSkipEnd(e);
            break;
        case COMBO_ONE_TELEGRAPH:
            telegraph(e, stance3);
            npc.getTimers().forceStart(COMBO_ONE_ATTACK, 15, false);
            break;
        case COMBO_ONE_ATTACK:
            breakLockon(target);
            timeSkipAttack(e, MEDIUM_DAMAGE, true, target);
            timeSkipEnd(e);
            npc.getTimers().forceStart(COMBO_TWO_DASH, 50, false);
            break;
        case COMBO_TWO_DASH:
            breakLockon(target);
            dashAtPlayer(e, target);
            npc.getTimers().forceStart(COMBO_TWO_TELEGRAPH, 20, false);
            break;
        case COMBO_TWO_TELEGRAPH:
            telegraph(e, stance3);
            npc.getTimers().forceStart(COMBO_TWO_ATTACK, 15, false);
            break;
        case COMBO_TWO_ATTACK:
            breakLockon(target);
            timeSkipAttack(e, MEDIUM_DAMAGE, true, target);
            timeSkipEnd(e);
            npc.getTimers().forceStart(COMBO_THREE_TELEGRAPH, 50, false);
            break;
        case COMBO_THREE_TELEGRAPH:
            telegraph(e, stance3);
            npc.getTimers().forceStart(MEDIUM_TIMESKIP, 20, false);
            npc.getTimers().forceStart(MEDIUM_TIMESKIP, 40, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 50, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 60, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 70, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 80, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 90, false);
            npc.getTimers().forceStart(STOP_TELEGRAPH, 90, false);
            npc.getTimers().forceStart(COMBO_FOUR_BACKSTEP, 210, false);
            break;
        case COMBO_FOUR_BACKSTEP:
            backstep(e);
            npc.getTimers().forceStart(COMBO_FOUR_TELEGRAPH, 30, false);
            break;
        case COMBO_FOUR_TELEGRAPH:
            telegraph(e, stance3);
            npc.getTimers().forceStart(COMBO_FOUR_ATTACK, 15, false);
            break;
        case COMBO_FOUR_ATTACK:
            breakLockon(target);
            timeSkipAttack(e, MEDIUM_DAMAGE, true, target);
            timeSkipEnd(e);
            npc.getTimers().forceStart(COMBO_FIVE_TELEPORT, 50, false);
            break;
        case COMBO_FIVE_TELEPORT:
            breakLockon(target);
            npc.setPosition(ARENA_CENTER[0], ARENA_CENTER[1], ARENA_CENTER[2]);
            npc.getTimers().forceStart(COMBO_FIVE_TELEGRAPH, 15, false);
            break;
        case COMBO_FIVE_TELEGRAPH:
            telegraph(e, stance1);
            npc.getTimers().forceStart(COMBO_FIVE_ATTACK, 15, false);
            break;
        case COMBO_FIVE_ATTACK:
            breakLockon(target);
            timeSkipAttack(e, HEAVY_DAMAGE, true, target);
            timeSkipEnd(e);
            npc.getTimers().forceStart(COMBO_SIX_TELEGRAPH, 30, false);
            break;
        case COMBO_SIX_TELEGRAPH:
            dashAtPlayer(e, target);
            breakLockon(target);
            telegraph(e, stance3);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 15, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 30, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 40, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 50, false);
            npc.getTimers().forceStart(LIGHT_TIMESKIP, 60, false);
            npc.getTimers().forceStart(STOP_TELEGRAPH, 60, false);
            npc.getTimers().forceStart(COMBO_SEVEN_TELEGRAPH, 130, false);
            break;
        case COMBO_SEVEN_TELEGRAPH:
            dashAtPlayer(e, target);
            breakLockon(target);
            telegraph(e, stance3);
            npc.getTimers().forceStart(COMBO_SEVEN_ATTACK, 15, false);
            break;
        case COMBO_SEVEN_ATTACK:
            breakLockon(target);
            timeSkipAttack(e, MEDIUM_DAMAGE, true, target);
            npc.getTimers().forceStart(COMBO_SEVEN_ATTACK_2, 20, false);
            break;
        case COMBO_SEVEN_ATTACK_2:
            breakLockon(target);
            timeSkipAttack(e, HEAVY_DAMAGE, true, target);
            timeSkipEnd(e);
            npc.getTimers().forceStart(COMBO_ONE_TELEGRAPH, 100, false);
            break;
        case REMOVE_TEXT_FROM_SCREEN:
            cancelSpeak(target, 111);
            break;
    }
}