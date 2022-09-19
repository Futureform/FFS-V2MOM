public with sharing class LookupController {
    
    @AuraEnabled(cacheable=true)  
    public static List<sobject> findRecords(String searchKey, String objectName,String queryString) {  
        string searchText = '\'' + String.escapeSingleQuotes(searchKey) + '%\'';
        string query;
        if(queryString == null || queryString == '')
        	query = 'SELECT Id, Name,Email FROM ' +objectName+ ' WHERE Name LIKE '+searchText+' WITH SECURITY_ENFORCED LIMIT 6';
        else{
            query = 'SELECT Id, Name,Email FROM ' +objectName+ ' WHERE Name LIKE '+searchText+' AND '+queryString+' WITH SECURITY_ENFORCED LIMIT 6';
            System.debug(query);
        }
        return Database.query(query);  
    }  
    
}