import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import D3 from '@salesforce/resourceUrl/d3';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
export default class ProgressRing extends LightningElement {
    d3Initialized = false;
    that;
    svg;
    arc;
    @api percentComplete;
    @api title;

    @api
    get percentage() {
        return this.percentComplete;
    }

    set percentage(value) {
        console.log(value);
        this.percentComplete = value;
        this.d3Initialized = false;
        //console.log(`${this.percentComplete}	 In rendered progress   ====>  ${this.d3Initialized}`);
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;

        Promise.all([
            loadScript(this, D3 + '/d3.v5.min.js'),
            loadStyle(this, D3 + '/style.css')
        ])
            .then(() => {
                //if (this.percentComplete) { console.log(`Conditional`); this.initializeD3(); }
                this.initializeD3();
            })
            .catch(error => {
                console.log(JSON.stringify(error));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading D3',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    /*connectedCallback() {

    }*/

    initializeD3() {
        console.log('Entered:');
        this.draw();
    }
    draw() {
        var that = this;
        const radius = 75;
        const border = 10;
        const padding = 0;
        const width = 150;
        const height = 150;
        const twoPi = Math.PI * 2;
        const boxSize = (radius + padding) * 2;
        var arc = this.arc;
        var svg = this.svg;

        console.log(that.percentComplete + '\t that.measure' + typeof that.percentComplete);

        if (!Number.isNaN(parseInt(that.percentComplete))) {
            that.percentComplete = parseInt(that.percentComplete);
            console.log('qwertyuiodfghj' + this.percentComplete);
        }



        console.log(that.percentComplete + '\t that.measure' + typeof that.percentComplete);
        //that.percentComplete = progressTexts[getRandom];
        arc = d3.arc()
            .startAngle(0)
            .innerRadius(radius)
            .outerRadius(radius - border)
            .cornerRadius(50);
        svg = d3.select(this.template.querySelector('svg.d3'))
            .attr("width", '100%')
            .attr("height", '100%')
            .attr('viewBox', '0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
            .attr('preserveAspectRatio', 'xMinYMin');
        svg.selectAll('foreignObject').remove();
        svg.selectAll('.progress-meter').remove();
        svg.append("foreignObject")
            .attr("width", boxSize)
            .attr("height", boxSize)
            .append("xhtml:div")
            .attr('class', typeof that.percentComplete === 'string' ? 'addBorder' : 'radial-wrapper')
            .style('color', typeof that.percentComplete === 'string'
                ? that.percentComplete == 'Not Started' ? 'grey' : that.percentComplete == 'On Track' ? 'deepskyblue' : that.percentComplete == 'On Hold' ? 'Grey' : that.percentComplete == 'Behind Schedule' ? 'red' : 'green'
                : that.percentComplete >= 50 ? 'green' : that.percentComplete === 0 ? 'grey' : 'red')
            .html(typeof that.percentComplete === 'string' ? `<div class="radial-content" style="font-size:25px; ">${that.percentComplete}<span style="font-size:22px"></span></div>` : that.percentComplete === 0 ? this.title ? `<div class="radial-content" style="font-weight:bold; font-size:25px">${that.title}<span style="font-size:22px"></span></div>` :`<div class="radial-content" style="font-weight:bold; font-size:25px">${that.percentComplete}%<span style="font-size:22px"></span></div>`  : `<div class="radial-content" style="font-weight:bold; font-size:25px">${that.percentComplete}<span style="font-size:22px">%</span></div>`);
        if (typeof that.percentComplete != 'string') {
            this.drawCircle(svg, arc, boxSize, that.percentComplete, twoPi);
            //console.log('##$#$#$' + this.percentComplete);
        }

    }

    drawCircle(svg, arc, boxSize, percent, twoPi) {
        console.log(`twoPi ${twoPi}        ${(percent / 100) * twoPi}`);
        const field = svg.append('g')
            .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

        const meter = field.append('g')
            .attr('class', 'progress-meter');
        if (this.title && percent) {
            console.log(this.title);
            field.append("text")
                .attr("dx", function (d) { return -7 })
                .attr("dy", function (d) { return -45 })
                /*.attr('text-anchor', 'middle').text(this.title)*/
                .style('fill', '#848484')
                .text(this.title)
        }

        const background = meter.append("path")
            .datum({
                endAngle: twoPi
            })
            .attr('class', 'background')
            .attr('fill', '#2D2E2F')
            .attr('fill-opacity', 0.1)
            .attr("d", arc);

        const foreground = meter.append("path")
            .datum({
                endAngle: (percent / 100) * twoPi
            })
            .attr('class', 'foreground')
            .attr('fill', percent >= 50 ? 'green' : 'red')
            .attr('fill-opacity', 1)
            .transition().duration(750).attrTween("d", (a) => {
                console.log(`****** ${percent} ${a}`);
                var j = { "endAngle": 0 };
                var i = d3.interpolateObject(j, a);

                return function (t) {
                    d3.select(".radial-content")
                        .text(percent);
                    return arc(i(t));
                };
            });
    }
}