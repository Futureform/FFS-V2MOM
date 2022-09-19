import { LightningElement,api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getV2MOMId from '@salesforce/apex/V2MOM_RootComponentController.getV2MOMId';
import { NavigationMixin } from 'lightning/navigation';

export default class V2momRecordDetail extends NavigationMixin(LightningElement) {
    @api recordId;
    
    @wire(getRecord, { recordId: '$recordId', fields: ['V2MOM__c.User__c'] })
    v2mom;

    handlefychange(event){
        let fyYear = event.detail;
        getV2MOMId({fyYear : fyYear, userId : this.v2mom.data.fields.User__c.value})
            .then(result => {
                if(result){
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result,
                            objectApiName: 'V2MOM__c', // objectApiName is optional
                            actionName: 'view'
                        }
                    });
                } else {
                    console.log('no result'+result);
                }
            })
            .catch(error => {
                this.error = error;
            });
    }
}