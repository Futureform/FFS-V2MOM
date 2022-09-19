import { LightningElement, api, wire } from 'lwc';
import getRelatedMeasures from '@salesforce/apex/V2MOM_RootComponentController.getRelatedMeasures';
import { refreshApex } from '@salesforce/apex';

export default class MeasureContainer extends LightningElement {
    @api methodId;
    @api applicableQuarter;
    @api canUserEdit;
    
    showCreate = false;
    @api manData;
    @api isManager;
    @api isAssignedMeasure=false;
    @api teamMemberList;
    @api isreadonlyUser=false;
    showTeamMeasureCreate = false;

    @wire(getRelatedMeasures, { methodId: '$methodId', applicableQuarter: '$applicableQuarter'})
    measures;

    get showIllustration(){  
        if(this.hasMeasures || this.hasAssignedMeasures){
            return false;
        }
        return true;
    }

    get hasMeasures(){
        if(this.measures.data){
            if(this.measures.data.length>0){
                return true;
            }
        }
        return false;
    }

    get hasAssignedMeasures(){
        if(this.teamMemberList){
            if(this.teamMemberList.length>0){
                return true;
            }
        }
        return false;
    }
    
    createMeasure(){
        this.showCreate = true;
    }

    createTeamMeasure(){
        this.showTeamMeasureCreate = true;
    }

    closeCreateModal(){
        this.showCreate = false;
        this.showTeamMeasureCreate=false;
        this.handleRefresh();
    }

    handleRefresh(event){
       // console.log('handleRefreshMeasures');
        refreshApex(this.measures);
        this.refreshContainer();
    }
    //For refreshing the measure in Method Card
    refreshContainer() {
        const selectedEvent = new CustomEvent("refreshmethodcontainer", {
            detail: 'refreshmethodcontainer',
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
}