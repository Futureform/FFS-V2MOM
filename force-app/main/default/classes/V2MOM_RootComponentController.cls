public with sharing class V2MOM_RootComponentController {

    public class Record {
        @AuraEnabled
        public String Id{get;set;}

        @AuraEnabled
        public String Name{get;set;}

        @AuraEnabled
        public String sObjectType{get;set;}

        @AuraEnabled
        public Boolean isV2MOM{get;set;}

        @AuraEnabled
        public Boolean isMethod{get;set;}

        @AuraEnabled
        public Boolean isMeasure{get;set;}

        public Record(String Id,String Name,String sObjectType){
            this.Id = Id;
            this.Name = Name;
            this.sObjectType = sObjectType;
            if(sObjectType=='V2MOM'){
                this.isV2MOM = true;
            } else if(sObjectType=='Method'){
                this.isMethod = true;
            } else if(sObjectType=='Measure'){
                this.isMeasure = true;
            }
        }
    }

    public class ChangeHistory{
        @AuraEnabled
        public String feedId{get;set;}

        @AuraEnabled
        public Record record{get;set;}

        @AuraEnabled
        public String fieldLabel{get;set;}

        @AuraEnabled
        public FeedTrackedChange fieldHistory{get;set;}

        @AuraEnabled
        public DateTime createdDateTime{get;set;}

        @AuraEnabled
        public Boolean isCreated{get;set;}
    }

    // Picklist Options - should check and delete later
    public class CustomSelectOption{
        @AuraEnabled
        public String label{get;set;}
        @AuraEnabled
        public String value{get;set;}
        
        public CustomSelectOption(String financialYear){
            this.label = 'FY '+financialYear;
            this.value = financialYear;
        }
    } 

    @AuraEnabled(cacheable=true)
    public static List<Obstacle__c> getObstacles(String v2momId){
        return [SELECT Id FROM Obstacle__c WHERE V2MOM__c=:v2momId WITH SECURITY_ENFORCED];
    }

    @AuraEnabled
    public static string getV2MOMId(String fyYear,String userId){
        if(fyYear==null){
            fyYear = String.valueOf(getCurrentFY());
        }
        List<V2MOM__c> v2momList= [SELECT Id FROM V2MOM__c WHERE User__c=:userId AND FY_Year__c=:fyYear WITH SECURITY_ENFORCED];
        if(!v2momList.isEmpty()){
            return v2momList[0].Id;
        }
        return null;
    }

    @AuraEnabled
    public static List<ChangeHistory> getHistory(String v2momId){
        
        Map<String,String> fieldApiMap = getFieldApiMap();
        List<ChangeHistory> changeHistoryList = new List<ChangeHistory>();
        Map<Id,Record> recordMap = new Map<Id,Record>();
        V2MOM__c v2mom = [SELECT Id,Name,(SELECT Id,Name FROM Methods__r) FROM V2MOM__c WHERE Id=:v2momId WITH SECURITY_ENFORCED LIMIT 1];
        if(!v2mom.Methods__r.isEmpty()){
            for(Method__c m : v2mom.Methods__r){
                recordMap.put(m.Id,new Record(m.Id,m.Name,'Method'));
            }
            for(Measure__c m : [SELECT Id,Name FROM Measure__c WHERE Method__c IN:recordMap.keySet() WITH SECURITY_ENFORCED]){
                recordMap.put(m.Id,new Record(m.Id,m.Name,'Measure'));
            }
            //Add Obstacles Query 
        }
        recordMap.put(v2mom.Id, new Record(v2mom.Id,v2mom.Name,'V2MOM'));
        List<FeedItem> feedItemList = [SELECT  Id, ParentId, CreatedDate, RelatedRecordId,Type,(SELECT Id,FieldName,OldValue,NewValue FROM FeedTrackedChanges) FROM FeedItem WHERE (Type='TrackedChange' OR Type='CreateRecordEvent') AND ParentId IN :recordMap.keySet() WITH SECURITY_ENFORCED LIMIT 50];
        if(feedItemList != null && feedItemList.size() > 0){
        
            for(FeedItem fi: feedItemList){
                ChangeHistory ch = new ChangeHistory();
                ch.feedId = fi.Id;
                ch.record = recordMap.get(fi.ParentId);
                ch.fieldHistory = fi.FeedTrackedChanges[0];
                ch.createdDateTime = fi.CreatedDate;
                if(fi.Type=='TrackedChange'){
                    ch.fieldLabel = fieldApiMap.get(ch.fieldHistory.FieldName);
                } else {
                    ch.isCreated = true;
                }
                changeHistoryList.add(ch);
            }
                
        }
        return changeHistoryList;
    }

    public static Map<String,String> getFieldApiMap(){
        Map<String,Schema.SObjectField> v2momFieldsMap = V2MOM__c.sObjectType.getDescribe().fields.getMap();
        Map<String,Schema.SObjectField> methodFieldsMap = Method__c.sObjectType.getDescribe().fields.getMap();
        Map<String,Schema.SObjectField> measureFieldsMap = Measure__c.sObjectType.getDescribe().fields.getMap();
        Map<String,String> fieldAPIMap = new Map<String,String>();
        for(String key : v2momFieldsMap.keySet()){
            fieldAPIMap.put('V2MOM__c.'+String.valueOf(v2momFieldsMap.get(key)),String.valueOf(v2momFieldsMap.get(key).getDescribe().getLabel()));
        }
        for(String key : methodFieldsMap.keySet()){
            fieldAPIMap.put('Method__c.'+String.valueOf(v2momFieldsMap.get(key)),String.valueOf(methodFieldsMap.get(key).getDescribe().getLabel()));
        }
        for(String key : measureFieldsMap.keySet()){
            fieldAPIMap.put('Measure__c.'+String.valueOf(v2momFieldsMap.get(key)),String.valueOf(measureFieldsMap.get(key).getDescribe().getLabel()));
        }
        
        return fieldAPIMap;
    }

    @AuraEnabled(cacheable=true)
    public static Boolean checkIsManager(String userId){
        
        List<User> listUsers = [SELECT Id FROM User WHERE ManagerId=:userId WITH SECURITY_ENFORCED LIMIT 1];
        
        if(!listUsers.isEmpty()){
            
            return true;
        } 
        return false;
    }
    
    @AuraEnabled(cacheable=true) 
    public static Boolean getManagerEdit(String userId,String v2momId){
        List<V2MOM__c> v2momList = [SELECT id, User__c from V2MOM__c where Id=:v2momId WITH SECURITY_ENFORCED LIMIT 1];
        
        if(v2momList != null){
            String v2momUserId = v2momList[0].User__c;
            if(v2momUserId != null){
                List<User> listUsers = [SELECT Id FROM User WHERE ManagerId=:userId AND id=: v2momUserId WITH SECURITY_ENFORCED LIMIT 1];
                if(!listUsers.isEmpty()){
                    return true;
                } 
            }
        }
        
        return false;
    }

    @AuraEnabled
    public static List<Measure_Team_Member__c> getAssignedMeasures(String userId,String fyyear,String quarter){
        
        List<Measure_Team_Member__c> teamMembers = new List<Measure_Team_Member__c>();
        String quarterField = quarter+'__c';
        String query = 'SELECT Id,CreatedById,Measure__r.Name,Team_Member__c,'+''+quarter+'_Progress__c FROM Measure_Team_Member__c WHERE Team_Member__c =:userId AND Measure__r.Method__r.V2MOM__r.FY_Year__c =:fyyear AND '+quarterField+'=true AND CreatedById != :userId WITH SECURITY_ENFORCED ORDER BY CreatedDate Desc';
        teamMembers = Database.query(query);
        
        
        return teamMembers;
    }

    @AuraEnabled(cacheable=true)
    public static List<Measure__c> getRelatedMeasures(String methodId,String applicableQuarter){
        
            String query = 'SELECT Id FROM Measure__c WHERE Method__c=:methodId AND '+''+applicableQuarter +'__c'+'=true WITH SECURITY_ENFORCED';
        
        //return [SELECT Id FROM Measure__c WHERE Method__c=:methodId WITH SECURITY_ENFORCED];
        return Database.query(query);
    }
    
    @AuraEnabled(cacheable=true)
    public static V2MOM__c getV2MOMData(String userId,String financialYear){
        if(string.isBlank(financialYear)){
            financialYear = String.valueOf(getCurrentFY());
        }
        List<V2MOM__c> v2momList = new List<V2MOM__c>();
        v2momList = [SELECT Id, Name, Status__c, Published_Date__c, FY_Year__c,
                     (SELECT Id, Name, Order__c FROM Methods__r ORDER BY Order__c),
                     (SELECT Id FROM Obstacles__r) 
                     FROM V2MOM__c WHERE User__c=:userId 
                     AND FY_Year__c=:financialYear
                     WITH SECURITY_ENFORCED 
                     LIMIT 1];
        if(v2momList.size()>0){
            return v2momList[0];
        } else {
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static integer getCurrentFY() {
        Organization orgInfo = [SELECT FiscalYearStartMonth, UsesStartDateAsFiscalYearName FROM Organization WHERE id=:Userinfo.getOrganizationId() WITH SECURITY_ENFORCED];
        Date today = system.today();
        Integer currentFY;
        if (today.month() >= orgInfo.FiscalYearStartMonth) {
            if (orgInfo.UsesStartDateAsFiscalYearName) {
                currentFY = today.year();
            } else {
                currentFY = today.year() + 1;
            }
        } else {
            if (orgInfo.UsesStartDateAsFiscalYearName) {
                currentFY = today.year() - 1;
            } else {
                currentFY = today.year();
            }
        }
        return currentFY;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getCurrentQuarter() {
        Date currentDate = system.today();
		String currentQuarter = 'Q1';
        List<Period> periodList = [SELECT Id, Type, StartDate, EndDate,  Number FROM Period where type='Quarter' AND startDate <=: currentDate AND EndDate >=: currentDate WITH SECURITY_ENFORCED];
        if(periodList != null){
            currentQuarter = 'Q'+periodList[0].Number;
        }     
        return currentQuarter;
    }

    //Can this be merged with getRelatedMeasures
    @AuraEnabled(cacheable=true)
    public static List<Measure__c> getMeasuresData(String methodId,String applicableQuarter ){
        String query = 'SELECT Id,Name,Q1_Progress__c,Q2_Progress__c,Q3_Progress__c,Q4_Progress__c FROM Measure__c WHERE Method__c =:methodId AND '+''+applicableQuarter +'__c'+'=true WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC';
        //query = 'SELECT Id FROM Measure__c WHERE Method__c=:methodId AND '+''+applicableQuarter +'__c'+'=true WITH SECURITY_ENFORCED';
        return Database.query(query);
        //return [SELECT Id,Name,Q1_Progress__c,Q2_Progress__c,Q3_Progress__c,Q4_Progress__c FROM Measure__c WHERE Method__c =:methodId WITH SECURITY_ENFORCED ORDER BY LastModifiedDate DESC];
    }

    @AuraEnabled(cacheable=true)
    public static V2MOM__c getManagerV2MOMData(String userId,String financialYear){
        if(string.isBlank(financialYear)){
            financialYear = String.valueOf(getCurrentFY());
        }
        List<V2MOM__c> v2momList = new List<V2MOM__c>();
        v2momList = [SELECT Id, Values__c, Vision__c FROM V2MOM__c WHERE User__c=:userId AND FY_Year__c=:financialYear WITH SECURITY_ENFORCED LIMIT 1];
        if(v2momList.size()>0){
            return v2momList[0];
        } else {
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getReportingUsers(){
        return [Select Id, Name from user where ManagerId=:UserInfo.getUserId() WITH SECURITY_ENFORCED];
    }

    @AuraEnabled(cacheable=true)
    public static List<CustomSelectOption> getAllV2MOMFY(String userId){
        String currentFinancialYear = String.valueOf(getCurrentFY());
        List<CustomSelectOption> selectOptions = new List<CustomSelectOption>{new CustomSelectOption(currentFinancialYear)};
            for(V2MOM__c v2mom:[SELECT Id,FY_Year__c FROM V2MOM__c WHERE User__c=:userId WITH SECURITY_ENFORCED ORDER BY CreatedDate]){
                if(String.isNotBlank(v2mom.FY_Year__c) && !v2mom.FY_Year__c.equals(currentFinancialYear)){
                    selectOptions.add(new CustomSelectOption(v2mom.FY_Year__c));
                }
            }
        return selectOptions;
    }

    @AuraEnabled(cacheable=true)
    public static V2MOM__c getV2MOMMethods(String v2momId,String applicableQuarter){
        
        String quarter = ''+applicableQuarter+'__c';
        String query = 'SELECT Id, Name, Status__c, Published_Date__c, FY_Year__c,';
        query += '(SELECT Id, Name, Order__c, '+quarter+' FROM Methods__r WHERE '+quarter +'=true ORDER BY CreatedDate DESC),';
        query += '(SELECT Id FROM Obstacles__r)';
        query += ' FROM V2MOM__c WHERE Id=:v2momId WITH SECURITY_ENFORCED';
        List<V2MOM__c> v2momList = new List<V2MOM__c>();
        
        
        v2momList = Database.query(query);
        
        if(v2momList.size()>0){
            return v2momList[0];
        } else {
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<V2MOM__c> getReporteeDetails(Id managerId, string year){
        List<User> lstUsers=  [SELECT Id from User where ManagerId=:managerId WITH SECURITY_ENFORCED];
        List<V2MOM__c> lstV2MoM = new List<V2MOM__c>();
        lstV2MoM = [SELECT Id, User__r.Name, User__r.Title,LastModifiedDate,Q1_Progress__c,Q2_Progress__c,Q3_Progress__c,Q4_Progress__c FROM V2MOM__c WHERE User__c IN :lstUsers AND FY_Year__c=:year WITH SECURITY_ENFORCED];  
        return lstV2MoM;
    }

    @AuraEnabled(cacheable=true)
    public static Boolean managerEditDetails(){
        List<ManagerV2MOMEdit__mdt> managerEdit = ManagerV2MOMEdit__mdt.getAll().values();
        if(managerEdit != null && managerEdit[0].ManagerEdit__c ){
            return true;
        }
        return false;

    }

    ////
    @AuraEnabled(cacheable=true)
    public static List<String> getAllV2MOMData(String userId){
        List<String> v2momFYList = new List<String>();
        List<V2MOM__c> v2momList = [SELECT Id, Name, Status__c, Published_Date__c, FY_Year__c FROM V2MOM__c WHERE User__c=:userId WITH SECURITY_ENFORCED ORDER BY CreatedDate DESC];
        for(V2MOM__c fy:v2momList)
            v2momFYList.add(fy.FY_Year__c);
        if(v2momFYList.size()>0){
            return v2momFYList;
        } else {
            return null;
        }
    }		
}