public with sharing class AssignMeasure {
    
    // This method helps in fetching measure team records of a measure. 
    @AuraEnabled(cacheable=true)
    public static List<Measure_Team_Member__c> getMeasureAssignees(Id MeasureId,String quarter){

        try{
            String quarterField = ''+quarter+'_Target__c';
            String quarterValue = ''+quarter + '_Value__c';
            String quarterName = ''+quarter+'__c';
            String progressField = ''+quarter+'_Progress__c';
            String measureValue = '\''+MeasureId+'\'';
            
            String query = 'Select Id, '+quarterName+', '+quarterField+', '+quarterValue+', '+progressField+', Team_Member__r.Name, Team_Member__r.Id FROM Measure_Team_Member__c where Measure__c = '+measureValue+' WITH SECURITY_ENFORCED';
            
            return Database.query(query);
        }catch(exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    
     @AuraEnabled(cacheable=true)
    public static Measure_Team_Member__c getMeasureTeamMemberRecord(Id teamMemberId){
        return [SELECT Q1__c,Q2__c,Q3__c,Q4__c FROM Measure_Team_Member__c where Id = :teamMemberId WITH SECURITY_ENFORCED];
    }

    
    @AuraEnabled(cacheable=true)
    public static Measure__c getMeasureDetails(Id measureId,String quarter){
        String quarterPriority = ''+quarter+'_Priority__c';
        String measureIdString = '\''+measureId+'\'';
        String query = 'SELECT Id,Obstacles__c,Method__c,'+quarterPriority+' FROM Measure__c WHERE Id ='+measureIdString+' WITH SECURITY_ENFORCED' ;
        
        return Database.query(query);
    }
}