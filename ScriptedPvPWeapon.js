// This code goes in the Player tab of Global Scripts.
// Makes a particular weapon drain the energy of another Player.

function attack(event) {
    var player = event.player;
    var t = event.getTarget();
    var godeater = "customnpcs:npcMithrilStaff";
    var gDisplay = player.getWorld().getStoredData("GodeaterWeapon");
    var heldItem = player.getHeldItem();

    if (heldItem != null && t.getType() == 1) {
        var disp = heldItem.getDisplayName();
        if (disp == gDisplay){
          //player.sendMessage("correct weapon test pass");
          var name = heldItem.name;
          if (name == godeater){
              var x = t.getDBCPlayer().getKi();
              x = x * 0.99;
              t.getDBCPlayer().setKi(x);
              //player.sendMessage("Ki drain Success");
              }
        }
    }
}
