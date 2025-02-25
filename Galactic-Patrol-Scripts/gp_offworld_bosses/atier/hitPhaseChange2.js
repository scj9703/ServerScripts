var ANIMATION_ONE = 1;
var TEXT_TO_SCREEN = 2;
var FADE_OUT = 3;
var NEXT_PHASE = 4;
var SPAWN_CLONE = 5;

var NPC_TAB = 5;
var NPC_NAME = "Assassin Hit (Full Power)";
var CLONE_NAME = "Hit (Clone A)"

var stance1 = "HitStance1"; //hands in pockets
var stance2 = "Hit_Stance2"; //Initial fighting stance
var stance3 = "HitStance3"; //Improved fighting stance, not used in Phase 1
var damagedAnimation = "chest_pain"

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

// Helper function for turning NPC's aura on.
// Param npc: the NPC to turn aura on for
function auraOn(npc)
{
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.toggleAura(true);
    npc.updateClient();

}

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

// Sends a message to all players within 50 blocks of the NPC.
// Hardcoded to use the same color and size as Hit's other messages.
function showTextToNearbyPlayers(npc, text)
{
    var players = npc.getSurroundingEntities(50, 1);
    for (var i = 0; i < players.length; i++)
    {
        speak(players[i], text, "0xff00ff", 4, 111); // 111 is the ID of all "text-to-screen" overlays
    }
}

function removeTextFromNearbyPlayers(npc)
{
    var players = npc.getSurroundingEntities(50, 1);
    for (var i = 0; i < players.length; i++)
    {
        cancelSpeak(players[i], 111);
    }
}

function setAura(npc, auraID)
{
    var display = DBCAPI.getDBCDisplay(npc)
    display.setAura(auraID)
    npc.updateClient()
}

function playSoundToNearbyPlayers(npc)
{
    var players = npc.getSurroundingEntities(50, 1);
    for (var i = 0; i < players.length; i++)
    {
        npc.getWorld().playSoundAtEntity(players[i],"jinryuudragonbc:1610.sss",100,1) // plays time skip sfx
    }
}

/** Returns a random number between two values
* @param {int} min - the minimum number to generate a value from
* @param {int} max - the minimum number to generate a value from 
*/
function getRandomInt(min, max)
{  
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnFromNpcOffset(npc)
{
    var xOffset = getRandomInt(5, 10);
    var zOffset = getRandomInt(0, 10);
    var rng = Math.random();
    if (rng > 0.5) xOffset = xOffset*-1;
    rng = Math.random();
    if (rng > 0.5) zOffset = zOffset*-1;
    npc.getWorld().spawnClone(npc.x+xOffset, npc.y, npc.z+zOffset, NPC_TAB, CLONE_NAME);
}

/////////////////////////////////////////// HOOKS

function interact(e)
{
    e.npc.getTimers().forceStart(ANIMATION_ONE, 10, false); // 10 ticks = 0.5 seconds
}

function timer(e)
{
    var npc = e.npc;
    var id = e.id;
    switch(id)
    {
        case ANIMATION_ONE:
            doAnimation(e, damagedAnimation) 
            showTextToNearbyPlayers(npc, "\"Don't think this is over...\"");
            npc.getTimers().forceStart(TEXT_TO_SCREEN, 80, false); 
            break;
        case TEXT_TO_SCREEN:
            showTextToNearbyPlayers(npc, "\"...I still have more tricks up my sleeve.\"");
            doAnimation(stance1);
            auraOn(npc);
            npc.getTimers().forceStart(FADE_OUT, 80, false);
            npc.getTimers().forceStart(SPAWN_CLONE, 10, true);
            break;
        case FADE_OUT:
            removeTextFromNearbyPlayers(npc);
            npc.setVisibleType(2);
            npc.getTimers().forceStart(NEXT_PHASE, 10, false);
            break;
        case NEXT_PHASE:
            //npc.spawnClone(npc.x, npc.y, npc.z, NPC_TAB, NPC_NAME);
            //npc.despawn();
            break;
        case SPAWN_CLONE:
            spawnFromNpcOffset(npc);
    }
}