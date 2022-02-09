const moment = require('moment');

function formatMessage(username, text) {
    let hours = moment().format('h');
    hours = parseInt(hours) + 6;
    if (hours > 12) {
        hours = hours - 12;
    }
    let minutes = moment().format('mm');
    let day = moment().format('a');
    if (day === 'am') {
        day = 'pm';
    } else {
        day = 'am';
    }
    let time = `${hours}:${minutes} ${day}`;
    return {
        username,
        text,
        time: time
    }
}

module.exports = formatMessage;