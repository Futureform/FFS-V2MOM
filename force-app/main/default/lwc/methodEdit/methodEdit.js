import { LightningElement, api, wire,track } from 'lwc';
import { getRecord, updateRecord, createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MethodObject from '@salesforce/schema/Method__c';



const FIELDSVAL = [
    'Method__c.Name',
    'Method__c.Description__c',
    'Method__c.V2MOM__c',
    'Method__c.Q1__c',
    'Method__c.Q2__c',
    'Method__c.Q3__c',
    'Method__c.Q4__c',
];
export default class MethodEdit extends LightningElement {
    @api methodId;
    @api addmethod = false;
    @api methodheader;
    @api v2momid;
    @api methodOrder;
    @api applicablequarter;

    data;
    error;
    name;
    description;
    method;
    Q1 =false;
    Q2=false;
    Q3=false;
    Q4=false;

    disabledSave = true;

    @wire(getRecord, { recordId: '$methodId', fields: FIELDSVAL })
    methodRec(methodData) {
        let data = methodData.data;
        let error = methodData.error;
        if (data) {
            this.method = data;
            this.setInitialValues();
        } else if (error) {
            console.log(error);
        }
    };

    maxLength = 1000;

    connectedCallback() {
        console.log('connectedCallback ---> Method edit'+this.v2momid + this.methodId +'::'+this.addmethod);
        this.setInitialQuarterValues();
    }

    setInitialValues(){
        this.name = this.method.fields.Name.value;
        this.description = this.method.fields.Description__c.value;
        this.Q1 = this.method.fields.Q1__c.value;
        this.Q2 = this.method.fields.Q2__c.value;
        this.Q3 = this.method.fields.Q3__c.value;
        this.Q4 = this.method.fields.Q4__c.value;
        this.validateInputs(this.name,this.description,this.Q1,this.Q2,this.Q3,this.Q4);
    }

    setInitialQuarterValues(){
        console.log('setInitialQuarterValues'+this.applicablequarter);
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

    handleNameChange(event){
        this.name = event.detail.value;
        this.setLength('name',this.name);
        this.validateText();
    }

    handleDescriptionChange(event){
        this.description = event.detail.value;
        this.setLength('description',this.description);
        this.validateText();
    }

    setLength(datafield,value){
        let fieldLengthElement = this.template.querySelector("[data-field='"+datafield+"size']");
        fieldLengthElement.inputText=value;
    }


    validateText() {
        var nameLength = 0;
        var descLength = 0;
        var quarterSelected = false;
        console.log('validateText');
       
        if(this.template.querySelector("[data-field='name']").value != null && this.template.querySelector("[data-field='name']").value != undefined){
            nameLength = this.template.querySelector("[data-field='name']").value.length;
        }
        if(this.template.querySelector("[data-field='description']").value != null && this.template.querySelector("[data-field='description']").value != undefined){
            descLength = this.template.querySelector("[data-field='description']").value.length;
        }
        if(this.template.querySelector("[data-field='Q1']").checked || this.template.querySelector("[data-field='Q2']").checked || 
         this.template.querySelector("[data-field='Q3']").checked || this.template.querySelector("[data-field='Q4']").checked){
            quarterSelected = true;
        }else{
            quarterSelected = false;
        }
        (nameLength > 4 && quarterSelected && descLength > 4) ? this.disabledSave = false : this.disabledSave = true;
 }

 validateInputs(name,description,Q1,Q2,Q3,Q4){
    var nameLength = 0;
    var descLength = 0;
    var quarterSelected = false;

    nameLength = name.length;
    descLength = description.length;

    if(Q1 || Q2 || Q3 || Q4){
            quarterSelected = true;
    }else{
        quarterSelected = false;
    }


    (nameLength > 4 && (descLength > 4 && descLength <= this.maxLength) && quarterSelected) ? this.disabledSave = false : this.disabledSave = true;
 }

    /*get name() {
        if (this.methodRec.data) {
            return this.methodRec.data.fields.Name.value;
        } else {
            return '';
        }
    }
    get description() {
        if (this.methodRec.data) {
            return this.methodRec.data.fields.Description__c.value;
        } else {
            return '';
        }
    }*/
    updateOrcreateMethod() {
        const fields = {};
        fields['Name'] = this.template.querySelector("[data-field='name']").value;
        fields['Description__c'] = this.template.querySelector("[data-field='description']").value;
        fields['Q1__c'] = this.template.querySelector("[data-field='Q1']").checked;
        fields['Q2__c'] = this.template.querySelector("[data-field='Q2']").checked;
        fields['Q3__c'] = this.template.querySelector("[data-field='Q3']").checked;
        fields['Q4__c'] = this.template.querySelector("[data-field='Q4']").checked;
        console.log('v2momId'+this.v2momid);
        fields['V2MOM__c'] = this.v2momid;
        if (this.addmethod == true) {
            this.createMethod(fields);
        }
        else {
            fields['Id'] = this.methodId;
            this.updateMethod(fields);
        }
    }

    updateMethod(fields) {
        console.log('updateMethod');
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(data => {
                this.closeModal();
                this.showSuccessToastMessage('Success', 'Method updated successfully!!');
                this.refreshContainer();
            })
            .catch(error => {
                this.closeModal();
                this.showErrorToastMessage('Error', 'Error updating record!!');

            });
    }
    
    
    createMethod(fields) {
        fields['V2MOM__c'] = this.v2momid;
        fields['Order__c'] = this.methodOrder;
        const recordInput = { apiName: MethodObject.objectApiName, fields };

        createRecord(recordInput)
            .then(data => {
                this.closeModal();
                this.showSuccessToastMessage('Success', 'Method created successfully!!');
                this.refreshContainer();
            })
            .catch(error => {
                this.closeModal();
                this.showErrorToastMessage('Error', 'Error creating record!!');

            });
            

    }

    refreshMethod() {
        this.template.querySelector("[data-field='name']").value = this.method.fields.Name.value;
        this.template.querySelector("[data-field='description']").value = this.method.fields.Description__c.value;
        this.template.querySelector("[data-field='Q1']").value = this.method.fields.Q1__c.checked;
        this.template.querySelector("[data-field='Q2']").value = this.method.fields.Q2__c.checked;
        this.template.querySelector("[data-field='Q3']").value = this.method.fields.Q3__c.checked;
        this.template.querySelector("[data-field='Q4']").value = this.method.fields.Q4__c.checked;
    }

    closeModal() {
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'close'
        });
        this.dispatchEvent(selectedEvent);
    }

    refreshContainer() {
        const selectedEvent = new CustomEvent("refreshmethods", {
            detail: 'refreshmethods',
            bubbles: true,
            composed: true
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