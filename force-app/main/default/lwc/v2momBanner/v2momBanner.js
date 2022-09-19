import { LightningElement, wire, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAllV2MOMFY from '@salesforce/apex/V2MOM_RootComponentController.getAllV2MOMFY';

const OPTIONS = [
    { label: 'My V2MOM', value: 'myView' },
    { label: 'My Team', value: 'teamView' },
];
export default class V2momBanner extends LightningElement {

    @api userRec;
    @api managerRec;
    @api v2mom;
    @api currentFY;
    _isUserRecordView = false;
    @api isNew = false;
    @api view;
    @api isManager;
    @api currentUserId;
    managerOptions = OPTIONS;
    showConfirmationPopUp;
    userCannotPublish;
    _bannerStyle;
    _intial = true;

    @wire(getAllV2MOMFY, { userId: '$userRec.data.fields.Id.value' })
    v2momFY;

    get v2momId() {
        if (this.v2mom.data) {
            return this.v2mom.data.fields.Id.value;
        }
        return null;
    }
    @api
    get isUserRecord() {
        return this._isUserRecordView;
    }
    set isUserRecord(value) {
        this._isUserRecordView = value;
        console.log(value);
        if (value) {
            console.log('In If');
            this._bannerStyle = "margin-top:1em;margin-bottom:1em;margin-left:1em;";
        } else {
            console.log('In else');
            this._bannerStyle = "margin-left:1em;";
        }
    }

    /*renderedCallback() {
        if (this._intial) {
            if (this.isUserRecord) {
                this._bannerStyle = "margin-top:1em;margin-bottom:1em;margin-left:1em;";
            } else {
                this._bannerStyle = "margin-left:1em;";
            }
            this._intial = false;
        }
    }*/

    get v2momUserId() {
        if (this.v2mom.data) {
            return this.v2mom.data.fields.User__c.value;
        }
        return null;
    }

    get userId() {
        return this.userRec.data.fields.Id.value;
    }

    get userUrl() {
        return '/lightning/r/User/' + this.userId + '/view'
    }

    get name() {
        return this.userRec.data.fields.Name.value;
    }

    get title() {
        return this.userRec.data.fields.Title.value;
    }

    get manager() {
        if (this.managerRec.data) {
            return this.managerRec.data.fields.Name.value;
        }
        return null;
    }

    get managerId() {
        if (this.managerRec.data) {
            return this.managerRec.data.fields.Id.value;
        }
        return null;
    }

    get managerUrl() {
        if (this.managerRec.data) {
            return '/lightning/r/User/' + this.managerId + '/view';
        }
        return '#';
    }

    get photo() {
        return this.userRec.data.fields.SmallPhotoUrl.value;
    }

    get status() {
        if (this.v2mom.data)
            return this.v2mom.data.fields.Status__c.value;
        else
            return null;
    }

    get publishedDate() {
        if (this.v2mom.data)
            return this.v2mom.data.fields.Published_Date__c.value;
        else
            return null;
    }

    get options() {
        if (this.v2momFY)
            return this.v2momFY.data;
        return [
            { label: 'None', value: null },
        ];
    }

    get isPublished() {
        if (this.v2mom.data) {
            if (this.v2mom.data.fields.Status__c.value === "Published") {
                return true;
            }
        }
        return false;
    }

    get selectedYear() {
        if (this.v2mom.data) {
            return this.v2mom.data.fields.FY_Year__c.value;
        } else if (this.isNew && this.currentFY.data) {
            return this.currentFY.data.toString();
        }
        return null;
    }

    get fyyear() {
        if (this.selectedYear)
            return "FY " + this.selectedYear;
        else
            return "FY " + this.currentFY.data;
    }

    get showShareasPDFButton() {
        if (this.v2mom.data && (this.currentUserId === this.managerId || this.currentUserId === this.userId)) {
            return true;
        }
        return false;
    }

    get isLoggedInUserV2MOM() {
        if (this.currentUserId === this.v2momUserId) {
            return true;
        }
        return false;
    }

    get showMyTeamButton() {
        if (this.isLoggedInUserV2MOM && this.isManager) {
            return true;
        }
        return false;
    }

    verifyPublish() {
        this.showConfirmationPopUp = true;
    }

    closeConfirmationModal() {
        this.showConfirmationPopUp = false;
    }



    publishV2MOM() {
        var d = new Date();
        var currentDate = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate();
        const fields = {};
        fields['Published_Date__c'] = currentDate;
        fields['Status__c'] = 'Published';
        fields['Id'] = this.v2mom.data.fields.Id.value;
        const recordInput = { fields };

        updateRecord(recordInput)
            .then(data => {
                const selectedEvent = new CustomEvent("v2mompublished", {
                    detail: 'v2mompublished'
                });
                this.dispatchEvent(selectedEvent);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Your V2MOM is now Published!!',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Publishing V2MOM',
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.closeConfirmationModal();
            });
    }

    handleChange(event) {
        console.log('event' + event.detail.value);
        const selectEvent = new CustomEvent('fychange', {
            detail: event.detail.value
        });
        this.dispatchEvent(selectEvent);
    }

    handleViewChange(event) {
        console.log('event' + event.target.value);
        const selectedEvent = new CustomEvent("viewchange", {
            detail: event.target.value
        });
        this.dispatchEvent(selectedEvent);
    }

    openPDF() {
        window.open("/apex/V2MOM_SharePDF?id=" + this.v2momId);
    }
}