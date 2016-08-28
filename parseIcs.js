"use strict";

var fs = require('fs');

var Event = function() {
    this.start = null;
    this.end = null;
    this.uid = null;
    this.created = null;
    this.lastModified = null;
    this.location = null;
    this.summary = null;
    this.details = null;
}

var parseDate = function(str) {
    return new Date(Date.UTC(str.substring(0,4), (Number(str.substring(4,6))-1),
                    str.substring(6,8), str.substring(9,11),
                    str.substring(11,13), str.substring(13,15), 0));
};

var parseRaw = function(raw) {

    var lines = raw.split('\r\n');
    var event = new Event(raw);

    lines.forEach(function(line) {

        if (line.startsWith('DTSTART:')) {
            let startTime = line.replace('DTSTART:', '');
            event.start = parseDate(startTime);
            return;
        }

        if (line.startsWith('DTEND:')) {
            let endTime = line.replace('DTEND:', '');
            event.end = parseDate(endTime);
            return;
        }

        if (line.startsWith('UID:')) {
            let idTask = line.replace('UID:', '');
            event.uid = idTask;
            return;
        }

        if(line.startsWith('CREATED:')) {
            event.created = parseDate(line.substring(8));
        }
        else if(line.startsWith('LAST-MODIFIED:')) {
            event.lastModified = parseDate(line.substring(14));
        }
        else if(line.startsWith('LOCATION:')) {
            event.location = line.substring(9);
        }
        else if(line.startsWith('DESCRIPTION:')) {
            let descriptionData = line.replace("DESCRIPTION:", "").split('\\n');
            let details = {};

            descriptionData.forEach(function(item) {
                if (item.startsWith('Tiempo estimado:') ) {
                    details.estimated_time = item.replace('Tiempo estimado:','')
                }

                if (item.startsWith('Etiquetas:') ) {
                    details.tags = descriptionData[1].replace('Etiquetas:','')
                }

                if (item.startsWith('Ubicación:') ) {
                    details.location_task = descriptionData[2].replace('Ubicación:','')
                }
            })


            event.details = details;
        }
        else if(line.startsWith('SUMMARY:')) {
            console.log ( line );
            //var summary = line.substring(8).split('SUMMARY: ');
            var summary = line.replace("SUMMARY:", "");
            //event.summary = (summary.length > 0) ? summary[1].replace(' Aktivitetstyp: Okänd', '') : '';
            event.summary = (summary.length > 0) ? summary : '';
        }

    })

    return event;
};

var parseIcs = function(data) {
    var lines = data.split('\r\n');
    var raw = '';
    var events = [];
    var k = false;

    for(var i = 0; i < lines.length; i++) {
        if(lines[i] == 'BEGIN:VTODO' || k == true) {
            raw += lines[i] + '\r\n';
            k = true;

            if(lines[i] == 'END:VTODO') {
                events.push(parseRaw(raw));
                raw = '';
                k = false;
            }
        }
    }
    return events;
};

function parseFile(file, callback) {

    let data;
    let readFile = fs.createReadStream(file);
    readFile.setEncoding('utf8');

    console.log(`reading ${file} ...`);
    readFile
        .on('data', (chunk) => { data += chunk; })
        .on('end', () => { callback( parseIcs(data) ); });

}

module.exports = parseFile