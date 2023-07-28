@isTest
public class V2MOMQ_TestClass {
    
    
    
    public static testmethod void recordsCreation(){
        Test.startTest();
        Profile pf = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        
        List<UserRole> urLst = new List<UserRole>();
        urLst.add(new UserRole(Name = 'Finance Approver'));
        urLst.add(new UserRole(Name = 'Finance'));        
        insert urLst;
        
        user manager = V2MOMQ_TestUtil.createTestUser(urLst[0].Id, pf.Id, 'Manager', 'LastName');
        insert manager;
        
        user reportee = V2MOMQ_TestUtil.createTestUser(urLst[1].Id, pf.Id, 'Reportee', 'LastName');
        reportee.ManagerId = manager.Id;
        insert reportee;
        
        Test.stopTest();        
        system.assertNotEquals(manager.Id, null);
        system.assertNotEquals(reportee.Id, null);
        
        System.runAs(reportee) {
            V2MOM__c v2MOMRec = V2MOMQ_TestUtil.createV2MOM();
            String v2momId = v2MOMRec.Id;
            Method__c methodRec  = V2MOMQ_TestUtil.createMethod(v2momId);
            Obstacle__c obstacleRec = V2MOMQ_TestUtil.createObstacle(v2momId);
            Measure__c measureRec = V2MOMQ_TestUtil.createMeasure(methodRec.Id);
            Measure__c assigendMeasureRec = V2MOMQ_TestUtil.createMeasure(methodRec.Id);
            
            Integer currentFY = V2MOM_RootComponentController.getCurrentFY();
            String dateValue = ''+Date.today().year();
            
            String returnedv2momId = V2MOM_RootComponentController.getV2MOMId(''+currentFY,reportee.Id);
            
            V2MOM_RootComponentController.getV2MOMData(reportee.Id,dateValue); 
            V2MOM_RootComponentController.getObstacles(v2momId);
            V2MOM_RootComponentController.getV2MOMMethods(v2momId,'Q1');
            V2MOM_RootComponentController.getAllV2MOMData(reportee.ID);
            V2MOM_RootComponentController.getAllV2MOMFY(reportee.Id);
            V2MOM_RootComponentController.getReportingUsers();
            V2MOM_RootComponentController.getRelatedMeasures(methodRec.ID,'Q1');
            V2MOM_RootComponentController.getFieldApiMap();
            
        }
        System.runAs(manager) {
            V2MOM__c v2MOMRec = V2MOMQ_TestUtil.createV2MOM();
            String v2momId = v2MOMRec.Id;
            Method__c methodRec  = V2MOMQ_TestUtil.createMethod(v2momId);
            Obstacle__c obstacleRec = V2MOMQ_TestUtil.createObstacle(v2momId);
            Measure__c measureRec = V2MOMQ_TestUtil.createMeasure(methodRec.Id);
            
            Measure_Team_Member__c assignedMeasure = V2MOMQ_TestUtil.createAssignedMeasure(measureRec.Id);
            
            Integer currentFY = V2MOM_RootComponentController.getCurrentFY();
            
            String dateValue = ''+Date.today().year();
            
            V2MOM_RootComponentController.getReporteeDetails(manager.Id,dateValue);
            V2MOM_RootComponentController.getManagerV2MOMData(manager.Id,dateValue);
            V2MOM_RootComponentController.checkIsManager(manager.Id);
            V2MOM_RootComponentController.managerEditDetails();
            
        }
        
    }
    
    @isTest static void getManagerEditTest(){
        Profile pf = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        System.debug(pf.Id);
        
        List<UserRole> urLst = new List<UserRole>();
        urLst.add(new UserRole(Name = 'Finance Approver'));
        urLst.add(new UserRole(Name = 'Finance'));        
        insert urLst;
        
        user manager = V2MOMQ_TestUtil.createTestUser(urLst[0].Id,pf.Id,'Manager', 'LastName');
        INSERT manager;
        System.debug(manager.Id);
        
        user reportee = V2MOMQ_TestUtil.createTestUser(urLst[1].Id,pf.Id,'Reportee', 'LastName');
        reportee.ManagerId = manager.Id;
        INSERT reportee;
         
        Test.startTest();
        System.runAs(reportee) {                
            V2MOM__c v2MOM = V2MOMQ_TestUtil.createV2MOM();
            v2MOM.User__c = reportee.Id;
            update v2MOM;
             Boolean val = V2MOM_RootComponentController.getManagerEdit(reportee.Id,v2MOM.Id);
        }
       

        Test.stopTest();
        
        

       
    }
    
    @isTest static void getCurrentQuarterTest(){
        Test.startTest();
        String quarter =V2MOM_RootComponentController.getCurrentQuarter();
        Test.stopTest();
    }
    
    
    public static testmethod void assignedMeasure(){
        
        List<PermissionSetAssignment> permissionSetList = new List<PermissionSetAssignment>();
        Id permissionSetId = [SELECT Id FROM PermissionSet WHERE Name = 'V2MOMAdmin'].Id;
        
        
        Profile pf = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        
        List<UserRole> urLst = new List<UserRole>();
        urLst.add(new UserRole(Name = 'Finance Approver'));
        urLst.add(new UserRole(Name = 'Finance'));        
        insert urLst;
        
        user manager = V2MOMQ_TestUtil.createTestUser(urLst[0].Id, pf.Id, 'Manager', 'LastName');
        insert manager;
        
        user reportee = V2MOMQ_TestUtil.createTestUser(urLst[1].Id, pf.Id, 'Reportee', 'LastName');
        reportee.ManagerId = manager.Id;
        
        insert reportee;
        PermissionSetAssignment psa = new PermissionSetAssignment (PermissionSetId = permissionSetId, AssigneeId = reportee.Id);
        
        
        
        // system.assertNotEquals(reportee.Id, null);
        
        Test.startTest();
        System.runAs(reportee) {
            V2MOM__c v2MOMRec = V2MOMQ_TestUtil.createV2MOM();
            String v2momId = v2MOMRec.Id;
            Method__c methodRec  = V2MOMQ_TestUtil.createMethod(v2momId);
            Measure__c assigendMeasureRec = V2MOMQ_TestUtil.createMeasure(methodRec.Id);
            Integer currentFY = V2MOM_RootComponentController.getCurrentFY();
            String dateValue = ''+Date.today().year();
            
            V2MOM_RootComponentController.getMeasuresData(methodRec.Id,'Q1'); 
            V2MOM_RootComponentController.getAssignedMeasures(reportee.Id, dateValue, 'Q1');
        }
        Test.stopTest();
        
        
    }
    
    public static testmethod void getHistory(){
        
        Profile pf = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        List<PermissionSetAssignment> permissionSetList = new List<PermissionSetAssignment>();
        Id permissionSetId = [SELECT Id FROM PermissionSet WHERE Name = 'V2MOMAdmin'].Id;
        
        List<UserRole> urLst = new List<UserRole>();
        urLst.add(new UserRole(Name = 'Finance Approver'));
        insert urLst;
        
        user reportee = V2MOMQ_TestUtil.createTestUser(urLst[0].Id, pf.Id, 'Reportee', 'LastName');
        
        insert reportee;
        PermissionSetAssignment psa = new PermissionSetAssignment (PermissionSetId = permissionSetId, AssigneeId = reportee.Id);
        
        
        system.assertNotEquals(reportee.Id, null);
        Test.startTest();
        System.runAs(reportee) {
            V2MOM__c v2MOMRec = V2MOMQ_TestUtil.createV2MOM();
            String v2momId = v2MOMRec.Id;
            Method__c methodRec  = V2MOMQ_TestUtil.createMethod(v2momId);
            
            Measure__c assigendMeasureRec = V2MOMQ_TestUtil.createMeasure(methodRec.Id);
            
            Integer currentFY = V2MOM_RootComponentController.getCurrentFY();
            
            String dateValue = ''+Date.today().year();
            methodRec.Description__c = 'New Description';
            update methodRec;
            FeedItem feed = new FeedItem (
                ParentId = v2momId,
                Body = 'Hello',
                Type='CreateRecordEvent'
            );
            //insert feed;
            V2MOM_RootComponentController.getHistory(v2momId);
            Test.stopTest();
            
        }
        
        
    }
}