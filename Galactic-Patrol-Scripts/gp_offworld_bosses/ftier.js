// F-Tier Bounty Hunter - script for F-Tier offworld boss
// Additional Setup Needed: Must have an aura that is just a glowing white or red outline, toggled off.
// AUTHOR: Mighty

var ARENA_CENTER = [0, 100, 0];
var speed = 8;
var SMOKE_BOMB_ASSET = "https://i.imgur.com/UxM3O4r.png";
var BLASTER_PROJECTILE = API.createItem("customnpcs:npcHolySpell", 1, 1); // 1/1 = damage/size
var hpForUltimate = 0.50;

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
function fireLaserTelegraph(e)
{
    var npc = e.npc;
    auraOn(npc);
    npc.setSpeed(0);
    npc.say("&eBlaster Overcharge!");
    doAnimation(e, "BigBangAttack");
}

function fireLaser(e)
{
    var npc = e.npc;
    auraOff(npc);
    //TODO: apparently the cnpc version isn't hot ass so maybe replace this
    npc.executeCommand("/dbcspawnki 4 1 5000 0 7 0 1 100 " + npc.x + " " + npc.y + " " + npc.z);
    npc.setSpeed(speed);
    doAnimation(e, "");
}

function smokeBomb(e)
{
    var npc = e.npc;

    // break lockon 
    var target = npc.getAttackTarget();
    if (target != null && target.getType() == 1) 
    {
        target.getDBCPlayer().setLockOnTarget(null); 
    }

    // spawn smoke cloud
    var smokeCloud = API.createParticle(SMOKE_BOMB_ASSET);
    smokeCloud.setScale(50,500, 200, 0); // Expand image
    smokeCloud.setAlpha(1.0,0.0, 1, 40); // Fade out smoke cloud
    smokeCloud.setGlows(true); 
    smokeCloud.setFacePlayer(true);
    smokeCloud.setMaxAge(120);
    smokeCloud.spawn(npc.getWorld(), npc.x, npc.y, npc.z);
    npc.setSpeed(0);
    // warp to center
    npc.setMotion(ARENA_CENTER[0], ARENA_CENTER[1]+10, ARENA_CENTER[2]);

    auraOn(npc);
    doAnimation("FinalFlash"); 
    
    npc.say("&eOver here!");
}

function blasterAttack(e)
{
    var npc = e.npc;
    auraOff(npc);    
    
    var target = npc.getAttackTarget();
    if (target != null && target.getType() == 1) npc.shootItem(npc.getAttackTarget(), BLASTER_PROJECTILE, 95);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////// HOOKS

var laserCooldown = 200;
var LASER_TELEGRAPH = 1;
var laserTelegraphDuration = 60;
var FIRE_LASER = 2;
var SMOKE_BOMB = 3;
var BLASTER_ATTACK = 5;

function init(e)
{
    var npc = e.npc
    npc.getTimers().forceStart(LASER_TELEGRAPH, laserCooldown, false);
    npc.setTempData("HasUlted", 0)
}

function damaged(e)
{
    if (e.npc.getTimers().has(SMOKE_BOMB))
    {
        e.setCancelled(true);
    } 
    else if ((e.npc.getHealth() < 1) && !e.npc.getTempData("HasUlted"))
    {
        e.npc.setHealth(1);
    }
}

function tick(e)
{
    var npc = e.npc
    var ulted = npc.getTempData("HasUlted")
    if (!ulted && npc.getHealth() < npc.getMaxHealth*hpForUltimate)
    {
        npc.setTempData("HasUlted", 1)
        npc.getTimers().forceStart(SMOKE_BOMB, 1, false);
    }
}

function timer(e)
{
    var id = e.id
    var npc = e.npc
    switch(id)
    {
        case LASER_TELEGRAPH:
            fireLaserTelegraph(e);
            npc.getTimers().forceStart(FIRE_LASER, laserTelegraphDuration, false);
            break;
        case FIRE_LASER:
            fireLaser(e);
            npc.getTimers().forceStart(LASER_TELEGRAPH, laserCooldown, false);
            break;
        case SMOKE_BOMB:
            npc.getTimers().stop(BLASTER_ATTACK_TELEGRAPH);
            npc.getTimers().stop(BLASTER_ATTACK);
            smokeBomb(e);
            npc.getTimers().forceStart(BLASTER_ATTACK, 50, false);
            npc.setTempData("ShotsFired", 0);
            break;
        case BLASTER_ATTACK:
            blasterAttack(e);
            var shotsFired = npc.getTempData("ShotsFired");
            shotsFired++;
            if (shotsFired >= 5)
            {
                shotsFired = 0;
                npc.getTimers().forceStart(LASER_TELEGRAPH, laserCooldown, false);
                npc.setSpeed(speed);
            }
            else
            {
                npc.getTimers().forceStart(BLASTER_ATTACK, 5, false);
            }
            break;
        default:
            npc.say("&c&lInvalid timer of " + id + ": Report this to Mighty or Head Dev");
    }
}