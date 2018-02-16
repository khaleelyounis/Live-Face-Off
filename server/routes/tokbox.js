const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const OpenTok = require('opentok');
const _ = require('lodash');
const path = require('path');
const keys = require('../config/keys');
const apiKey = keys.TOKBOX_API_KEY;
const secret = keys.TOKBOX_SECRET;

if (!apiKey || !secret) {
    console.error('=========================================================================================================');
    console.error('');
    console.error('Missing TOKBOX_API_KEY or TOKBOX_SECRET');
    console.error('Find the appropriate values for these by logging into your TokBox Dashboard at: https://tokbox.com/account/#/');
    console.error('Then add them to ', path.resolve('.env'), 'or as environment variables');
    console.error('');
    console.error('=========================================================================================================');
    process.exit();
};


const opentok = new OpenTok(apiKey, secret);


const roomToSessionIdDictionary = {};

// returns the room name, given a session ID that was associated with it
function findRoomFromSessionId(sessionId) {
    return _.findKey(roomToSessionIdDictionary, function (value) { return value === sessionId; });
};

/**
 * GET /session redirects to /room/session
 */
router.get('/session', function (req, res) {
    res.redirect('/room/session');
});

/**
 * GET /room/:name
 */
router.get('/room/:name', function (req, res) {
    const roomName = req.params.name;
    console.log('attempting to create a session associated with the room: ' + roomName);

    // if the room name is associated with a session ID, fetch that
    if (roomToSessionIdDictionary[roomName]) {
        const sessionId = roomToSessionIdDictionary[roomName];

        // generate token
        const token = opentok.generateToken(sessionId);
        res.setHeader('Content-Type', 'application/json');
        res.send({
            apiKey: apiKey,
            sessionId: sessionId,
            token: token
        });
    }
    // if this is the first time the room is being accessed, create a new session ID
    else {
        opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
            if (err) {
                console.log(err);
                res.status(500).send({ error: 'createSession error:' + err });
                return;
            }

            // now that the room name has a session associated wit it, store it in memory
            // IMPORTANT: Because this is stored in memory, restarting your server will reset these values
            // if you want to store a room-to-session association in your production application
            // you should use a more persistent storage for them
            roomToSessionIdDictionary[roomName] = session.sessionId;

            // generate token
            const token = opentok.generateToken(session.sessionId);
            res.setHeader('Content-Type', 'application/json');
            res.send({
                apiKey: apiKey,
                sessionId: session.sessionId,
                token: token
            });
        });
    }
});

// /**
//  * POST /archive/start
//  */
// router.post('/archive/start', function (req, res) {
//     const json = req.body;
//     const sessionId = json.sessionId;
//     opentok.startArchive(sessionId, { name: findRoomFromSessionId(sessionId) }, function (err, archive) {
//       if (err) {
//         console.error('error in startArchive');
//         console.error(err);
//         res.status(500).send({ error: 'startArchive error:' + err });
//         return;
//       }
//       res.setHeader('Content-Type', 'application/json');
//       res.send(archive);
//     });
//   });

//   /**
//    * POST /archive/:archiveId/stop
//    */
//   router.post('/archive/:archiveId/stop', function (req, res) {
//     const archiveId = req.params.archiveId;
//     console.log('attempting to stop archive: ' + archiveId);
//     opentok.stopArchive(archiveId, function (err, archive) {
//       if (err) {
//         console.error('error in stopArchive');
//         console.error(err);
//         res.status(500).send({ error: 'stopArchive error:' + err });
//         return;
//       }
//       res.setHeader('Content-Type', 'application/json');
//       res.send(archive);
//     });
//   });

//   /**
//    * GET /archive/:archiveId/view
//    */
//   router.get('/archive/:archiveId/view', function (req, res) {
//     const archiveId = req.params.archiveId;
//     console.log('attempting to view archive: ' + archiveId);
//     opentok.getArchive(archiveId, function (err, archive) {
//       if (err) {
//         console.error('error in getArchive');
//         console.error(err);
//         res.status(500).send({ error: 'getArchive error:' + err });
//         return;
//       }

//       if (archive.status === 'available') {
//         res.redirect(archive.url);
//       } else {
//         res.render('view', { title: 'Archiving Pending' });
//       }
//     });
//   });

//   /**
//    * GET /archive/:archiveId
//    */
//   router.get('/archive/:archiveId', function (req, res) {
//     var archiveId = req.params.archiveId;

//     // fetch archive
//     console.log('attempting to fetch archive: ' + archiveId);
//     opentok.getArchive(archiveId, function (err, archive) {
//       if (err) {
//         console.error('error in getArchive');
//         console.error(err);
//         res.status(500).send({ error: 'getArchive error:' + err });
//         return;
//       }

//       // extract as a JSON object
//       res.setHeader('Content-Type', 'application/json');
//       res.send(archive);
//     });
//   });

//   /**
//    * GET /archive
//    */
//   router.get('/archive', function (req, res) {
//     var options = {};
//     if (req.query.count) {
//       options.count = req.query.count;
//     }
//     if (req.query.offset) {
//       options.offset = req.query.offset;
//     }

//     // list archives
//     console.log('attempting to list archives');
//     opentok.listArchives(options, function (err, archives) {
//       if (err) {
//         console.error('error in listArchives');
//         console.error(err);
//         res.status(500).send({ error: 'infoArchive error:' + err });
//         return;
//       }

//       // extract as a JSON object
//       res.setHeader('Content-Type', 'application/json');
//       res.send(archives);
//     });
//   });

module.exports = router;