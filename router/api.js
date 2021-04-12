const router = require('express').Router();
const { functions } = require('../methods');

router.get('/server/:id', async (req, res) => {
  functions.read.server(req.params.id).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.post('/server', async (req, res) => {
  functions.create.server(req.body.name).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.put('/server/:id', async (req, res) => {
  functions.update.server(req.params.id, req.body).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.delete('/server/:id', async (req, res) => {
  functions.delete.server(req.params.id).then(() => {
    res.sendStatus(204);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.get('/user/:id', async (req, res) => {
  functions.read.user(req.params.id).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.post('/user', async (req, res) => {
  functions.create.user(req.body.username, req.body.ip).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.put('/user/:id', async (req, res) => {
  functions.update.user(req.params.id, req.body).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.delete('/user/:id', async (req, res) => {
  functions.delete.user(req.params.id).then(() => {
    res.sendStatus(204);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.get('/server/:serverId/channel/:channelId', async (req, res) => {
  functions.read.channel(req.params.serverId, req.params.channelId).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.post('/server/:serverId/channel', async (req, res) => {
  functions.create.channel(req.params.serverId, req.params.channelId).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.put('/server/:serverId/channel/:channelId', async (req, res) => {
  functions.update.channel(req.params.serverId, req.params.channelId, req.body).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

router.delete('/server/:serverId/channel/:channelId', async (req, res) => {
  functions.delete.channel(req.params.serverId, req.params.channelId).then(() => {
    res.sendStatus(204);
  }).catch((err) => {
    console.error(err);
    res.status(500);
  });
});

module.exports = router;
