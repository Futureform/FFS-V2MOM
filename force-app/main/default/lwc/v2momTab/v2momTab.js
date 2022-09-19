import { LightningElement } from 'lwc';
import CurrentUserId from '@salesforce/user/Id';
import getV2MOMId from '@salesforce/apex/V2MOM_RootComponentController.getV2MOMId';

export default class V2momTab extends LightningElement {
    userId = CurrentUserId;
    isNew=false;
    v2momId;
    showSpinner=true;

    connectedCallback(){
        this.fetchV2MOMId();
    }

    handlefychange(event){
        this.showSpinner = true;
        let fyYear = event.detail;
        this.fetchV2MOMId(fyYear);
    }

    fetchV2MOMId(fyYear){
        getV2MOMId({fyYear : fyYear, userId : this.userId})
            .then(result => {
                if(result){
                    this.v2momId = result;
                    this.isNew = false;
                    console.log('result->'+result);
                } else {
                    this.v2momId = null;
                    this.isNew = true;
                    console.log('here');
                }
            })
            .catch(error => {
                this.error = error;
            })
            .finally(()=>{
                this.showSpinner = false;
            });
    }

}