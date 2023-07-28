public class V2MOMQ_TestUtil {
    
    public static User createTestUser(Id roleId, Id profID, String fName, String lName)
    {
        String orgId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','');
        
        Integer randomInt = Integer.valueOf(math.rint(math.random()*1000000));
        String uniqueName = orgId + dateString + randomInt;
        User tuser = new User(  firstname = fName,
                              lastName = lName,
                              email = uniqueName + '@test' + orgId + '.org',
                              Username = uniqueName + '@test' + orgId + '.org',
                              EmailEncodingKey = 'ISO-8859-1',
                              Alias = uniqueName.substring(18, 23),
                              TimeZoneSidKey = 'America/Los_Angeles',
                              LocaleSidKey = 'en_US',
                              LanguageLocaleKey = 'en_US',
                              ProfileId = profId,
                              UserRoleId = roleId,
                              Title = 'Test');
        return tuser;
    }
    
    public static V2MOM__c createV2MOM(){
        V2MOM__c v2momRecord = new V2MOM__c(
            Name='V2MOMTestRecord',
            FY_Year__c = ''+Date.today().year(),
            Status__c = 'Draft',
            Vision__c = 'Vision',
            Values__c = 'Values'
            
        );
        
        insert v2momRecord;
        return v2momRecord;
    }
    
    public static Method__c createMethod(String v2momId){
        Method__c methodRecord = new Method__c(
            Name = 'TestMethod1',
            V2MOM__c = v2momId,
            Description__c = 'Description'
        );
        
        insert methodRecord;
        
        return methodRecord;
    }
    
    public static Measure__c createMeasure(String methodId){
        Measure__c measureRecord = new Measure__c(
            Method__c = methodId,
            Name= 'TestMeasure',
            Comments__c = 'Comments',
            Description__c = 'Description',
            Obstacles__c = 'Obsctacles');
        
        insert measureRecord;
        
        return measureRecord;
    }
    public static Obstacle__c createObstacle(String v2momId){
        Obstacle__c obstacleRecord = new Obstacle__c(
            Name='TestObstacle',
            V2MOM__c = v2momId,
            Description__c = 'Description'
        );
        insert obstacleRecord;
        return obstacleRecord;
    }
    
    public static Measure_Team_Member__c createAssignedMeasure(String measureId){
        Measure_Team_Member__c measureRecord = new Measure_Team_Member__c(
            Measure__c = measureId
        );
        insert measureRecord;
        return measureRecord;
    }
    public static FeedComment createFeedComment(String feedId,String post){
        FeedComment objPost = new FeedComment();
        objPost.FeedItemId = feedId;
        objPost.CommentBody = post;
        insert objPost;
        return objPost;
    }
    public static FeedItem createFeedItem(String measureId,String post){
        FeedItem objFirstFeed = new FeedItem();
        objFirstFeed.ParentId = measureId;
        objFirstFeed.Body = post;
        insert objFirstFeed;
        return objFirstFeed;
    }
}