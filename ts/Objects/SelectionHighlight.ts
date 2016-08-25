module Fabrique {
    export class SelectionHighlight extends Phaser.Graphics {
        private inputOptions: InputOptions;
        private text: Phaser.Text;
        private cursor: Phaser.Text;

        constructor(game: Phaser.Game, inputOptions: InputOptions, text:Phaser.Text, cursor: Phaser.Text) {
            super(game, inputOptions.padding, inputOptions.padding);

            this.inputOptions = inputOptions;
            this.text = text;
            this.cursor = cursor;
        }

        public updateSelection(start:number, end:number, lines:string[]): void {

            //Swap start and end if it's a backwards selection
            if (start > end) {
                var temp = start;
                start = end;
                end = temp;
            }

            var color = Phaser.Color.webToColor(this.inputOptions.selectionColor);

            this.clear();

            var index = 0;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];

                if (index >= end) {
                    return;
                }

                if (index + line.length >= start && index <= end) {
                    var startIdx = start > index ? start - index : 0;
                    var endIdx = index + line.length <= end ? line.length : line.length + (index - end);
                    this.text.context.font = this.text.cssFont;

                    var startPos = this.text.context.measureText(line.slice(0, startIdx));
                    var endPos = this.text.context.measureText(line.slice(0, endIdx));

                    this.beginFill(SelectionHighlight.rgb2hex(color), color.a);
                    this.drawRect(startPos.width, i * this.cursor.height, endPos.width, (i + 1) * this.cursor.height);
                    this.endFill();
                }

                index += line.length + 1;
            }
        }

        public static rgb2hex(color: {r: number, g: number, b: number, a: number}): number {
            return parseInt(("0" + color.r.toString(16)).slice(-2) +
                ("0" + color.g.toString(16)).slice(-2) +
                ("0" + color.b.toString(16)).slice(-2), 16);
        }
    }
}