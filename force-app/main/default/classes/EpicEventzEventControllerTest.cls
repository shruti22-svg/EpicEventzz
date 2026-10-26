
@IsTest
private class EpicEventzEventControllerTest {

    @IsTest
    static void testPublishedEventsOnly() {
        Venue__c venue = new Venue__c(
            Name = 'Test Auditorium',
            Address__c = 'Hyderabad',
            Seating_Capacity__c = 100
        );
        insert venue;

        Datetime startDate = System.now().addDays(10);

        Event__c publishedEvent = new Event__c(
            Name = 'Test Music Festival',
            Event_Description__c = 'Test concert event',
            Event_Start_Date__c = startDate,
            Event_End_Date__c = startDate.addHours(3),
            Ticket_Price__c = 500,
            Seating_Capacity__c = 100,
            Event_Status__c = 'Published',
            Venue__c = venue.Id
        );

        Event__c cancelledEvent = new Event__c(
            Name = 'Test Cancelled Event',
            Event_Start_Date__c = startDate.addDays(5),
            Event_End_Date__c = startDate.addDays(5).addHours(2),
            Ticket_Price__c = 600,
            Seating_Capacity__c = 100,
            Event_Status__c = 'Cancelled',
            Venue__c = venue.Id
        );

        insert new List<Event__c>{
            publishedEvent,
            cancelledEvent
        };

        Test.startTest();
        List<Event__c> results =
            EpicEventzEventController.getPublishedEvents();
        Test.stopTest();

        System.assertEquals(
            1,
            results.size(),
            'Only published events should be returned.'
        );

        System.assertEquals(
            publishedEvent.Id,
            results[0].Id
        );

        System.assertEquals(
            'Test Auditorium',
            results[0].Venue__r.Name
        );
    }
}

