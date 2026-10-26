public with sharing class EpicEventzFeedbackController {

    public class EventOption {
        @AuraEnabled public Id eventId;
        @AuraEnabled public String eventName;

        public EventOption(Id eventId, String eventName) {
            this.eventId = eventId;
            this.eventName = eventName;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<EventOption> getMyBookedEvents() {
        List<EventOption> options = new List<EventOption>();
        Id contactId = currentContactId();
        if (contactId == null) {
            return options;
        }

        Set<Id> eventIds = new Set<Id>();
        for (Ticket_Booking__c booking : [
            SELECT Event__c
            FROM Ticket_Booking__c
            WHERE Contact__c = :contactId
            AND Booking_Status__c = 'Confirmed'
        ]) {
            eventIds.add(booking.Event__c);
        }
        if (eventIds.isEmpty()) {
            return options;
        }

        for (Event__c ev : [
            SELECT Id, Name
            FROM Event__c
            WHERE Id IN :eventIds
            ORDER BY Name
        ]) {
            options.add(new EventOption(ev.Id, ev.Name));
        }
        return options;
    }

    @AuraEnabled
    public static void submitFeedback(Id eventId, Integer rating, String comments) {
        if (eventId == null) {
            throw new AuraHandledException('Please choose an event.');
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new AuraHandledException('Please choose a rating from 1 to 5.');
        }
        Id contactId = currentContactId();
        if (contactId == null) {
            throw new AuraHandledException('Please log in with an attendee account to give feedback.');
        }

        Feedback__c fb = new Feedback__c(
            Event__c = eventId,
            Contact__c = contactId,
            Rating__c = rating,
            Comments__c = comments,
            Feedback_Date__c = Date.today()
        );

        try {
            insert fb;
        } catch (DmlException e) {
            if (e.getDmlType(0) == StatusCode.DUPLICATE_VALUE) {
                throw new AuraHandledException('You have already submitted feedback for this event.');
            }
            throw new AuraHandledException(e.getDmlMessage(0));
        }
    }

    private static Id currentContactId() {
        List<User> users = [
            SELECT ContactId
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];
        return users.isEmpty() ? null : users[0].ContactId;
    }
}