// hitCloneB.js - Hit's clones from Phase 3.
//                Appear briefly and then disappear.

var VISIBLE = 0;
var INVIS = 1;
var TRANSPARENT = 2;

var stance1 = "HitStance1"; //hands in pockets
var stance2 = "Hit_Stance2"; //Initial fighting stance
var stance3 = "HitStance3"; //Improved fighting stance, not used in Phase 1

// Helper function for turning NPC's aura on.
// Param npc: the NPC to turn aura on for
function auraOn(npc)
{
    var dbcDisplay = DBCAPI.getDBCDisplay(npc);
    dbcDisplay.toggleAura(true);
    npc.updateClient();

}

// Helper function for making animations easy
// Param e: any NPC event
// Param animationName: string name of desired animation
function doAnimation(e)
{
    var rng = Math.random();
    var animationName = "";
    if (rng < 0.33) animationName = stance1
    else if (rng > 0.66) animationName = stance2
    else animationName = stance3;
    var anim = API.getAnimations().get(animationName)
    var animData = e.npc.getAnimationData()
    animData.setEnabled(true)
    animData.setAnimation(anim)
    animData.updateClient()
}

var BECOME_TRANSPARENT = 1;
var BECOME_VISIBLE = 2;
var START_DISAPPEARING = 3;
var DESPAWN = 4;

function init(e)
{
    e.npc.setVisibleType(INVIS);
    e.npc.getTimers().forceStart(BECOME_TRANSPARENT, 1, false);
}

function timer(e)
{
    var npc = e.npc;
    var id = e.id;
    switch(id)
    {
        case BECOME_TRANSPARENT:
            npc.setVisibleType(TRANSPARENT);
            npc.getTimers().forceStart(BECOME_VISIBLE, 10, false);
            auraOn(npc);
            break;
        case BECOME_VISIBLE:
            npc.setVisibleType(VISIBLE);
            npc.getTimers().forceStart(START_DISAPPEARING, 40, false);
            doAnimation(e);
            break;
        case START_DISAPPEARING:
            npc.setVisibleType(TRANSPARENT);
            npc.getTimers().forceStart(DESPAWN, 10, false);
            break;
        case DESPAWN:
            npc.setVisibleType(INVIS);
            //npc.despawn();
            break;
    }
}

