import { LightningElement, api } from 'lwc';

export default class DeleteUserPopup extends LightningElement {
    @api userId;
    @api memberId;

    handleRemove() {
        const passEventr = new CustomEvent('recordremove', {
            detail: { userId: this.userId, memberId: this.memberId }
        });
        this.dispatchEvent(passEventr);
    }

    handleCancel(){
        const passEventr = new CustomEvent('cancelremove', {
            detail: { userId: this.userId, memberId: this.memberId }
        });
        this.dispatchEvent(passEventr);
    }
}