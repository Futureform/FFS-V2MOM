import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CurrentUserId from '@salesforce/user/Id';
import getCurrentFY from '@salesforce/apex/V2MOM_RootComponentController.getCurrentFY';
import checkIsManager from '@salesforce/apex/V2MOM_RootComponentController.checkIsManager';
import managerEdit from '@salesforce/apex/V2MOM_RootComponentController.managerEditDetails';
import { refreshApex } from '@salesforce/apex';
import getV2MOMData from '@salesforce/apex/V2MOM_RootComponentController.getV2MOMData';
import getManagerEdit from '@salesforce/apex/V2MOM_RootComponentController.getManagerEdit';
import getCurrentQuarter from '@salesforce/apex/V2MOM_RootComponentController.getCurrentQuarter';




const USERFIELDSVAL = [
    'User.Id',
    'User.Name',
    'User.Title',
    'User.ManagerId',
    'User.SmallPhotoUrl'
];

const V2MOMFIELDSVAL = [
    'V2MOM__c.Id',
    'V2MOM__c.Name',
    'V2MOM__c.Vision__c',
    'V2MOM__c.Values__c',
    'V2MOM__c.User__c',
    'V2MOM__c.FY_Year__c',
    'V2MOM__c.Status__c',
    'V2MOM__c.Published_Date__c',
    'V2MOM__c.Q1_Check_In__c',
    'V2MOM__c.Q2_Check_In__c',
    'V2MOM__c.Q3_Check_In__c',
    'V2MOM__c.Q4_Check_In__c',
    'V2MOM__c.Q1_Progress__c',
    'V2MOM__c.Q2_Progress__c',
    'V2MOM__c.Q3_Progress__c',
    'V2MOM__c.Q4_Progress__c',
];

export default class V2momCard extends LightningElement {
    @api userId;
    @api v2momId;
    @api isNew = false;
    @api isUserRecord = false;
    currentUserId = CurrentUserId;
    @track navigationElements=[];
    showHome=true;
    showMethods;
    showMeasures;
    selectedQuarter;
    selectedMethodId;
    selectedMethodName;
    view = 'myView';
    isAssignedMeasure=false;
    @track teamMemberList;
    showConfirmationPopUp;
    checkinPopupHeader;
    checkinPopupBody;
    checkinQuarter;
    checkInValue = false;
    userCheckinDisabled;

    @api methodRefreshValue = false;
    

    @wire(getRecord, { recordId: '$userId', fields: USERFIELDSVAL })
    userRec;

    @wire(getRecord, { recordId: '$userRec.data.fields.ManagerId.value', fields: USERFIELDSVAL })
    managerRec;

    @wire(getRecord, { recordId: '$v2momId', fields: V2MOMFIELDSVAL })
    V2MOMRec;

    @wire(getCurrentFY)
    currentFY;

    @wire(checkIsManager, { userId: '$currentUserId' })
    checkManager;

    @wire(getManagerEdit, { userId: '$currentUserId', v2momId: '$v2momId'})
    currentUserManager;


    @wire(managerEdit)
    canManagerEdit;

    get isLoggedInUser(){
        if(this.currentUserId === this.userId){
            return true;
        }
        return false;
    }

    get isManager(){
        
        if(this.checkManager.data){
            return this.checkManager.data;
        }
        return false;
    }

    connectedCallback(){
        console.log('######'+ this.v2momId);
        
        //console.log('This is it'+this.currentV2MOMYear());
    }


    getV2MOMdataMethod() {
        getV2MOMData()
            .then(result => {
                this.V2MOMRec = result;
            })
            .catch(error => {
                this.error = error;
            });
    }

    get otherUserEdit(){
        console.log('otherUserEdit');
        /*console.log('loggedIn'+this.isLoggedInUser );
        console.log('canManagerEdit'+this.canManagerEdit.data );
        console.log('isManager'+this.isManager );*/
        var managerEditable = this.canManagerEdit.data ;
        console.log('currentUserManager',JSON.stringify(this.currentUserManager));
        var isManager = this.currentUserManager.data ? true: false;
        var loggedInUser = this.currentUserId === this.userId ? true:false;
        if(loggedInUser || (managerEditable && isManager)){
            this.userCheckinDisabled = false;
            return true;
            
        }
        this.userCheckinDisabled = true;
        return false;
    }

    get Q1Val(){
        if(this.V2MOMRec.data){
            if(this.V2MOMRec.data.fields.Q1_Progress__c.value){
                return this.V2MOMRec.data.fields.Q1_Progress__c.value;
            }
        }
        return 0;
    }

    get Q2Val(){
        if(this.V2MOMRec.data){
            if(this.V2MOMRec.data.fields.Q2_Progress__c.value){
                return this.V2MOMRec.data.fields.Q2_Progress__c.value;
            }
        }
        return 0;
    }

    get Q3Val(){
        if(this.V2MOMRec.data){
            if(this.V2MOMRec.data.fields.Q3_Progress__c.value){
                return this.V2MOMRec.data.fields.Q3_Progress__c.value;
            }
        }
        return 0;
    }

    get Q4Val(){
        if(this.V2MOMRec.data){
            if(this.V2MOMRec.data.fields.Q4_Progress__c.value){
                return this.V2MOMRec.data.fields.Q4_Progress__c.value;
            }
        }
        return 0;
    }

    get currentV2MOMId(){
        if(this.V2MOMRec.data){
            return this.V2MOMRec.data.fields.Id.value;
        }
        return null;
    }

    get currentV2MOMYear(){
        if(this.V2MOMRec.data){
            return this.V2MOMRec.data.fields.FY_Year__c.value;
        }
        return null;
    }

    get showManagerView(){
        if(this.view==='teamView'){
            return true;
        }
        return false;
    }

    

    handlefychange(event){
        const selectEvent = new CustomEvent('fychange', {
            detail: event.detail
        });
        this.dispatchEvent(selectEvent);
    }

    handleQuarterClick(event){
        if(!this.isNew){
            this.selectedQuarter = event.target.title;
            this.showMethodScreen();
        }
    }

    handleMethodClick(event){
        this.selectedMethodId = event.detail.methodId;
        this.selectedMethodName = event.detail.name;
        if(this.selectedMethodId){
            this.isAssignedMeasure = false;
            this.teamMemberList = null;
        } else {
            this.isAssignedMeasure = true;
            this.teamMemberList = event.detail.measureList;
        }
        this.showMeasureScreen();
    }

    showHomeScreen(){
        this.showHome = true;
        this.showMethods = false;
        this.showMeasures = false;
    }

    showMethodScreen(){
        this.showHome = false;
        this.showMethods = true;
        this.showMeasures = false;
        this.navigationElements=[];
        this.navigationElements.push({ Id: 'Quarter', value: this.selectedQuarter, label: this.selectedQuarter });
    }

    showMeasureScreen(){
        this.showHome = false;
        this.showMethods = false;
        this.showMeasures = true;
        this.navigationElements=[];
        this.navigationElements.push({ Id: 'Quarter', value: this.selectedQuarter, label: this.selectedQuarter });
        this.navigationElements.push({ Id: 'Method', value: this.selectedMethodId, label: this.selectedMethodName });
    }

    navigateHome(event){
        this.showHomeScreen();
        this.navigationElements=[];
        this.selectedQuarter = null;
        this.selectedMethodId = null;
        this.selectedMethodName = null;
    }

    handleNavigation(event){
        let Id = event.target.dataset.id;
        if(Id==='Quarter'){
            this.showMethodScreen();
        } else if(Id==='Method') {
            this.showMeasureScreen();
        }
    }

    handleViewChange(event){
        this.view = event.detail;
    }

    handleCheck(event){
        this.checkinQuarter = event.target.value;
        this.checkinPopupHeader = 'Confirm Check In';
        this.checkinPopupBody = `Are you sure you want to check in ${this.checkinQuarter}?`;
        this.checkInValue = true;
        this.showConfirmationPopUp = true;
    }

    handleUncheck(event){
        this.checkinQuarter = event.target.value;
        this.checkinPopupHeader = 'Confirm Undo Check In';
        this.checkinPopupBody = `Are you sure you want to undo check in for ${this.checkinQuarter}?`;
        this.checkInValue = false;
        this.showConfirmationPopUp = true;
    }

    closeCheckinPopup(event){
        this.showConfirmationPopUp = false;
    }

    handleCheckinConfirmation(event){
        const fields = {};
        fields['Id'] = this.v2momId;
        fields[''+this.checkinQuarter+'_Check_In__c'] = this.checkInValue;
        const recordInput = { fields };

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: `${this.checkinQuarter} Check In status updated`,
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Unable to update Check In status',
                    message: error.body.message,
                    variant: 'error'
                })
            );            
        })
        .finally(() => {
            this.closeCheckinPopup();
        })
    }
    handleMethodContainerRefresh(event){
        console.log('handleMethodContainerRefresh');
        /*refreshApex(this.V2MOMRec).then(()=>{
            console.log('refreshedData',this.V2MOMRec);
        });*/
       // this.getV2MOMdataMethod();
        

    }
}