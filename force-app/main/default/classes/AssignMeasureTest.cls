@isTest
public class AssignMeasureTest {
    @isTest static void getMeasureAssigneesTestMethod(){
        V2MOMQ__V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        V2MOMQ__Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        V2MOMQ__Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        V2MOMQ__Measure_Team_Member__c teamMember = new V2MOMQ__Measure_Team_Member__c();
        String quarter = 'Q2';
        teamMember.V2MOMQ__Measure__c = measure.Id;
        teamMember.V2MOMQ__Q2__c = true;
        teamMember.V2MOMQ__Q2_Target__c  = 100;
        teamMember.V2MOMQ__Q2_Value__c  = 40;
        INSERT teamMember;
        
        Test.startTest();
        List<V2MOMQ__Measure_Team_Member__c> teamMembersList = AssignMeasure.getMeasureAssignees(measure.Id,quarter);
        //List<V2MOMQ__Measure_Team_Member__c> teamMembersList_1 = AssignMeasure.getMeasureAssignees(measure.Id,'Q5');
        Test.stopTest();
        System.assertEquals(1,teamMembersList.size());
        System.assertEquals(true,teamMembersList[0].V2MOMQ__Q2__c);
    }
    
    @isTest static void getMeasureTeamMemberRecordTestMethod(){
        V2MOMQ__V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        V2MOMQ__Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        V2MOMQ__Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);      
        
        V2MOMQ__Measure_Team_Member__c teamMember = new V2MOMQ__Measure_Team_Member__c();
        String quarter = 'Q2';
        teamMember.V2MOMQ__Measure__c = measure.Id;
        teamMember.V2MOMQ__Q2__c = true;
        teamMember.V2MOMQ__Q2_Target__c  = 100;
        teamMember.V2MOMQ__Q2_Value__c  = 40;
        INSERT teamMember;
        
        V2MOMQ__Measure_Team_Member__c teamMember_1 = new V2MOMQ__Measure_Team_Member__c();
        String quarter_1 = 'Q1';
        teamMember_1.V2MOMQ__Q1__c = true;
        teamMember_1.V2MOMQ__Measure__c = measure.Id;
        //teamMember_1.V2MOMQ__Q2__c = true;
        teamMember_1.V2MOMQ__Q1_Target__c  = 100;
        teamMember_1.V2MOMQ__Q1_Value__c  = 40;
        INSERT teamMember_1;
        
        Test.startTest();
        V2MOMQ__Measure_Team_Member__c teamMemberObj = AssignMeasure.getMeasureTeamMemberRecord(teamMember_1.Id);
        Test.stopTest();
        System.assertEquals(true,teamMemberObj.V2MOMQ__Q1__c);
        System.assertEquals(false,teamMemberObj.V2MOMQ__Q2__c);
    }
    
    @isTest static void getMeasureDetailsTestMethod(){
        V2MOMQ__V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        V2MOMQ__Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        V2MOMQ__Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        
        V2MOMQ__Measure_Team_Member__c teamMember = new V2MOMQ__Measure_Team_Member__c();
        String quarter = 'Q2';
        teamMember.V2MOMQ__Measure__c = measure.Id;
        teamMember.V2MOMQ__Q2__c = true;
        teamMember.V2MOMQ__Q2_Target__c  = 100;
        teamMember.V2MOMQ__Q2_Value__c  = 40;
        INSERT teamMember;
        
        V2MOMQ__Measure_Team_Member__c teamMember_1 = new V2MOMQ__Measure_Team_Member__c();
        String quarter_1 = 'Q1';
        teamMember_1.V2MOMQ__Q1__c = true;
        teamMember_1.V2MOMQ__Measure__c = measure.Id;
        //teamMember_1.V2MOMQ__Q2__c = true;
        teamMember_1.V2MOMQ__Q1_Target__c  = 100;
        teamMember_1.V2MOMQ__Q1_Value__c  = 40;
        INSERT teamMember_1;
        
        Test.startTest();
        V2MOMQ__Measure__c measure_1 = AssignMeasure.getMeasureDetails(measure.Id,'Q2');
        Test.stopTest();
        System.assertEquals('Obsctacles',measure_1.V2MOMQ__Obstacles__c);
        System.assertEquals(method.Id,measure_1.V2MOMQ__Method__c);
    }
}