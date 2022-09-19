import { LightningElement, api, wire } from 'lwc';
import getManagerV2MOMData from '@salesforce/apex/V2MOM_RootComponentController.getManagerV2MOMData';

export default class ManagersDataPopover extends LightningElement {
    @api popupHeader;
    @api type;
    @api managerId;
    textvalue;
    managerV2MOM;


    @wire(getManagerV2MOMData, { userId: '$managerId', financialYear: '' })
    managerV2MOMData({ error, data }) {
        console.log(data);
        if (data) {
            console.log('Inside');
            this.managerV2MOM = data;
            if (this.type === 'Vision') {
                this.textvalue = data.Vision__c;
            }
            else {
                this.textvalue = data.Values__c;
            }
        } else {
            this.textvalue = "Your Manager doesn't have a V2MOM created yet. Please connect with your manager."
        }
    }


    copyText() {
        //let copytext = this.template.querySelector('.copytext');
        //copytext.disabled = false;
        //copytext.select();
        //copytext.setSelectionRange(0,999999);
        //document.execCommand('copy');
        //copytext.disabled = true;
        //navigator.clipboard.writeText(this.textvalue);
        const copyEvent = new CustomEvent("copytext", {
            detail: {
                text:this.textvalue,
            }
        });
        this.dispatchEvent(copyEvent);
        this.closeModal();
    }

    closeModal() {
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'closemodal'
        });
        this.dispatchEvent(selectedEvent);
    }
}