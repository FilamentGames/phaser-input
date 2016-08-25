declare module "phaser-input" {
	export = Fabrique;
}

declare module Phaser {
	interface GameObjectFactory {
		inputField(x:number, y:number, inputOptions?:Fabrique.InputOptions, group?:Phaser.Group):Fabrique.InputField;
	}
}