import { LightningElement, api, track } from 'lwc';
import getHistory from '@salesforce/apex/V2MOM_RootComponentController.getHistory';
export default class RecentActivities extends LightningElement {

    @api v2momId;
    @track recentActivities=[];
    connectedCallback(){
        this.getV2MOMHistory();
    }

    get hasRecentActivities(){
        if(this.recentActivities.length>0){
            return true;
        }
        return false;
    }

    getV2MOMHistory(){
        getHistory({ v2momId : this.v2momId })
            .then(result=>{
                this.recentActivities = result;
                this.recentActivities.map(item=>{
                    item.createdDateTime=new Date(item.createdDateTime);
                    item.fieldHistory.NewValue = item.fieldHistory.NewValue?item.fieldHistory.NewValue:'blank';
                    item.fieldHistory.OldValue = item.fieldHistory.OldValue?item.fieldHistory.OldValue:'blank';
                    return item;
                });
            })
            .catch(error=>{
                this.recentActivities=[];
                console.log(error);
            })
    }
}