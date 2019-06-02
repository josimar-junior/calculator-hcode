class CalculatorController {

    constructor() {

        this._operation = [];
        this._locale = 'pt-BR';

        this._lastOperator = '';
        this._lastNumber = '';

        this._audioOn = false;
        this._audio = new Audio('click.mp3');

        this._display = document.querySelector('#display');
        this._date = document.querySelector('#data');
        this._time = document.querySelector('#hora');

        this.init();

        this.initButtonsEvents();

        this.initKeyboard();
        this.pasteFromClipboard();
    }

    init() {
        this.setDisplayDateTime();
        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);
        this.setLastNumberToDisplay();

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', event => {
                this.toggleAudio();
            });
        });
    }

    toggleAudio() {
        this._audioOn = !this._audioOn;
    }

    playAudio() {
        if(this._audioOn) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    initKeyboard() {
        document.addEventListener('keyup', event => {

            this.playAudio();
            
            switch(event.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(event.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(event.key));
                    break;
                case 'c':
                    if(event.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }

    copyToClipboard() {
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
    }

    pasteFromClipboard() {
        document.addEventListener('paste', event => {
            let text = event.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text);
        });
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');

        buttons.forEach(btn => {
            this.addEventListenerAll(btn, 'click drag', event => {
                let textBtn = btn.className.baseVal.replace('btn-', '');

                this.executeBtn(textBtn);
            });
            
            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', event => {
                btn.style.cursor = 'pointer';
            });
        });
    }

    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    executeBtn(value) {

        this.playAudio();

        switch(value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default: 
                this.setError();
                break;
        }
    }

    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    addOperation(value) {
        if(isNaN(this.getLastOperation())) {

            if(this.isOperator(value)) {
                this.setLastOperation(value);
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        } else {
            if(this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();
            }
            
        }
    }

    setError() {
        this.displayCalc = 'Error';
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1];
    }

    isOperator(value) {
        return ['+', '-', '*', '%', '/'].indexOf(value) > -1;
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    pushOperation(value) {
        this._operation.push(value);

        if(this._operation.length > 3) {
            this.calc();
        }
    }

    calc() {
        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3) {
            last = this._operation.pop();

            this._lastNumber = this.getResult();
        } else if(this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        if(last == '%') {
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];
            if(last) {
                this._operation.push(last);
            }
        }

        this.setLastNumberToDisplay();
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if(!lastNumber)
            lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    getLastItem(isOperator = true) {
        let lastItem;
        for(let i = this._operation.length - 1; i >= 0; i--) {
            if(this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        if(!lastItem) {
            lastItem = isOperator ? this._lastOperator : this.lastNumber;
        }

        return lastItem;
    }

    addDot() {
        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1)
            return;

        if(this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }

    getResult() {
        try {
            return eval(this._operation.join(''));
        } catch(error) {
            setTimeout(() => {
                this.setError();
            }, 1);
        }
    }

    get displayTime() {
        return this._time.innerHTML;
    }

    set displayTime(value) {
        this._time.innerHTML = value;
    }

    get displayDate() {
        return this._date.innerHTML;
    }

    set displayDate(value) {
        return this._date.innerHTML = value;
    }

    get displayCalc() {
        return this._display.innerHTML;
    }

    set displayCalc(value) {
        if(value.toString().length > 10) {
            this.setError();
            return;
        }
        return this._display.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

}