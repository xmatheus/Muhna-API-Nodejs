/* eslint-disable radix */
const express = require('express');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

const User = require('../models/User');
const News = require('../models/News/news');
const authMiddleware = require('../middleware/auth');
const newsAuthQuery = require('../middleware/newsAuthQuery');
const File = require('../models/News/file');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { title, resume, news } = req.body;

        const user = await User.findById(req.userId);
        const nova = await News.create({
            title,
            resume,
            news,
            userId: req.userId,
            autor: user.name,
        });
        return res.status(200).send(nova);
    } catch (err) {
        return res.status(400).send({ error: 'create news failed' });
    }
});

router.put('/update', authMiddleware, newsAuthQuery, async (req, res) => {
    try {
        const { title, resume, news } = req.body;

        await News.findByIdAndUpdate(req.newsid, {
            title,
            resume,
            news,
        });
        return res.status(200).send({ ok: 'updated news' });
    } catch (err) {
        return res.status(400).send({ error: 'update news failed' });
    }
});

router.get('/', async (req, res) => {
    const { newsid } = req.query;

    if (newsid) {
        const nNews = await News.findById({ _id: newsid });
        return res.status(200).send({ docs: nNews });
    }
    return res.status(400).send();
});

router.get('/show', async (req, res) => {
    const { page = 1, limite = 10 } = req.query;

    const limit = parseInt(limite);
    const news = await News.paginate(
        {},
        {
            page,
            limit,
            sort: {
                createAt: -1, //  Sort by Date Added DESC
            },
        },
    ); //  buscando todas as noticias

    return res.status(200).json(news);
});

router.post('/remove', authMiddleware, newsAuthQuery, async (req, res) => {
    const gfs = Grid(mongoose.connection.db, mongoose.mongo);
    // gfs.collection('uploads')

    const { newsid } = req;

    await News.deleteMany({ _id: newsid });
    const mfiles = await File.find({ newsid });
    await File.deleteMany({ newsid });

    const fileid = mfiles.map((t) => t.fileid);

    fileid.map(async (t) => {
        await gfs.remove({ _id: t, root: 'uploads' });
    });
    res.status(200).send();
});

router.post('/search', async (req, res) => {
    const { title } = req.query;

    const docs = await News.find({
        title: {
            $regex: new RegExp(title, 'ig'),
        },
    });

    if (docs) {
        return res.status(200).send({ docs });
    }

    return res.status(404).send();
});

module.exports = (app) => app.use('/news', router);
