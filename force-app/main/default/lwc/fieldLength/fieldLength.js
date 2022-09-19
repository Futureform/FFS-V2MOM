import { LightningElement,api } from 'lwc';

export default class FieldLength extends LightningElement {
    @api inputText='';
    @api maximumLength;

    get inputTextLength(){
        if(this.inputText){
            return this.inputText.length;
        }
        return 0;
    }
}