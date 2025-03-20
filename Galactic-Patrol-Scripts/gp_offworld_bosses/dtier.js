// D-Tier Bounty Hunter - script for D-Tier offworld boss
// Additional Setup Needed: Must have an aura that is just a glowing white or red outline, toggled off.
// AUTHOR: Mighty
var ARENA_CENTER = [-9740, 92, -10699];
var speed = 8;
var BLASTER_PROJECTILE = API.createItem("customnpcs:npcHolySpell", 1, 1);
var hpForUltimate = 0.33;
var NPC_TAB = 5; 
var BOMB_NPC_NAME = "Thermal Detonator";
var EMP_NPC_NAME = "Electromagnetic Pulse";

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


////////////////////////////////////////////////////// FUNCTIONS

function blasterAttackTelegraph(e)
{
    var npc = e.npc;
    auraOn(npc);
    doAnimation(e, "LeftHandKi"); // gun in left hand, throw gadgets from right
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

function bombThrowTelegraph(e)
{
    var npc = e.npc;
    auraOn(npc);
    npc.setSpeed(0);
    doAnimation(e, "FinalShine"); // looks like a throw windup
    npc.say("&eHere, catch!")
}

function bombThrow(e)
{
    var npc = e.npc;
    auraOff(npc);
    npc.setSpeed(speed);
    doAnimation(e, "BigBangAttack");
    npc.getWorld().spawnClone(npc.x, npc.y, npc.z, NPC_TAB, BOMB_NPC_NAME);
}

function empGrenadeTelegraph(e)
{
    var npc = e.npc;
    auraOn(npc);
    npc.setSpeed(0);
    doAnimation(e, "FinalShine"); // looks like a throw windup
    npc.say("&bTry and tank this one! I dare ya'!");
}

function empGrenade(e)
{
    var npc = e.npc;
    auraOff(npc);
    npc.setSpeed(speed);
    doAnimation(e, "BigBangAttack");
    npc.getWorld().spawnClone(npc.x, npc.y, npc.z, NPC_TAB, EMP_NPC_NAME);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////// HOOKS

var attackCooldown = 100;
var attackTelegraphDuration = 60;
var BOMB_THROW_TELEGRAPH = 1;
var BOMB_THROW = 2;
var BLASTER_ATTACK_TELEGRAPH = 3;
var BLASTER_ATTACK = 4;
var EMP_GRENADE_TELEGRAPH = 5;
var EMP_GRENADE = 6;

function init(e)
{
    var npc = e.npc
    npc.getTimers().clear();
    npc.getTimers().forceStart(BOMB_THROW_TELEGRAPH, attackCooldown, false);
    auraOff(npc);
    npc.setTempData("HasUlted", 0)
}

function tick(e)
{
    var npc = e.npc
    var ulted = npc.getTempData("HasUlted")
    if (!ulted && npc.getHealth() < npc.getMaxHealth()*hpForUltimate)
    {
        npc.setTempData("HasUlted", 1);
        npc.getTimers().forceStart(EMP_GRENADE_TELEGRAPH, 1, false);
    }
}

function damaged(e)
{
    if (e.npc.getTimers().has(EMP_GRENADE_TELEGRAPH))
    {
        e.setCancelled(true);
    } 
    else if ((e.npc.getHealth() < 1) && !e.npc.getTempData("HasUlted"))
    {
        e.npc.setHealth(1);
    }
}

function timer(e)
{
    var id = e.id
    var npc = e.npc
    switch(id)
    {
        case EMP_GRENADE_TELEGRAPH:
            npc.getTimers().stop(BOMB_THROW_TELEGRAPH);
            npc.getTimers().stop(BOMB_THROW);
            npc.getTimers().stop(BLASTER_ATTACK_TELEGRAPH);
            npc.getTimers().stop(BLASTER_ATTACK);
            empGrenadeTelegraph(e);
            npc.getTimers().forceStart(EMP_GRENADE, attackTelegraphDuration, false);
            break;
        case EMP_GRENADE:
            empGrenade(e);
            npc.getTimers().forceStart(BOMB_THROW_TELEGRAPH, attackCooldown, false);
            break;
        case BOMB_THROW_TELEGRAPH:
            bombThrowTelegraph(e);
            npc.getTimers().forceStart(BOMB_THROW, attackTelegraphDuration, false);
            break;
        case BOMB_THROW:
            bombThrow(e);
            npc.getTimers().forceStart(BLASTER_ATTACK_TELEGRAPH, attackCooldown, false);
            break;
        case BLASTER_ATTACK_TELEGRAPH:
            blasterAttackTelegraph(e);
            npc.getTimers().forceStart(BLASTER_ATTACK, attackTelegraphDuration, false);
            npc.setTempData("ShotsFired", 0);
            break;
        case BLASTER_ATTACK:
            blasterAttack(e);
            var shotsFired = npc.getTempData("ShotsFired");
            shotsFired++;
            if (shotsFired >= 5)
            {
                shotsFired = 0;
                npc.getTimers().forceStart(BOMB_THROW_TELEGRAPH, attackCooldown, false);
                npc.setSpeed(speed);
                doAnimation(e, "");
            }
            else
            {
                npc.getTimers().forceStart(BLASTER_ATTACK, 10, false);
            }
            npc.setTempData("ShotsFired", shotsFired);
            break;
    }
}
