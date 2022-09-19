import { LightningElement, api, wire } from 'lwc';
import { getRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const FIELDSVAL = [
    'Measure__c.Name',
    'Measure__c.Comments__c',
    'Measure__c.Obstacles__c',
    'Measure__c.LastModifiedDate',
    'Measure__c.Is_Assigned_Measure__c',

    'Measure__c.Q1_Priority__c',
    'Measure__c.Q2_Priority__c',
    'Measure__c.Q3_Priority__c',
    'Measure__c.Q4_Priority__c',

    'Measure__c.Q1_Progress__c',
    'Measure__c.Q2_Progress__c',
    'Measure__c.Q3_Progress__c',
    'Measure__c.Q4_Progress__c',

    'Measure__c.Q1_Target__c',
    'Measure__c.Q2_Target__c',
    'Measure__c.Q3_Target__c',
    'Measure__c.Q4_Target__c',

    'Measure__c.Q1_Status__c',
    'Measure__c.Q2_Status__c',
    'Measure__c.Q3_Status__c',
    'Measure__c.Q4_Status__c',

    'Measure__c.Q1_Value__c',
    'Measure__c.Q2_Value__c',
    'Measure__c.Q3_Value__c',
    'Measure__c.Q4_Value__c',


    'Measure__c.CreatedDate',
    'Measure__c.Q1__c',
    'Measure__c.Q2__c',
    'Measure__c.Q3__c',
    'Measure__c.Q4__c',

    'Measure__c.Q1_Type__c',
    'Measure__c.Q2_Type__c',
    'Measure__c.Q3_Type__c',
    'Measure__c.Q4_Type__c',


];

export default class MeasureCard extends LightningElement {
    @api measureId;
    @api methodId;
    @api manData;
    @api canUserEdit;

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

    @wire(getRecord, { recordId: '$measureId', fields: FIELDSVAL })
    measure;

    renderedCallback() {
        if (this.__initial === true) {
            let boxdiv = this.template.querySelector("[data-id='box']");
            let divWidth = boxdiv.getBoundingClientRect().width;
            this.boxStyle = "height:" + divWidth + "px;";
            this.measureName = "font-size:" + String(Number(divWidth / 17)) + "px;";
            this.measureDate = "font-size:" + String(Number(divWidth / 22)) + "px;";
            this.__initial = false;
        }
    }

    get name() {
        return this.measure.data.fields.Name.value;
    }

    get measureheader() {

        return 'Edit ' + this.measure.data.fields.Name.value;
    }
    get deleteMeasureheader() {

        return 'Delete ' + this.measure.data.fields.Name.value;
    }

    get comment() {
        return this.measure.data.fields.Comments__c.value;
    }

    get obstacles() {
        return this.measure.data.fields.Obstacles__c.value;
    }

    get lastmodifiedby() {
        return this.measure.data.fields.LastModifiedDate.value;
    }

    get quarterProgress() {
        console.log('this.quarter' + this.quarter);
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Progress__c'].value == null)
            return 1;
        return this.measure.data.fields['' + this.quarter + '_Progress__c'].value;
    }
    get targetValue() {
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Target__c'].value == null)
            return 0;
        return this.measure.data.fields['' + this.quarter + '_Target__c'].value;
    }

    get currentvalue() {
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Value__c'].value == null)
            return 0;
        return this.measure.data.fields['' + this.quarter + '_Value__c'].value;
    }

    get priority() {
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Priority__c'].value == null)
            return null;
        return this.measure.data.fields['' + this.quarter + '_Priority__c'].value;
    }

    get progressStatus() {
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Status__c'].value == null)
            return null;
        return this.measure.data.fields['' + this.quarter + '_Status__c'].value;
    }

    get progressBy() {
        if (this.quarter == null || this.measure.data.fields['' + this.quarter + '_Type__c'].value == null)
            return null;
        return this.measure.data.fields['' + this.quarter + '_Type__c'].value == 'Completion' ? true : false;
        //return this.measure.data.fields.Type__c.value == 'Completion' ? true : false;
    }

    get isAssignedMeasure() {
        if (this.measure.data) {
            return this.measure.data.fields.Is_Assigned_Measure__c.value;
        }
        return false;
    }


    get createdDate() {
        return this.measure.data.fields.CreatedDate.value;
    }


    handleMenuSelect(event) {
        let selectedItemValue = event.detail.value;
        if (selectedItemValue === 'edit') {
            this.handleEdit();
        } else if (selectedItemValue === 'comment') {
            this.handleChat();
        } else if (selectedItemValue === 'Assign Measure') {
            this.assignMeasure();
        } else if (selectedItemValue === 'Applicable Quarters') {
            this.handleApplicableQuarters();
        } else {
            this.handleDelete();
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

    handleDelete() {
        this.showDelete = true;
        this.deletePopupBody = "<div style='font-size:18px;text-align:center;'>Are you sure you want to delete <b>" + this.name + "</b>?</div><div style='margin-top:10px;font-size:14px;'>Note: This will delete the Measure from <b>all the Quarters</b>. If you need to delete the Measure for a particular Quarter,use <b>Edit</b> to uncheck the <b>Quarter</b>.</div>";
    }

    handleApplicableQuarters() {
        this.showApplicableQuarters = true;
    }

    closeApplicableQuarters() {
        this.showApplicableQuarters = false;
    }
    assignMeasurestoQuarters() {
        console.log('assignMeasurestoQuarters');
        this.showApplicableQuarters = false;
    }

    closeDelete() {
        this.showDelete = false;
    }

    assignMeasure() {
        var arr = [];

        var x = this.manData;
        x.forEach(function (element) {
            let objvar = { label: element['Name'], value: element['Id'] };
            arr.push(objvar);
        });
        this.options = arr;
    }
    handleChange(event) {
        this.value = event.detail.value;
    }
    handleAssign() {

    }

    deleteMeasure() {
        deleteRecord(this.measureId)
            .then(() => {
                const selectedEvent = new CustomEvent("refreshmeasures", {
                    detail: 'refreshmeasures'
                });
                this.dispatchEvent(selectedEvent);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Measure Deleted Successfully!!',
                        variant: 'success'
                    })
                );
                this.closeDelete();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Deleting Measure!!',
                        variant: 'error'
                    })
                );
                console.log('Error Deleting measure->' + error.body.message);
            });

    }
}