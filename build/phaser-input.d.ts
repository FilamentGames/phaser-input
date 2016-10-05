/// <reference path="../typings/phaser-input-shim.d.ts" />
declare module Fabrique {
    enum InputType {
        text = 0,
        password = 1,
        number = 2,
    }
    class InputElement {
        private element;
        private inputCallback;
        private keyDownCallback;
        private keyUpCallback;
        private type;
        private id;
        private game;
        focusIn: Phaser.Signal;
        focusOut: Phaser.Signal;
        constructor(game: Phaser.Game, id: string, value: string, options: Fabrique.InputOptions);
        addEventListeners(inputCallback: () => void, keyDownCallback: () => void, keyUpCallback: () => void): void;
        removeEventListeners(): void;
        destroy(): void;
        private setMax(max, min?);
        value: string;
        focus(): void;
        blur(): void;
        hasSelection: boolean;
        caretStart: number;
        caretEnd: number;
        caretPosition: number;
    }
}
declare module Fabrique {
    interface InputOptions {
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
    class InputField extends Phaser.Sprite {
        private placeHolder;
        private box;
        private textMask;
        private focus;
        private cursor;
        private text;
        private offscreenText;
        private inputOptions;
        private domElement;
        private selection;
        private lines;
        private windowScale;
        private scrollPos;
        private cursorPos;
        private cachedValue;
        value: string;
        displayText: string;
        constructor(game: Phaser.Game, x: number, y: number, inputOptions?: InputOptions);
        /**
         * This is a generic input down handler for the game.
         * if the input object is clicked, we gain focus on it and create the dom element
         *
         * If there was focus on the element previously, but clicked outside of it, the element will loose focus
         * and no keyboard events will be registered anymore
         *
         * @param e Phaser.Pointer
         */
        private checkDown(e);
        update(): void;
        private blink;
        private cnt;
        /**
         * Update function makes the cursor blink, it uses two private properties to make it toggle
         *
         * @returns {number}
         */
        private updateCursorBlink();
        /**
         * Focus is lost on the input element, we disable the cursor and remove the hidden input element
         */
        endFocus(): void;
        /**
         *
         */
        startFocus(e: Phaser.Pointer): void;
        private finishFocus(e);
        /**
         * Update the text value in the box
         */
        private updateTextFromElement();
        /**
         * Updates the position of the caret in the phaser input field
         */
        private updateCursorFromElement();
        /**
         * Fetches the carrot position from the dom element. This one changes when you use the keyboard to navigate the element
         *
         * @returns {number}
         */
        private getCaretPosition();
        private updateFromDomElement();
        private getCursorIndex(globalPoint);
        /**
         * This checks if a select has been made, and if so highlight it with blue
         * TODO: Handle multiline selection
         * TODO: Handle mouse selection
         */
        private updateSelection();
        private zoomIn();
        private zoomOut();
        /**
         * Event fired when a key is pressed, it takes the value from the hidden input field and adds it as its own
         */
        private inputListener(evt);
        private keyDownListener(evt);
        private keyUpListener(evt);
        /**
         * We overwrite the destroy method because we want to delete the (hidden) dom element when the inputField was removed
         */
        destroy(): void;
        /**
         * Resets the text to an empty value
         */
        resetText(): void;
        private scrollTo(cursorPos);
        private updateTextPos();
        private updateCursorPos();
    }
}
declare module Fabrique {
    class InputBox extends Phaser.Graphics {
        constructor(game: Phaser.Game, inputOptions: InputOptions);
    }
}
declare module Fabrique {
    class SelectionHighlight extends Phaser.Graphics {
        private inputOptions;
        private text;
        private cursor;
        constructor(game: Phaser.Game, inputOptions: InputOptions, text: Phaser.Text, cursor: Phaser.Text);
        updateSelection(start: number, end: number, lines: string[]): void;
        static rgb2hex(color: {
            r: number;
            g: number;
            b: number;
            a: number;
        }): number;
    }
}
declare module Fabrique {
    class TextMask extends Phaser.Graphics {
        constructor(game: Phaser.Game, inputOptions: InputOptions);
    }
}
declare module Fabrique {
    module Plugins {
        interface InputFieldObjectFactory extends Phaser.GameObjectFactory {
            inputField: (x: number, y: number, inputOptions?: Fabrique.InputOptions, group?: Phaser.Group) => Fabrique.InputField;
        }
        interface InputFieldObjectCreator extends Phaser.GameObjectCreator {
            inputField: (x: number, y: number, inputOptions?: Fabrique.InputOptions) => Fabrique.InputField;
        }
        interface InputFieldGame extends Phaser.Game {
            add: InputFieldObjectFactory;
            make: InputFieldObjectCreator;
        }
        class InputField extends Phaser.Plugin {
            static Zoomed: boolean;
            static KeyboardOpen: boolean;
            static onKeyboardOpen: Phaser.Signal;
            static onKeyboardClose: Phaser.Signal;
            constructor(game: Phaser.Game, parent: Phaser.PluginManager);
            /**
             * Extends the GameObjectFactory prototype with the support of adding InputField. this allows us to add InputField methods to the game just like any other object:
             * game.add.InputField();
             */
            private addInputFieldFactory();
        }
    }
}
