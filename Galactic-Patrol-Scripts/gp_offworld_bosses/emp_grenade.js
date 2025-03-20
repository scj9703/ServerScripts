// emp_grenade.js - D-Tier Bounty Hunter's EMP grenade, disrupts player's ki if hits
// AUTHOR: Mighty

var ARENA_CENTER = [-9740, 92, -10699];
var dashSpeed = 1; // mess around w/ this
var TELEGRAPH_PARTICLE = "customnpcs:textures/items/npcIceSpell.png"
var TELEGRAPH_HEXCODE = 0x4169e1; // 4169e1 = royal blue
var telegraphDuration = 60;
var BOMB_RANGE_RADIUS = 5; // radius, NOT diameter
var BOMB_DAMAGE = 0.5;
var TELEGRAPH_ASSET = "https://i.imgur.com/WGH0Vkr.png"
var EXPLOSION_ASSET = "https://i.imgur.com/vOZG5Da.png"
var BOMB_TEXTURE = "customnpcs:textures/items/npcAmethyst.png"

///////////////////////////////////////////////////////////////////////////////// HELPER FUNCS

// Cross of particles
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
    
    npc.setMotion(x, 3.0, z)
}



function getDirection(npc, entity) 
{
    return Math.atan2(npc.getZ()-entity.getZ(), npc.getX()-entity.getX())
}



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
        // disabled for now because of no overload support
        //dash(npc, ARENA_CENTER[0], ARENA_CENTER[2], dashSpeed);
    }
}

// make pretty ring of colors
function telegraphRing(e)
{
    var npc = e.npc;
    var chargeParticle = API.createParticle(TELEGRAPH_ASSET);
    chargeParticle.setScale(100,100, 200, 0); // Keep size the same
    chargeParticle.setAlpha(0.0,1.0, 1, 40); // Fade in electricity
    chargeParticle.setGlows(true); 
    chargeParticle.setFacePlayer(true);
    chargeParticle.setMaxAge(120);
    chargeParticle.setHEXColor(0x89cff0,0x0047ab,2,0) // make particle flash colors
    chargeParticle.spawn(npc);
    
    warnParticles(npc, 0, 0, BOMB_RANGE_RADIUS, 4);
    warnParticles(npc, 90, 0, BOMB_RANGE_RADIUS, 4);
    warnParticles(npc, 180, 0, BOMB_RANGE_RADIUS, 4);
    warnParticles(npc, 270, 0, BOMB_RANGE_RADIUS, 4);
}

// explode
function explode(e)
{
    var npc = e.npc;
    // spawn electricity effect
    var shockParticle = API.createParticle(EXPLOSION_ASSET);
    shockParticle.setScale(50,500, 200, 0); // Expand image
    shockParticle.setAlpha(1.0,0.0, 0.5, 0); // Fade out electricity
    shockParticle.setGlows(true); 
    shockParticle.setFacePlayer(true);
    shockParticle.setMaxAge(40);
    shockParticle.setHEXColor(0x89cff0,0x0047ab,2,0) // make particle flash colors
    shockParticle.spawn(npc);

    // damage nearby players
    var players = npc.getSurroundingEntities(BOMB_RANGE_RADIUS, 1);
    for (var i = 0; i < players.length; i++)
    {
        var p = players[i];
        p.getDBCPlayer().setKi(0);
        p.sendMessage(("&bYou've been hit by an EMP! Your Ki is short-circuiting!").replaceAll("&", "\u00a7"));
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
    textureParticle.setScale(50,50, 200, 0)
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
