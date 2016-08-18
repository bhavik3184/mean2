var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Message = require('../models/message');
var User = require('../models/user');

router.get('/', function (req, res, next) {

    Message.find()
        .exec(function (err, docs) {
            if (err) {
                return req.status(404).json({
                    title: 'Unable to get messages',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Got data',
                obj: docs
            });
        });
});

router.use('/', function (req, res, next) {
    if (!jwt.verify(req.query.token, 'secret', function (err, decoded) {
            if (err) {
                return res.status(404).json({
                    title: 'Authentication failed',
                    error: err
                });
            }
            next();
        }));
});

router.post('/', function (req, res, next) {
    var decoded = jwt.decode(req.query.token);
    User.findById(decoded.user._id, function (err, doc) {
        if (err) {
            res.status(404).json({
                message: 'An error occoured',
                error: err
            })
        }
        var message = new Message({
            content: req.body.content,
            user: doc
        });
        message.save(function (err, result) {
            if (err) {
                return res.status(404).json({
                    title: 'An error occurred',
                    error: err
                })
            }
            doc.messages.push(result);
            doc.save();
            res.status(200).json({
                message: 'Saved message',
                obj: result
            });
        });
    });

});

router.patch('/:id', function (req, res, next) {
    Message.findById(req.params.id, function (err, doc) {
        if (err) {
            return req.status(404).json({
                title: 'An error occoured',
                error: err
            });
        }
        if (!doc) {
            return req.status(404).json({
                title: 'Message not found',
                error: {message: 'message counld not be found'}
            });
        }
        doc.content = req.body.content;
        doc.save(function (err, result) {
            if (err) {
                return req.status(404).json({
                    title: 'An error occoured while updating',
                    error: err
                });
            }
            res.status(200).json({
                message: 'Message updated',
                obj: result
            })
        });
    });
});

router.delete('/:id', function (req, res, next) {
    Message.findById(req.params.id, function (err, doc) {
        if (err) {
            return res.status(404).json({
                title: 'An Error occoured',
                error: err
            });
        }
        if (!doc) {
            return res.status(404).json({
                title: 'Unable to find message',
                error: err
            })
        }
        doc.remove(function (err, result) {
            if (err) {
                return res.status(404).json({
                    title: 'An error occoured',
                    error: err
                })
            }
            res.status(200).json({
                message: 'Success',
                obj: result
            });
        });
    });
});

module.exports = router;