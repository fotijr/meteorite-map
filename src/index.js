import app from './app';

var instance = app("#mainMap");

document.getElementById("setGlobe").addEventListener("click", instance.setProjection);

document.getElementById("play").addEventListener("click", function () {
    this.classList.add("pressed");
    instance.start();
});

document.getElementById("stop").addEventListener("click", instance.stop);