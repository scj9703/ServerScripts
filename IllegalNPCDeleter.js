// This Code goes into the All NPCs global scripting tab
// Locates Illegal NPCs, duplicated traders for example, and deletes them.
// Change 'init' to 'tick' in dire situations, but note that it will be called extremely frequently.
function init(e) {
    var npcName = "Legendary Ticket"; //replace name with the name desired
    var time = 10; //replace 10 with seconds
    if(npcName = e.npc.getName() == npcName){
      var en = npc.getSurroundingEntities(10, 1);
      for (var i = 0; i < en.length; i++){
        e.npc.executeCommand("broadcast Illegal NPC at " + e.npc.x + " " + e.npc.y + " " + e.npc.z + " by possible rulebreaker IGN: " + en[i].getName());
        e.npc.executeCommand("broadcast Send a screenshot of this message to Staff.");
      }
      e.npc.despawn();
    }
}
