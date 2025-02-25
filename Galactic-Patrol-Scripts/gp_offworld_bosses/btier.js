// B-Tier Bounty Hunter - script for B-Tier offworld boss
// Additional Setup Needed: Must have an aura that is just a glowing white or red outline, toggled off.
// AUTHOR: Mighty

var SAND_ASSET = "https://i.imgur.com/a6herlG.png";
var SANDSTORM_OVERLAY_ASSET = "https://i.imgur.com/H0aJlNJ.png";
var ARENA_CENTER = [0, 69, 0];
var INVIS_ID = 1; // check this shit TODO
var VISIBLE_ID = 0; // check this shit
var MINE_NPC_NAME = "Landmine";
var MINE_NPC_TAB = 5;
var speed = 9;
var ARENA_RADIUS = 30;
var sandstorm_damage_val = 0.20 // percent value
var SANDSTORM_DMG_RATE = 60; // rate of sandstorm dmg, ex: 60 = dmg every 3 seconds

////////////////////////////////////////////////////// IMPORTED FUNCTIONS

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


function auraOn(npc)
{
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.toggleAura(true);
    npc.updateClient();
}

function auraOff(npc)
{
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.toggleAura(false);
    npc.updateClient();
}
/////////////////////////////////////////////////////////// CUSTOM FUNCTIONS

// go invis
// teleport x4
// drop mine x4
// pull up and shoot player
// ult: sandstorm - idk what thatll do but make it cool


function blasterAttackTelegraph(e)
{
    var npc = e.npc;
    auraOn(npc);
    doAnimation("FinalFlash");
    npc.setSpeed(0);
    npc.say("&eDon't move!");
}

function blasterAttack(e)
{
    var npc = e.npc;
    auraOff(npc);
    var target = npc.getAttackTarget();
    if (target != null && target.getType() == 1) npc.shootItem(npc.getAttackTarget(), BLASTER_PROJECTILE, 95);
}

function getRandomPos(e)
{
    // TODO
    return 69;
}

function breakLockon(e)
{
    var npc = e.npc;
    var players = npc.getSurroundingEntities(ARENA_RADIUS, 1);
    for (var i = 0; i < players.length; i++)
    {
        var p = players[i];
        p.getDBCPlayer().setLockOnTarget(null); // check this shit TODO
    }
}

// Param e: any CNPC event
function teleportTelegraph(e)
{
    var npc = e.npc;
    npc.setSpeed(0);
    auraOn(npc);
    doAnimation(e, "Final Flash"); // looks like he's putting his guns together
    npc.say("Keep yer' eyes peeled, Patroller!");
}

function sandBlast(e)
{
    var sandParticle = API.createParticle(SAND_ASSET);
    sandParticle.setScale(50,500, 200, 0); // Expand image
    sandParticle.setAlpha(1.0,0.0, 1, 0); // Fade out sand cloud
    sandParticle.setGlows(true); // todo: not needed?
    sandParticle.setFacePlayer(true);
    sandParticle.setMaxAge(40);
    sandParticle.spawn(npc);
}

// Param e: any CNPC event
function mainTeleport(e)
{
    var npc = e.npc;
    auraOff(npc);
    var pos = getRandomPos(e);
    npc.getWorld().spawnClone(npc.x, npc.y, npc.z, MINE_NPC_TAB, MINE_NPC_NAME);
    npc.setVisibleType(INVIS_ID);
    breakLockon(e);
    sandBlast(e);
    npc.setPosition(pos[0], pos[1], pos[2]);
    
}

// Param e: any CNPC event
function teleportEnd(e)
{
    var npc = e.npc;
    doAnimation(e, "FinalFlash"); // looks like he's putting his guns together
}

function sandstormOn(e)
{
    var npc = e.npc;
    var players = npc.getSurroundingEntities(ARENA_RADIUS, 1);
    for (var i = 0; i < players.length; i++)
        {
            var p = players[i];
            p.sendMessage("&6A &6sandstorm &6kicked &6up! &6Health &6decreases &6over &6time!");
            // uhhh do the overlay shit :3 i forgot how it goes
        }
}

function sandstormOff(e)
{
    var npc = e.npc;
    var players = npc.getSurroundingEntities(ARENA_RADIUS, 1);
    for (var i = 0; i < players.length; i++)
        {
            var p = players[i];
            p.getOverlays.clear(); // check this TODO
        }
}

function sandstormDamage(e)
{
    var npc = e.npc;
    if (npc.getTempData("Sandstorm") == 1)
    {
        var players = npc.getSurroundingEntities(ARENA_RADIUS, 1);
        for (var i = 0; i < players.length; i++)
            {
                var p = players[i];
                var dbc = p.getDBCPlayer();
                if (dbc != null)
                {
                    var hp = dbc.getBody();
                    var maxHp = dbc.getMaxBody();
                    var newHp = hp - (maxHp * sandstorm_damage_val);
                    if (newHp <= 0) newHp = 0;
                    dbc.setBody(newHp);
                }
            }
        }
    
}

/////////////////////////////////////////////////////////////////////////////////// HOOKS

var TELEPORT_ONE = 1;
var TELEPORT_TWO = 2;
var MULTI_TELEPORT_TELEGRAPH = 3;
var MULTI_TELEPORT = 4;
var REAPPEAR = 5;
var SHOOT = 6;
var SANDSTORM_DAMAGE = 7;

function init(e)
{
    e.npc.getTimers().forceStart(TELEPORT_ONE, 60, false);
    e.npc.setTempData("Sandstorm", 0);
    sandstormOff(e);
    e.npc.getTimers().forceStart(SANDSTORM_DAMAGE, SANDSTORM_DMG_RATE, true);
}

function killed(e)
{
    sandstormOff(e);
}

function tick(e)
{
    var npc = e.npc;
    var sandstorming = npc.getTempData("Sandstorm");
    if (!sandstorming && npc.getHealth() <= npc.getMaxHealth()*0.5)
    {
        sandstormOn(e);
    }
}

function targetLost(e)
{
    var lastAttacker = e.npc.getLastAttacker();
    if (lastAttacker.getType() == 1)
    {
        lastAttacker.getOverlays().clear();
    }
}

function timers(e)
{
    var npc = e.npc;
    var id = e.id;
    switch(id)
    {
        case TELEPORT_ONE:
            mainTeleport(e);
            npc.getTimers().forceStart(TELEPORT_TWO, 80, false);
            break;
        case TELEPORT_TWO:
            mainTeleport(e);
            npc.getTimers().forceStart(TELEPORT_ONE, 80, false);
            break;
        case MULTI_TELEPORT_TELEGRAPH:
            teleportTelegraph(e);
            npc.getTimers().forceStart(TELEPORT_ONE, 60, false);
            npc.setTempData("Teleports", 0);
            break;
        case MULTI_TELEPORT:
            var teleports = npc.getTempData("Teleports");
            if (teleports >= 4)
            {
                teleports = 0;
                npc.getTimers().forceStart(REAPPEAR, 1, false);
            }
            else
            {
                teleports = teleports + 1;
                mainTeleport(e);
                npc.getTimers().forceStart(MULTI_TELEPORT, 10, false);
            }
            npc.setTempData("Teleports", teleports);
            break;
        case REAPPEAR:
            npc.getTimers().forceStart(TELEPORT_ONE, 20, false);
            npc.setTempData("Shoots", 0);
            blasterAttackTelegraph(e);
            break;
        case SHOOT:
            var shoots = npc.getTempData("Shoots");
            if (shoots >= 5)
            {
                shoots = 0;
                doAnimation(e, "");
                npc.setSpeed(speed);
                npc.getTimers().forceStart(TELEPORT_ONE, 200, false);
            }
            else
            {
                shoots = shoots + 1;
                npc.getTimers().forceStart(SHOOT, 10, false);
                blasterAttack(e);
                
            }
            npc.setTempData("Shoots", shoots);
            break;
        case SANDSTORM_DAMAGE:
            break;
        default:
            npc.say("&cError at timer " + id + ". Report this to Mighty or Head Dev.");
    }
}