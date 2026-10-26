import { LightningElement, wire } from 'lwc';
import isGuest from '@salesforce/user/isGuest';
import getMyBookedEvents from '@salesforce/apex/EpicEventzFeedbackController.getMyBookedEvents';
import submitFeedback from '@salesforce/apex/EpicEventzFeedbackController.submitFeedback';

export default class EpicEventzFeedback extends LightningElement {

    isOpen = false;

    eventOptions = [];
    selectedEventId = '';
    rating = '';
    comments = '';

    message = '';
    messageType = '';
    loadError = undefined;
    isSubmitting = false;

    ratingOptions = [
        { label: '5 - Excellent', value: '5' },
        { label: '4 - Good', value: '4' },
        { label: '3 - Average', value: '3' },
        { label: '2 - Poor', value: '2' },
        { label: '1 - Very poor', value: '1' }
    ];

    // LOAD THE EVENTS THIS ATTENDEE HAS CONFIRMED BOOKINGS FOR

    @wire(getMyBookedEvents)
    wiredEvents({ data, error }) {
        if (data) {
            this.eventOptions = data.map(item => ({
                label: item.eventName,
                value: item.eventId
            }));
            this.loadError = undefined;
        } else if (error) {
            this.eventOptions = [];
            this.loadError =
                error.body?.message ||
                error.message ||
                'Unable to load your events.';
        }
    }

    // DISPLAY STATES

    get showButton() {
        return !isGuest;
    }

    get hasEvents() {
        return this.eventOptions.length > 0;
    }

    get isSubmitDisabled() {
        return this.isSubmitting || !this.selectedEventId || !this.rating;
    }

    get messageClass() {
        return 'feedback-message ' + this.messageType;
    }

    // OPEN AND CLOSE THE POPUP

    openModal() {
        this.message = '';
        this.isOpen = true;
    }

    closeModal() {
        this.isOpen = false;
    }

    // FIELD CHANGES

    handleEventChange(event) {
        this.selectedEventId = event.detail.value;
    }

    handleRatingChange(event) {
        this.rating = event.detail.value;
    }

    handleCommentsChange(event) {
        this.comments = event.detail.value;
    }

    // SUBMIT

    async handleSubmit() {
        this.isSubmitting = true;
        this.message = '';

        try {
            await submitFeedback({
                eventId: this.selectedEventId,
                rating: parseInt(this.rating, 10),
                comments: this.comments
            });

            this.message = 'Thank you! Your feedback was submitted.';
            this.messageType = 'success';
            this.selectedEventId = '';
            this.rating = '';
            this.comments = '';
        } catch (error) {
            this.message =
                error.body?.message ||
                error.message ||
                'Your feedback could not be submitted.';
            this.messageType = 'error';
        } finally {
            this.isSubmitting = false;
        }
    }
}