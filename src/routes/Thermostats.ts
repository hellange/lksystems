import { Router, Request, Response, NextFunction } from 'express';

var request = require('request-promise');

const Heroes = require('../data');
const mysql = require('promise-mysql');

let thermostats = [];
let connection;

let lk_username;
let lk_password;
let auth;
let lk_url;

// TODO: Replace with environment variables

export class Thermostats {
    router: Router

    /**
     * Initialize
     */
    constructor() {
        this.router = Router();
        this.init();

        lk_username = process.env.LK_USERNAME;
        lk_password = process.env.LK_PASSWORD;
        auth = "Basic " + new Buffer(lk_username + ":" + lk_password).toString("base64");
        lk_url = process.env.LK_URL;

        //console.log("lk username:", lk_username);
        //console.log("lk password:", lk_password);

        this.createConnection();
        console.log("Connected, initiate periodic polling");
        setTimeout( () => this.collectAllThermostats(), 1000); // needed for LK webserver to be ready
        setInterval( () => this.collectAllThermostats(), 30000);
        //connection.end();
    }

    private collectAllThermostats() {
        console.log("Start requesting LK for thermostat info...");
        this.collectThermostatData(thermostats, connection).then((res) => {
            console.log("Thermostat data collection done!", res);
            thermostats = res;

            //TODO: Get rid of global variables !
            this.storeDataToDb(thermostats, connection);
        })
    }

    private createConnection() {
        console.log("Connecting to DB...");

        connection = mysql.createPool({
            host: 'db',
            user: 'root',
            password: 'secret2',
            database: 'helge'
        });

        connection.query("CREATE DATABASE IF NOT EXISTS helge;").then( (err, result) => {
            console.log("Creating db result:", result);

            connection.query('CREATE TABLE IF NOT EXISTS samples ('
                + 'creation_time DATETIME DEFAULT CURRENT_TIMESTAMP,'
                + 'thermostats json DEFAULT NULL'
                + ')').then ((res) =>{
                console.log("Table created ", res);
            });
        });

    }

    private async getDataFromDb(c) {
        return await c.query('SELECT * from samples').then ((rows) => {

            let thermostats = [];
            rows.forEach((r,i) => {
                thermostats.push({
                    creation_time: r.creation_time,
                    thermostats: JSON.parse(r.thermostats),
                });
            });
            let result = {
                entries: rows.length,
                thermostats: thermostats,
            };
            return result;
        });
    }

    public storeDataToDb(res, c) {

        var allData = [];
        res.forEach((r) => {
            allData.push([
                r.names,
                r.setRoomTemp,
                r.actualRoomTemp,
                r.setbackTemp,
                r.heatingStatus
            ]);
        });

        console.log("TRYING TO STORE ", res);
        console.log("date ", Date.now());

        allData = <any>JSON.stringify(res);

        var values = [
            [allData]
        ];

        console.log("Leaving async storeDataToDb...")

        return c.query("INSERT INTO samples (thermostats) VALUES ?", [values], function (err, result) {
            if (!err) {
                console.log('Result after storing thermostat sample', result);
            }
            else {
                console.log('Error when storing thermostat sample', err);
            }
            console.log("storeDataToDb result ready");
            return result;
        });
    }

    private collectThermostatData(res, connection) {

        let thermostats = [];

        return this.getThermostatInfo(1).then((res) => {
            thermostats.push(res);
            return this.getThermostatInfo(2);
        }).then((res) => {
            thermostats.push(res);
            return this.getThermostatInfo(3);
        }).then((res) => {
            thermostats.push(res);
            return this.getThermostatInfo(4);
        }).then((res) => {
            thermostats.push(res);
            return this.getThermostatInfo(5);
        }).then((res) => {
            thermostats.push(res);
            return thermostats;
        })

    }


    public getThermostatInfo(i) {

        let urlBase = lk_url + "/thermostat.json?tid=";
        let res = <any>{};
        let url = urlBase + i;
        console.log("Requesting thermostat info:", url);
        return request.get({
            url: url,
            headers: {
                "Authorization": auth
            }
        }).then((body) => {

            var name = JSON.parse(body).name;
            var setRoomTemp = JSON.parse(body).set_room_deg;
            var actualRoomTemp = JSON.parse(body).get_room_deg;
            var heatingStatus = JSON.parse(body).heat_status;
            var setbackTemp = JSON.parse(body).setback_deg;

            res.names = this.hex_to_ascii(name);
            res.setRoomTemp = (setRoomTemp / 100).toFixed(1);
            res.actualRoomTemp = (actualRoomTemp / 100).toFixed(1);
            res.setBackTemp = (setbackTemp / 100).toFixed(1);
            res.heatingStatus = heatingStatus;

            return res;
        });
    }


    private getSystemInfo() {

        var system_url = "http://de1102.lkics.net:8088/system.json";
        return request.get({
            url: system_url,
            headers: {
                "Authorization": auth
            }
        }).then((body) => {
            //console.log('body : ', body);
            var res = <any>[];
            var boilerState = JSON.parse(body).boiler_state;
            var setbackStatus = JSON.parse(body).override;
            var res = <any>{};

            res.boilerState = (boilerState == "0") ? "NO HEAT" : "HEATING";
            res.setbackStatus = (setbackStatus == "2") ? "REDUCED" : "NORMAL";
            console.log('System info: ', res);
            return res;
        });
    }

    private hex_to_ascii(str1) {
        var hex = str1.toString();
        var str = '';
        for (var n = 0; n < hex.length; n += 2) {
            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        return str;
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {

        this.router.get('/',  async (req: Request, res: Response, next: NextFunction) => {
            res.send(await this.getDataFromDb(connection));
        });

        //this.router.get('/:id', this.getOne);
    }


}

// Create the router, and export its configured Express.Router
const thermostatRoutes = new Thermostats();

export default thermostatRoutes.router;
