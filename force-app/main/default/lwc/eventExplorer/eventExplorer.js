
import { LightningElement, wire } from 'lwc';
import getPublishedEvents from '@salesforce/apex/EpicEventzEventController.getPublishedEvents';

export default class EventExplorer extends LightningElement {

    events = [];
    error = undefined;

    selectedEvent = null;
    currentView = 'list';

    bookingSubmitted = false;

    // FETCH PUBLISHED EVENTS

    @wire(getPublishedEvents)
    wiredEvents({ data, error }) {

        if (data) {
            this.events = data;
            this.error = undefined;
        } else if (error) {
            this.events = [];
            this.error =
                error.body?.message ||
                error.message ||
                'Unable to load events.';
        }

    }

    // DISPLAY STATES

    get showEventList() {
        return this.currentView === 'list';
    }

    get showDetailsView() {
        return this.currentView === 'details' &&
            this.selectedEvent !== null;
    }

    get showBookingView() {
        return this.currentView === 'booking' &&
            this.selectedEvent !== null;
    }

    get showBookingFinished() {
        return this.currentView === 'finished';
    }

    // SHOW CORRECT BOOKING RESULT

    get bookingResultTitle() {
        return this.bookingSubmitted
            ? 'Booking Submitted Successfully!'
            : 'Booking Could Not Be Completed';
    }

    get bookingResultMessage() {
        return this.bookingSubmitted
            ? 'Your ticket booking has been submitted successfully. Please check your booking status for confirmation.'
            : 'Your ticket booking was not completed. Please check your attendee account and ticket availability before trying again.';
    }

    // PASS SELECTED EVENT TO EXISTING FLOW

    get bookingFlowInputs() {

        if (!this.selectedEvent) {
            return [];
        }

        return [
            {
                name: 'recordId',
                type: 'String',
                value: this.selectedEvent.Id
            }
        ];

    }

    // OPEN EVENT DETAILS

    handleViewDetails(event) {

        const eventId = event.currentTarget.dataset.id;

        this.selectedEvent =
            this.events.find(item => item.Id === eventId) || null;

        if (this.selectedEvent) {
            this.currentView = 'details';
        }

    }

    // OPEN BOOKING SCREEN

    handleBookTickets() {

        if (this.selectedEvent) {
            this.bookingSubmitted = false;
            this.currentView = 'booking';
        }

    }

    // RETURN TO EVENT DETAILS

    handleBackToDetails() {

        if (this.selectedEvent) {
            this.currentView = 'details';
        }

    }

    // RETURN TO EVENT LIST

    handleBackToEvents() {

        this.selectedEvent = null;
        this.bookingSubmitted = false;
        this.currentView = 'list';

    }

    // HANDLE FLOW FINISH

    handleFlowStatusChange(event) {

        const status = event.detail.status;

        if (
            status === 'FINISHED' ||
            status === 'FINISHED_SCREEN'
        ) {

            const outputVariables =
                event.detail.outputVariables || [];

            const successOutput = outputVariables.find(
                variable => variable.name === 'bookingSuccess'
            );

            this.bookingSubmitted =
                successOutput?.value === true;

            this.currentView = 'finished';

        }

    }

}
