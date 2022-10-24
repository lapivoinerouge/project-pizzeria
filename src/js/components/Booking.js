import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.table = '';

    thisBooking.getElements(element);
    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getElements(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
  }

  render() {
    const thisBooking = this;

    const generatedHtml = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHtml);
    thisBooking.dom.wrapper.appendChild(generatedDOM);

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tableWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tableWrapper);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.bookingForm);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }

  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking
                                      + '?' + params.bookings.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let i = minDate; i <= maxDate; i = utils.addDays(i, 1)) {
          thisBooking.makeBooked(utils.dateToStr(i), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    // if object for a specified date doesn't exist yet
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let i = startHour; i < startHour + duration; i += 0.5) {
      if (typeof thisBooking.booked[date][i] == 'undefined') {
        thisBooking.booked[date][i] = [];
      }

      thisBooking.booked[date][i].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined'
      || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.bookings.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(target) {
    const thisBooking = this;
    if (target.classList.contains(classNames.booking.table)) {
      if (target.classList.contains(classNames.booking.tableBooked)) {
        alert('This table is reserved.');
      } else {
        if (target.classList.contains(classNames.booking.tableSelected)) {
          target.classList.remove(classNames.booking.tableSelected);
        } else {
          thisBooking.resetTableSelection();
          target.classList.toggle(classNames.booking.tableSelected);
        }
        thisBooking.table = target.getAttribute(settings.bookings.tableIdAttribute);
      }
    }
  }

  resetTableSelection() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      if (table.classList.contains(classNames.booking.tableSelected)) {
        table.classList.remove(classNames.booking.tableSelected);
        thisBooking.table = '';
      }
    }
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      thisBooking.resetTableSelection();
    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
      thisBooking.resetTableSelection();
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function() {
      thisBooking.resetTableSelection();
    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function() {
      thisBooking.resetTableSelection();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tableWrapper.addEventListener('click', function() {
      event.preventDefault();

      thisBooking.initTables(event.target);
    });

    thisBooking.dom.form.addEventListener('submit', function() {
      event.preventDefault();

      const errors = thisBooking.validateBooking();
      if (errors.length == 0) {
        thisBooking.sendBooking();
      } else {
        alert(errors.join('\n'));
      }
    });
  }

  validateBooking() {
    const thisBooking = this;
    const errorCollection = [];

    if (!thisBooking.dom.phone.value || isNaN(parseInt(thisBooking.dom.phone.value))) {
      errorCollection.push('Phone number is invalid.');
    }

    if (!thisBooking.dom.address.value) {
      errorCollection.push('Address cannot be empty.');
    }

    if (!thisBooking.table) {
      errorCollection.push('Please, select the table.');
    }
    return errorCollection;
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {};
    payload.date = thisBooking.datePicker.value;
    payload.hour = thisBooking.hourPicker.value;
    payload.table = thisBooking.table ? parseInt(thisBooking.table) : null;
    payload.duration = parseInt(thisBooking.hoursAmountWidget.value);
    payload.ppl = parseInt(thisBooking.peopleAmountWidget.value);
    payload.starters = [];
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;

    for(let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then((response) => {
        switch(response.status) {
        case 200:
        case 201:
          thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
          thisBooking.updateDOM();
          thisBooking.resetTableSelection();
          alert('Table booked! See you there!');
          break;
        default:
          alert('Sorry, something went wrong. Try again.');
        }
      });
  }

}

export default Booking;
