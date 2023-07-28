@isTest(SeeAllData=false)
public class V2MOM_LinkReportClassTest {
    @isTest static void fetchRecordsTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        
        Test.startTest();
        List<V2MOM_LinkReportClass.RecordsData> records = V2MOM_LinkReportClass.fetchRecords('V2MOM__c', 'Status__c', '',myv2mom.Id);
        List<V2MOM_LinkReportClass.RecordsData> records_1 = V2MOM_LinkReportClass.fetchRecords('V2MOM__c', 'Name', 'V2MOM','');
        Test.stopTest();
        
        System.assertEquals(1, records.size());
        System.assertEquals(1, records_1.size());
    }
    
    @isTest(SeeAllData=true) static void getReportListTestMethod(){
        Test.startTest();
        List<Report> reports = V2MOM_LinkReportClass.getReportList();
        Test.stopTest();
        System.assertEquals(1, reports.size());
    }
    @isTest static void getReportListNullTestMethod(){
        Test.startTest();
        List<Report> reports = V2MOM_LinkReportClass.getReportList();
        Test.stopTest();
        System.assertEquals(null, reports);
    }
    
    @isTest(SeeAllData=true) static void getAggregateFieldsTestMethod(){
        Id rId;
        List<Report> reportsList = [select id from Report where Name='Sample Flow Report: Screen Flows'];
        if(reportsList != null && reportsList.size() > 0){
            rId = reportsList[0].Id;
        }
        Test.startTest();
        
		List<V2MOM_LinkReportClass.RecordsData> records = V2MOM_LinkReportClass.getAggregateFields(rId);
        List<V2MOM_LinkReportClass.RecordsData> records_1 = V2MOM_LinkReportClass.getAggregateFields(rId);
        Test.stopTest();
        System.assertEquals(records[records.size()-1].label, 'Record Count');
    }
    
    
    @isTest(SeeAllData = true) static void getAggregatesTestMethod(){
        
        Test.startTest();
        String reportId;
        List<Report> reportsList = [select id from Report where Name='Sample Flow Report: Screen Flows'];
        if(reportsList != null && reportsList.size() > 0){
            reportId = reportsList[0].Id;
        }
        
        List<String> aggs = V2MOM_LinkReportClass.getAggregates(reportId);
        V2MOM_LinkReportClass.getAggregateValue(reportId,aggs[0]);

        Test.stopTest();
        system.debug('r1'+aggs[0]);
        System.assertEquals(aggs[aggs.size()-1], 'Record Count');
    }
    
    @isTest(SeeAllData = true) static void getAggregateValueNegativeTestMethod(){
        
        String reportId;
        Test.startTest();
        List<Report> reportsList = [select id from Report where Name='Sample Flow Report: Screen Flows'];
        if(reportsList != null && reportsList.size() > 0){
            reportId = reportsList[0].Id;
        }
        
        List<String> aggs = V2MOM_LinkReportClass.getAggregates(reportId);
        V2MOM_LinkReportClass.getAggregateValue(reportId,'');
        
        Test.stopTest();


    }
}