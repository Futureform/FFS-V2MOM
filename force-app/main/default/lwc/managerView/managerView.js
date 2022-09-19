import { LightningElement, api, wire, track } from 'lwc';
import getV2MomDetails from '@salesforce/apex/V2MOM_RootComponentController.getReporteeDetails';

export default class ManagerView extends LightningElement {
    @api managerId = '0055e000006fy1dAAA';
    @api fy = '2021';
    @track gridData = [];

    @wire(getV2MomDetails, {
        managerId: '$managerId',
        year: '$fy'
    })
    wiredRecord({ error, data }) {
        if (data) {
            let dataClone = JSON.parse(JSON.stringify(data));
            var transformedData = dataClone.filter(function (item) {
                if (item.LastModifiedDate) {
                    var date = new Date(item.LastModifiedDate);
                    item.modifiedDate = date.toISOString().substring(0, 10);
                } else {
                    item.modifiedDate = 'NA';
                }
                item.link = '/' + item.Id;
                if (!item.Q1_Progress__c) {
                    item.Q1_Progress__c = 0;
                }
                if (!item.Q2_Progress__c) {
                    item.Q2_Progress__c = 0;
                }
                if (!item.Q3_Progress__c) {
                    item.Q3_Progress__c = 0;
                }
                if (!item.Q4_Progress__c) {
                    item.Q4_Progress__c = 0;
                }
                return item;
            });

            this.gridData = transformedData;
        }
    }

    get checkgridData() {
        return this.gridData.length > 0 ? true : false;
    }

}