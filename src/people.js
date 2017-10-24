const camperSize = 50;

function addWaiver(waiver) {
    this.waivers[waiver] = true;
}

function doActivity(activity) {
    return activity.do(this);
}

export default function (x, y) {
    var nia = {
        name: "Nia",
        color: "#774938",
        age: 14,
        addWaiver: addWaiver,
        doActivity: doActivity,
        waivers: {},
        x: x ? (x - (camperSize / 2)) : 0,
        y: y ? (y - (camperSize / 2)) : 0,
        size: camperSize,
        get boundaries() {
            return {
                top: this.y,
                right: this.x + this.size,
                bottom: this.y + this.size,
                left: this.x
            };
        }
    };

    return {
        nia,
        all: [nia]
    };
}