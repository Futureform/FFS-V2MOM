import { LightningElement, track, api } from 'lwc';
import findRecords from "@salesforce/apex/LookupController.findRecords";

export default class LookUpComponent extends LightningElement {

    @track recordsList;
    @track searchKey = "";
    @api selectedValue;
    @api selectedRecordId;
    @api objectApiName;
    @api iconName;
    @api lookupLabel;
    @track message;
    @api placeholder;
    query;
    selectedRecords;

    @api
    get queryString() {
        return this.query;
    }

    set queryString(value) {
        this.query = value;
    }


    @api
    get preSelectedValues() {
        return this.selectedRecords;
    }
    set preSelectedValues(value) {
        if (value)
            this.selectedRecords = JSON.parse(JSON.stringify(value));
    }

    onLeave(event) {
        setTimeout(() => {
            this.searchKey = "";
            this.recordsList = null;
        }, 300);
    }

    onRecordSelection(event) {
        this.selectedRecordId = event.currentTarget.dataset.key;
        this.selectedValue = event.currentTarget.dataset.name;
        console.log(this.selectedRecordId);
        console.log(this.selectedValue);
        this.searchKey = "";
        this.onSeletedRecordUpdate();
    }

    handleKeyChange(event) {
        const searchKey = event.target.value;
        this.searchKey = searchKey;
        this.getLookupResult();
    }

    removeRecordOnLookup() {
        this.searchKey = "";
        this.selectedValue = null;
        this.selectedRecordId = null;
        this.recordsList = null;
        //this.onSeletedRecordUpdate();
    }

    getLookupResult() {
        findRecords({ searchKey: this.searchKey, objectName: this.objectApiName, queryString: this.query })
            .then((result) => {
                if (result.length === 0) {
                    this.recordsList = [];
                    this.message = "No Records Found";
                } else {
                    this.recordsList = result;
                    console.log(this.recordsList);
                    this.message = "";
                }
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.recordsList = undefined;
            });
    }

    onSeletedRecordUpdate() {
        //this.recordsList = null;
        const passEventr = new CustomEvent('recordselection', {
            detail: { selectedRecordId: this.selectedRecordId, selectedValue: this.selectedValue }
        });
        this.dispatchEvent(passEventr);
        this.removeRecordOnLookup();
    }

    handleRemoveMember(event){
        let userId = event.target.dataset.userid;
        let memberId = event.target.dataset.memberid;

        const removeUser = new CustomEvent('removerecord', {
            detail: { userId: userId, memberId: memberId }
        });
        this.dispatchEvent(removeUser);
    }
}