import {templates} from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.getElements(element);
    thisHome.render();
    thisHome.initWidgets();
  }

  getElements(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
  }

  render() {
    const thisHome = this;

    const generatedHtml = templates.homePage();
    const generatedDOM = utils.createDOMFromHTML(generatedHtml);
    thisHome.dom.wrapper.appendChild(generatedDOM);

    thisHome.dom.services = document.querySelector('#services-container');
  }

  initWidgets() {
    const thisHome = this;

    // thisHome.dom.services.addEventListener('click', function() {
    //   thisHome.dom.services.querySelector('a').style.transform = 'translate(20px 20px)';
    // });


    // thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    // thisBooking.dom.peopleAmount.addEventListener('updated', function() {
    //   thisBooking.resetTableSelection();
    // });

    // thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    // thisBooking.dom.hoursAmount.addEventListener('updated', function() {
    //   thisBooking.resetTableSelection();
    // });

    // thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    // thisBooking.dom.datePicker.addEventListener('updated', function() {
    //   thisBooking.resetTableSelection();
    // });

    // thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // thisBooking.dom.hourPicker.addEventListener('updated', function() {
    //   thisBooking.resetTableSelection();
    // });

    // thisBooking.dom.wrapper.addEventListener('updated', function() {
    //   thisBooking.updateDOM();
    // });

    // thisBooking.dom.tableWrapper.addEventListener('click', function() {
    //   event.preventDefault();

    //   thisBooking.initTables(event.target);
    // });

    // thisBooking.dom.form.addEventListener('submit', function() {
    //   event.preventDefault();

    //   const errors = thisBooking.validateBooking();
    //   if (errors.length == 0) {
    //     thisBooking.sendBooking();
    //   } else {
    //     alert(errors.join('\n'));
    //   }
    // });
  }
}

export default Home;
