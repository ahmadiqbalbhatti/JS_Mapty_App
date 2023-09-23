'use strict';

///////////////////////////////////////////////
////////// Application Architecture ///////////
///////////////////////////////////////////////

import Running from "./Running.js";
import Cycling from "./Cycling.js";

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const run = new Running([32, -12], 23, 90, 123);
console.log(run)

class App {
    #map;
    #mapEvent;
    #mapZoomLevel = 15;
    #workouts = [];


    constructor() {
        // Getting user position
        this.#getPosition();

        // Get the Data from the Local Sotrage
        this.#getLocalStorageData();


        // Attached event handler
        form.addEventListener('submit', this.#newWorkout.bind(this))

        inputType.addEventListener('change', this.#toggleElevationField.bind(this))

        containerWorkouts.addEventListener('click', this.#moveToPopUp.bind(this))

    }

    #getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), () => {
                alert('Could not Get Your Geolocation');
            })
        }

    }

    #loadMap(position) {

        const {latitude} = position.coords;
        const {longitude} = position.coords;

        const coords = [latitude, longitude]
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);


        this.#map.on('click', this.#showForm.bind(this));


        this.#workouts.forEach(workout => {
            this.#renderWorkoutMarker(workout);
        })
    }

    #showForm(mapE) {
        this.#mapEvent = mapE;


        // Handling Clinks on Map
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    #hidForm() {
        // Making fields Empty
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => {
            form.style.display = 'grid';
        }, 1000)

    }

    #toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    #newWorkout(event) {
        event.preventDefault();

        // Helper Validation Functions
        const inputValidation = (...inputs) => inputs.every(inputValue => Number.isFinite(inputValue));
        const allPositive = (...inputs) => inputs.every(inputValue => inputValue > 0)


        // Get data from the Form & User
        const {lat, lng} = this.#mapEvent.latlng;

        this.type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;

        let workout;

        // if workout is running, create running object.
        if (this.type === 'running') {
            const cadence = +inputCadence.value;

            // Check If data is Valid or apply validations
            if (!inputValidation(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert('Inputs have to be Positive Number');
            }

            workout = new Running([lat, lng], distance, duration, cadence);


        }

        // if workout is cycling, create cycling object.
        if (this.type === 'cycling') {
            const elevationGain = +inputElevation.value;

            // Check If data is Valid or apply validations
            if (!inputValidation(distance, duration, elevationGain) || !allPositive(distance, duration)) {
                return alert('Inputs have to be Positive Number');
            }

            workout = new Cycling([lat, lng], distance, duration, elevationGain);
        }

        // Add new object to the workout array
        this.#workouts.push(workout);


        // Render workout on map as marker
        this.#renderWorkoutMarker(workout);


        // Render workout on list
        this.#renderWorkoutList(workout);

        // Clear Input filed
        this.#hidForm();

        // Store data in the local storage
        this.#setLocalStorage();
    }

    // get getWorkouts() {
    //     return this.#workouts;
    // }

    #renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: `${workout.type}-popup`
            }))
            .setPopupContent(workout.description) //  appending HTML or Text into
            .openPopup();
    }

    #renderWorkoutList(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? "🏃" : "🚴‍♀️"}‍️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
          </li>
        `;
        }
        if (workout.type === 'cycling') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
            </li>
        `;
        }

        form.insertAdjacentHTML('afterend', html);


    }


    #moveToPopUp(event) {
        const workoutElement = event.target.closest('.workout');

        if (!workoutElement) {
            console.log('Workout element not found.');
            return;
        }

        const workout = this.#workouts.find(work => work.id === workoutElement.dataset.id);

        if (workout) {
            this.#map.setView(workout.coords, this.#mapZoomLevel, {
                animate: true,
                pan: {
                    duration: 1,
                }
            });
        } else {
            console.error("Workout is undefined.");
        }

        // workout.click();

    }

    #setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    #getLocalStorageData(){
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data) return;

        this.#workouts = data;

        this.#workouts.forEach(workout => {
            this.#renderWorkoutList(workout);
        })
    }
    
    reset(){
        localStorage.removeItem('workouts');
        location.reload();
    }

}

const app = new App();

