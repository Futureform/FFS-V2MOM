import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


//Fields to be fetched from Measure
const FIELDSVAL = [
    'Measure__c.Name',
    'Measure__c.Comments__c',
    'Measure__c.Obstacles__c',
    'Measure__c.LastModifiedDate',
    'Measure__c.Q1_Priority__c',
    'Measure__c.Q2_Priority__c',
    'Measure__c.Q3_Priority__c',
    'Measure__c.Q4_Priority__c',
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


export default class AssignedMeasureEdit extends LightningElement {

    @api measureTeamMemberId;
    @api applicablequarter;
    measure;
    measureData;

    name;
    comment;
    obstacles;
    currentValue = 0;
    targetValue = 0;

    Q1 = false;
    Q2 = false;
    Q3 = false;
    Q4 = false;
    
    disableSave = true;
    highPriority;
    mediumPriority;
    lowPriority=true;
    priority='Low';

    connectedCallback(){
        this.setInitialQuarterValues();
    }
    renderedCallback(){
        this.validateData();
    }

    @wire(getRecord, { recordId: '$measureTeamMemberId', fields: FIELDSVAL2 })
    measureTeamMember;

    @wire(getRecord, { recordId: '$measureTeamMember.data.fields.Measure__c.value', fields: FIELDSVAL })
    measureRecord(measureData) {
        let data = measureData.data;
        let error = measureData.error;
        if (data) {
            this.measure = data;
            this.setInitialValues();
            
        } else if (error) {
            console.log(error);
            this.error=error;
        }
    };

    setInitialValues(){
        this.name = this.measure.fields.Name.value;
        this.comment = this.measure.fields.Comments__c.value;
        this.currentValue = this.measureTeamMember.data.fields[''+this.applicablequarter+'_Value__c'] != null ? this.measureTeamMember.data.fields[''+this.applicablequarter+'_Value__c'].value : null;
        this.targetValue = this.measureTeamMember.data.fields[''+this.applicablequarter+'_Target__c'] != null ? this.measureTeamMember.data.fields[''+this.applicablequarter+'_Target__c'].value : null;
        console.log('currentValue'+this.currentValue + ''+ this.targetValue);
        this.obstacles = this.measure.fields.Obstacles__c.value;
        this.priority = this.measure.fields[''+this.applicablequarter+'_Priority__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Priority__c'].value : null;
        this.setPriority(this.priority);
        this.setInitialQuarterValues();
        this.validateData();
    }
    setInitialQuarterValues(){
        if(this.applicablequarter == 'Q1'){
            this.Q1 = true;
        }else if(this.applicablequarter == 'Q2'){
            this.Q2 = true;
        }else if(this.applicablequarter == 'Q3'){
            this.Q3 = true;
        }else if(this.applicablequarter == 'Q4'){
            this.Q4 = true;
        }
    }

    setPriority(priority){
        if(priority != null){
            if(priority == 'High'){
                this.priority = 'High';
                this.highPriority = true;
                this.mediumPriority = false;
                this.lowPriority = false;
            } else if(priority == 'Medium'){
                this.priority = 'Medium';
                this.highPriority = false;
                this.mediumPriority = true;
                this.lowPriority = false;
            } else if(priority == 'Low'){
                this.priority = 'Low';
                this.highPriority = false;
                this.mediumPriority = false;
                this.lowPriority = true;
            }
        }
    }

    checkFieldValue(datafield){
        var fieldValue;
        let queryElement = this.template.querySelector("[data-field='"+datafield+"']");
        if(queryElement != null){
            if(queryElement.value != null){
                fieldValue = queryElement.value;
            }else{
                fieldValue = null;
            }
        }
        else{
            fieldValue = null;
        }
        return fieldValue;
    }

    validateData(){
        if(!this.checkFieldValue('currentvalue')) {
            this.disableSave = true;
        } else {
            this.disableSave = false;
        }
    }
    
    updateMeasureTeamMember() {
        const fields = {};
        fields[''+this.applicablequarter+'_Value__c'] = this.setUpdateFieldValues('currentvalue');
        console.log('targetvalue'+this.setUpdateFieldValues('currentvalue'));
        fields['Id'] = this.measureTeamMemberId;
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(data => {
            this.closeModal();
            this.showSuccessToastMessage('Success', 'Measure updated successfully!!');
        })
        .catch(error => {
            this.closeModal();
            this.showErrorToastMessage('Error', 'Error updating record!!');
        });
    }    

    setUpdateFieldValues(datafield){
        var fieldValue;
        let queryElement = this.template.querySelector("[data-field='"+datafield+"']");
        
        if(queryElement != null){
            if(queryElement.value != null){
                fieldValue = queryElement.value;
            }else{
                fieldValue = null;
            }
        }
        else{
            fieldValue = null;
        }
        return fieldValue;
    }
    
    refreshMethod() {
        console.log('refreshMethod');
        this.setInitialValues();
        this.template.querySelector("[data-field='targetvalue']").value = this.measure.fields[''+this.applicablequarter+'_Target__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Target__c'].value : null;
        this.template.querySelector("[data-field='currentvalue']").value = this.measure.fields[''+this.applicablequarter+'_Value__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Value__c'].value : null;
    }

    refreshContainer() {
        const selectedEvent = new CustomEvent("refreshmeasures", {
            detail: 'refreshmeasures',
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
    
    closeModal() {
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'close'
        });
        this.dispatchEvent(selectedEvent);
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