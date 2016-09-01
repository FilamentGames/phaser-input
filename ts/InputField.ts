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
    }

    export class InputField extends Phaser.Sprite {

        private placeHolder:Phaser.Text = null;

        private box:Phaser.Graphics = null;

        private textMask: TextMask;

        private focus:boolean = false;

        private cursor:Phaser.Text;

        private text:Phaser.Text;

        private offscreenText: Phaser.Text;

        private inputOptions: InputOptions;

        private domElement: InputElement;

        private selection: SelectionHighlight;

        private lines:string[];

        private windowScale: number = 1;

        private scrollPos:Phaser.Point = new Phaser.Point();

        private cursorPos:Phaser.Point = new Phaser.Point();

        private cachedValue:string;

        public get value():string {
            return this.domElement.value;
        }

        public set value(val:string) {
            this.domElement.value = val;
            this.updateFromDomElement();
        }

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
            this.inputOptions.font = inputOptions.font || '14px Arial';
            this.inputOptions.fontWeight = inputOptions.fontWeight || 'normal';
            this.inputOptions.fill = inputOptions.fill || '#000000';
            this.inputOptions.placeHolderColor = inputOptions.placeHolderColor || '#bfbebd';

            //create the input box
            this.box = new Fabrique.InputBox(this.game, inputOptions);
            this.setTexture(this.box.generateTexture());

            //create the mask that will be used for the texts
            this.textMask = new Fabrique.TextMask(this.game, inputOptions);
            this.addChild(this.textMask);

            //Create the hidden dom elements
            this.domElement = new Fabrique.InputElement(this.game, 'phaser-input-' + (Math.random() * 10000 | 0).toString(),
                "", this.inputOptions);


            if (inputOptions.placeHolder && inputOptions.placeHolder.length > 0) {
                this.placeHolder = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding,
                    inputOptions.placeHolder, <Phaser.PhaserTextStyle>{
                    font: inputOptions.font,
                    fontWeight: inputOptions.fontWeight,
                    fill: inputOptions.placeHolderColor,
                    wordWrapWidth: inputOptions.width
                });
                this.placeHolder.mask = this.textMask;
                this.placeHolder.useAdvancedWrap = true;
                this.addChild(this.placeHolder);
            }

            this.cursor = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding - 2, '|', <Phaser.PhaserTextStyle>{
                font: inputOptions.font,
                fontWeight: inputOptions.fontWeight,
                fill: inputOptions.cursorColor
            });
            this.cursor.visible = false;
            this.addChild(this.cursor);

            this.text = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, '', <Phaser.PhaserTextStyle>{
                font: inputOptions.font,
                fontWeight: inputOptions.fontWeight,
                fill: inputOptions.fill,
                wordWrapWidth: inputOptions.width
            });
            this.text.mask = this.textMask;
            this.text.useAdvancedWrap = true;
            this.addChild(this.text);

            this.offscreenText = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, '', <Phaser.PhaserTextStyle>{
                font: inputOptions.font,
                fontWeight: inputOptions.fontWeight,
                fill: inputOptions.fill,
                wordWrapWidth: inputOptions.width
            });

            this.offscreenText.useAdvancedWrap = true;

            this.selection = new Fabrique.SelectionHighlight(this.game, this.inputOptions, this.offscreenText, this.cursor);
            this.addChild(this.selection);

            this.updateTextPos();

            this.inputEnabled = true;
            this.input.useHandCursor = true;

            this.game.input.onDown.add(this.checkDown, this);
            this.domElement.focusOut.add((): void => {

                if (Fabrique.Plugins.InputField.KeyboardOpen) {
                    this.endFocus();
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
                this.startFocus(e);
            } else {
                if (this.focus === true) {
                    this.endFocus();
                }
            }
        }

        public update() {
            if (!this.focus) {
                return;
            }

            this.updateFromDomElement();
            this.updateCursorBlink();
        }

        private blink:boolean = true;
        private cnt: number = 0;

        /**
         * Update function makes the cursor blink, it uses two private properties to make it toggle
         *
         * @returns {number}
         */
        private updateCursorBlink() {
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
                Fabrique.Plugins.InputField.KeyboardOpen = false;
                Fabrique.Plugins.InputField.onKeyboardClose.dispatch();
            }

            if (this.inputOptions.zoom) {
                this.zoomOut();
            }
        }

        /**
         *
         */
        public startFocus(e: Phaser.Pointer) {
            if (this.game.device.desktop) {
                //Timeout is a chrome hack
                setTimeout(() => {
                    this.finishFocus(e);
                }, 0);
            } else {
                this.finishFocus(e);
            }
        }

        private finishFocus(e: Phaser.Pointer):void {
            this.focus = true;

            if (null !== this.placeHolder) {
                this.placeHolder.visible = false;
            }

            this.domElement.addEventListeners(this.inputListener.bind(this), this.keyDownListener.bind(this), this.keyUpListener.bind(this));
            this.domElement.focus();

            //Make sure we have the correct scroll information
            this.updateFromDomElement();

            this.domElement.caretPosition = this.getCursorIndex(new PIXI.Point(e.x, e.y));

            if (!this.game.device.desktop) {
                Fabrique.Plugins.InputField.KeyboardOpen = true;
                Fabrique.Plugins.InputField.onKeyboardOpen.dispatch();
            }

            if (this.inputOptions.zoom && !Fabrique.Plugins.InputField.Zoomed) {
                this.zoomIn();
            }
        }

        /**
         * Update the text value in the box
         */
        private updateTextFromElement() {

            //Don't do anything if the text hasn't changed
            if (this.cachedValue == this.value) {
                return;
            }

            this.cachedValue = this.value;

            if (null !== this.placeHolder) {
                if (this.value.length > 0) {
                    this.placeHolder.visible = false;
                } else {
                    this.placeHolder.visible = true;
                }
            }

            if (this.inputOptions.wordWrap) {
                this.lines = this.offscreenText.precalculateWordWrap(this.value);
            } else {
                this.lines = [this.value];
            }

            this.text.setText(this.lines.join('\n'));
        }

        /**
         * Updates the position of the caret in the phaser input field
         */
        private updateCursorFromElement() {
            this.cursorPos = this.getCaretPosition();
            this.scrollTo(this.cursorPos);
            this.updateCursorPos();
        }

        /**
         * Fetches the carrot position from the dom element. This one changes when you use the keyboard to navigate the element
         *
         * @returns {number}
         */
        private getCaretPosition():Phaser.Point {
            var caretPosition: any = this.domElement.caretPosition;
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
                var lines = this.lines;
                var index = 0;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    if (index + line.length >= caretPosition) {
                        var lineOffset = caretPosition - index;
                        line = line.slice(0, lineOffset);
                        this.text.context.font = this.text.cssFont;
                        let width = this.text.context.measureText(line).width;
                        return new Phaser.Point(width, this.cursor.height * i);
                    } else if (i == lines.length - 1) { //This is the last line
                        this.text.context.font = this.text.cssFont;
                        let width = this.text.context.measureText(line).width;
                        return new Phaser.Point(width, this.cursor.height * i);
                    }

                    index += line.length + 1;
                }
            } else {
                this.text.context.font = this.text.cssFont;
                let width = this.text.context.measureText(text.slice(0, caretPosition)).width;
                return new Phaser.Point(width, 0);
            }
        }

        private updateFromDomElement() {
            this.updateTextFromElement();
            this.updateCursorFromElement();
            this.updateSelection();
        }

        private getCursorIndex(globalPoint:PIXI.Point):number {
            var localPoint: PIXI.Point = (this.text.toLocal(new PIXI.Point(globalPoint.x, globalPoint.y), this.game.world));

            if (this.inputOptions.align && this.inputOptions.align === 'center') {
                localPoint.x += this.text.width / 2;
            }

            var index:number = 0;

            if (this.inputOptions.wordWrap) {
                var lines = this.text.precalculateWordWrap(this.value);

                //TODO: Try binary search to speed this up
                for (let i:number = 0, lineY:number = this.cursor.height; i < lines.length; i++, lineY += this.cursor.height) {
                    var line = lines[i];

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
                    //TODO: Try binary search to speed this up
                    if (width >= localPoint.x) {
                        return (index > 0 ? index - 1 : index);
                    }
                }
            }

            return index;
        }

        /**
         * This checks if a select has been made, and if so highlight it with blue
         * TODO: Handle multiline selection
         * TODO: Handle mouse selection
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

                this.selection.updateSelection(this.domElement.caretStart, this.domElement.caretEnd, this.lines);

                switch (this.inputOptions.align) {
                    case 'left':
                        this.selection.x = this.inputOptions.padding - this.scrollPos.x;
                        break;
                    case 'center':
                        this.selection.x = this.inputOptions.padding + this.inputOptions.width / 2 - this.text.width / 2 - this.scrollPos.x;
                        break;
                }

                this.selection.y = -this.scrollPos.y;

            } else {
                this.selection.clear();
            }
        }
        
        private zoomIn(): void {
            if (Fabrique.Plugins.InputField.Zoomed) {
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
            Fabrique.Plugins.InputField.Zoomed = true;
        }

        private zoomOut(): void {
            if (!Fabrique.Plugins.InputField.Zoomed) {
                return;
            }

            this.game.world.scale.set(this.game.world.scale.x / this.windowScale, this.game.world.scale.y / this.windowScale);
            this.game.world.pivot.set(0, 0);
            Fabrique.Plugins.InputField.Zoomed = false;
        }

        /**
         * Event fired when a key is pressed, it takes the value from the hidden input field and adds it as its own
         */
        private inputListener(evt: KeyboardEvent) {
        }

        private keyDownListener(evt: KeyboardEvent) {

            if (evt.keyCode === 13) {
                if(this.inputOptions.focusOutOnEnter) {
                    this.endFocus();
                    return;
                }
            }
        }

        private keyUpListener(evt: KeyboardEvent) {
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
            this.value = "";
        }

        private scrollTo(cursorPos:Phaser.Point) {
            if (cursorPos.x < this.scrollPos.x) {
                this.scrollPos.x += cursorPos.x - this.scrollPos.x;
            } else if (cursorPos.x > this.scrollPos.x + this.inputOptions.width) {
                this.scrollPos.x += cursorPos.x - this.scrollPos.x - this.inputOptions.width;
            }

            if (cursorPos.y < this.scrollPos.y) {
                this.scrollPos.y += cursorPos.y - this.scrollPos.y;
            } else if (cursorPos.y > this.scrollPos.y + this.inputOptions.height - this.cursor.height) {
                this.scrollPos.y += cursorPos.y + this.cursor.height - this.scrollPos.y - this.inputOptions.height;
            }

            this.updateTextPos();
            this.updateCursorPos();
        }

        private updateTextPos() {
            switch (this.inputOptions.align) {
                case 'left':
                    this.text.anchor.set(0, 0);
                    this.text.x = -this.scrollPos.x;
                    break;
                case 'center':
                    this.text.anchor.set(0.5, 0);
                    this.text.x = this.inputOptions.width / 2 - this.scrollPos.x;
                    break;
                case 'right':
                    this.text.anchor.set(1, 0);
                    this.text.x = this.inputOptions.width - this.scrollPos.x;
                    break;
            }

            this.text.y = -this.scrollPos.y;
        }

        private updateCursorPos() {
            switch (this.inputOptions.align) {
                case 'left':
                    this.cursor.x = this.inputOptions.padding + this.cursorPos.x - this.scrollPos.x;
                    break;
                case 'center':
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width / 2  - this.text.width / 2  + this.cursorPos.x - this.scrollPos.x;
                    break;
                case 'right':
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width - this.scrollPos.x;
                    break;
            }

            this.cursor.y = this.cursorPos.y - this.scrollPos.y;
        }
    }
}