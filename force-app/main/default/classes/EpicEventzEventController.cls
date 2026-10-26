public without sharing class EpicEventzEventController {

    // Read-only listing of Published events for signed-in external attendees.
    // Runs without record sharing (Event/Venue stay Private for external users),
    // but still enforces object and field permissions via stripInaccessible.
    // No Ticket_Booking__c data is queried or returned here.
    @AuraEnabled(cacheable=true)
    public static List<Event__c> getPublishedEvents() {

        // Never serve this list to guest (not logged in) visitors
        if (UserInfo.getUserType() == 'Guest') {
            return new List<Event__c>();
        }

        // TEMPORARY DIAGNOSTICS - remove after the issue is found
        System.debug('DIAG userType=' + UserInfo.getUserType()
            + ' userId=' + UserInfo.getUserId()
            + ' orgId=' + UserInfo.getOrganizationId());
        System.debug('DIAG totalEvents=' + [SELECT COUNT() FROM Event__c]);
        System.debug('DIAG publishedEvents='
            + [SELECT COUNT() FROM Event__c WHERE Event_Status__c = 'Published']);

        List<Event__c> events = [
            SELECT
                Id,
                Name,
                Event_Description__c,
                Event_Start_Date__c,
                Event_End_Date__c,
                Ticket_Price__c,
                Available_Seats__c,
                Event_Status__c,
                Venue__r.Name,
                Venue__r.Address__c,
                Venue__r.Image_URL__c
            FROM Event__c
            WHERE Event_Status__c = 'Published'
            ORDER BY Event_Start_Date__c ASC
            LIMIT 100
        ];

        SObjectAccessDecision decision =
            Security.stripInaccessible(AccessType.READABLE, events);
        return (List<Event__c>) decision.getRecords();
    }
}