import { api, LightningElement } from 'lwc';

export default class Illustration extends LightningElement {


    @api heading;
 @api messageBody;

     @api imageName;
  @api imageSize = "small";

   @api textOnly = false;

    get rootClass() {
        return `slds-illustration slds-illustration_${this.imageSize}`;
    }

}