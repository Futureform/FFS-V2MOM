import { LightningElement, track, api, wire } from 'lwc';
import { getRecord, updateRecord, createRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const FIELDSVAL = [
    'Obstacle__c.Name',
    'Obstacle__c.Description__c',
];

export default class ObstacleCard extends LightningElement {
    @track isEdit;
    @api obstacleId;
    @api v2momId;
    showDeletePopup=false;
    deletePopupBody="";
    nameLength = 80;
    descLength = 1000;

    @wire(getRecord, { recordId: '$obstacleId', fields: FIELDSVAL })
    obstacle;

    get name() {
        //console.log('Name'+this.obstacle.data.fields.Name.value);
        return this.obstacle.data.fields.Name.value;
    }

    get description() {
        //console.log('Description'+this.obstacle.data.fields.Description__c.value);
        return this.obstacle.data.fields.Description__c.value;
    }

    get disableSave(){
        if(this.nameLength == 80)
            return true;
        return false;
    }

    calculateLengthName(){
            this.nameLength = 80-this.template.querySelector("[data-field='name']").value.length;
    }

    calculateLengthDescription(){
        this.descLength = 1000-this.template.querySelector("[data-field='description']").value.length;
}

    calculateNewLengthName(){
            this.nameLength = 80-this.template.querySelector("[data-field='newname']").value.length;
    }

    calculateNewLengthDescription(){
        this.descLength = 1000-this.template.querySelector("[data-field='newdescription']").value.length;
}

    editObstacle(){
        this.isEdit = true;
        this.nameLength = 80-this.name.length;
        this.descLength = 1000-this.description.length;
    }

    saveObstacle(){
        const fields = {};
        fields['Name'] = this.template.querySelector("[data-field='name']").value;
        fields['Description__c'] = this.template.querySelector("[data-field='description']").value;
        fields['Id'] = this.obstacleId;
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(data => {
            this.isEdit = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Obstacle updated successfully!!',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating Obstacle',
                    variant: 'error'
                })
            );
        });    
    }

    closeObstacle(){
        this.isEdit = false;
    }

    createObstacle(){
        const fields = {};
        fields['Name'] = this.template.querySelector("[data-field='newname']").value;
        fields['Description__c'] = this.template.querySelector("[data-field='newdescription']").value;
        fields['V2MOM__c'] = this.v2momId;
        const recordInput = { apiName: 'Obstacle__c' , fields };
        createRecord(recordInput)
        .then(data => {
            this.hideNewObstacle();
            this.fireRefresh();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Obstacle created successfully!!',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error Creating Obstacle',
                    variant: 'error'
                })
            );
        });
    }

    confirmDeletion(){
        this.deletePopupBody = "Are you sure you want to delete <b style='font-size:14px;'>"+this.name+"</b> from list of Obstacles?";
        this.showDeletePopup = true;
    }

    closeDeletePopup(){
        this.showDeletePopup = false;
    }

    deleteObstacle(){
        this.closeDeletePopup();
        deleteRecord(this.obstacleId)
        .then(() => {
            this.fireRefresh();
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Obstacle is deleted',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting Obstacle',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });    
    }

    hideNewObstacle(){
        const selectedEvent = new CustomEvent("deleteobstacle", {
            detail: 'closenewobstacle'
        });
        this.dispatchEvent(selectedEvent);
    }

    fireRefresh(){
        const selectedEvent = new CustomEvent("refreshrec", {
            detail: 'refreshV2MOM'
        });
        this.dispatchEvent(selectedEvent);
        console.log('obstacleevent');
    }
}