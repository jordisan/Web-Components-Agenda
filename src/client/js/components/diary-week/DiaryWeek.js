import { WebComponent } from "web-component";
import moment from 'moment-es6';
import DiaryDay from "../diary-day/DiaryDay";

@WebComponent("diary-week", {
  template: require("./diary-week.html"),
  styles: require("./diary-week.scss"),
  shadowDOM: true
})
export default class DiaryWeek extends HTMLElement {
  constructor() {
    super();
    this._firstdate = moment().startOf('isoWeek').toDate();
    this._tasksbyday = 5;
    this._days = 7;
  }

  static get observedAttributes() {
    return ["firstdate", "tasksbyday", "days"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._updateRendering(name, oldValue, newValue);
  }

  connectedCallback() {
    this._updateRendering();
    let root = this.shadowRoot ? this.shadowRoot : this;
    root.querySelector('.week-header_goprev').addEventListener('click', e => {
      this._firstdate = moment(this._firstdate).add(-this._days, 'days').toISOString();
      this._updateRendering();
    });
    root.querySelector('.week-header_gonext').addEventListener('click', e => {
      this._firstdate = moment(this._firstdate).add(this._days, 'days').toISOString();
      this._updateRendering();
    });    
  }

  _updateRendering(name, oldValue, newValue) {
    let root = this.shadowRoot ? this.shadowRoot : this;

    // si ha cambiado el número de días
    if (!name || (name=='days' && oldValue != newValue)) {
      // borrar los anteriores
      let weekDays =  root.querySelector(".week-days");
      if (weekDays) {
        while (weekDays.firstChild) {
          weekDays.removeChild(weekDays.firstChild);
        }
        // crear los días
        for (var index = 0; index < this._days; index++) {
          let day = new DiaryDay();
          day._tasksnumber = this._tasksbyday;
          let newdate = new Date(this._firstdate);
          newdate.setDate(newdate.getDate() + index);
          day._date = moment(newdate).toISOString();
          weekDays.appendChild(day);
        }  
      }
    }
    // encabezados
    root.querySelectorAll(".week-header .week-header_dates").forEach(hd => {
      hd.textContent = new Date(this._firstdate).getDate() + "-" + moment(this._firstdate).add(this._days-1, 'days').date();
    });
    root.querySelectorAll(".week-header .week-header_month").forEach(mo => {
      mo.textContent = moment(this._firstdate).format("MMMM YYYY");
    });
  }
}