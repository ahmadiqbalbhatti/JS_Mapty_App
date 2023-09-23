class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;
    // type = "";
    constructor(coords, distance, duration) {
        this.coords = coords;  // [lat, lng]
        this.distance = distance;  // in km
        this.duration = duration;  // in minute
    }

    click(){
        this.clicks++;
    }
    
    setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

export default Workout;
