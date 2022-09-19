import { LightningElement, wire, api } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import Actual_Target from '@salesforce/schema/Measure_Team_Member__c.Q1_Target__c'
import ID_FIELD from '@salesforce/schema/Measure_Team_Member__c.Id'
import getMeasureAssignees from '@salesforce/apex/AssignMeasure.getMeasureAssignees';
import getMeasureTeamMemberRecord from '@salesforce/apex/AssignMeasure.getMeasureTeamMemberRecord';
import USER_ID from '@salesforce/user/Id';
import USER_FIELD from '@salesforce/schema/Measure_Team_Member__c.Team_Member__c';
import MEASURE_FIELD from '@salesforce/schema/Measure_Team_Member__c.Measure__c';
import { refreshApex } from '@salesforce/apex';
import MEASURE_OBJ from '@salesforce/schema/Measure__c';
import MEASURE_Id from '@salesforce/schema/Measure__c.Id';
import MEASURE_NAME from '@salesforce/schema/Measure__c.Name';
import COMMENTS from '@salesforce/schema/Measure__c.Comments__c';
import OBSTACLES from '@salesforce/schema/Measure__c.Obstacles__c';
import METHOD from '@salesforce/schema/Measure__c.Method__c';
import IS_ASSIGNED_MEASURE from '@salesforce/schema/Measure__c.Is_Assigned_Measure__c';
import Measure_Team_Member__c from '@salesforce/schema/Measure_Team_Member__c';
import ID_MEMBER_FIELD from '@salesforce/schema/Measure_Team_Member__c.Id';
import getMeasureDetails from '@salesforce/apex/AssignMeasure.getMeasureDetails';



export default class AssignMeasure extends LightningElement {

    namesapce = '';
    userId = USER_ID;
    currMeasureTeamRecs = [];
    error;
    measureTeamList = [];
    allTeamList = [];
    queryString = '';
    @api measureId;
    @api methodId;
    @api currentQuarter;
    results;
    //removeMembers = [];
    isRemoveMember = false;
    removeUserId = '';
    removeMemberId = '';
    comment;

    sumTarget = 0;
    sumAchieved = 0;
    disableSave;

    priorityTypes;
    highPriority;
    mediumPriority;
    lowPriority = true;
    priority = 'Low';
    obstacles;

    managerMeasureCurrentValue = {};


    @wire(getMeasureDetails, { measureId: '$measureId', quarter: '$currentQuarter' })
    measureDetails({ error, data }) {
        if (error) {
            console.log(error)
        }
        else if (data) {
            this.obstacles = data.Obstacles__c;
            let priortyField = this.namesapce + this.currentQuarter + '_Priority__c';
            this.setPriority(data[priortyField]);
        }
    }



    @wire(getMeasureAssignees, { MeasureId: '$measureId', quarter: '$currentQuarter' })
    wiredMeasureAssignees(value) {
        this.results = value;
        const { data, error } = value;
        let fieldName = this.namesapce + this.currentQuarter + '_Target__c'
        let fieldValue = this.namesapce + this.currentQuarter + '_Value__c';
        let quarterField = this.namesapce + this.currentQuarter + '__c';
        if (data) {
            this.allTeamList = JSON.parse(JSON.stringify(data)).map(item => {
                item.applicableValue = item[fieldValue];
                item.applicableTarget = item[fieldName] ? item[fieldName] : 0;
                return item;
            })
            console.log(this.allTeamList);
            this.measureTeamList = this.allTeamList.filter(item => (item[quarterField]))

            this.measureTeamList.map(item => {
                if (item.applicableValue)
                    this.sumAchieved = this.sumAchieved + item.applicableValue;
                if (item.applicableTarget)
                    this.sumTarget = this.sumTarget + item.applicableTarget;
                if (item['Team_Member__r'].Id === this.userId) {
                    item.isLoggedInUser = true;
                }
            });
            console.log(this.sumAchieved);

        } else if (error) {
            this.error = error;
        }
    }

    connectedCallback() {
        this.queryString = this.queryString + '(ManagerId = \'' + this.userId + '\'' + ' OR Id = \'' + this.userId + '\')';
    }

    handlePriorityChange(event) {
        var priority = event.target.value;
        this.setPriority(priority);
        this.validateData();
    }

    setPriority(priority) {
        if (priority != null) {
            if (priority == 'High') {
                this.priority = 'High';
                this.highPriority = true;
                this.mediumPriority = false;
                this.lowPriority = false;
            } else if (priority == 'Medium') {
                this.priority = 'Medium';
                this.highPriority = false;
                this.mediumPriority = true;
                this.lowPriority = false;
            } else if (priority == 'Low') {
                this.priority = 'Low';
                this.highPriority = false;
                this.mediumPriority = false;
                this.lowPriority = true;
            }
        }
    }

    handleCommentChange(event) {
        this.comment = event.detail.value;
        this.setLength('comment', this.comment);
    }

    handleNameChange(event) {
        this.name = event.detail.value;
        this.setLength('name', this.name);
        this.validateData();
    }

    handleObstacleChange(event) {
        this.obstacles = event.detail.value;
        this.setLength('obstacles', this.obstacles);
    }

    setLength(datafield, value) {
        let fieldLengthElement = this.template.querySelector("[data-field='" + datafield + "size']");
        fieldLengthElement.inputText = value;
    }

    checkFieldValue(datafield) {
        var fieldValue;
        let queryElement = this.template.querySelector("[data-field='" + datafield + "']");
        if (queryElement != null) {
            if (queryElement.value != null) {
                fieldValue = queryElement.value;
            } else {
                fieldValue = null;
            }
        }
        else {
            fieldValue = null;
        }
        return fieldValue;
    }

    validateData() {
        console.log(this.highPriority);
        console.log(this.mediumPriority);
        console.log(this.lowPriority);
        if (this.checkFieldValue('name').length < 5) {
            this.disableSave = true;
            console.log('Name Disable');
        } else if (!this.highPriority && !this.mediumPriority && !this.lowPriority) {
            this.disableSave = true;
            console.log('highPriority Disable');
        } else {
            this.disableSave = false;
        }
    }

    updateQuarterFieldInMeasure(quarterField) {
        let fields = {};
        fields[MEASURE_Id.fieldApiName] = this.measureId;
        fields[quarterField] = true;
        const recordInput = { fields };
        updateRecord(recordInput);
    }

    createAndUpdate() {
        let fieldName = this.namesapce + this.currentQuarter + '_Target__c'
        let quarterField = this.namesapce + this.currentQuarter + '__c';
        this.updateQuarterFieldInMeasure(quarterField);
        let promises = this.currMeasureTeamRecs.map(item => {
            const fields = {};
            if (!item.recId.startsWith("newMeasureTeamMember")) {
                fields[ID_FIELD.fieldApiName] = item.recId;
                fields[fieldName] = item.currActualTarget;
                fields[quarterField] = true;
                //console.log(quarterField);
                console.log(fields);
                const recordInput = { fields };
                return updateRecord(recordInput);
            }
            else {
                fields[fieldName] = item.currActualTarget;
                fields[USER_FIELD.fieldApiName] = item.userId;
                fields[MEASURE_FIELD.fieldApiName] = this.measureId;
                fields[quarterField] = true;
                console.log(fields);
                console.log("Create Record" + quarterField);
                let objRecordInput = { 'apiName': 'Measure_Team_Member__c', fields };
                return createRecord(objRecordInput);
            }
        });

        Promise.all(promises).then((data) => {
            console.log(data);

            JSON.parse(JSON.stringify(data)).map(item => {
                if (item.fields['Team_Member__c'].value === this.userId) {
                    this.managerMeasureCurrentValue.Id = item.id;
                    //console.log('recordId===>' + recordId);
                }
            });
            if (this.managerMeasureCurrentValue.Id)
                this.saveCurrentValue();
            if (data.length > 0) {
                refreshApex(this.results).then(() => {
                    const evt = new ShowToastEvent({
                        title: "Success",
                        message: "Measures assigned successfully.",
                        variant: "success",
                    });
                    this.dispatchEvent(evt);
                })
            }
            this.currMeasureTeamRecs = [];
            this.closeModal();
        }).catch(err => {
            console.log(err);
        });
    }

    saveAssignments(event) {
        if (this.measureId)
            this.createAndUpdate();
        else {
            const fields = {};
            fields[MEASURE_NAME.fieldApiName] = this.checkFieldValue('name');
            fields[COMMENTS.fieldApiName] = this.checkFieldValue('comment');
            let quarterPriority = this.namesapce + this.currentQuarter + '_Priority__c';
            fields[quarterPriority] = this.priority;
            fields[OBSTACLES.fieldApiName] = this.checkFieldValue('obstacles');
            fields[METHOD.fieldApiName] = this.methodId;
            fields[IS_ASSIGNED_MEASURE.fieldApiName] = true;
            const recordInput = { apiName: MEASURE_OBJ.objectApiName, fields };
            createRecord(recordInput)
                .then(response => {
                    this.measureId = response.id;
                    console.log(this.measureId);
                    this.createAndUpdate();
                })
        }
    }


    calculateTarget() {
        let totaltarget = 0;
        this.template.querySelectorAll('[data-type="target"]').forEach(element => {
            if (element.value) {
                totaltarget = totaltarget + parseInt(element.value);
            }
        })
        this.sumTarget = totaltarget;
    }

    handleTargetChange(event) {
        let currActualTarget = event.target.value;
        let recId = event.target.dataset.recid;
        let userId = event.target.dataset.teammemid;
        this.calculateTarget();

        let redIds = this.currMeasureTeamRecs.map(item => {
            return item.recId;
        })

        let obj = {};
        obj.recId = recId;
        obj.currActualTarget = currActualTarget;
        obj.userId = userId;
        obj['Team_Member__r'] = {
            Id: userId
        }

        if (!redIds.includes(recId)) {
            this.currMeasureTeamRecs.push(obj);
            console.log(this.currMeasureTeamRecs);
        } else {
            this.currMeasureTeamRecs = this.currMeasureTeamRecs.map(item => {
                if (item.recId === recId) {
                    item.currActualTarget = currActualTarget;
                    return item;
                }
                else
                    return item;
            });
        }

    }

    closeAssign(event) {
        this.currMeasureTeamRecs = [];
        //this.removeMembers = [];
        refreshApex(this.results).then(() => {
            console.log('Records refreshed');
        });
    }

    //Q1_Target__c, Team_Member__c
    handleUserSelect(event) {
        let userId = event.detail.selectedRecordId;
        let userName = event.detail.selectedValue;

        //push item in both the lists

        let userIds = this.measureTeamList.map(item => {
            return item['Team_Member__r'].Id;
        })

        if (!userIds.includes(userId)) {

            let users = this.allTeamList.map(item => {
                return item.Team_Member__r.Id;
            });

            if (users.includes(userId)) {
                this.allTeamList.map(item => {
                    if (item.Team_Member__r.Id === userId) {
                        this.measureTeamList.push(
                            {
                                'Id': item.Id,
                                'Q1_Target__c': 0,
                                'applicableTarget': 0,
                                'Q1_Value__c': 0,
                                'applicableValue': 0,
                                'Team_Member__c': userId,
                                'Team_Member__r': { 'Name': userName, 'Id': userId },
                                'isLoggedInUser': this.userId === userId
                            }
                        );
                    }
                });

            }
            else {
                this.measureTeamList.push(
                    {
                        'Id': 'newMeasureTeamMember_' + userId,
                        'Q1_Target__c': 0,
                        'applicableTarget': 0,
                        'Q1_Value__c': 0,
                        'applicableValue': 0,
                        'Team_Member__c': userId,
                        'Team_Member__r': { 'Name': userName, 'Id': userId },
                        'isLoggedInUser': this.userId === userId
                    }
                );
            }
            this.measureTeamList = JSON.parse(JSON.stringify(this.measureTeamList));
        }
        else {
            this.template.querySelector('[data-teammemrowid="' + userId + '"]').classList.add('highlight');
            setTimeout(() => {
                this.template.querySelector('[data-teammemrowid="' + userId + '"]').classList.remove('highlight');
            }, 2000)
        }
    }

    remove(event) {
        this.removeUserId = event.detail.userId;
        this.removeMemberId = event.detail.memberId;
        this.isRemoveMember = true;
    }

    handleCancelDelete() {
        this.removeUserId = '';
        this.removeMemberId = '';
        this.isRemoveMember = false;
    }

    handleRemoveMember(event) {
        let userId = event.detail.userId;
        let memberId = event.detail.memberId;
        let quarterField = this.namesapce + this.currentQuarter + '__c';
        let quarterTarget = this.namesapce + this.currentQuarter + '_Target__c';
        let quarterValue = this.namesapce + this.currentQuarter + '_Value__c';
        let remainingQuarters = quarterField === 'Q1__c' ? ['Q2__c', 'Q3__c', 'Q4__c'] : quarterField === 'Q2__c' ? ['Q1__c', 'Q3__c', 'Q4__c'] : quarterField === 'Q3__c' ? ['Q1__c', 'Q2__c', 'Q4__c'] : ['Q1__c', 'Q2__c', 'Q3__c'];
        if (!memberId.startsWith("newMeasureTeamMember")) {
            getMeasureTeamMemberRecord({ teamMemberId: memberId })
                .then(data => {
                    console.log(data);
                    if (data[remainingQuarters[0]] || data[remainingQuarters[1]] || data[remainingQuarters[2]]) {
                        const fields = {};
                        fields[ID_FIELD.fieldApiName] = memberId;
                        //fields[fieldName] = item.currActualTarget;
                        fields[quarterField] = false;
                        fields[quarterTarget] = 0;
                        fields[quarterValue] = 0;
                        const recordInput = { fields };

                        updateRecord(recordInput)
                            .then(() => {
                                const deleteEvt = new ShowToastEvent({
                                    title: 'Success',
                                    message: 'Measures Team Member deleted successfully',
                                    variant: 'success'
                                });
                                this.dispatchEvent(deleteEvt);
                                this.removeMemberFromLists(userId);
                                this.calculateTarget();
                            })
                    }
                    else {
                        deleteRecord(memberId)
                            .then(() => {
                                /*refreshApex(this.results).then(() => {
                                });*/

                                const deleteEvt = new ShowToastEvent({
                                    title: 'Success',
                                    message: 'Measures Team Member deleted successfully',
                                    variant: 'success'
                                });
                                this.dispatchEvent(deleteEvt);
                                this.removeMemberFromLists(userId);
                                this.allTeamList = this.allTeamList.filter(item => (!(item.Team_Member__r.Id === userId)));
                                this.calculateTarget();
                            })
                    }

                })

        }
        else {
            this.removeMemberFromLists(userId);
            this.calculateTarget();
            //this.removeMembers = this.removeMembers.filter(item => (!(item.userId === userId)));
        }

        this.handleCancelDelete();

    }

    removeMemberFromLists(userId) {
        this.measureTeamList = this.measureTeamList.filter(item => (!(item.Team_Member__r.Id === userId)));
        this.currMeasureTeamRecs = this.currMeasureTeamRecs.filter(item => (!(item.Team_Member__r.Id === userId)));
    }

    closeModal() {
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'close'
        });
        this.dispatchEvent(selectedEvent);
    }

    handleUserCurrentValueChange(event) {
        this.managerMeasureCurrentValue.value = event.target.value;
        if (!event.target.dataset.record.startsWith('newMeasureTeamMember'))
            this.managerMeasureCurrentValue.Id = event.target.dataset.record;
    }

    //Saves the current value of the manager into the record
    saveCurrentValue() {
        let currentValueFieldName = this.namesapce + this.currentQuarter + '_Value__c';
        const fields = {};
        fields[ID_MEMBER_FIELD.fieldApiName] = this.managerMeasureCurrentValue.Id;
        fields[currentValueFieldName] = this.managerMeasureCurrentValue.value;
        const recordInput = { fields };
        updateRecord(recordInput).then(() => {
            const evt = new ShowToastEvent({
                title: "Success",
                message: "Successfully Updated the Current Value.",
                variant: "success",
            });
            this.dispatchEvent(evt);
        })

        console.log('In save current Value');
    }

}