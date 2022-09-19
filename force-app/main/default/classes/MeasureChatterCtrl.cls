public with sharing class MeasureChatterCtrl {
    //wrapper comment feed
    public class WrapperCommentFeeds{
        @AuraEnabled
        public String sUserName{get;set;}
        @AuraEnabled
        public String sUserId{get;set;}
        @AuraEnabled
        public String sFeeds{get;set;}
        @AuraEnabled 
        public String sSmallPhotoUrl{get;set;}
        @AuraEnabled 
        public Long lTimeStamp{get;set;}
        @AuraEnabled
        public String sParentFeedId{get;set;}
        @AuraEnabled
        public String sFeedId{get;set;}
        @AuraEnabled
        public String sLoggedInUserId{get;set;}
        @AuraEnabled
        public Boolean sIsLoggedInUser{get;set;}
        @AuraEnabled
        public String sFeedRichText{get;set;}
        public WrapperCommentFeeds(String sLoggedInUserId,String sUserName,String sUserId,String sFeeds, String sSmallPhotoUrl, Long lTimeStamp, String sParentFeedId, String sFeedId, String sFeedRichText){
            this.sLoggedInUserId = sLoggedInUserId;
            this.sUserName = sUserName;
            this.sUserId = sUserId;
            this.sFeeds = sFeeds;
            this.sSmallPhotoUrl = sSmallPhotoUrl;
            this.lTimeStamp = lTimeStamp;
            this.sParentFeedId = sParentFeedId;
            this.sFeedId = sFeedId;
            this.sFeedRichText = sFeedRichText;
            if(sLoggedInUserId.equalsIgnoreCase(sUserId)){
                this.sIsLoggedInUser = true;
            } else {
                this.sIsLoggedInUser = false;
            }
        }
    }
    
    public static String getChatFeedId(String measureId){
        return [SELECT Id,MeasureChatFeedId__c FROM Measure__c WHERE Id=:measureId WITH SECURITY_ENFORCED LIMIT 1].MeasureChatFeedId__c;
    }
    
    // This method helps in fetching current measure feed. 
    @AuraEnabled(cacheable=true)
    public static List<WrapperCommentFeeds> getCurrentMeasureFeed(String measureId){
        String feedId = getChatFeedId(measureId);
        List<WrapperCommentFeeds> lstMeasureCommentFeeds = new List<WrapperCommentFeeds>();
        String sRegex = '<[/a-zAZ0-9]*>';
        
        if(String.isNotBlank(feedId)){
            List<Measure__Feed> lstMeasureFeed = [SELECT Id, Type, CreatedById,CreatedBy.FirstName, CreatedBy.LastName, CreatedBy.Name, ParentId, Parent.Name, 
                                                          Body, Title,LinkUrl, CreatedDate,
                                                          (SELECT Id, CommentBody, CreatedDate, CreatedBy.Name, CreatedBy.FirstName, CreatedBy.LastName, CreatedById
                                                           FROM FeedComments ORDER BY CreatedDate LIMIT 1000)
                                                          FROM Measure__Feed
                                                          WHERE Id =: feedId WITH SECURITY_ENFORCED
                                                          ORDER BY CreatedDate DESC, Id DESC
                                                          LIMIT 1];
            
            Set<Id> setUserId = new Set<Id>();
            if(lstMeasureFeed != null && lstMeasureFeed.size() > 0){
                setUserId.add(lstMeasureFeed[0].CreatedById);
                if(lstMeasureFeed[0].FeedComments != null && lstMeasureFeed[0].FeedComments.size() > 0){
                    for(FeedComment objFeedComm : lstMeasureFeed[0].FeedComments){
                        setUserId.add(objFeedComm.CreatedById);
                    }
                }
            }
            
            Map<Id,User> mapUserImageURL = new Map<Id,User>([SELECT Id,SmallPhotoUrl FROM User WHERE Id IN:setUserId WITH SECURITY_ENFORCED LIMIT 1000]);
            
            
            if(lstMeasureFeed != null && lstMeasureFeed.size() > 0){
                
                lstMeasureCommentFeeds.add( new WrapperCommentFeeds(
                    UserInfo.getUserId(),
                    lstMeasureFeed[0].CreatedBy.Name, 
                    lstMeasureFeed[0].CreatedById, 
                    lstMeasureFeed[0].Body.replaceAll(sRegex, ''), 
                    mapUserImageURL.containsKey(lstMeasureFeed[0].CreatedById)?mapUserImageURL.get(lstMeasureFeed[0].CreatedById).SmallPhotoUrl:null, 
                    lstMeasureFeed[0].CreatedDate.getTime(), 
                    lstMeasureFeed[0].Id, 
                    lstMeasureFeed[0].Id, 
                    lstMeasureFeed[0].Body));
                
                if(lstMeasureFeed[0].FeedComments != null && lstMeasureFeed[0].FeedComments.size() > 0){
                    for(FeedComment objFeedComm : lstMeasureFeed[0].FeedComments){
                        lstMeasureCommentFeeds.add( new WrapperCommentFeeds(
                            UserInfo.getUserId(),
                            objFeedComm.CreatedBy.Name, 
                            objFeedComm.CreatedById, 
                            objFeedComm.CommentBody.replaceAll(sRegex, ''), 
                            mapUserImageURL.containsKey(objFeedComm.CreatedById)?mapUserImageURL.get(objFeedComm.CreatedById).SmallPhotoUrl:null,
                            objFeedComm.CreatedDate.getTime(), 
                            lstMeasureFeed[0].Id, 
                            objFeedComm.Id, 
                            objFeedComm.CommentBody));
                    }
                }
            }
        }
        return lstMeasureCommentFeeds;
    }
    
    @AuraEnabled
    public static String createMeasureFeedComment(String measureId, String post){
        String feedId = getChatFeedId(measureId);
        if(String.isNotEmpty(feedId)){
            List<String> fieldNames = new List<String>{'CommentBody','FeedItemId'};
                if(FLSCheck.isCreateable(fieldNames,'FeedComment')){
                    FeedComment objPost = new FeedComment();
                    objPost.FeedItemId = feedId;
                    objPost.CommentBody = post;
                    insert objPost;
                    return objPost.CommentBody;
                }else{
                    return 'You don\'t have Permission to perform this operation. Please contact your admin for help.';
                }
            
        } else {
            List<String> fieldNames = new List<String>{'Body','ParentId'};
                List<String> fieldNames_1 = new List<String>{'MeasureChatFeedId__c'};
                    if(FLSCheck.isCreateable(fieldNames, 'FeedItem') && FLSCheck.isUpdateable(fieldNames_1, 'Measure__c')){
                        FeedItem objFirstFeed = new FeedItem();
                        objFirstFeed.ParentId = measureId;
                        objFirstFeed.Body = post;
                        insert objFirstFeed;
                        
                        update new Measure__c(Id=measureId,MeasureChatFeedId__c=objFirstFeed.Id);
                        return objFirstFeed.Body;
                    }else{
                        return 'You don\'t have Permission to perform this operation. Please contact your admin for help.';
                    }
        }
    }
    
    @AuraEnabled
    public static String updateMeasureFeedComment(String feedItemId, String post){
        String sObjectApi = String.valueOf(Id.valueOf(feedItemId).getsobjecttype());
        if(sObjectApi.contains('FeedItem')){
            List<String> fieldNames = new List<String>{'Body'};
                if(FLSCheck.isUpdateable(fieldNames,'FeedItem')){
                    FeedItem updateFeed = new FeedItem();
                    updateFeed.Id = feedItemId;
                    updateFeed.Body = post;
                    update updateFeed;
                    return 'Updated FeedItem Successfully!';
                }else{
                    return 'Updated Failed due access issues!';
                }
        }else{
            List<String> fieldNames = new List<String>{'CommentBody'};
                if(FLSCheck.isUpdateable(fieldNames,'FeedComment')){
                    FeedComment objPost = new FeedComment();
                    objPost.Id = feedItemId;
                    objPost.CommentBody = post;
                    update objPost;
                    return 'Updated FeedComment Successfully!';
                }else{
                    return 'Updated Failed due access issues!';
                }
        }
    }
    
    @AuraEnabled
    public static String deleteMeasureFeed(String feedItemId){
        String sObjectApi = String.valueOf(Id.valueOf(feedItemId).getsobjecttype());
        if(sObjectApi.contains('FeedItem')) {
            if(FLSCheck.isDeletable('FeedItem')){
                delete new FeedItem(Id=feedItemId);
                return 'Deleted FeedItem Successfully!';
            }else{
                return 'You don\'t have delete permission to delete this record. Please contact your admin for help.';
            }
        } else {
            if(FLSCheck.isDeletable('FeedComment')){
                delete new FeedComment(Id=feedItemId);
                return 'Deleted FeedComment Successfully!';
            }else{
                return 'You don\'t have delete permission to delete this record. Please contact your admin for help.';
            }
        }
    }
}