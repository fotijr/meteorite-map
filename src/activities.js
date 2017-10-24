export default function () {
    function getResource(url) {
        return new Promise(function (resolve, reject) {
            let req = new XMLHttpRequest();
            req.open("GET", url);
            req.onload = () => {
                if (req.status === 200) {
                    resolve(JSON.parse(req.response));
                } else {
                    reject(new Error(req.statusText));
                }
            };
            req.onerror = () => reject(new Error("Network error"));
            req.send();
        });
    }

    var zipline = {
        title: "Zipline",
        x: 0,
        y: 0,
        style: {
            top: "10%",
            left: "10%",
            width: 300,
            height: 213,
            "background-image": "url(img/zipline.jpg)"
        },
        get boundaries() {
            return {
                top: this.y,
                right: this.x + this.style.width,
                bottom: this.y + this.style.height,
                left: this.x
            };
        },
        action: "ride the zipline",
        do: function (person) {
            return new Promise((resolve, reject) => {
                if (person.age < 16 && !person.waivers.zipline) {
                    reject("I'm sorry, you are not old enough to ride the zipline without a waiver ☹");
                }
                resolve("🎈 You enjoyed the zipline! 🎈");
            });
        }
    };

    var pool = {
        title: "Pool",
        get boundaries() {
            return {
                top: this.y,
                right: this.x + this.style.width,
                bottom: this.y + this.style.height,
                left: this.x
            };
        },
        x: 0,
        y: 0,
        style: {
            top: "10%",
            right: "10%",
            width: 300,
            height: 213,
            "background-image": "url(img/pool.jpg)"
        },
        action: "swim in the pool",
        do: function (person) {
            return new Promise((resolve, reject) => {
                var now = new Date().getHours(),
                    open = 7,
                    close = 19;
                if (now < open || now >= close) {
                    reject("I'm sorry, the pool is only open between 7am-7pm ☹");
                }
                resolve("🎈 You swam in the pool! 🎈");
            });
        }
    };

    var computerLab = {
        title: "Computer Lab",
        x: 0,
        y: 0,
        style: {
            bottom: "10%",
            left: "10%",
            width: 300,
            height: 213,
            "background-image": "url(img/computer.jpg)"
        },
        get boundaries() {
            return {
                top: this.y,
                right: this.x + this.style.width,
                bottom: this.y + this.style.height,
                left: this.x
            };
        },
        action: "to check your email",
        do: function (person) {
            return new Promise((resolve, reject) => {
                getResource("api/waiver.json")
                    .then(waiver => {
                        if (!waiver.signed) reject("I'm sorry, your parents sent the waiver but it wasn't signed ☹");
                        person.addWaiver("zipline");
                        resolve("🎈 Your parents emailed a zipline waiver! 🎈");
                    })
                    .catch(() => reject("I'm sorry, you weren't able to check your email ☹"));
            });
        }
    };

    return {
        zipline,
        pool,
        computerLab,
        all: [zipline, pool, computerLab]
    };
}