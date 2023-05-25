@isTest
public class LookupControllerTest {
    @isTest static void findRecordsTestMethod(){

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
            List<SObject> users = LookupController.findRecords('lookupUser','User','');
            List<SObject> users_1 = LookupController.findRecords('lookupUser','User','ManagerId = \''+manager.Id+'\'');
            System.debug(users);
        	
        Test.stopTest();


    }
}