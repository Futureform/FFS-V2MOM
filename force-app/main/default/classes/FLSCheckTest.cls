@isTest
public class FLSCheckTest {
    @isTest static void isAccessibleTest(){
        
        List<String> fieldNames = new List<String>{'Name'};
        Test.startTest();
        boolean isAccessibleFields = FLSCheck.isAccessible(fieldNames, 'V2MOM__c');
        Test.stopTest();
    }
    @isTest static void isUpdateableTest(){
        List<String> fieldNames = new List<String>{'Name'};
        Test.startTest();
        boolean isUpdateableFields = FLSCheck.isUpdateable(fieldNames, 'V2MOM__c');
        Test.stopTest();
    }
    @isTest static void isCreateableTest(){
        List<String> fieldNames = new List<String>{'Body','ParentId'};
        Test.startTest();
        boolean isCreateableFields = FLSCheck.isCreateable(fieldNames, 'FeedItem');
        Test.stopTest();
    }
    @isTest static void isDeleteableTest(){
        Test.startTest();
        boolean isDeleteableFields = FLSCheck.isDeletable('FeedItem');
        Test.stopTest();
    }
}