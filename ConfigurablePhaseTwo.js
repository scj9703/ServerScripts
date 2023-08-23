
// Initialize (in NPC Init Tab) anything you will change: DMG, speed, regen, etc

// The following goes in an NPC Update Tab.
var MAX = npc.getMaxHealth();
var HP = npc.getHealth();

var activationHP = MAX/3; // What % hp to activate Phase Two
var deactivationHP = MAX*0.8; // What % hp that Phase Two changes are reverted
var setToThisHP = MAX/2;

if (HP >= MAX){
  var canActivate = true;
  var isActive = false;
}

if (HP <= activationHP && HP > 0 && !isActive && canActivate){
  npc.setHealth(setToThisHP);
  isActive = true;
  canActivate = false;
  //npc.say("Phase 2 active");
  //do other stuff here, stat and behavior changes, ETC
}

if (HP >= deactivationHP && isActive){
  isActive = false;
  //npc.say("normal state");
  //revert any changes you made to the NPC's normal state
}
