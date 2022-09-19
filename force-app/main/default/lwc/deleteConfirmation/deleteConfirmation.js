import { LightningElement,api } from 'lwc';

export default class DeleteConfirmation extends LightningElement {
    @api popupHeader;
    @api popupBody;
    @api confirmButtonLabel = "Delete";
    @api confirmButtonIcon = "utility:delete";
    @api cancelButtonLabel = "Cancel";

    confirmDelete(){
        const selectedEvent = new CustomEvent("confirmdelete", {
            detail: 'delete'
        });
        this.dispatchEvent(selectedEvent);
    }

    closeModal(){
        const selectedEvent = new CustomEvent("closemodal", {
            detail: 'closemodal'
        });
        this.dispatchEvent(selectedEvent);
    }
}