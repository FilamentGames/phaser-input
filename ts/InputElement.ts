module Fabrique {

    export enum InputType {
        text,
        password,
        number
    }

    export class InputElement {
        private element: HTMLTextAreaElement | HTMLInputElement;

        private inputCallback: () => void;

        private keyDownCallback: () => void;

        private keyUpCallback: () => void;

        private type: InputType;

        private id: string;

        private game: Phaser.Game;

        public focusIn: Phaser.Signal = new Phaser.Signal();

        public focusOut: Phaser.Signal = new Phaser.Signal();

        constructor(game: Phaser.Game, id: string, type: InputType = InputType.text, value: string = '', multiline:boolean = false) {
            this.id = id;
            this.type = type;
            this.game = game;

            if (multiline) {
                this.element = document.createElement('textarea');
                this.element.type = InputType[type];
            } else {
                this.element = document.createElement('input');
            }

            this.element.id = id;
            this.element.style.position = 'absolute';
            this.element.style.top = (-100).toString() + 'px';
            this.element.style.left = (-100).toString() + 'px';
            this.element.value = this.value;


            this.element.addEventListener('focusin', (): void => {
                this.focusIn.dispatch();
            });
            this.element.addEventListener('focusout', (): void => {
                this.focusOut.dispatch();
            });

            document.body.appendChild(this.element);
        }

        public addEventListeners(inputCallback: () => void, keyDownCallback: () => void, keyUpCallback: () => void): void {
            this.inputCallback = inputCallback;
            this.keyDownCallback = keyDownCallback;
            this.keyUpCallback = keyUpCallback;
            this.element.addEventListener('input', this.inputCallback);
            this.element.addEventListener('keydown', this.keyDownCallback);
            this.element.addEventListener('keyup', this.keyUpCallback);
        }

        public removeEventListeners(): void {
            this.element.removeEventListener('input', this.inputCallback);
            this.element.removeEventListener('keydown', this.keyDownCallback);
            this.element.removeEventListener('keyup', this.keyUpCallback);
        }

        public destroy() {
            document.body.removeChild(this.element);
        }

        public setMax(max: string, min?: string) {
            if (max === undefined) {
                return;
            }

            if (this.type === InputType.text || this.type === InputType.password) {
                this.element.maxLength = parseInt(max, 10);
            } else if (this.type === InputType.number && this.element instanceof HTMLInputElement) {
                (<HTMLInputElement>this.element).max = max;
                if (min === undefined) {
                    return;
                }

                (<HTMLInputElement>this.element).min = min;
            }
        }

        get value(): string {
            return this.element.value;
        }

        set value(value: string) {
            this.element.value = value;
        }

        public focus(): void {
            this.element.focus();
            if (!this.game.device.desktop && this.game.device.chrome) {
                let originalWidth = window.innerWidth,
                    originalHeight = window.innerHeight;

                let kbAppeared: boolean = false;
                let interval: number = setInterval((): void => {
                    if (originalWidth > window.innerWidth || originalHeight > window.innerHeight) {
                        kbAppeared = true;
                    }

                    if (kbAppeared && originalWidth === window.innerWidth && originalHeight === window.innerHeight) {
                        this.focusOut.dispatch();
                        clearInterval(interval);
                    }
                }, 50);
            }
        }

        public blur(): void {
            this.element.blur();
        }

        get hasSelection () {
            if (this.type === InputType.number) {
                return false;
            }

            return this.element.selectionStart !== this.element.selectionEnd;
        }

        get caretStart() {
            return this.element.selectionEnd;
        }

        get caretEnd() {
            return this.element.selectionStart;
        }

        public getCaretPosition() {
            if (this.type === InputType.number) {
                return -1;
            }
            return this.element.selectionStart;
        }

        public setCaretPosition(pos: number) {
            if (this.type === InputType.number) {
                return ;
            }
            this.element.setSelectionRange(pos, pos);
        }
    }
}