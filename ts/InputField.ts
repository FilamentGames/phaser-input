module Fabrique {
    import Text = Phaser.Text;
    export interface InputOptions {
        x?: number;
        y?: number;
        placeHolder?: string;
        fillAlpha?: number;
        width?: number;
        height?: number;
        padding?: number;
        borderWidth?: number;
        borderColor?: string;
        borderRadius?: number;
        cursorColor?: string;
        placeHolderColor?: string;
        type?: InputType;
        min?: string;
        max?: string;
        selectionColor?: string;
        zoom?: boolean;
        focusOutOnEnter?: boolean;
        font?: string;
        fontWeight?: string | number;
        backgroundColor?: string;
        fill?: any;
        align?: string;
        wordWrap?: boolean;
        wordWrapWidth?: number;
    }

    export class InputField extends Phaser.Sprite {
        public focusOutOnEnter: boolean = true;

        private placeHolder:Phaser.Text = null;

        private box:Phaser.Graphics = null;

        private textMask: TextMask;

        private focus:boolean = false;

        private cursor:Phaser.Text;

        private text:Phaser.Text;

        private offscreenText: Phaser.Text;

        public value:string = '';

        private inputOptions: InputOptions;

        private domElement: InputElement;

        private selection: SelectionHighlight;

        private windowScale: number = 1;

        //public blockInput: boolean = true;

        constructor(game:Phaser.Game, x:number, y:number, inputOptions:InputOptions = {}) {
            super(game, x, y);

            //Parse the options
            this.inputOptions = inputOptions;
            this.inputOptions.width = inputOptions.width || 150;
            this.inputOptions.padding = inputOptions.padding || 0;
            this.inputOptions.align = inputOptions.align || 'left';
            this.inputOptions.type = inputOptions.type || Fabrique.InputType.text;
            this.inputOptions.borderRadius = inputOptions.borderRadius || 0;
            this.inputOptions.height = inputOptions.height || 14;
            this.inputOptions.fillAlpha = (inputOptions.fillAlpha === undefined) ? 1 : inputOptions.fillAlpha;
            this.inputOptions.selectionColor = inputOptions.selectionColor || 'rgba(179, 212, 253, 0.8)';
            this.inputOptions.zoom = (!game.device.desktop) ? inputOptions.zoom || false : false;

            this.focusOutOnEnter = this.inputOptions.focusOutOnEnter;

            //create the input box
            this.box = new Fabrique.InputBox(this.game, inputOptions);
            this.setTexture(this.box.generateTexture());

            //create the mask that will be used for the texts
            this.textMask = new Fabrique.TextMask(this.game, inputOptions);
            this.addChild(this.textMask);

            //Create the hidden dom elements
            this.domElement = new Fabrique.InputElement(this.game, 'phaser-input-' + (Math.random() * 10000 | 0).toString(),
                this.inputOptions.type, this.value, this.inputOptions.wordWrap);
            this.domElement.setMax(this.inputOptions.max, this.inputOptions.min);

            this.selection = new Fabrique.SelectionHighlight(this.game, this.inputOptions);
            this.addChild(this.selection);

            if (inputOptions.placeHolder && inputOptions.placeHolder.length > 0) {
                this.placeHolder = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding,
                    inputOptions.placeHolder, <Phaser.PhaserTextStyle>{
                    font: inputOptions.font || '14px Arial',
                    fontWeight: inputOptions.fontWeight || 'normal',
                    fill: inputOptions.placeHolderColor || '#bfbebd',
                    wordWrap: inputOptions.wordWrap,
                    wordWrapWidth: inputOptions.width
                });
                this.placeHolder.mask = this.textMask;
                this.addChild(this.placeHolder);
            }

            this.cursor = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding - 2, '|', <Phaser.PhaserTextStyle>{
                font: inputOptions.font || '14px Arial',
                fontWeight: inputOptions.fontWeight || 'normal',
                fill: inputOptions.cursorColor || '#000000'
            });
            this.cursor.visible = false;
            this.addChild(this.cursor);

            this.text = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, '', <Phaser.PhaserTextStyle>{
                font: inputOptions.font || '14px Arial',
                fontWeight: inputOptions.fontWeight || 'normal',
                fill: inputOptions.fill || '#000000',
                wordWrap: inputOptions.wordWrap,
                wordWrapWidth: inputOptions.width
            });
            this.text.mask = this.textMask;
            this.addChild(this.text);

            this.offscreenText = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, '', <Phaser.PhaserTextStyle>{
                font: inputOptions.font || '14px Arial',
                fontWeight: inputOptions.fontWeight || 'normal',
                fill: inputOptions.fill || '#000000',
                wordWrapWidth: inputOptions.width
            });

            var caretPosition = this.getCaretPosition();

            switch (this.inputOptions.align) {
                case 'left':
                    this.text.anchor.set(0, 0);
                    this.cursor.x = this.inputOptions.padding + caretPosition.x;
                    break;
                case 'center':
                    this.text.anchor.set(0.5, 0);
                    this.text.x += this.inputOptions.width / 2;
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width / 2  - this.text.width / 2  + caretPosition.x;
                    break;
                case 'right':
                    this.text.anchor.set(1, 0);
                    this.text.x += this.inputOptions.width;
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width;
                    break;
            }

            this.cursor.y = caretPosition.y;

            this.inputEnabled = true;
            this.input.useHandCursor = true;

            this.game.input.onDown.add(this.checkDown, this);
            this.domElement.focusOut.add((): void => {

                if (Plugins.InputField.KeyboardOpen) {

                    this.endFocus();
                    if (this.inputOptions.zoom) {
                        this.zoomOut();
                    }
                }
            });
        }

        /**
         * This is a generic input down handler for the game.
         * if the input object is clicked, we gain focus on it and create the dom element
         *
         * If there was focus on the element previously, but clicked outside of it, the element will loose focus
         * and no keyboard events will be registered anymore
         *
         * @param e Phaser.Pointer
         */
        private checkDown(e: Phaser.Pointer): void
        {
            if(!this.value){
                this.resetText();
            }
            if (this.input.checkPointerOver(e)) {
                if (this.focus) {
                    this.setCaretOnclick(e);
                    return;
                }

                if (this.inputOptions.zoom && !Fabrique.Plugins.InputField.Zoomed) {
                    this.zoomIn();
                }
                this.startFocus();
            } else {
                if (this.focus === true) {
                    this.endFocus();
                    if (this.inputOptions.zoom) {
                        this.zoomOut();
                    }
                }
            }
        }

        /**
         * Update function makes the cursor blink, it uses two private properties to make it toggle
         *
         * @returns {number}
         */
        private blink:boolean = true;
        private cnt: number = 0;
        public update()
        {
            if (!this.focus) {
                return;
            }

            if (this.cnt !== 30) {
                return this.cnt++;
            }

            this.cursor.visible = this.blink;
            this.blink = !this.blink;
            this.cnt = 0;
        }

        /**
         * Focus is lost on the input element, we disable the cursor and remove the hidden input element
         */
        public endFocus() {
            this.domElement.removeEventListeners();

            this.focus = false;
            if (this.value.length === 0 && null !== this.placeHolder) {
                this.placeHolder.visible = true;
            }
            this.cursor.visible = false;

            if (this.game.device.desktop) {
                //Timeout is a chrome hack
                setTimeout(() => {
                    this.domElement.blur();
                }, 0);
            } else {
                this.domElement.blur();
            }

            if (!this.game.device.desktop) {
                Plugins.InputField.KeyboardOpen = false;
                Plugins.InputField.onKeyboardClose.dispatch();
            }
        }

        /**
         *
         */
        public startFocus() {
            this.focus = true;

            if (null !== this.placeHolder) {
                this.placeHolder.visible = false;
            }

            if (this.game.device.desktop) {
                //Timeout is a chrome hack
                setTimeout(() => {
                    this.attachEvents();
                }, 0);
            } else {
                this.attachEvents();
            }

            if (!this.game.device.desktop) {
                Plugins.InputField.KeyboardOpen = true;
                Plugins.InputField.onKeyboardOpen.dispatch();
            }
        }

        private attachEvents():void {
            this.domElement.addEventListeners(this.inputListener.bind(this), this.keyDownListener.bind(this), this.keyUpListener.bind(this));
            this.domElement.focus();
        }

        /**
         * Update the text value in the box, and make sure the cursor is positioned correctly
         */
        private updateText()
        {
            var text: string = '';
            if (this.inputOptions.type === Fabrique.InputType.password) {
                for (let i = 0; i < this.value.length; i++) {
                    text += '*';
                }
            }else if (this.inputOptions.type === Fabrique.InputType.number) {
                var val = parseInt(this.value);
                if (val < parseInt(this.inputOptions.min)) {
                    text = this.inputOptions.min;
                } else if (val > parseInt(this.inputOptions.max)) {
                    text = this.inputOptions.max;
                } else {
                    text = this.value;
                }
            } else {
                text = this.value;
            }

            this.text.setText(text);

            if (this.text.width > this.inputOptions.width) {
                this.text.anchor.x = 1;
                this.text.x = this.inputOptions.padding + this.inputOptions.width;
            } else {
                switch (this.inputOptions.align) {
                    case 'left':
                        this.text.anchor.set(0, 0);
                        this.text.x = this.inputOptions.padding;
                        break;
                    case 'center':
                        this.text.anchor.set(0.5, 0);
                        this.text.x = this.inputOptions.padding + this.inputOptions.width / 2;
                        break;
                    case 'right':
                        this.text.anchor.set(1, 0);
                        this.text.x = this.inputOptions.padding + this.inputOptions.width;
                        break;
                }
            }
        }

        /**
         * Updates the position of the caret in the phaser input field
         */
        private updateCursor() {
            var caretPosition = this.getCaretPosition();

            switch (this.inputOptions.align) {
                case 'right':
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width;
                    break;
                case 'left':
                    this.cursor.x = this.inputOptions.padding + caretPosition.x;
                    break;
                case 'center':
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width / 2 - this.text.width / 2 + caretPosition.x;
                    break;
            }

            this.cursor.y = caretPosition.y;
        }

        /**
         * Fetches the carrot position from the dom element. This one changes when you use the keyboard to navigate the element
         *
         * @returns {number}
         */
        private getCaretPosition():any {
            //TODO: Position caret at the edge of the textfield if there is more text than can fit visually

            var caretPosition: any = this.domElement.getCaretPosition();
            if (-1 === caretPosition) {
                caretPosition = this.value.length;
            }

            var text = this.value;
            if (this.inputOptions.type === Fabrique.InputType.password) {
                text = '';
                for (let i = 0; i < this.value.length; i++) {
                    text += '*';
                }
            }

            if (this.inputOptions.wordWrap) {
                //Measure the number of lines down
                var lines = this.text.precalculateWordWrap(this.value);
                var index = 0;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    line = line.slice(0, -1);

                    if (index + line.length >= caretPosition) {
                        var lineOffset = caretPosition - index;
                        console.log(caretPosition, i, index, lineOffset);
                        line = line.slice(0, lineOffset);
                        this.text.context.font = this.text.cssFont;
                        let width = this.text.context.measureText(line).width;
                        return {x: width, y: this.cursor.height * i};
                    } else if (i == lines.length - 1) { //This is the last line
                        this.text.context.font = this.text.cssFont;
                        let width = this.text.context.measureText(line).width;
                        return {x: width, y: this.cursor.height * i};
                    }

                    index += line.length + 1;
                }
            } else {
                this.text.context.font = this.text.cssFont;
                let width = this.text.context.measureText(text.slice(0, caretPosition)).width;
                return {x: width, y: 0};
            }
        }

        /**
         * Set the caret when a click was made in the input field
         *
         * @param e
         */
        private setCaretOnclick(e: Phaser.Pointer) {
            var localPoint: PIXI.Point = (this.text.toLocal(new PIXI.Point(e.x, e.y), this.game.world));

            if (this.inputOptions.align && this.inputOptions.align === 'center') {
                localPoint.x += this.text.width / 2;
            }


            var index = this.getCursorIndex(localPoint);


            this.startFocus();

            this.domElement.setCaretPosition(index);

            this.updateCursor();
        }

        private getCursorIndex(localPoint:PIXI.Point):number {
            var index:number = 0;

            if (this.inputOptions.wordWrap) {
                var lines = this.text.precalculateWordWrap(this.value);

                for (let i:number = 0, lineY:number = this.cursor.height; i < lines.length; i++, lineY += this.cursor.height) {
                    var line = lines[i];
                    line = line.slice(0, -1);

                    //The last character in the line is an extra character so don't use it
                    for (let j:number = 0; j < line.length; j++, index++) {
                        this.text.context.font = this.text.cssFont;
                        let width = this.text.context.measureText(line.slice(0, j)).width;
                        if (width >= localPoint.x && lineY >= localPoint.y) {
                            return (index > 0 ? index - 1 : index);
                        }
                    }

                    if (lineY >= localPoint.y) {
                        return index;
                    }

                    index++;
                }
            } else {
                for (let j:number = 0; j < this.value.length; j++, index++) {
                    this.text.context.font = this.text.cssFont;
                    let width = this.text.context.measureText(this.value.slice(0, j)).width;

                    if (width >= localPoint.x) {
                        return (index > 0 ? index - 1 : index);
                    }
                }
            }

            return index;
        }

        /**
         * This checks if a select has been made, and if so highlight it with blue
         */
        private updateSelection(): void {
            if (this.domElement.hasSelection) {
                var text = this.value;
                if (this.inputOptions.type === Fabrique.InputType.password) {
                    text = '';
                    for (let i = 0; i < this.value.length; i++) {
                        text += '*';
                    }
                }
                text = text.substring(this.domElement.caretStart, this.domElement.caretEnd);
                this.offscreenText.setText(text);

                //TODO: Handle multiline selection
                //TODO: Handle keyboard selection
                this.selection.updateSelection(this.offscreenText.getBounds());

                switch (this.inputOptions.align) {
                    case 'left':
                        this.selection.x = this.inputOptions.padding;
                        break;
                    case 'center':
                        this.selection.x = this.inputOptions.padding + this.inputOptions.width / 2 - this.text.width / 2;
                        break;
                }
            } else {
                this.selection.clear();
            }
        }
        
        private zoomIn(): void {
            if (Plugins.InputField.Zoomed) {
                return;
            }

            let bounds: PIXI.Rectangle = this.getBounds();
            if (window.innerHeight > window.innerWidth) {
                this.windowScale = this.game.width / (bounds.width * 1.5);
            } else {
                this.windowScale = (this.game.width / 2) / (bounds.width * 1.5);
            }

            let offsetX: number = ((this.game.width - bounds.width * 1.5) / 2) / this.windowScale;
            this.game.world.scale.set(this.game.world.scale.x * this.windowScale, this.game.world.scale.y * this.windowScale);
            this.game.world.pivot.set(bounds.x - offsetX, bounds.y - this.inputOptions.padding * 2);
            Plugins.InputField.Zoomed = true;
        }

        private zoomOut(): void {
            if (!Plugins.InputField.Zoomed) {
                return;
            }

            this.game.world.scale.set(this.game.world.scale.x / this.windowScale, this.game.world.scale.y / this.windowScale);
            this.game.world.pivot.set(0, 0);
            Plugins.InputField.Zoomed = false;
        }

        /**
         * Event fired when a key is pressed, it takes the value from the hidden input field and adds it as its own
         */
        private inputListener(evt: KeyboardEvent) {
        }

        private keyDownListener(evt: KeyboardEvent) {
            if (evt.keyCode === 13) {
                if(this.focusOutOnEnter) {
                    this.endFocus();
                    return;
                }
            }

            this.value = this.domElement.value;
            this.updateText();
            this.updateCursor();
            this.updateSelection();
        }

        private keyUpListener(evt: KeyboardEvent) {
            this.value = this.domElement.value;
            this.updateText();
            this.updateCursor();
            this.updateSelection();
        }

        /**
         * We overwrite the destroy method because we want to delete the (hidden) dom element when the inputField was removed
         */
        public destroy() {
            this.domElement.destroy();

            super.destroy();
        }

        /**
         * Resets the text to an empty value
         */
        public resetText() {
            this.setText();
        }

        public setText(text: string = ''): void {
            if (null !== this.placeHolder) {
                if (text.length > 0) {
                    this.placeHolder.visible = false;
                } else {
                    this.placeHolder.visible = true;
                }
            }

            this.value = text;
            this.domElement.value = this.value;
            this.updateText();
            this.updateCursor();
            this.endFocus();
        }
    }
}