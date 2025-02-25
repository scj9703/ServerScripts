var ANIMATION_ONE = 1;
var TEXT_TO_SCREEN = 2;
var POWER_UP = 3;
var GIVE_LIGHTNING_AURA = 4;
var ANIMATION_TWO = 5;
var ANIMATION_THREE = 6;
var SPAWN_PHASE_TWO = 7;

var SMALL_AURA = 145;
var BIG_AURA = 146;
var LIGHTNING_ONLY_AURA = 122;

NPC_TAB = 5;
NPC_NAME = "Assassin Hit (Pure Progress)";

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
            doAnimation(e, "fruitEat") // ironically, this animation looks like he is wiping blood from his mouth.
            showTextToNearbyPlayers(npc, "\"I underestimated you.\"");
            npc.getTimers().forceStart(TEXT_TO_SCREEN, 80, false); 
            break;
        case TEXT_TO_SCREEN:
            showTextToNearbyPlayers(npc, "\"I won't make the same mistake twice.\"");
            setAura(npc, SMALL_AURA);
            auraOn(npc);
            npc.getTimers().forceStart(POWER_UP, 60, false);
            break;
        case POWER_UP:
            showTextToNearbyPlayers(npc, "\"WRAAAAAAAAUGH!\"");
            doAnimation(e, "RageBurst");
            setAura(npc, BIG_AURA);
            playSoundToNearbyPlayers(npc);
            npc.getTimers().forceStart(GIVE_LIGHTNING_AURA, 80, false);
            break;
        case GIVE_LIGHTNING_AURA:
            setAura(npc, LIGHTNING_ONLY_AURA);
            npc.getTimers().forceStart(ANIMATION_TWO, 40, false);
            break;
        case ANIMATION_TWO:
            showTextToNearbyPlayers(npc, "*Hit's Time-Skip has improved!*");
            doAnimation(e, "Kamehamehax10");
            npc.getTimers().forceStart(ANIMATION_THREE, 20, false);
            break;
        case ANIMATION_THREE:
            doAnimation(e, "HitStance3");
            npc.getTimers().forceStart(SPAWN_PHASE_TWO, 20, false);
            break;
        case SPAWN_PHASE_TWO:
            removeTextFromNearbyPlayers(npc);
            //npc.spawnClone(npc.x, npc.y, npc.z, NPC_TAB, NPC_NAME);
            //npc.despawn();
    }
}