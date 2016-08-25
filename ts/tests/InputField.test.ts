describe("InputField", () => {
    it("can display a single line input field with a placeholder", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    placeHolder: "Enter text here",
                    height: 22
                });

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 5000);
            }
        }, true);
    }, 10000);

    it("can display a number field", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    height: 22,
                    type: Fabrique.InputType.number,
                    min: 0,
                    max: 100
                });

                input.value = "50";

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 5000);
            }
        }, true);
    }, 10000);

    it("can display a password field", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    height: 22,
                    type: Fabrique.InputType.password,
                    min: 0,
                    max: 100
                });

                input.value = "password";

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 5000);
            }
        }, true);
    }, 10000);

    fit("can display a single line input field with a really long line", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    placeHolder: "Enter text here",
                    align: "center",
                    height: 22
                });

                input.value = "Loremipsumc";

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 60000);
            }
        }, true);
    }, 120000);

    it("can display a multiline input field with a placeholder", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    placeHolder: "Enter text here",
                    height: 250,
                    wordWrap: true
                });

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 5000);
            }
        }, true);
    }, 10000);

    it("can display a multiline input field with a really long line", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    placeHolder: "Enter text here",
                    height: 250,
                    wordWrap: true
                });

                input.value = "LoremipsumdolorsitametconsecteturadipiscingelitEtiamsedduiutsapienpharetrascelerisqueMaurisintortornunc";

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 60000);
            }
        }, true);
    }, 120000);

    it("can wrap text correctly in a multiline text field", (cb) => {
        var game = new Phaser.Game({
            width: "100%",
            height: "100%"
        });
        (<any>window).game = game;
        game.state.add("test", {
            init: function () {
                game.plugins.add(Fabrique.Plugins.InputField);
            },
            create: function () {
                var input = game.add.inputField(50, 50, {
                    width: 250,
                    height: 250,
                    wordWrap: true,
                    zoom: false
                });

                input.value = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sed dui ut sapien pharetra" +
                    "scelerisque. Mauris in tortor nunc. Vestibulum sodales, mi ac mattis dictum, leo sem fringilla felis," +
                    "in pharetra velit ante sit amet elit. Duis non tristique felis. Sed tincidunt ac ligula sit amet mattis." +
                    "Nunc dapibus orci nisl, id eleifend dolor porta quis. Integer porta vestibulum orci ut viverra. Nam ac erat" +
                    "nibh. Nam vehicula interdum sapien, vel ullamcorper ligula ultricies id. In ultricies sem sit amet nibh" +
                    " tempus, sit amet fringilla risus viverra. Phasellus et enim nec purus finibus rutrum at et elit.Nullam" +
                    " sit amet libero a arcu vehicula fringilla sed ac diam. Vestibulum vel convallis tortor, ut tincidunt" +
                    " velit. Nulla convallis dui enim, at blandit felis feugiat in. Sed lacinia convallis leo et gravida. " +
                    "Quisque eleifend, lacus sit amet congue tempor, nulla odio iaculis diam, sed iaculis lectus leo sed augue. " +
                    "Vivamus ac tempus nibh. Sed vitae congue erat. Suspendisse lacinia dapibus felis, sed eleifend lectus " +
                    "posuere eu. Phasellus molestie euismod bibendum. Aliquam nunc neque, volutpat at feugiat et, placerat " +
                    "non sapien. Quisque varius fringilla nisl vitae auctor. Donec consectetur dui orci, non commodo nunc " +
                    "dictum nec. Sed sagittis rhoncus vehicula. Nullam euismod ac purus a hendrerit. Mauris vitae orci diam.";

                setTimeout(function () {
                    game.destroy();
                    cb();
                }, 60000);
            }
        }, true);
    }, 120000);
});