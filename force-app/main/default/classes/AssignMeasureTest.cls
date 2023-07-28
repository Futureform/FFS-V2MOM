@isTest
public class AssignMeasureTest {
    @isTest static void getMeasureAssigneesTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        Measure_Team_Member__c teamMember = new Measure_Team_Member__c();
        String quarter = 'Q2';
        teamMember.Measure__c = measure.Id;
        teamMember.Q2__c = true;
        teamMember.Q2_Target__c  = 100;
        teamMember.Q2_Value__c  = 40;
        INSERT teamMember;
        
        Test.startTest();
        List<Measure_Team_Member__c> teamMembersList = AssignMeasure.getMeasureAssignees(measure.Id,quarter);
        //List<Measure_Team_Member__c> teamMembersList_1 = AssignMeasure.getMeasureAssignees(measure.Id,'Q5');
        Test.stopTest();
        System.assertEquals(1,teamMembersList.size());
        System.assertEquals(true,teamMembersList[0].Q2__c);
    }
    
    @isTest static void getMeasureTeamMemberRecordTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);      
        
        Measure_Team_Member__c teamMember = new Measure_Team_Member__c();
        String quarter = 'Q2';
        teamMember.Measure__c = measure.Id;
        teamMember.Q2__c = true;
        teamMember.Q2_Target__c  = 100;
        teamMember.Q2_Value__c  = 40;
        INSERT teamMember;
        
        Measure_Team_Member__c teamMember_1 = new Measure_Team_Member__c();
        String quarter_1 = 'Q1';
        teamMember_1.Q1__c = true;
        teamMember_1.Measure__c = measure.Id;
        //teamMember_1.Q2__c = true;
        teamMember_1.Q1_Target__c  = 100;
        teamMember_1.Q1_Value__c  = 40;
        INSERT teamMember_1;
        
        Test.startTest();
        Measure_Team_Member__c teamMemberObj = AssignMeasure.getMeasureTeamMemberRecord(teamMember_1.Id);
        Test.stopTest();
        System.assertEquals(true,teamMemberObj.Q1__c);
        System.assertEquals(false,teamMemberObj.Q2__c);
    }
    
    @isTest static void getMeasureDetailsTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        
        Measure_Team_Member__c teamMember = new Measure_Team_Member__c();
        String quarter = 'Q2';
        teamMember.Measure__c = measure.Id;
        teamMember.Q2__c = true;
        teamMember.Q2_Target__c  = 100;
        teamMember.Q2_Value__c  = 40;
        INSERT teamMember;
        
        Measure_Team_Member__c teamMember_1 = new Measure_Team_Member__c();
        String quarter_1 = 'Q1';
        teamMember_1.Q1__c = true;
        teamMember_1.Measure__c = measure.Id;
        //teamMember_1.Q2__c = true;
        teamMember_1.Q1_Target__c  = 100;
        teamMember_1.Q1_Value__c  = 40;
        INSERT teamMember_1;
        
        Test.startTest();
        Measure__c measure_1 = AssignMeasure.getMeasureDetails(measure.Id,'Q2');
        Test.stopTest();
        System.assertEquals('Obsctacles',measure_1.Obstacles__c);
        System.assertEquals(method.Id,measure_1.Method__c);
    }
}