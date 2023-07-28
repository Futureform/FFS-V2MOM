@isTest
public class MeasureChatterCtrlTest {
    
    @isTest static void getChatFeedIdTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        
        FeedItem feedItem = V2MOMQ_TestUtil.createFeedItem(measure.Id,'MeasureFeedItemPost');
        FeedItem feedItem_1 = V2MOMQ_TestUtil.createFeedItem(measure.Id,'MeasureFeedItemPost_1');
        FeedComment comment_feed = V2MOMQ_TestUtil.createFeedComment(feedItem.Id,'FeedComment');
        
        measure.MeasureChatFeedId__c = feedItem.Id;
        update measure;
        
		Test.startTest();
        MeasureChatterCtrl.getCurrentMeasureFeed(measure.Id);
        Test.stopTest();
        

    }
    
    @isTest static void createMeasureFeedCommentTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        Measure__c measure_1 = V2MOMQ_TestUtil.createMeasure(method.Id);
        FeedItem feedItem = V2MOMQ_TestUtil.createFeedItem(measure.Id,'MeasureFeedItemPost');
        measure.MeasureChatFeedId__c = feedItem.Id;
        UPDATE measure;
        
        Test.startTest();
        String comment = MeasureChatterCtrl.createMeasureFeedComment(measure.Id,'MeasureFeedItemPost_1');
        String item = MeasureChatterCtrl.createMeasureFeedComment(measure_1.Id, 'MeasureFeedItemPost_2');
        Test.stopTest();
        
        System.assertEquals('MeasureFeedItemPost_1',comment);
        System.assertEquals('MeasureFeedItemPost_2',item);
    }
    
    @isTest static void updateMeasureFeedCommentTestMethod(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        FeedItem feedItem = V2MOMQ_TestUtil.createFeedItem(measure.Id,'MeasureFeedItemPost');
        FeedComment comment_feed = V2MOMQ_TestUtil.createFeedComment(feedItem.Id,'FeedComment');
        
        Test.startTest();
        String comment = MeasureChatterCtrl.updateMeasureFeedComment(feedItem.Id,'MeasureTestComment');
        String item = MeasureChatterCtrl.updateMeasureFeedComment(comment_feed.Id,'MeasureTestItemUpdate');
        Test.stopTest();
        
        System.assertEquals('Updated FeedItem Successfully!',comment);
        System.assertEquals('Updated FeedComment Successfully!',item);
    }
    
    @isTest static void deleteMeasureFeedTest(){
        V2MOM__c myv2mom = V2MOMQ_TestUtil.createV2MOM();
        Method__c method = V2MOMQ_TestUtil.createMethod(myv2mom.Id);
        Measure__c measure = V2MOMQ_TestUtil.createMeasure(method.Id);
        FeedItem feedItem = V2MOMQ_TestUtil.createFeedItem(measure.Id,'MeasureFeedItemPost');
        FeedItem feedItem_1 = V2MOMQ_TestUtil.createFeedItem(measure.Id,'MeasureFeedItemPost_1');
        FeedComment comment_feed = V2MOMQ_TestUtil.createFeedComment(feedItem_1.Id,'FeedComment');
        
        Test.startTest();
        String comment = MeasureChatterCtrl.deleteMeasureFeed(feedItem.Id);
        String item = MeasureChatterCtrl.deleteMeasureFeed(comment_feed.Id);
        Test.stopTest();
        
        System.assertEquals('Deleted FeedItem Successfully!',comment);
        System.assertEquals('Deleted FeedComment Successfully!',item);
    }
    
    @isTest static void WrapperTest(){
        Profile pf = [SELECT Id FROM Profile WHERE Name = 'System Administrator'];
        
         List<UserRole> urLst = new List<UserRole>();
        	urLst.add(new UserRole(Name = 'Finance Approver'));
        	urLst.add(new UserRole(Name = 'Finance'));        
        insert urLst;
        User u = V2MOMQ_TestUtil.createTestUser(urLst[0].Id,pf.Id,'TestUserMOM','userTest');
        insert u;
        
        Test.startTest();
        MeasureChatterCtrl.WrapperCommentFeeds wrapper = new MeasureChatterCtrl.WrapperCommentFeeds(u.Id,u.Username,u.Id,'Sfeeds','smallPhotoUrl',4271990,'ParentFeedId','FeedId','feedRichText');
        Test.stopTest();
        System.assertEquals(u.Username, wrapper.sUserName);
    }
}