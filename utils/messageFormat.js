const moment = require('moment');

const formatMessages = (username, body) => {
    return {
        username,
        body,
        time: moment().format('h:mm a')
    };
};

module.exports = formatMessages;