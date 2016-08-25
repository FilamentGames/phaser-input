describe("InputField", () => {
   it("can display a single line input field", (cb) => {
      var game = new Phaser.Game({
         width:"100%",
         height:"100%"
      });
      (<any>window).game = game;
      game.state.add("test", {
         create: function () {
            var input = game.add.inputField(50, 50, {
               width: 250,
               placeHolder: "Enter text here",
               height: 22
            });

            setTimeout(function() {
               game.destroy();
               cb();
            }, 5000);
         }
      }, true);
   });
});