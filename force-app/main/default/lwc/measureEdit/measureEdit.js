import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, updateRecord, createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MeasureObject from '@salesforce/schema/Measure__c';
import { getObjectInfo,getPicklistValues } from 'lightning/uiObjectInfoApi';
//import getQuarterEndDate from '@salesforce/apex/V2MOM_Measure_Controller.getQuarterEndDate';
import getReportFields from '@salesforce/apex/V2MOM_LinkReportClass.getAggregateFields';
import getReportFieldValue from '@salesforce/apex/V2MOM_LinkReportClass.getAggregateValue';


//Fields to be fetched from Measure
const FIELDSVAL = [
    'Measure__c.Name',
    'Measure__c.Comments__c',
    'Measure__c.Obstacles__c',
    'Measure__c.LastModifiedDate',

    'Measure__c.Q1_Status__c',
    'Measure__c.Q2_Status__c',
    'Measure__c.Q3_Status__c',
    'Measure__c.Q4_Status__c',

    'Measure__c.Q1_Value__c',
    'Measure__c.Q2_Value__c',
    'Measure__c.Q3_Value__c',
    'Measure__c.Q4_Value__c',

    'Measure__c.Q1_Target__c',
    'Measure__c.Q2_Target__c',
    'Measure__c.Q3_Target__c',
    'Measure__c.Q4_Target__c',

    'Measure__c.Q1_Priority__c',
    'Measure__c.Q2_Priority__c',
    'Measure__c.Q3_Priority__c',
    'Measure__c.Q4_Priority__c',

    'Measure__c.Q1__c',
    'Measure__c.Q2__c',
    'Measure__c.Q3__c',
    'Measure__c.Q4__c',
    'Measure__c.Q1_Type__c',
    'Measure__c.Q2_Type__c',
    'Measure__c.Q3_Type__c',
    'Measure__c.Q4_Type__c',
];

const MethodFIELDSVAL = [
    'Method__c.Name',
    'Method__c.Q1__c',
    'Method__c.Q2__c',
    'Method__c.Q3__c',
    'Method__c.Q4__c',
];


export default class MeasureEdit extends LightningElement {

    @api measureId;
    @api methodId;
    @api addmeasure = false;
    @api measureheader;
    @api applicablequarter;


    statusLabel='Status';
    targetLabel='Target Value';
    currentLabel='Current Value';
    

    measure;
    methodName;
    name;
    comment;
    obstacles;

    progressType ='Progress';
    isValuesCompletion = false;
    isProgressCompletion = true;
    currentValue = 0;
    targetValue = 0;

    Q1 = true;
    Q2 = true;
    Q3 = true;
    Q4 = true;
    
    disableSave = true;

    priorityTypes;
    highPriority;
    mediumPriority;
    lowPriority=true;
    priority='Low';

    reportId;
    reportFields = [];
    selectedReportField;


    quarter1 = false;
    quarter2 = false;
    quarter3 = false;
    quarter4 = false;


    disableQ1= false;
    disableQ2= false;
    disableQ3= false;
    disableQ4= false;


    applicableQ1 = true;
    applicableQ2 = true;
    applicableQ3 = true;
    applicableQ4 = true;

    error;

    @wire(getObjectInfo, { objectApiName: MeasureObject })
    measureInfo;

    @wire(getPicklistValues, { recordTypeId: '$measureInfo.data.defaultRecordTypeId', fieldApiName: 'Measure__c.Q1_Status__c'})
    measureStatusValues;

    connectedCallback(){
        this.setInitialQuarterValues();
        this.statusLabel = this.applicablequarter+' Status';
        this.targetLabel = this.applicablequarter+' Target Value';
        this.currentLabel = this.applicablequarter+' Current Value';
    }
    renderedCallback(){
        this.validateData();
    }

    @wire(getRecord, { recordId: '$measureId', fields: FIELDSVAL })
    measureMethod(measureData) {
        console.log(measureData);
        let data = measureData.data;
        let error = measureData.error;
        if (data) {
            this.measure = data;
            this.setInitialValues();
            
        } else if (error) {
            console.log(error);
            this.error=error;
        }
    };
    
    @wire(getRecord, { recordId: '$methodId', fields: MethodFIELDSVAL })
    methodData({ error, data }) {
        if (data) {
            this.methodName = data.fields.Name.value;
            this.quarter1 = data.fields.Q1__c.value;
            this.quarter2 = data.fields.Q2__c.value;
            this.quarter3 = data.fields.Q3__c.value;
            this.quarter4 = data.fields.Q4__c.value;
            //this.applicableQ1 = data.fields.Q1__c.value;
            //this.applicableQ2 = data.fields.Q2__c.value;
            //this.applicableQ3 = data.fields.Q3__c.value;
            //this.applicableQ4 = data.fields.Q4__c.value;
        } else if (error) {
            console.log(error);
            this.error=error;
        }
    };

    /*get disableCompletionDate(){
        if(this.currentQuarter){
            return true;
        } 
        return false;
    }

    get tableClass(){
        if(this.splitEditTarget){
            return "slds-hide";
        }
        return "slds-p-left_small";
    }*/

    get disableReportValueButton(){
        if(this.reportId && this.selectedReportField){
            return false;
        }
        return true;
    }

    get setCurrentValueReadOnly(){
        if(!this.disableReportValueButton || this.splitByQuarter){
            return true;
        }
        return false;
    }

    

    setInitialValues(){
        console.log('setInitialValues');
        console.log(this.measure);
        console.log(this.applicablequarter);

        

        this.name = this.measure.fields.Name.value;
        this.comment = this.measure.fields.Comments__c.value;

        this.currentValue = this.measure.fields[''+this.applicablequarter+'_Value__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Value__c'].value : null;
        this.targetValue = this.measure.fields[''+this.applicablequarter+'_Target__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Target__c'].value : null;
        console.log('currentValue'+this.currentValue + ':::'+ this.targetValue);
        
        
        this.status = this.measure.fields[''+this.applicablequarter+'_Status__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Status__c'].value : null;
        console.log('Status::'+this.status);

        this.obstacles = this.measure.fields.Obstacles__c.value;

        var progressTypeValue = this.measure.fields[''+this.applicablequarter+'_Type__c']  != null ? this.measure.fields[''+this.applicablequarter+'_Type__c'].value : null;
        
        this.priority = this.measure.fields[''+this.applicablequarter+'_Priority__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Priority__c'].value : null;
        console.log('applicable quarters'+this.applicableQ1 + '>>'+this.applicableQ2 +'>>'+ this.applicableQ3+'>>'+ this.applicableQ4);

        if(this.measure.fields.Q1__c.value == false){
            this.applicableQ1 = false;
            this.Q1 = false;
        }
        if(this.measure.fields.Q2__c.value == false){
            this.applicableQ2 = false;
            this.Q2 = false;
        }
        if(this.measure.fields.Q3__c.value == false){
            this.applicableQ3 = false;
            this.Q3 = false;
        }

        if(this.measure.fields.Q4__c.value == false){
            this.applicableQ4 = false;
            this.Q4 = false;
        }
        console.log('applicable quarterslast'+this.applicableQ1 + '>>'+this.applicableQ2 +'>>'+ this.applicableQ3+'>>'+ this.applicableQ4);

        this.setShowStatusorNumbers(progressTypeValue);
        this.setPriority(this.priority);
        this.setInitialQuarterValues();
        this.validateData();
        

        /*

        this.reportId = this.measure.fields.Linked_Report_Id__c.value;
        this.fetchReportFields(true);*/
        
    }

    onQuarterCheck(event){
        var quarter = event.target.dataset.field;
        this[quarter]= event.target.checked;
        this.validateData();

    }
    setInitialQuarterValues(){
        console.log('setInitialQuarterValues'+this.applicablequarter);
       
        
        if(this.applicablequarter == 'Q1'){
            this.Q1 = true;
           
        }else if(this.applicablequarter == 'Q2'){
            this.Q2 = true;
           
        }else if(this.applicablequarter == 'Q3'){
            this.Q3 = true;
           
        }else if(this.applicablequarter == 'Q4'){
            this.Q4 = true;
           
        }

    }

    handleNameChange(event){
        this.name = event.detail.value;
        this.setLength('name',this.name);
        this.validateData();
    }

    handleCommentChange(event){
        this.comment = event.detail.value;
        this.setLength('comment',this.comment);
    }

    handleObstacleChange(event){
        this.obstacles = event.detail.value;
        this.setLength('obstacles',this.obstacles);
    }

    setLength(datafield,value){
        let fieldLengthElement = this.template.querySelector("[data-field='"+datafield+"size']");
        fieldLengthElement.inputText=value;
    }

    handleTrackProgressChange(event){
        console.log('HandleProgressChangeValue'+event.target.value);
        var trackProgress= event.target.value;
        this.setShowStatusorNumbers(trackProgress);
        this.validateData();
    }

    setShowStatusorNumbers(trackProgress){
        console.log('setShowStatusorNumbers'+trackProgress);
        if(trackProgress != null){
            if(trackProgress == 'Completion'){
                this.isValuesCompletion = true;
                this.isProgressCompletion = false;
                this.progressType = 'Completion';

            }
            if(trackProgress == 'Progress'){
                this.isValuesCompletion = false;
                this.isProgressCompletion = true;
                this.progressType = 'Progress';
            }
        }
    }

    handlePriorityChange(event){
        var priority= event.target.value;
        this.setPriority(priority);
        this.validateData();
    }


    

    setPriority(priority){
        if(priority != null){
            if(priority == 'High'){
                this.priority = 'High';
                this.highPriority = true;
                this.mediumPriority = false;
                this.lowPriority = false;
            } else if(priority == 'Medium'){
                this.priority = 'Medium';
                this.highPriority = false;
                this.mediumPriority = true;
                this.lowPriority = false;
            } else if(priority == 'Low'){
                this.priority = 'Low';
                this.highPriority = false;
                this.mediumPriority = false;
                this.lowPriority = true;
            }
        }
    }

    handleQuarterChange(event){
        console.log(event.target.value);
        var quarterSelected = event.target.value;
        this.currentQuarter = event.target.value;
        getQuarterEndDate({currentQuarter : quarterSelected.substr(1)})
        .then(result => {
            this.completionDate = result;
            this.template.querySelector("[data-field='addcompletiondate']").value = result;
        })
        .catch(error => {
            console.log('handleQuarterChange Error->' + error.body);
        });
    }


    checkFieldValue(datafield){
        var fieldValue;
        let queryElement = this.template.querySelector("[data-field='"+datafield+"']");
        if(queryElement != null){
            if(queryElement.value != null){
                fieldValue = queryElement.value;
            }else{
                fieldValue = null;
            }
        }
        else{
            fieldValue = null;
        }
        return fieldValue;
    }

    setApplicableQuartersonSave(){
        console.log('applicable quarters'+this.applicableQ1 + '>>'+this.applicableQ2 +'>>'+ this.applicableQ3+'>>'+ this.applicableQ4);

        if(this.applicableQ1){
            this.Q1 = true;
        }else if(this.applicableQ2){
            this.Q2 = true;
        }else if(this.applicableQ3){
            this.Q3 = true;
        }else if(this.applicableQ4){
            this.Q4 = true;
        }
        
    }

    validateData(){
        
        console.log('Status'+this.checkFieldValue('status'));
        if(this.checkFieldValue('name').length < 5){
            this.disableSave =  true;
            console.log('Name Disable');
        } else if(this.isValuesCompletion && (!this.checkFieldValue('targetvalue')  || !this.checkFieldValue('currentvalue'))) {
            console.log('tets'+this.checkFieldValue('targetvalue')  + this.checkFieldValue('currentvalue'));
                this.disableSave = true;
                console.log('isValuesCompletion Disable');
        } else if(this.isProgressCompletion && !this.checkFieldValue('status')){
            this.disableSave = true;
            
            console.log('isProgressCompletion Disable');
        } else if(!this.highPriority && !this.mediumPriority  && !this.lowPriority){
           this.disableSave = true;
           console.log('highPriority Disable');
        } else if((this.reportId && !this.selectedReportField) ||  (!this.reportId && this.selectedReportField)){
           // this.disableSave = true;
        } else if(!(this.Q1 || this.Q2 || this.Q3 || this.Q4)){
            this.disableSave = true;
            console.log('Q1 Q2 Disable');
        } else {
            this.disableSave = false;
        }
        console.log('DisableSaveInValidate'+this.disableSave);
    }
    
    updateOrcreateMeasure() {
        //this.setApplicableQuartersonSave();
        console.log('updateOrcreateMeasure');
        const fields = {};
        fields['Name'] = this.setUpdateFieldValues('name');
        fields['Comments__c'] = this.setUpdateFieldValues('comment');
        fields['Obstacles__c'] = this.setUpdateFieldValues('obstacles');
        fields['Method__c'] = this.methodId;
        
        fields[''+this.applicablequarter+'_Priority__c'] = this.priority;
        console.log('this.priority'+this.priority);
        console.log('quarterSelected');
        console.log('Qaurters'+this.Q1+'>>'+this.Q2+'>>'+this.Q3+'>>'+ this.Q4);
        console.log('applicable quarters'+this.applicableQ1 + '>>'+this.applicableQ2 +'>>'+ this.applicableQ3+'>>'+ this.applicableQ4);

        if(this.Q1){
            fields['Q1__c'] = true;
        }else{
            fields['Q1__c'] = false;
        }
        if(this.Q2){
            fields['Q2__c'] = true;
        }else{
            fields['Q2__c'] = false;
        }
        if(this.Q3){
            fields['Q3__c'] = true;
        }else{
            fields['Q3__c'] = false;
        }
        
        if(this.Q4){
            fields['Q4__c'] = true;
        }else{
            fields['Q4__c'] = false;
        }

        
        /*fields['Q2__c'] = this.Q2;
        fields['Q3__c'] = this.Q3;
        fields['Q4__c'] = this.Q4;*/
        console.log('quarterSelection'+this.Q1 + this.Q2+this.Q3+this.Q4);
        console.log('Progress'+this.progressType);
        fields[''+this.applicablequarter+'_Type__c'] = this.progressType;

        if(this.isValuesCompletion){
            fields[''+this.applicablequarter+'_Target__c'] = this.setUpdateFieldValues('targetvalue');
            console.log('targetvalue'+this.setUpdateFieldValues('targetvalue'));
            fields[''+this.applicablequarter+'_Value__c'] = this.setUpdateFieldValues('currentvalue');
            console.log('targetvalue'+this.setUpdateFieldValues('currentvalue'));

        }
        else if(this.isProgressCompletion){
            console.log('status'+this.setUpdateFieldValues('status'));
            fields[''+this.applicablequarter+'_Status__c'] = this.setUpdateFieldValues('status');
        }
        
        /*fields['Linked_Report_Id__c'] = this.reportId;
        fields['Linked_Report_Field_Name__c'] = this.selectedReportField;*/
        
        if (this.addmeasure) {
            this.createMeasure(fields);
        } else {
            fields['Id'] = this.measureId;
            this.updateMeasure(fields);
        }
    }

    createMeasure(fields) {
        const recordInput = { apiName: MeasureObject.objectApiName, fields };
        createRecord(recordInput)
        .then(data => {
            this.closeModal();
            this.refreshContainer();
            this.showSuccessToastMessage('Success', 'Measure created successfully!!');
        })
        .catch(error => {
            console.log(error);
            this.closeModal();
            this.showErrorToastMessage('Error', 'Error creating record!!');
        });
    }
    

    updateMeasure(fields) {
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(data => {
            this.closeModal();
            
            this.showSuccessToastMessage('Success', 'Measure updated successfully!!');
        })
        .catch(error => {
            this.closeModal();
            this.showErrorToastMessage('Error', 'Error updating record!!');
        });
    }

    
    
    

    compareCurrentTargetValues(){
        console.log('compareValues'+this.checkFieldValue('targetvalue') < this.checkFieldValue('currentValue'));
        if(this.checkFieldValue('targetvalue') < this.checkFieldValue('currentValue')){
            return true;
        }
        return false;
    }


    setUpdateFieldValues(datafield){
        var fieldValue;
        let queryElement = this.template.querySelector("[data-field='"+datafield+"']");
        
        if(queryElement != null){
            if(queryElement.value != null){
                fieldValue = queryElement.value;
            }else{
                fieldValue = null;
            }
        }
        else{
            fieldValue = null;
        }
        return fieldValue;
    }
    
    refreshMethod() {
        console.log('refreshMethod');
        this.setInitialValues();

        if(this.progressType == 'Progress'){
            this.template.querySelector("[data-field='status']").value = this.measure.fields[''+this.applicablequarter+'_Status__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Status__c'].value : null;
        }
        else{
            this.template.querySelector("[data-field='targetvalue']").value = this.measure.fields[''+this.applicablequarter+'_Target__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Target__c'].value : null;
            this.template.querySelector("[data-field='currentvalue']").value = this.measure.fields[''+this.applicablequarter+'_Value__c'] != null ? this.measure.fields[''+this.applicablequarter+'_Value__c'].value : null;
        }
        
        
        

        
       /* this.template.querySelector("[data-field='name']").value = this.measure.fields.Name.value;
        this.template.querySelector("[data-field='comment']").value = this.measure.fields.Comments__c.value;
        this.template.querySelector("[data-field='obstacles']").value = this.measure.fields.Obstacles__c.value;

        this.template.querySelector("[data-field='targetvalue']").value = this.measure.fields[this.applicablequarter+'_Value__c'].value;
        this.template.querySelector("[data-field='currentvalue']").value = this.measure.fields[this.applicablequarter+'_Target__c'].value;
        this.template.querySelector("[data-field='status']").value = this.measure.fields[this.applicablequarter+'_Status__c'].value;
        this.template.querySelector("[data-field='priority']").value = this.measure.fields[this.applicablequarter+'_Priority__c'].value;
        this.template.querySelector("[data-field='progressType']").value = this.measure.fields[this.applicablequarter+'_Type__c'].value;*/

        /*this.template.querySelector("[data-field='Q1']").value = this.measure.fields.Q1__c.value;*/
       
        
    }


    refreshContainer() {
        const selectedEvent = new CustomEvent("refreshmeasures", {
            detail: 'refreshmeasures',
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(selectedEvent);
    }
    
    closeModal() {
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'close'
        });
        this.dispatchEvent(selectedEvent);
    }

    showSuccessToastMessage(title, message) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'success'
        });
        this.dispatchEvent(evt);
    }

    showErrorToastMessage(title, message) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'error'
        });
        this.dispatchEvent(evt);
    }
 
    handleReportSelected(event){
        this.reportId = event.detail.value;
        this.reportFields = [];
        this.selectedReportField = '';
        this.fetchReportFields();
        this.validateData();
    }

    fetchReportFields(isInit=false){
        if(this.reportId){
            getReportFields({rId : this.reportId})
            .then(result => {
                this.reportFields = result;
                if(isInit){
                    this.selectedReportField = this.measure.fields.Linked_Report_Field_Name__c.value;
                }
            })
            .catch(error => {
                console.log('handleReportSelected Error->' + error.body);
            });
        }
    }

    setReportField(event){
        this.selectedReportField = event.target.value;
        this.validateData();
    }

    fetchValueFromReport(){
        if(this.reportId && this.selectedReportField){
            getReportFieldValue({rId : this.reportId,aggName : this.selectedReportField})
            .then(result => {
                this.currentValue = result;
                console.log('here-->'+this.currentValue);
            })
            .catch(error => {
                console.log('fetchValueFromReport Error->' + error.body);
            });
        }
    }

    // To be removed later - sept28
    handleQuarterTotal(event){
        let sumCurrentValue=0;
        let sumTargetValue=0;
        console.log(event.target.value);
        for(var i=1; i<=4; i++){
            let currentQuarter = 'Q'+i+'EditCurrent';
            let targetQuarter = 'Q'+i+'EditTarget';
            let currentQVal = this.template.querySelector("[data-field='"+currentQuarter+"']").value;
            let targetQVal = this.template.querySelector("[data-field='"+targetQuarter+"']").value;
            if(! isNaN(currentQVal) && currentQVal){
                sumCurrentValue += parseFloat(currentQVal);        
            }
            if(! isNaN(targetQVal) && targetQVal){
                sumTargetValue += parseFloat(targetQVal);        
            }
        }
        this.currentValue = sumCurrentValue;
        this.targetValue = sumTargetValue;
    }

    handleSplitEvent(event){
        let isChecked =  event.target.checked;
        this.handleQuarterSplit(isChecked);
    }

    handleQuarterSplit(isChecked){
        this.splitByQuarter = isChecked;
        this.splitEditTarget = !isChecked;
        if(this.template.querySelector("[data-field='targetvalue']")){
            this.calculateQuarterDivision();
        }
    }

    calculateQuarterDivision(){
        var splitByQuarter = this.splitByQuarter;
        var targetValue =  this.template.querySelector("[data-field='targetvalue']").value;
        var totalSplitValue = 0;

        if(splitByQuarter){
            var splitValue = targetValue/4; 
            for(var i=1; i<5; i++){
                totalSplitValue += parseFloat(splitValue.toFixed(2));
                var targetQuarter = 'Q'+i+'EditTarget';
                this.template.querySelector("[data-field='"+targetQuarter+"']").value = parseFloat(splitValue.toFixed(2));
            }

            if(totalSplitValue < targetValue){
                var currentQuarter = this.currentQuarter+'EditTarget';
                var currentQuarterValue = this.template.querySelector("[data-field='"+currentQuarter+"']").value;
                var tempNumber = (targetValue - totalSplitValue) + currentQuarterValue;
                this.template.querySelector("[data-field='"+currentQuarter+"']").value = parseFloat(tempNumber.toFixed(2));
                
            }else if(totalSplitValue > targetValue){
                var currentQuarter = this.currentQuarter+'EditTarget';
                var currentQuarterValue = this.template.querySelector("[data-field='"+currentQuarter+"']").value;
                var tempNumber = currentQuarterValue - (totalSplitValue - targetValue);
                this.template.querySelector("[data-field='"+currentQuarter+"']").value = parseFloat(tempNumber.toFixed(2));
                
            }
        }
    }


    /*
    handleQuarterSelection(event){
        
        var quarterSelected = event.target.dataset.field;
        var quarterchecked = event.target.checked;
        this.setQuarterSelections(quarterSelected,quarterchecked);
        this.validateData();

    }

    setQuarterSelections(quarterSelected,quarterchecked){

        if(quarterSelected == 'Q1'){
            this.Q1 = quarterchecked;
        }
        if(quarterSelected == 'Q2'){
            this.Q2 = quarterchecked;
        }
        if(quarterSelected == 'Q3'){
            this.Q3 = quarterchecked;
        }
        if(quarterSelected == 'Q4'){
            this.Q4 = quarterchecked;
        }
    }
    */
}