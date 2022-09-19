import { LightningElement, api, wire } from 'lwc';
import { getRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import measureData from '@salesforce/apex/V2MOM_RootComponentController.getMeasuresData';


const FIELDSVAL = [
    'Method__c.Name',
    'Method__c.Description__c',
    'Method__c.LastModifiedDate',
    'Method__c.Q1_Progress__c',
    'Method__c.Q2_Progress__c',
    'Method__c.Q3_Progress__c',
    'Method__c.Q4_Progress__c',
];
export default class MethodCard extends LightningElement {
    @api methodId;
    @api quarter;
    @api canUserEdit;
    @api applicableQuarter;

    headerName;

    boxStyle = "";
    methodName = "";
    methodDate = "";

    showEdit = false;
    showDelete = false;

    deletePopupBody = "";
    overlayIcon = "utility:up";
    measureData;
    measuresLength;
    error;

    __initial = true;


    @wire(getRecord, { recordId: '$methodId', fields: FIELDSVAL })
    method;


    renderedCallback() {
        if (this.__initial === true) {
            let boxdiv = this.template.querySelector("[data-id='box']");
            let divWidth = boxdiv.getBoundingClientRect().width;

            this.methodName = "font-size:" + String(Number(divWidth / 17)) + "px;";
            this.methodDate = "font-size:" + String(Number(divWidth / 22)) + "px;";
            this.boxStyle = "height:" + divWidth + "px;";
            this.__initial = false;
        }
    }

    handleMouseOver(){
        this.template.querySelector('.flip-card-inner').classList.add('flip-card-hover');
    }

    handleBlur(){
        console.log('In blur');
        this.template.querySelector('.flip-card-hover').classList.remove('flip-card-hover');
    }

    @wire(measureData, { methodId: '$methodId', applicableQuarter: '$quarter' })
    wiredmeasureData({ error, data }) {
        if (data) {
            console.log('measureList' + '::' + this.methodId + '::' + data.length);
            console.log('data', data);
            this.assignMeasureData(data);
        } else if (error) {
            console.log(error);
        }
    }

    get name() {
        console.log('Name', this.method.data.fields.Name.value);
        return this.method.data.fields.Name.value;
    }

    get description() {
        return this.method.data.fields.Description__c.value;
    }

    get lastmodifiedby() {

        return this.method.data.fields.LastModifiedDate.value;
    }
    get quarterProgress() {
        console.log('this.quarter' + this.quarter);
        if (this.quarter == null || this.method.data.fields['' + this.quarter + '_Progress__c'].value == null)
            return 0;
        return this.method.data.fields['' + this.quarter + '_Progress__c'].value;
    }


    assignMeasureData(data) {
        if (data != null && data != undefined) {

            this.measuresLength = data.length;
            this.noMeasures = this.measuresLength === 0 ? true:false;
            var tempMeasures = new Array();
            var measuresSize = 6;

            let inputData = data.map((item) =>
                Object.assign({}, item, { selected: false })
            )
            if (data.length < 6) {
                measuresSize = data.length;
            }
            for (var v = 0; v < measuresSize; v++) {

                var currentEle = inputData[v];
                var quarterProgress = currentEle.hasOwnProperty('' + this.quarter + '_Progress__c') ? currentEle['' + this.quarter + '_Progress__c'] : 0;
                currentEle['currentQuarterProgress'] = quarterProgress;
                tempMeasures.push(currentEle);
            }

            this.measureData = tempMeasures;
            console.log('measureData');
            console.log(this.measureData);
        }

    }

    handleMenuSelect(event) {
        console.log('handleMenuSelect' + event.detail.value);
        let selectedItemValue = event.detail.value;

        if (selectedItemValue === 'edit') {
            this.headerName = 'Edit ' + this.name;
            this.handleEdit();
        } else if (selectedItemValue === 'delete') {
            this.headerName = 'Delete ' + this.name;
            this.handleDelete();
        }
    }

    handleEdit() {
        this.showEdit = true;
    }

    closeEditModal() {
        this.showEdit = false;
    }

    handleDelete() {
        this.showDelete = true;
        this.deletePopupBody = "<div style='font-size:18px;text-align:center;'>Are you sure you want to delete <b>" + this.name + "</b>?</div><div style='margin-top:10px;font-size:14px;'>Note: This will delete the Method from <b>all the Quarters</b>. If you need to delete the Method for a particular Quarter,use <b>Edit</b> to uncheck the <b>Quarter</b>.</div>";
    }

    closeDelete() {
        this.showDelete = false;
    }
    closeDeletePopup() {
        this.closeDelete();
    }
    deleteMethod() {
        this.closeDelete();
        deleteRecord(this.methodId)
            .then(() => {

                this.refreshContainerOnDelete();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Method deleted successfully!!',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error deleting Method!!',

                        variant: 'error'
                    })
                );
                console.log('methodCard Error->' + error.body.message);
            });


    }
    refreshContainerOnDelete() {
        const selectedEvent = new CustomEvent("refreshmethods", {
            detail: 'refreshmethods',
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectedEvent);
    }

    handleMouseIn() {
        this.overlayIcon = 'utility:down';
    }

    handleMouseOut() {
        this.overlayIcon = 'utility:up';
    }

    showMeasures() {
        console.log('dispatching event');
        const selectEvent = new CustomEvent('navigatetomeasures', {
            detail: { methodId: this.methodId, name: this.method.data.fields.Name.value },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectEvent);
    }

}