import { LightningElement, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCurrentMeasureFeed from '@salesforce/apex/MeasureChatterCtrl.getCurrentMeasureFeed'; 
import createMeasureFeedComment from '@salesforce/apex/MeasureChatterCtrl.createMeasureFeedComment'; 
import updateMeasureFeedComment from '@salesforce/apex/MeasureChatterCtrl.updateMeasureFeedComment';
import deleteMeasureFeed from '@salesforce/apex/MeasureChatterCtrl.deleteMeasureFeed';

export default class MeasureComment extends LightningElement {
    @api measureId;

    @api measureName = 'Measure Comment Name';

    @wire(getCurrentMeasureFeed, { measureId : '$measureId' })
    feedList;

    formats = ['font', 'size', 'bold', 'italic', 'underline', 'list', 'indent', 'align', 'link','image', 'clean', 'table', 'header'];

    renderedCallback() {
        this.adjustRichText();
        let chatDiv = this.template.querySelector("[data-field='chatDiv']");
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
    
    adjustRichText() {
        let element = this.template.querySelector("[data-field='newpost']");
    
        if (!element) {
            setTimeout(() => {
                this.adjustRichText()
            }, 100);
    
            return;
        }
    
        const style = document.createElement('style');
        style.innerText = '.ql-editor.slds-rich-text-area__content {max-height:85px;}';
        element.appendChild(style);
    }

    closeDocker(){
        console.log(JSON.stringify(this.feedList.data));
        const selectedEvent = new CustomEvent("closedock", {
            detail: 'close'
        });
        this.dispatchEvent(selectedEvent);
    }

    createPost() {
        let post = this.template.querySelector("[data-field='newpost']").value
        if(post){
            createMeasureFeedComment({ measureId: this.measureId, post: post })
            .then((result) => {
                refreshApex(this.feedList);
                let post = this.template.querySelector("[data-field='newpost']").value = '';
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Creating Post',
                        variant: 'error'
                    })
                );
            });
        }
    }

    editPost(event){
        let feedId = event.currentTarget.name;
        let msgDiv = this.template.querySelector("div[data-msg-id='"+feedId+"']");
        if(msgDiv){
            msgDiv.className='slds-chat-message__text slds-chat-message__text_outbound hideDiv';
        }
        let editDiv = this.template.querySelector("div[data-edit-id='"+feedId+"']");
        if(editDiv){
            editDiv.className='slds-chat-message__text slds-chat-message__text_outbound';
        }
        let textArea = this.template.querySelector("lightning-input-rich-text[data-field='"+feedId+"']");
        if(textArea){
            textArea.focus();
        }
    }

    savePost(event){
        console.log(JSON.stringify(event.currentTarget.name));
        let feedId = event.currentTarget.name;
        let post = this.template.querySelector("lightning-input-rich-text[data-field='"+feedId+"']").value;
        let editDiv = this.template.querySelector("div[data-edit-id='"+feedId+"']");
        if(editDiv){
            console.log('this');
            editDiv.className='slds-chat-message__text slds-chat-message__text_outbound hideDiv';
        }
        let msgDiv = this.template.querySelector("div[data-msg-id='"+feedId+"']");
        if(msgDiv){
            console.log('that');
            msgDiv.className='slds-chat-message__text slds-chat-message__text_outbound';
        }

        updateMeasureFeedComment({ feedItemId: feedId , post: post })
        .then((result) => {
            refreshApex(this.feedList);
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error Updating Post',
                    variant: 'error'
                })
            );
        });
    }

    deletePost(event){
        let feedId = event.currentTarget.name;
        deleteMeasureFeed({ feedItemId: feedId })
        .then((result) => {
            refreshApex(this.feedList);
        })
        .catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error Updating Post',
                    variant: 'error'
                })
            );
        });
    }
}