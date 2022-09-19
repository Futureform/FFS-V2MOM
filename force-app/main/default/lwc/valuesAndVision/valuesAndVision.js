import { LightningElement, api, wire,track } from 'lwc';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getObstacles from '@salesforce/apex/V2MOM_RootComponentController.getObstacles';

export default class ValuesAndVision extends LightningElement {
    @api v2mom;
    @api userRec;
    @api isNew = false;
    @api financialYear;
    @api canUserEdit;

    isNewEditMode
    activeSections = ['vision', 'value', 'obstacle'];
    activeSectionsNew = ['vision', 'value'];
    isVisionEditMode = false;
    isValueEditMode = false;
    newObstacle = false;
    @track visLength = 0;
    valLength = 0;
    showManagersPopover = false;
    popupHeader;
    popupType;

    @wire(getObstacles,{ v2momId:'$v2mom.data.fields.Id.value' })
    obstacles;

    get v2momId(){
        if(this.v2mom.data){
            console.log('V2MOMId',this.v2mom.data.fields.Id.value);
            return this.v2mom.data.fields.Id.value;
        }
        console.log('Data Issue');
        return null;
    }

    get managerId() {
        if(this.userRec.data){
            return this.userRec.data.fields.ManagerId.value;
        }
        return null;
    }

    get value() {
        if(this.v2mom.data){
            return this.v2mom.data.fields.Values__c.value;
        }
        return null;
    }

    get vision() {
        if(this.v2mom.data){
            return this.v2mom.data.fields.Vision__c.value;
        }
        return null;
    }

    get cardLabel() {
        return "Vision, Values & Obstacles";
    }

    get cardLabelNew() {
        if (this.userRec.data && this.financialYear)
            return "FY" + this.financialYear.data + " V2MOM - " + this.userRec.data.fields.Name.value;
        return "FY V2MOM";
    }

    get disableCreate() {
        if (this.visLength == 32768 || this.valLength == 32768)
            return true;
        else
            return false;
    }

    get disableVisionSave() {
        if (this.visLength == 32768)
            return true;
        else
            return false;
    }

    get disableValueSave() {
        if (this.valLength == 32768)
            return true;
        else
            return false;
    }

    get disableManagerCopy() {
        if (this.userRec.data.fields.ManagerId.value)
            return false;
        else
            return true;
    }

    updateVisionCharacters(event) {
        //console.log('In method');
        this.visLength = 32768 - event.target.value.length;
    }

    updateValueCharacters(event) {
        this.valLength = 32768 - event.target.value.length;
    }

    editVision() {
        this.isVisionEditMode = true;
        this.visLength = 32768 - this.v2mom.data.fields.Vision__c.value.length;
    }

    editValue() {
        this.isValueEditMode = true;
        this.valLength = 32768 - this.v2mom.data.fields.Values__c.value.length;
    }

    cancelVision() {
        this.isVisionEditMode = false;
    }

    cancelValue() {
        this.isValueEditMode = false;
    }

    updateVision() {
        const fields = {};
        fields['Vision__c'] = this.template.querySelector("[data-field='vision']").value;
        fields['Id'] = this.v2momId;
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(data => {
                this.isVisionEditMode = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Vision updated',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        variant: 'error'
                    })
                );
            });
    }

    updateValue() {
        const fields = {};
        fields['Values__c'] = this.template.querySelector("[data-field='value']").value;
        fields['Id'] = this.v2momId;
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(data => {
                this.isValueEditMode = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Values updated',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        variant: 'error'
                    })
                );
            });
    }

    closeModal(event) {
        this.showManagersPopover = false;
    }

    copyVision() {
        //this.template.querySelector("[data-field='vision']").value = this.managerv2mom.data.fields.Vision__c.value;
        this.popupHeader = "Copy Manager's Vision";
        this.popupType = "Vision";
        this.showManagersPopover = true;
    }

    copyValue() {
        //this.template.querySelector("[data-field='value']").value = this.managerv2mom.data.fields.Values__c.value;
        this.popupHeader = "Copy Manager's Value";
        this.popupType = "Value";
        this.showManagersPopover = true;
    }

    showVisionVideo() {
        window.open("https://salesforce.vidyard.com/watch/NfNhgIOpeOjeF3VGS27zaQ");
    }

    showValueVideo() {
        window.open("https://salesforce.vidyard.com/watch/QCP_DeSO9NDR20Ma51sWog");
    }

    showObstacleVideo() {
        window.open("https://salesforce.vidyard.com/watch/YfyQU5kM2MD3giOw4oB2MA");
    }

    createObstacle() {
        console.log('New $$$');
        this.newObstacle = true;
    }

    hideNewObstacle() {
        this.newObstacle = false;
    }

    handleRefresh() {
        refreshApex(this.obstacles);
    }

    showNewEdit() {
        this.isNewEditMode = true;
        this.visLength = 32768
        this.valLength = 32768
    }

    hideNewEdit() {
        this.isNewEditMode = false;
    }

    createV2MOM() {
        const fields = {};
        fields['Name'] = this.cardLabelNew;
        fields['Values__c'] = this.template.querySelector("[data-field='newvalue']").value;
        fields['Vision__c'] = this.template.querySelector("[data-field='newvision']").value;
        fields['Status__c'] = 'Draft';
        fields['FY_Year__c'] = String(this.financialYear.data);
        fields['User__c'] = this.userRec.data.fields.Id.value;
        const recordInput = { apiName: 'V2MOM__c', fields };
        createRecord(recordInput)
            .then(data => {
                const selectEvent = new CustomEvent('createv2mom', {
                    detail: String(this.financialYear.data)
                });
                this.dispatchEvent(selectEvent);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Your FY' + this.financialYear.data +' V2MOM has been Created!',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.log('Error in valuesAndVision :: ' + JSON.stringify(error))
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Creating V2MOM',
                        variant: 'error'
                    })
                );
            });
    }




    handleClick(e) {
        e.target.classList.toggle("active");
        var content = e.target.nextSibling;
        console.log(content)
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }

    sectionOne(e) {
        var show = this.template.querySelectorAll('.slds-show');
        console.log(JSON.stringify(show));
        show.forEach(item => {
            console.log('Inn');
            item.classList.remove("slds-show");
            item.classList.add("slds-hide");
        });
        var rec = this.template.querySelector('div[data-id="s1"]');
        if (rec.classList.contains('slds-hide')) {
            rec.classList.add('slds-show');
            rec.classList.remove('slds-hide');
        } else {
            rec.classList.add('slds-hide');
            rec.classList.remove('slds-show');
        }
    }
    sectionTwo(e) {
        var show = this.template.querySelectorAll('.slds-show');
        console.log(JSON.stringify(show));
        show.forEach(item => {
            item.classList.remove("slds-show");
            item.classList.add("slds-hide");
        });
        var rec = this.template.querySelector('div[data-id="s2"]');
        if (rec.classList.contains('slds-hide')) {
            rec.classList.add('slds-show');
            rec.classList.remove('slds-hide');
        } else {
            rec.classList.remove('slds-show');
            rec.classList.add('slds-hide');
        }

    }
    sectionThree(e) {
        var show = this.template.querySelectorAll('.slds-show');
        console.log(JSON.stringify(show));

        var show = this.template.querySelectorAll('.slds-show');
        show.forEach(item => {
            item.classList.remove("slds-show");
            item.classList.add("slds-hide");
        });
        var rec = this.template.querySelector('div[data-id="s3"]');
        if (rec.classList.contains('slds-hide')) {
            rec.classList.add('slds-show');
            rec.classList.remove('slds-hide');
        } else {
            rec.classList.remove('slds-show');
            rec.classList.add('slds-hide');
        }
    }
    handleTextCopy(event){
        if(this.popupType === 'Vision'){
            this.template.querySelector('[data-field="vision"]').value = event.detail.text;
        }else if(this.popupType === 'Value'){
            this.template.querySelector('[data-field="value"]').value = event.detail.text;
        }
    }
}