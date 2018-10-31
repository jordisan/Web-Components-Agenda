import { WebComponent } from "web-component";
import moment from 'moment-es6';

@WebComponent("diary-day", {
  template: require("./diary-day.html"),
  styles: require("./diary-day.scss"),
  shadowDOM: false
})
export default class DiaryDay extends HTMLElement {
  constructor() {
    super();
    this._tasksnumber = 3;
    this._date = Date.now();
  }

  static get observedAttributes() {
    return ["tasksnumber", "date"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._updateRendering(name, oldValue, newValue);
  }

  connectedCallback() {
    this._updateRendering();
  }

  _setNameDay(date, element) {
    const APIURL = `http://svatky.adresa.info/json?date=${moment(date).format('DDMM')}`;//`https://api.abalin.net/get/namedays?day=&month=&country=es`; // 'http://dataservice.accuweather.com/forecasts/v1/daily/10day/308014?apikey=Nv5HvzT2qKsBaLGgXUgMxGbJafbki1pB'; // 

    fetch(APIURL, { method: 'GET', mode: 'cors'})
    .then(res => {
      res.json().then(response => {
        if (response && response[0] && response[0].name) {
          element.textContent = response[0].name.split(' ')[0];
        }
      })
    })   
    .catch(err => {
        console.warn("error getting nameday from " + APIURL);
        console.warn(err);
    });
  }

  _updateRendering(name, oldValue, newValue) {
    let root = this.shadowRoot ? this.shadowRoot : this;
    root.querySelectorAll(".day-table").forEach( table => {
      let firsttaskrow = null;
      
      // filas para tareas (si ha cambiado el número)
      if ( !name || (name == 'tasksnumber' && oldValue != newValue)) {
        table.querySelectorAll(".task-row").forEach( row => {
          if (firsttaskrow == null) { // guardar la primera fila como template
            firsttaskrow = row;
          } else {
            // borrar las demás
            row.remove();
          }
        });
        // crear rows (una por tarea)      
        for (var index = 0; index < this._tasksnumber -1; index++) {
          var newtask = firsttaskrow.cloneNode(true);
           // fecha solo en la primera fila
          let datecell = newtask.querySelector('.date');
          if (datecell) newtask.removeChild(datecell); 
          // añadir la fila
          table.querySelector(".day").appendChild(newtask);  
        }
      }
      
      // celda de fecha en la primera fila (si ha cambiado)
      if ( !name || (name == 'date' && oldValue != newValue)) {
        let date = table.querySelector(".task-row .date");
        if (date && this._date) {
          date.setAttribute('rowspan', this._tasksnumber);
          date.querySelector(".date-weekday").textContent = moment(this._date).format("ddd");
          date.querySelector(".date-day").textContent = moment(this._date).format("DD");
          this._setNameDay(new Date(this._date), date.querySelector(".date-name"));
        }
        // clase para "hoy"
        let day = table.querySelector(".day");
        if (moment(this._date).isSame(moment(), "day")) {
          day.classList.add("today");
        } else {
          day.classList.remove("today");
        }
      }
    })
  }
}