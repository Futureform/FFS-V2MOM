import { LightningElement, api } from 'lwc';

export default class AssignedMeasuresMethodCard extends LightningElement {
    @api quarterProgress = 10;
    @api teamMemberList = [];
    boxStyle;
    methodName;
    methodDate;
    __initial = true;

    get measuresLength() {
        console.log('teamMemberList');
        console.log(this.teamMemberList);
        return this.teamMemberList.length;
    }


    renderedCallback() {
        if (this.__initial) {
            let boxdiv = this.template.querySelector("[data-id='box']");
            let divWidth = boxdiv.getBoundingClientRect().width;
            this.boxStyle = "height:" + divWidth + "px;";
            this.methodName = "font-size:" + String(Number(divWidth / 17)) + "px;";
            this.methodDate = "font-size:" + String(Number(divWidth / 22)) + "px;";
            this.__initial = false;
        }
    }

    showAssignedMeasures() {
        const selectEvent = new CustomEvent('navigatetomeasures', {
            detail: { methodId: '', name: 'Assigned Measure', measureList: this.teamMemberList },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectEvent);
    }
}