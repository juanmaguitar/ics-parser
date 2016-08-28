'use strict';

var fs = require('fs');

function parseDateIcs(str) {
  const year = +str.slice(0, 4);
  const month = (+str.slice(4, 6)) - 1;
  const day = +str.slice(6, 8);
  const hour = +str.slice(9, 11);
  const min = +str.slice(11, 13);
  const sec = +str.slice(13, 15);
  const timestamp = Date.UTC(year, month, day, hour, min, sec);

  return new Date(timestamp);
}

function parseLine(line) {
  if (line.startsWith('DTSTART:')) {
    return { start: parseDateIcs(line.replace('DTSTART:', '')) };
  }

  if (line.startsWith('DTEND:')) {
    return { end: parseDateIcs(line.replace('DTEND:', '')) };
  }

  if (line.startsWith('UID:')) {
    return { id: line.replace('UID:', '') };
  }

  if (line.startsWith('CREATED:')) {
    return { created: line.replace('CREATED:', '') };
  }

  if (line.startsWith('LAST-MODIFIED:')) {
    return { last_modified: line.replace('LAST-MODIFIED:', '') };
  }

  if (line.startsWith('LOCATION:')) {
    return { location: line.replace('LOCATION:', '') };
  }

  if (line.startsWith('DESCRIPTION:')) {
    const descriptionData = line.replace('DESCRIPTION:', '').split('\\n');
    const details = {};

    descriptionData.forEach((item) => {
      if (item.startsWith('Tiempo estimado:')) {
        details.estimated_time = item.replace('Tiempo estimado:', '');
      }

      if (item.startsWith('Etiquetas:')) {
        details.tags = descriptionData[1].replace('Etiquetas:', '');
      }

      if (item.startsWith('Ubicación:')) {
        details.location_task = descriptionData[2].replace('Ubicación:', '');
      }
    });
    return { details };
  }

  if (line.startsWith('SUMMARY:')) {
    return { summary: line.replace('SUMMARY:', '')};
  }
  return false;
}

function parseIcsContent(data) {
  const lines = data.split('\r\n');
  const events = [];
  let event = {};

  lines.forEach((line) => {
    if (line === 'BEGIN:VTODO') return;
    parseLine(line) ? Object.assign(event, parseLine(line)) : null;
    if (line === 'END:VTODO') {
      events.push(event);
      event = {};
    }
    return;
  });

  return events;
}

function parseFile(file, callback) {
  let data;
  const readFile = fs.createReadStream(file);
  readFile.setEncoding('utf8');

  console.log(`reading ${file} ...`);
  readFile
    .on('data', (chunk) => { data += chunk; })
    .on('end', () => { callback(parseIcsContent(data)); });
}

module.exports = parseFile;
