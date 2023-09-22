'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');




class App {
    #map;
    #mapEvent;


    constructor() {
        this.#getPosition();


        form.addEventListener('submit', this.#newWorkout.bind(this))


        inputType.addEventListener('change', this.#toggleElevationField.bind(this))

    }

    #getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), () => {
                alert('Could not Get Your Geolocation');
            })
        }

    }

    #loadMap(position) {
        console.log(position)

        const {latitude} = position.coords;
        const {longitude} = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        const coords = [latitude, longitude]
        this.#map = L.map('map').setView(coords, 15);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);


        this.#map.on('click', this.#showForm.bind(this))
    }

    #showForm(mapE) {
        this.#mapEvent = mapE;

        // Handling Clinks on Map
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    #toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    #newWorkout(event) {
        event.preventDefault();

        // Clear Input filed
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        const {lat, lng} = this.#mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: "running-popup"
            }))
            .setPopupContent("Workouts")
            .openPopup();
    }

}

const app = new App();
console.log(app)
