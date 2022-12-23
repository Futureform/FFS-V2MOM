/* This class holds the business logic for linking a report to a measure. */
public with sharing class V2MOM_LinkReportClass {
    
    public class RecordsData {
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        public RecordsData(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }

    //V2 - This method is used to fetch Reports dunamically
    @AuraEnabled
    public static List<RecordsData> fetchRecords(String objectName, String filterField, String searchString, String value) {
        try {
            List<RecordsData> recordsDataList = new List<RecordsData>();
            String query = 'SELECT Id, ' + filterField + ' FROM '+objectName;
            if(String.isNotBlank(value)) {
                query += ' WHERE Id = \''+ value + '\' WITH SECURITY_ENFORCED LIMIT 50';
            } else {
                query += ' WHERE '+filterField + ' LIKE ' + '\'%' + String.escapeSingleQuotes(searchString.trim()) + '%\' WITH SECURITY_ENFORCED LIMIT 50';
            }
	        for(SObject s : Database.query(query)) {
	            recordsDataList.add( new RecordsData((String)s.get(filterField), (String)s.get('id')) );
	        }
            return recordsDataList;
	    } catch (Exception err) {
	    	if ( String.isNotBlank( err.getMessage() ) && err.getMessage().contains( 'error:' ) ) {
                throw new AuraHandledException(err.getMessage().split('error:')[1].split(':')[0] + '.');
            } else {
                
                throw new AuraHandledException(err.getMessage());
            }
	    }
    }

    /* This method helps in fetching the list of reports. */
    @AuraEnabled
    public static List<Report> getReportList(){
        List<Report> reportList = [SELECT Id,Name,DeveloperName FROM Report WITH SECURITY_ENFORCED];
        if(reportList.size()>0 && reportList != null)
            return reportList;
        else
            return null;
    }

    /* This method helps in fetching the aggregated labels of a particular report. */
    @AuraEnabled
    public static List<RecordsData> getAggregateFields(Id rId){
        List<RecordsData> aggrList = new List<RecordsData>();
        if(rId != null){
            Reports.ReportResults results = Reports.ReportManager.runReport(rId,true);
            Reports.ReportMetadata rm = results.getReportMetadata();
            List<String> aggList = rm.getAggregates();
            if(aggList.size()>0 && aggList != null){
                for(String s:aggList){
                    if(s.contains('!')){
                        String[] arr = s.split('!');
                        aggrList.add(new RecordsData(s,s));
                    }
                }
                aggrList.add(new RecordsData('Record Count','Record Count'));
                
            }
        }
        if(aggrList.size()>0 && aggrList != null)
            return aggrList;
        else
            return null;
    }
    
    /* This method helps in fetching the aggregated labels of a particular report. */
    @AuraEnabled
    public static List<String> getAggregates(Id rId){
        Report rp = [Select Id,DeveloperName FROM Report where Id=:rId WITH SECURITY_ENFORCED];
        
        List<String> aggrList = new List<String>();
        if(rp != null){
            Reports.ReportResults results = Reports.ReportManager.runReport(rp.Id,true);
            Reports.ReportMetadata rm = results.getReportMetadata();
            List<String> aggList = rm.getAggregates();
            if(aggList.size()>0 && aggList != null){
                for(String s:aggList){
                    if(s.contains('!')){
                        String[] arr = s.split('!');
                        aggrList.add(arr[1]);
                    }
                }
                aggrList.add('Record Count');
            }
        }
        if(aggrList.size()>0 && aggrList != null)
            return aggrList;
        else
            return null;
    }
    
    /* This method helps in fetching the aggregated values of a particular report. */
    @AuraEnabled
    public static Double getAggregateValue(Id rId, String aggName){
        Report report = [SELECT Id,DeveloperName FROM Report where Id=:rId WITH SECURITY_ENFORCED];
        
        String reportId = rId;
        
        if(report != null){
            // Run a report
            Reports.ReportResults results = Reports.ReportManager.runReport(reportId,true);
            
            // Get the report metadata
            Reports.ReportMetadata rm = results.getReportMetadata();
            String ReportFormat = String.valueOf(rm.getReportFormat());
            
            if(ReportFormat == 'TABULAR' || ReportFormat == 'SUMMARY' || ReportFormat == 'MATRIX'){
                String factMapKey = 'T!T';
                Reports.ReportFactWithDetails factDetails =
                    (Reports.ReportFactWithDetails)results.getFactMap().get(factMapKey);
                
                Integer totalAggregates = rm.getAggregates().size();
                
                for(integer k=0;k<totalAggregates;k++){
                    if(rm.getAggregates()[k].contains('!')){
                        String[] aggr = rm.getAggregates()[k].split('!');
                        
                        if(aggr[1].equals(aggName)){
                            Reports.SummaryValue sumVal = factDetails.getAggregates()[k];
                            Double val = Double.valueOf((sumVal.getValue()));
                            return val;
                        }
                    }
                    else{
                        Reports.SummaryValue sumVal = factDetails.getAggregates()[k];
                        Double val = Double.valueOf((sumVal.getValue()));
                        return val;
                    }
                }
            }
        }   
        return null;
    }
    
}