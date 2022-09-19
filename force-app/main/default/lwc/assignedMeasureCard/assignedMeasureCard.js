import { LightningElement, api, wire } from 'lwc';
import { getRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const FIELDSVAL = [
    'Measure__c.Name',
    'Measure__c.Comments__c',
    'Measure__c.Obstacles__c',
    'Measure__c.LastModifiedDate',
    'Measure__c.Q1_Priority__c',
    'Measure__c.Q2_Priority__c',
    'Measure__c.Q3_Priority__c',
    'Measure__c.Q4_Priority__c',
    'Measure__c.CreatedDate',
];

const FIELDSVAL2 = [
    'Measure_Team_Member__c.Measure__c',
    'Measure_Team_Member__c.Q1_Target__c',
    'Measure_Team_Member__c.Q1_Value__c',
    'Measure_Team_Member__c.Q2_Target__c',
    'Measure_Team_Member__c.Q2_Value__c',
    'Measure_Team_Member__c.Q3_Target__c',
    'Measure_Team_Member__c.Q3_Value__c',
    'Measure_Team_Member__c.Q4_Target__c',
    'Measure_Team_Member__c.Q4_Value__c',
    'Measure_Team_Member__c.Q1_Progress__c',
    'Measure_Team_Member__c.Q2_Progress__c',
    'Measure_Team_Member__c.Q3_Progress__c',
    'Measure_Team_Member__c.Q4_Progress__c',
    'Measure_Team_Member__c.LastModifiedDate',
    'Measure_Team_Member__c.CreatedDate',
];

export default class AssignedMeasureCard extends LightningElement {
    @api measureTeamMemberId;
    @api quarter;
    @api isreadonlyUser;

    boxStyle = "";
    measureName = "";
    measureDate = "";
    isProgressStatus = false;
    showEdit = false;
    showChat = false;
    showDelete = false;
    showApplicableQuarters = false;
    deletePopupBody = "";
    options;
    value = '';
    __initial = true;

    @wire(getRecord, { recordId: '$measureTeamMemberId', fields: FIELDSVAL2 })
    measureTeamMember;

    @wire(getRecord, { recordId: '$measureTeamMember.data.fields.Measure__c.value', fields: FIELDSVAL })
    measure;

    renderedCallback() {

        if (this.__initial) {
            let boxdiv = this.template.querySelector("[data-id='box']");
            let divWidth = boxdiv.getBoundingClientRect().width;
            this.boxStyle = "height:" + divWidth + "px;";
            this.measureName = "font-size:" + String(Number(divWidth / 17)) + "px;";
            this.measureDate = "font-size:" + String(Number(divWidth / 22)) + "px;";
            this.__initial = false;
            //this.checkFlipClass();
        }
    }

    get name() {
        return this.measure.data.fields.Name.value;
    }

    get measureheader() {

        return 'Edit ' + this.measure.data.fields.Name.value;
    }

    get comment() {
        return this.measure.data.fields.Comments__c.value;
    }

    get obstacles() {
        return this.measure.data.fields.Obstacles__c.value;
    }

    get lastmodifiedby() {
        return this.measureTeamMember.data.fields.LastModifiedDate.value;
    }

    get quarterProgress() {
        console.log('this.quarter' + this.quarter);
        if (this.quarter == null || this.measureTeamMember.data.fields['' + this.quarter + '_Progress__c'].value == null)
            return 0;
        return this.measureTeamMember.data.fields['' + this.quarter + '_Progress__c'].value;
    }
    get targetValue() {
        if (this.quarter == null || this.measureTeamMember.data.fields['' + this.quarter + '_Target__c'].value == null)
            return 0;
        return this.measureTeamMember.data.fields['' + this.quarter + '_Target__c'].value;
    }

    get currentvalue() {
        if (this.quarter == null || this.measureTeamMember.data.fields['' + this.quarter + '_Value__c'].value == null)
            return 0;
        return this.measureTeamMember.data.fields['' + this.quarter + '_Value__c'].value;
    }

    get priority() {
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Priority__c'].value == null)
            return null;
        return this.measure.data.fields['' + this.quarter + '_Priority__c'].value;
    }

    get createdDate() {
        return this.measureTeamMember.data.fields.CreatedDate.value;
    }

    checkFlipClass() {
        let divblock = this.template.querySelector('[data-id="flip"]');
        if (!divblock.className) {
            setTimeout(() => this.template.querySelector('[data-id="flip"]').className = 'flip-card', 2000);
        }
    }

    handleMenuSelect(event) {
        let selectedItemValue = event.detail.value;
        if (selectedItemValue === 'edit') {
            this.handleEdit();
        } else if (selectedItemValue === 'comment') {
            this.handleChat();
        }
    }

    handleEdit() {
        this.showEdit = true;
    }

    closeEditModal(event) {
        this.showEdit = false;
        const selectedEvent = new CustomEvent("refreshmeasures", {
            detail: 'refreshmeasures'
        });
        this.dispatchEvent(selectedEvent);
    }

    handleChat() {
        this.showChat = true;
    }

    closeChatDocker() {
        this.showChat = false;
    }
}