// bomb.js - D-Tier Bounty Hunter's thermal detonator, damages player if hits
// AUTHOR: Mighty


var ARENA_CENTER = [-9740, 92, -10699];
var dashSpeed = 1; // mess around w/ this
var TELEGRAPH_PARTICLE = "customnpcs:textures/items/npcFireSpell.png"
var TELEGRAPH_HEXCODE = 0xd1001c; // d1001c = blood orange color
var telegraphDuration = 60;
var BOMB_RANGE_RADIUS = 5; // radius, NOT diameter
var BOMB_DAMAGE = 0.5;
var BOMB_TEXTURE = "customnpcs:textures/items/npcOrb.png"

///////////////////////////////////////////////////////////////////////////////// HELPER FUNCS

function warnParticles(npc, dr, dp, distance, height) 
{
    var part = API.createParticle(TELEGRAPH_PARTICLE);
    var angle = dr * Math.PI / 180;
    var pitch = dp * Math.PI / 180;
    for (var h = 0; h < height; h++) 
        {
        for (var i = 0; i < distance; i++) 
            {
            var dx = -Math.sin(angle) * i * Math.cos(pitch);
            var dz = Math.cos(angle) * i * Math.cos(pitch);
            var dy = Math.sin(pitch) * i;
            var X = npc.x + dx;
            var Y = npc.y + 1 + h + dy;
            var Z = npc.z + dz;
            part.setSize(16, 16);
            part.setMaxAge(telegraphDuration);
            part.setGlows(true);
            part.setAlpha(0.1, 0.1, 0, 0);
            part.setHEXColor(TELEGRAPH_HEXCODE, TELEGRAPH_HEXCODE, 0, 0);
            part.setPosition(X, Y, Z);
            part.setScale(100, 100, 0, 100);
            part.spawn(npc.getWorld());
        }
    }
}

//you can replace npc with an entity object, if you wanted to
//npc will dash towards entity
//speed changes how fast/far the npc goes, but youd have to change the 0.2 at setMotion to change how high it goes. keep it above 0, or your npc loses speed to touching the ground.
function dash(npc, entity, dashSpeed) 
{
    var angle = getDirection(npc, entity)
    var x = -Math.cos(angle) * dashSpeed
    var z = -Math.sin(angle) * dashSpeed    
    npc.setMotion(x, 1.0, z)
}

// function dash(npc, xCoordinate, zCoordinate, dashSpeed)
// {
//     var angle = getDirection(npc, xCoordinate, zCoordinate);
//     var x = -Math.cos(angle) * dashSpeed
//     var z = -Math.sin(angle) * dashSpeed
//     npc.say("dashCoords " + x + " " + z);
    
//     npc.setMotion(x, 1.0, z)
// }


function getDirection(npc, entity) 
{
    return Math.atan2(npc.getZ()-entity.getZ(), npc.getX()-entity.getX())
}

// function getDirection(npc, xCoordinate, zCoordinate)
// {
//     return Math.atan2(npc.getZ()-zCoordinate, npc.getX()-xCoordinate);
// }


//////////////////////////////////////////////////////////////////////////////// FUNCTIONS
// fly at player
function throwAtPlayer(e)
{
    var npc = e.npc;
    var players = npc.getSurroundingEntities(50, 1)
    if (players.length != 0)
    {
        // just pick the first player in the array, there will rarely if ever
        // be more than 1 near this npc
        var player = players[0];
        dash(npc, player, dashSpeed);
    }
    else
    {
        // if cannot find player, fly at arena center
        // disabled for now because overloading not supported
        //dash(npc, ARENA_CENTER[0], ARENA_CENTER[2], dashSpeed);
    }
}

// make pretty ring of colors
function telegraphRing(e)
{
    var npc = e.npc;
    
    warnParticles(npc, 0, 0, BOMB_RANGE_RADIUS, 4);
    warnParticles(npc, 90, 0, BOMB_RANGE_RADIUS, 4);
    warnParticles(npc, 180, 0, BOMB_RANGE_RADIUS, 4);
    warnParticles(npc, 270, 0, BOMB_RANGE_RADIUS, 4);
}

// explode
function explode(e)
{
    var npc = e.npc;
    // cause explode particle thing
    npc.getWorld().explode(npc.getPosition(), 0.0, false, false);
    // damage nearby players
    var players = npc.getSurroundingEntities(BOMB_RANGE_RADIUS, 1);
    for (var i = 0; i < players.length; i++)
    {
        var p = players[i];
        var maxHp = p.getDBCPlayer().getMaxBody();
        var damage = maxHp*BOMB_DAMAGE;
        var newHp = p.getDBCPlayer().getBody() - damage;
        if (newHp < 0) newHp = 0; // prevent negative hp
        p.getDBCPlayer().setBody(newHp);
    }
    // despawn
    npc.despawn();
}

/////////////////////////////////////////////////////////////////////////// TIMERS
var TELEGRAPH = 1;
var EXPLODE = 2;

function init(e)
{
    throwAtPlayer(e);
    var npc = e.npc;
    npc.getTimers().clear();
    var textureParticle = API.createParticle(BOMB_TEXTURE);
    textureParticle.setScale(10,10, 200, 0)
    textureParticle.setHEXColor(0x000000,0xffff00,2,0) // alternate colors
    textureParticle.setGlows(true)
    textureParticle.setFacePlayer(true)
    textureParticle.setMaxAge(40 + telegraphDuration);
    textureParticle.spawn(npc)
    // timer duration should be 'how long does it take bomb to hit the ground and stay there'
    // mess around with this
    e.npc.getTimers().forceStart(TELEGRAPH, 40, false);
}

function timer(e)
{
    var npc = e.npc;
    var id = e.id;
    switch(id)
    {
        case TELEGRAPH:
            telegraphRing(e);
            npc.getTimers().forceStart(EXPLODE, telegraphDuration, false);
            break;
        case EXPLODE:
            explode(e);
            break;
    }
}
