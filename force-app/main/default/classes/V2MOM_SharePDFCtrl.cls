public class V2MOM_SharePDFCtrl {
    
    public V2MOM__c v2momObj;
    public List<Method__c> methodsList {get; set;}
    public List<Obstacle__c> obsList {get; set;}
    
    public V2MOM_SharePDFCtrl(ApexPages.StandardController stdController) {
        this.v2momObj = (V2MOM__c)stdController.getRecord();
        methodsList = new List<Method__c>();
        obsList = new List<Obstacle__c>();
        fetchMethods();
        fetchObstacles();
    }
    
    public List<Method__c> fetchMethods() {
        
        methodsList = [select id, Name, Description__c,
                                      (select id, Name, Description__c, Comments__c, 
                                       Q1__c, Q1_Progress__c,
                                       Q2__c, Q2_Progress__c,
                                       Q3__c, Q3_Progress__c,
                                       Q4__c, Q4_Progress__c,
                                       Q1_Type__c, Q1_Status__c,
                                       Q2_Type__c, Q2_Status__c,
                                       Q3_Type__c, Q3_Status__c,
                                       Q4_Type__c, Q4_Status__c
                                       from Measures__r) 
                                      from Method__c where V2MOM__c =: v2momObj.Id WITH SECURITY_ENFORCED];

		return methodsList;
    }
    
    public List<Obstacle__c> fetchObstacles(){
        obsList = [select id, Name, Description__c from Obstacle__c where V2MOM__c =: v2momObj.Id WITH SECURITY_ENFORCED];
        return obsList;
    }
    
}