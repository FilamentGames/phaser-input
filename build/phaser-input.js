/*!
 * phaser-input - version 1.2.3-filament5 
 * Adds input boxes to Phaser like CanvasInput, but also works for WebGL and Mobile, made for Phaser only.
 *
 * OrangeGames
 * Build at 25-08-2016
 * Released under MIT License 
 */

var Fabrique;
(function (Fabrique) {
    (function (InputType) {
        InputType[InputType["text"] = 0] = "text";
        InputType[InputType["password"] = 1] = "password";
        InputType[InputType["number"] = 2] = "number";
    })(Fabrique.InputType || (Fabrique.InputType = {}));
    var InputType = Fabrique.InputType;
    var InputElement = (function () {
        function InputElement(game, id, value, options) {
            var _this = this;
            if (value === void 0) { value = ''; }
            this.focusIn = new Phaser.Signal();
            this.focusOut = new Phaser.Signal();
            this.id = id;
            this.type = options.type;
            this.game = game;
            if (options.wordWrap) {
                this.element = document.createElement('textarea');
            }
            else {
                this.element = document.createElement('input');
                this.element.type = Fabrique.InputType[this.type];
            }
            this.setMax(options.max, options.min);
            this.element.id = id;
            this.element.style.position = 'absolute';
            this.element.style.top = (-1000).toString() + 'px';
            this.element.style.left = (-1000).toString() + 'px';
            this.element.style.width = options.width + 'px';
            this.element.style.height = options.height + 'px';
            this.element.style.font = options.font;
            this.element.style.textAlign = options.align;
            this.element.style.fontWeight = options.fontWeight.toString();
            this.element.value = this.value;
            this.element.addEventListener('focusin', function () {
                _this.focusIn.dispatch();
            });
            this.element.addEventListener('focusout', function () {
                _this.focusOut.dispatch();
            });
            document.body.appendChild(this.element);
        }
        InputElement.prototype.addEventListeners = function (inputCallback, keyDownCallback, keyUpCallback) {
            this.inputCallback = inputCallback;
            this.keyDownCallback = keyDownCallback;
            this.keyUpCallback = keyUpCallback;
            this.element.addEventListener('input', this.inputCallback);
            this.element.addEventListener('keydown', this.keyDownCallback);
            this.element.addEventListener('keyup', this.keyUpCallback);
        };
        InputElement.prototype.removeEventListeners = function () {
            this.element.removeEventListener('input', this.inputCallback);
            this.element.removeEventListener('keydown', this.keyDownCallback);
            this.element.removeEventListener('keyup', this.keyUpCallback);
        };
        InputElement.prototype.destroy = function () {
            document.body.removeChild(this.element);
        };
        InputElement.prototype.setMax = function (max, min) {
            if (max === undefined) {
                return;
            }
            if (this.type === InputType.text || this.type === InputType.password) {
                this.element.maxLength = parseInt(max, 10);
            }
            else if (this.type === InputType.number) {
                this.element.max = max;
                if (min === undefined) {
                    return;
                }
                this.element.min = min;
            }
        };
        Object.defineProperty(InputElement.prototype, "value", {
            get: function () {
                return this.element.value;
            },
            set: function (value) {
                this.element.value = value;
            },
            enumerable: true,
            configurable: true
        });
        InputElement.prototype.focus = function () {
            var _this = this;
            this.element.focus();
            if (!this.game.device.desktop && this.game.device.chrome) {
                var originalWidth = window.innerWidth, originalHeight = window.innerHeight;
                var kbAppeared = false;
                var interval = setInterval(function () {
                    if (originalWidth > window.innerWidth || originalHeight > window.innerHeight) {
                        kbAppeared = true;
                    }
                    if (kbAppeared && originalWidth === window.innerWidth && originalHeight === window.innerHeight) {
                        _this.focusOut.dispatch();
                        clearInterval(interval);
                    }
                }, 50);
            }
        };
        InputElement.prototype.blur = function () {
            this.element.blur();
        };
        Object.defineProperty(InputElement.prototype, "hasSelection", {
            get: function () {
                if (this.type === InputType.number) {
                    return false;
                }
                return this.element.selectionStart !== this.element.selectionEnd;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElement.prototype, "caretStart", {
            get: function () {
                return this.element.selectionEnd;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElement.prototype, "caretEnd", {
            get: function () {
                return this.element.selectionStart;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElement.prototype, "caretPosition", {
            get: function () {
                if (this.type === InputType.number) {
                    return -1;
                }
                return this.element.selectionStart;
            },
            set: function (pos) {
                if (this.type === InputType.number) {
                    return;
                }
                this.element.setSelectionRange(pos, pos);
            },
            enumerable: true,
            configurable: true
        });
        return InputElement;
    })();
    Fabrique.InputElement = InputElement;
})(Fabrique || (Fabrique = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Fabrique;
(function (Fabrique) {
    var InputField = (function (_super) {
        __extends(InputField, _super);
        function InputField(game, x, y, inputOptions) {
            var _this = this;
            if (inputOptions === void 0) { inputOptions = {}; }
            _super.call(this, game, x, y);
            this.placeHolder = null;
            this.box = null;
            this.focus = false;
            this.windowScale = 1;
            this.scrollPos = new Phaser.Point();
            this.cursorPos = new Phaser.Point();
            this.blink = true;
            this.cnt = 0;
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
            this.domElement = new Fabrique.InputElement(this.game, 'phaser-input-' + (Math.random() * 10000 | 0).toString(), "", this.inputOptions);
            if (inputOptions.placeHolder && inputOptions.placeHolder.length > 0) {
                this.placeHolder = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, inputOptions.placeHolder, {
                    font: inputOptions.font,
                    fontWeight: inputOptions.fontWeight,
                    fill: inputOptions.placeHolderColor,
                    wordWrap: inputOptions.wordWrap,
                    wordWrapWidth: inputOptions.width
                });
                this.placeHolder.mask = this.textMask;
                this.placeHolder.useAdvancedWrap = true;
                this.addChild(this.placeHolder);
            }
            this.cursor = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding - 2, '|', {
                font: inputOptions.font,
                fontWeight: inputOptions.fontWeight,
                fill: inputOptions.cursorColor
            });
            this.cursor.visible = false;
            this.addChild(this.cursor);
            this.text = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, '', {
                font: inputOptions.font,
                fontWeight: inputOptions.fontWeight,
                fill: inputOptions.fill,
                wordWrap: inputOptions.wordWrap,
                wordWrapWidth: inputOptions.width
            });
            this.text.mask = this.textMask;
            this.text.useAdvancedWrap = true;
            this.addChild(this.text);
            this.offscreenText = new Phaser.Text(game, this.inputOptions.padding, this.inputOptions.padding, '', {
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
            this.domElement.focusOut.add(function () {
                if (Fabrique.Plugins.InputField.KeyboardOpen) {
                    _this.endFocus();
                }
            });
        }
        Object.defineProperty(InputField.prototype, "value", {
            get: function () {
                return this.domElement.value;
            },
            set: function (val) {
                this.domElement.value = val;
                this.updateFromDomElement();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * This is a generic input down handler for the game.
         * if the input object is clicked, we gain focus on it and create the dom element
         *
         * If there was focus on the element previously, but clicked outside of it, the element will loose focus
         * and no keyboard events will be registered anymore
         *
         * @param e Phaser.Pointer
         */
        InputField.prototype.checkDown = function (e) {
            if (!this.value) {
                this.resetText();
            }
            if (this.input.checkPointerOver(e)) {
                this.startFocus(e);
            }
            else {
                if (this.focus === true) {
                    this.endFocus();
                }
            }
        };
        InputField.prototype.update = function () {
            if (!this.focus) {
                return;
            }
            this.updateFromDomElement();
            this.updateCursorBlink();
        };
        /**
         * Update function makes the cursor blink, it uses two private properties to make it toggle
         *
         * @returns {number}
         */
        InputField.prototype.updateCursorBlink = function () {
            if (this.cnt !== 30) {
                return this.cnt++;
            }
            this.cursor.visible = this.blink;
            this.blink = !this.blink;
            this.cnt = 0;
        };
        /**
         * Focus is lost on the input element, we disable the cursor and remove the hidden input element
         */
        InputField.prototype.endFocus = function () {
            var _this = this;
            this.domElement.removeEventListeners();
            this.focus = false;
            if (this.value.length === 0 && null !== this.placeHolder) {
                this.placeHolder.visible = true;
            }
            this.cursor.visible = false;
            if (this.game.device.desktop) {
                //Timeout is a chrome hack
                setTimeout(function () {
                    _this.domElement.blur();
                }, 0);
            }
            else {
                this.domElement.blur();
            }
            if (!this.game.device.desktop) {
                Fabrique.Plugins.InputField.KeyboardOpen = false;
                Fabrique.Plugins.InputField.onKeyboardClose.dispatch();
            }
            if (this.inputOptions.zoom) {
                this.zoomOut();
            }
        };
        /**
         *
         */
        InputField.prototype.startFocus = function (e) {
            var _this = this;
            if (this.game.device.desktop) {
                //Timeout is a chrome hack
                setTimeout(function () {
                    _this.finishFocus(e);
                }, 0);
            }
            else {
                this.finishFocus(e);
            }
        };
        InputField.prototype.finishFocus = function (e) {
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
        };
        /**
         * Update the text value in the box
         */
        InputField.prototype.updateTextFromElement = function () {
            if (null !== this.placeHolder) {
                if (this.value.length > 0) {
                    this.placeHolder.visible = false;
                }
                else {
                    this.placeHolder.visible = true;
                }
            }
            this.text.setText(this.value);
            if (this.inputOptions.wordWrap) {
                this.lines = this.offscreenText.precalculateWordWrap(this.value);
            }
            else {
                this.lines = [this.value];
            }
        };
        /**
         * Updates the position of the caret in the phaser input field
         */
        InputField.prototype.updateCursorFromElement = function () {
            this.cursorPos = this.getCaretPosition();
            this.scrollTo(this.cursorPos);
            this.updateCursorPos();
        };
        /**
         * Fetches the carrot position from the dom element. This one changes when you use the keyboard to navigate the element
         *
         * @returns {number}
         */
        InputField.prototype.getCaretPosition = function () {
            var caretPosition = this.domElement.caretPosition;
            if (-1 === caretPosition) {
                caretPosition = this.value.length;
            }
            var text = this.value;
            if (this.inputOptions.type === Fabrique.InputType.password) {
                text = '';
                for (var i_1 = 0; i_1 < this.value.length; i_1++) {
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
                        var width = this.text.context.measureText(line).width;
                        return new Phaser.Point(width, this.cursor.height * i);
                    }
                    else if (i == lines.length - 1) {
                        this.text.context.font = this.text.cssFont;
                        var width = this.text.context.measureText(line).width;
                        return new Phaser.Point(width, this.cursor.height * i);
                    }
                    index += line.length + 1;
                }
            }
            else {
                this.text.context.font = this.text.cssFont;
                var width = this.text.context.measureText(text.slice(0, caretPosition)).width;
                return new Phaser.Point(width, 0);
            }
        };
        InputField.prototype.updateFromDomElement = function () {
            this.updateTextFromElement();
            this.updateCursorFromElement();
            this.updateSelection();
        };
        InputField.prototype.getCursorIndex = function (globalPoint) {
            var localPoint = (this.text.toLocal(new PIXI.Point(globalPoint.x, globalPoint.y), this.game.world));
            if (this.inputOptions.align && this.inputOptions.align === 'center') {
                localPoint.x += this.text.width / 2;
            }
            var index = 0;
            if (this.inputOptions.wordWrap) {
                var lines = this.text.precalculateWordWrap(this.value);
                //TODO: Try binary search to speed this up
                for (var i = 0, lineY = this.cursor.height; i < lines.length; i++, lineY += this.cursor.height) {
                    var line = lines[i];
                    //The last character in the line is an extra character so don't use it
                    for (var j = 0; j < line.length; j++, index++) {
                        this.text.context.font = this.text.cssFont;
                        var width = this.text.context.measureText(line.slice(0, j)).width;
                        if (width >= localPoint.x && lineY >= localPoint.y) {
                            return (index > 0 ? index - 1 : index);
                        }
                    }
                    if (lineY >= localPoint.y) {
                        return index;
                    }
                    index++;
                }
            }
            else {
                for (var j = 0; j < this.value.length; j++, index++) {
                    this.text.context.font = this.text.cssFont;
                    var width = this.text.context.measureText(this.value.slice(0, j)).width;
                    //TODO: Try binary search to speed this up
                    if (width >= localPoint.x) {
                        return (index > 0 ? index - 1 : index);
                    }
                }
            }
            return index;
        };
        /**
         * This checks if a select has been made, and if so highlight it with blue
         * TODO: Handle multiline selection
         * TODO: Handle mouse selection
         */
        InputField.prototype.updateSelection = function () {
            if (this.domElement.hasSelection) {
                var text = this.value;
                if (this.inputOptions.type === Fabrique.InputType.password) {
                    text = '';
                    for (var i = 0; i < this.value.length; i++) {
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
            }
            else {
                this.selection.clear();
            }
        };
        InputField.prototype.zoomIn = function () {
            if (Fabrique.Plugins.InputField.Zoomed) {
                return;
            }
            var bounds = this.getBounds();
            if (window.innerHeight > window.innerWidth) {
                this.windowScale = this.game.width / (bounds.width * 1.5);
            }
            else {
                this.windowScale = (this.game.width / 2) / (bounds.width * 1.5);
            }
            var offsetX = ((this.game.width - bounds.width * 1.5) / 2) / this.windowScale;
            this.game.world.scale.set(this.game.world.scale.x * this.windowScale, this.game.world.scale.y * this.windowScale);
            this.game.world.pivot.set(bounds.x - offsetX, bounds.y - this.inputOptions.padding * 2);
            Fabrique.Plugins.InputField.Zoomed = true;
        };
        InputField.prototype.zoomOut = function () {
            if (!Fabrique.Plugins.InputField.Zoomed) {
                return;
            }
            this.game.world.scale.set(this.game.world.scale.x / this.windowScale, this.game.world.scale.y / this.windowScale);
            this.game.world.pivot.set(0, 0);
            Fabrique.Plugins.InputField.Zoomed = false;
        };
        /**
         * Event fired when a key is pressed, it takes the value from the hidden input field and adds it as its own
         */
        InputField.prototype.inputListener = function (evt) {
        };
        InputField.prototype.keyDownListener = function (evt) {
            if (evt.keyCode === 13) {
                if (this.inputOptions.focusOutOnEnter) {
                    this.endFocus();
                    return;
                }
            }
        };
        InputField.prototype.keyUpListener = function (evt) {
        };
        /**
         * We overwrite the destroy method because we want to delete the (hidden) dom element when the inputField was removed
         */
        InputField.prototype.destroy = function () {
            this.domElement.destroy();
            _super.prototype.destroy.call(this);
        };
        /**
         * Resets the text to an empty value
         */
        InputField.prototype.resetText = function () {
            this.value = "";
        };
        InputField.prototype.scrollTo = function (cursorPos) {
            if (cursorPos.x < this.scrollPos.x) {
                this.scrollPos.x += cursorPos.x - this.scrollPos.x;
            }
            else if (cursorPos.x > this.scrollPos.x + this.inputOptions.width) {
                this.scrollPos.x += cursorPos.x - this.scrollPos.x - this.inputOptions.width;
            }
            if (cursorPos.y < this.scrollPos.y) {
                this.scrollPos.y += cursorPos.y - this.scrollPos.y;
            }
            else if (cursorPos.y > this.scrollPos.y + this.inputOptions.height - this.cursor.height) {
                this.scrollPos.y += cursorPos.y + this.cursor.height - this.scrollPos.y - this.inputOptions.height;
            }
            this.updateTextPos();
            this.updateCursorPos();
        };
        InputField.prototype.updateTextPos = function () {
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
        };
        InputField.prototype.updateCursorPos = function () {
            switch (this.inputOptions.align) {
                case 'left':
                    this.cursor.x = this.inputOptions.padding + this.cursorPos.x - this.scrollPos.x;
                    break;
                case 'center':
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width / 2 - this.text.width / 2 + this.cursorPos.x - this.scrollPos.x;
                    break;
                case 'right':
                    this.cursor.x = this.inputOptions.padding + this.inputOptions.width - this.scrollPos.x;
                    break;
            }
            this.cursor.y = this.cursorPos.y - this.scrollPos.y;
        };
        return InputField;
    })(Phaser.Sprite);
    Fabrique.InputField = InputField;
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    var InputBox = (function (_super) {
        __extends(InputBox, _super);
        function InputBox(game, inputOptions) {
            _super.call(this, game, 0, 0);
            var bgColor = (inputOptions.backgroundColor) ? parseInt(inputOptions.backgroundColor.slice(1), 16) : 0xffffff, borderRadius = inputOptions.borderRadius || 0, borderColor = (inputOptions.borderColor) ? parseInt(inputOptions.borderColor.slice(1), 16) : 0x959595, alpha = inputOptions.fillAlpha, height = inputOptions.height;
            if (inputOptions.font) {
                //fetch height from font;
                height = Math.max(parseInt(inputOptions.font.substr(0, inputOptions.font.indexOf('px')), 10), height);
            }
            height = inputOptions.padding * 2 + height;
            var width = inputOptions.width;
            width = inputOptions.padding * 2 + width;
            this.beginFill(bgColor, alpha)
                .lineStyle(inputOptions.borderWidth || 1, borderColor, alpha);
            if (borderRadius > 0) {
                this.drawRoundedRect(0, 0, width, height, borderRadius);
            }
            else {
                this.drawRect(0, 0, width, height);
            }
        }
        return InputBox;
    })(Phaser.Graphics);
    Fabrique.InputBox = InputBox;
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    var SelectionHighlight = (function (_super) {
        __extends(SelectionHighlight, _super);
        function SelectionHighlight(game, inputOptions, text, cursor) {
            _super.call(this, game, inputOptions.padding, inputOptions.padding);
            this.inputOptions = inputOptions;
            this.text = text;
            this.cursor = cursor;
        }
        SelectionHighlight.prototype.updateSelection = function (start, end, lines) {
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
                    var endIdx = index + line.length <= end ? line.length : end - index;
                    this.text.context.font = this.text.cssFont;
                    var startPos = this.text.context.measureText(line.slice(0, startIdx));
                    var endPos = this.text.context.measureText(line.slice(0, endIdx));
                    this.beginFill(SelectionHighlight.rgb2hex(color), color.a);
                    console.log(startIdx, endIdx, startPos, endPos, i);
                    this.drawRect(startPos.width, i * this.cursor.height, endPos.width - startPos.width, this.cursor.height);
                    this.endFill();
                }
                index += line.length + 1;
            }
        };
        SelectionHighlight.rgb2hex = function (color) {
            return parseInt(("0" + color.r.toString(16)).slice(-2) +
                ("0" + color.g.toString(16)).slice(-2) +
                ("0" + color.b.toString(16)).slice(-2), 16);
        };
        return SelectionHighlight;
    })(Phaser.Graphics);
    Fabrique.SelectionHighlight = SelectionHighlight;
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    var TextMask = (function (_super) {
        __extends(TextMask, _super);
        function TextMask(game, inputOptions) {
            _super.call(this, game, inputOptions.padding, inputOptions.padding);
            var borderRadius = inputOptions.borderRadius, height = inputOptions.height;
            if (inputOptions.font) {
                //fetch height from font;
                height = Math.max(parseInt(inputOptions.font.substr(0, inputOptions.font.indexOf('px')), 10), height);
            }
            var width = inputOptions.width;
            this.beginFill(0x000000);
            if (borderRadius > 0) {
                this.drawRoundedRect(0, 0, width, height, borderRadius);
            }
            else {
                this.drawRect(0, 0, width, height);
            }
        }
        return TextMask;
    })(Phaser.Graphics);
    Fabrique.TextMask = TextMask;
})(Fabrique || (Fabrique = {}));
///<reference path="../typings/phaser-input-shim.d.ts"/>
var Fabrique;
(function (Fabrique) {
    var Plugins;
    (function (Plugins) {
        var InputField = (function (_super) {
            __extends(InputField, _super);
            function InputField(game, parent) {
                _super.call(this, game, parent);
                this.addInputFieldFactory();
            }
            /**
             * Extends the GameObjectFactory prototype with the support of adding InputField. this allows us to add InputField methods to the game just like any other object:
             * game.add.InputField();
             */
            InputField.prototype.addInputFieldFactory = function () {
                Phaser.GameObjectFactory.prototype.inputField = function (x, y, inputOptions, group) {
                    if (group === undefined) {
                        group = this.world;
                    }
                    var nineSliceObject = new Fabrique.InputField(this.game, x, y, inputOptions);
                    return group.add(nineSliceObject);
                };
                Phaser.GameObjectCreator.prototype.inputField = function (x, y, inputOptions) {
                    return new Fabrique.InputField(this.game, x, y, inputOptions);
                };
            };
            InputField.Zoomed = false;
            InputField.KeyboardOpen = false;
            InputField.onKeyboardOpen = new Phaser.Signal();
            InputField.onKeyboardClose = new Phaser.Signal();
            return InputField;
        })(Phaser.Plugin);
        Plugins.InputField = InputField;
    })(Plugins = Fabrique.Plugins || (Fabrique.Plugins = {}));
})(Fabrique || (Fabrique = {}));
//# sourceMappingURL=phaser-input.js.map