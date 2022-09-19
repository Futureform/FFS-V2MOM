import { LightningElement,api,wire  } from 'lwc';
import MeasureObject from '@salesforce/schema/Measure__c';
import { getRecord, getFieldValue, updateRecord, createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const MethodFIELDSVAL = [
    'Method__c.Q1__c',
    'Method__c.Q2__c',
    'Method__c.Q3__c',
    'Method__c.Q4__c',
];
const FIELDSVAL = [
    'Measure__c.Q1__c',
    'Measure__c.Q2__c',
    'Measure__c.Q3__c',
    'Measure__c.Q4__c',
];


export default class ModifyApplicableQuarters extends LightningElement {
    @api popupHeader;
    @api measureData;
    @api methodId;
    @api measureId;
    @api currentQuarter;

    quarter1 = false;
    quarter2 = false;
    quarter3 = false;
    quarter4 = false;

    Q1= false;
    Q2= false;
    Q3= false;
    Q4= false;

    disableQ1= false;
    disableQ2= false;;
    disableQ3= false;;
    disableQ4= false;;

    @wire(getRecord, { recordId: '$methodId', fields: MethodFIELDSVAL })
    methodData({ error, data }) {
        if (data) {
            console.log('modifyApplicableQuarter');
            console.log('methodQ1'+data.fields.Q1__c.value);
            this.quarter1 = data.fields.Q1__c.value;
            this.quarter2 = data.fields.Q2__c.value;
            this.quarter3 = data.fields.Q3__c.value;
            this.quarter4 = data.fields.Q4__c.value;
        } else if (error) {
            console.log(error);
        }
    };
    connectedCallback(){
       this.setInitialValues();
    }

    setInitialValues(){
        console.log('setInitialValues Start');
        this['disable'+this.currentQuarter] = true;
        this.Q1 = this.measureData.data.fields.Q1__c.value;
        this.Q2 = this.measureData.data.fields.Q2__c.value;
        this.Q3 = this.measureData.data.fields.Q3__c.value;
        this.Q4 = this.measureData.data.fields.Q4__c.value;
        console.log('setInitialValues End');
    }

    onQuarterCheck(event){
        var quarter = event.target.dataset.field;
        this[quarter]= event.target.checked;
    }

    closeModal(){
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'closemodal'
        });
        this.dispatchEvent(selectedEvent);
    }
    saveData(){
        const fields = {};
        fields['Q1__c'] = this.Q1;
        fields['Q2__c'] = this.Q2;
        fields['Q3__c'] = this.Q3;
        fields['Q4__c'] = this.Q4;
        fields['Id']=this.measureId;
        this.updateMeasure(fields);
        
    }

    updateMeasure(fields) {
        console.log('updateMeasure');
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(data => {
            this.showSuccessToastMessage('Success', 'Measure Cloned Successfully!!');
           this.closeModal();
           
        })
        .catch(error => {
           this.closeModal();
            this.showErrorToastMessage('Error', 'Error updating record!!');
        });
    }

    showSuccessToastMessage(title, message) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'success'
        });
        this.dispatchEvent(evt);
    }

    showErrorToastMessage(title, message) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'error'
        });
        this.dispatchEvent(evt);
    }

}