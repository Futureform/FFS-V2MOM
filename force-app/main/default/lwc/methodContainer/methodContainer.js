import { LightningElement,api,track,wire } from 'lwc';
import getV2MOMData from '@salesforce/apex/V2MOM_RootComponentController.getV2MOMMethods';
import getAssignedMeasures from '@salesforce/apex/V2MOM_RootComponentController.getAssignedMeasures';
import { refreshApex } from '@salesforce/apex';


export default class MethodContainer extends LightningElement {
    openMethodModal = false;
    isAddMethod;
    methodheaderName;

    @api canUserEdit;
    @track myv2mom;
    @api applicableQuarter;
    @api myv2momId;
    @api fyyear;
    @api userId;
    @track v2momData;
    @track assignedMeasuresData = [];

    totalProgress = 0;
    
    hasAssignedMeasures=false;
    completionPercent = 0;

    methodRefresh = false;
    @api showMethods = false;

    @api
    get itemName() {
        return this.methodRefresh;
    }

    set itemName(value) {
        console.log('in Setter');
       this.methodRefresh = value;
    }

    @api
    childMethod() {
        console.log('childMethod');
        if(this.v2momData){
            refreshApex(this.v2momData);
        }
    }

    @wire(getV2MOMData, { v2momId: '$myv2momId',applicableQuarter:'$applicableQuarter' }) 
    v2mom(result) {
        console.log('methodContainerWire');
        this.v2momData = result;   
        const { data, error } = result;
        if (data) {
            console.log('methodContainerDetails1');
            
            this.myv2mom = this.v2momData.data;
            console.log(JSON.stringify(this.myv2mom.V2MOMQ__Methods__r));
        } else if (error) {
            console.log('error->' + JSON.stringify(error));
        } 
    }

    get showIllustration(){
        if(this.hasAssignedMeasures || this.myv2mom.V2MOMQ__Methods__r){
            return false;
        }
        return true;
    }

    connectedCallback(){
        this.hasAssignedMeasures = false;
        this.getAssignedMeasures();
    }

    getAssignedMeasures(){
        getAssignedMeasures( { userId : this.userId, fyyear : this.fyyear, quarter : this.applicableQuarter} )
        .then(result=>{
            if(result.length>0){
                this.hasAssignedMeasures = true;
                let sum = 0;
                this.assignedMeasuresData = JSON.parse(JSON.stringify(result));
                this.assignedMeasuresData.forEach(measure => {
                    sum += measure['V2MOMQ__'+this.applicableQuarter+'_Progress__c'];
                    measure.currentQuarterProgress = measure['V2MOMQ__'+this.applicableQuarter+'_Progress__c'];
                });
                this.totalProgress = sum/result.length;
            } else {
                this.hasAssignedMeasures = false;
            }
        })
        .catch(error=>{
            this.hasAssignedMeasures = false;
            console.log('error is here->' + error+JSON.stringify(error));
        })
    }

    addNewMethod(){
        this.isAddMethod = true;
        this.methodheaderName = 'Add Method';
        this.openMethodModal = true;
    }

    closeMethodModal(){
        this.openMethodModal = false;
    }

    refreshContainer(){
        console.log('refreshContainerCalled'); 
        refreshApex(this.v2momData).then(()=>{
            console.log('refreshedData',this.myv2mom);
        });
    }

}