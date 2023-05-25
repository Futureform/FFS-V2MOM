@isTest
public class V2MOM_SharePDFCtrlTest { 
    @isTest static void fetchObstaclesTest(){
        V2MOMQ__V2MOM__c v2momRecord = V2MOMQ_TestUtil.createV2MOM();
        V2MOMQ__Obstacle__c obs_1 = V2MOMQ_TestUtil.createObstacle(v2momRecord.Id);
        V2MOMQ__Obstacle__c obs_2 = V2MOMQ_TestUtil.createObstacle(v2momRecord.Id);
        
        Test.startTest();
        ApexPages.StandardController sc = new ApexPages.StandardController(v2momRecord);
        V2MOM_SharePDFCtrl obj = new V2MOM_SharePDFCtrl(sc);
        obj.v2momObj = v2momRecord;
        List<V2MOMQ__Obstacle__c> obstacles = obj.fetchObstacles();
        Test.stopTest();
    }
	@isTest static void fetchMethodsTest(){
        V2MOMQ__V2MOM__c v2momRecord = V2MOMQ_TestUtil.createV2MOM();
        V2MOMQ__Method__c method_1 = V2MOMQ_TestUtil.createMethod(v2momRecord.Id);
        V2MOMQ__Method__c method_2 = V2MOMQ_TestUtil.createMethod(v2momRecord.Id);
        
        Test.startTest();
        ApexPages.StandardController sc = new ApexPages.StandardController(v2momRecord);
        V2MOM_SharePDFCtrl obj = new V2MOM_SharePDFCtrl(sc);
        obj.v2momObj = v2momRecord;
        List<Method__c> obstacles = obj.fetchMethods();
        Test.stopTest();
    }
}